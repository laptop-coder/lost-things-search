package handler

import (
	"backend/internal/model"
	"backend/internal/permissions"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"backend/pkg/middleware"
	"fmt"
	"github.com/google/uuid"
	"net/http"
	"slices"
	"strconv"
	"strings"
)

type PostHandler struct {
	postService         service.PostService
	userService         service.UserService
	teacherService      service.TeacherService
	parentService       service.ParentService
	studentGroupService service.StudentGroupService
	studentService      service.StudentService
	log                 logger.Logger
}

func NewPostHandler(postService service.PostService, userService service.UserService, teacherService service.TeacherService, parentService service.ParentService, studentGroupService service.StudentGroupService, studentService service.StudentService, log logger.Logger) *PostHandler {
	return &PostHandler{
		postService:         postService,
		userService:         userService,
		teacherService:      teacherService,
		parentService:       parentService,
		studentGroupService: studentGroupService,
		studentService:      studentService,
		log:                 log,
	}
}

func (h *PostHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 15<<20) // 15 MB
	if err := r.ParseMultipartForm(15 << 20); err != nil {
		h.log.Error("failed to parse multipart/formdata form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get name field
	nameFields := r.PostForm["name"]
	if len(nameFields) > 1 {
		h.log.Error(fmt.Sprintf("failed to parse form: too many name fields (%d)", len(nameFields)))
		helpers.TooManyFieldsError(h.log, w, "name")
		return
	} else if len(nameFields) == 0 {
		h.log.Error("failed to parse form: name field cannot be empty")
		helpers.FieldRequiredError(h.log, w, "name")
		return
	}
	name := nameFields[0]
	// Get and convert user ID
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		h.log.Error("failed to get userID from context and convert it to UUID")
		helpers.InternalError(h.log, w)
		return
	}
	// Pre-assemble DTO
	dto := service.CreatePostDTO{
		Name:     name,
		AuthorID: userID,
	}
	// Get description (optional field)
	if descriptionFields := r.PostForm["description"]; len(descriptionFields) == 1 {
		dto.Description = descriptionFields[0]
	} else if len(descriptionFields) != 0 {
		h.log.Error("failed to parse form: too many description values")
		helpers.TooManyFieldsError(h.log, w, "description")
		return
	}
	// Get post photo (optional field)
	formFiles := r.MultipartForm.File["photo"]
	if len(formFiles) > 1 {
		h.log.Error("failed to parse form: too many post photo files")
		helpers.TooManyFieldsError(h.log, w, "photo")
		return
	} else if len(formFiles) == 1 {
		dto.Photo = formFiles[0]
	}
	// Check if user can verify posts
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	canVerifyPost := slices.Contains(userPermissions, permissions.PostVerify)
	// Create post
	postResponse, err := h.postService.CreatePost(r.Context(), dto, canVerifyPost)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to create the post: %w", err))
		return
	}
	helpers.JsonResponse(w, map[string]interface{}{
		"post": postResponse,
	},
		http.StatusCreated,
	)
}

func (h *PostHandler) Update(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodPatch {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Restrictions
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
	// Parse form
	if err := r.ParseForm(); err != nil {
		h.log.Error("failed to parse x-www-form-urlencoded form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Check if user updating his own post
	if slices.Contains(userPermissions, permissions.PostUpdateOwn) && !slices.Contains(userPermissions, permissions.PostUpdateAny) {
		// Get and convert user ID
		userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
		if !ok {
			h.log.Error("failed to get userID from context and convert it to UUID")
			helpers.InternalError(h.log, w)
			return
		}
		// Get post
		post, err := h.postService.GetPostByID(r.Context(), postID)
		if err != nil || post == nil {
			helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to find the post by ID: %w", err))
			return
		}
		// Check if the post belongs to the user
		if userID != post.Author.ID {
			h.log.Error("forbidden: you do not have permission to update this post")
			helpers.ForbiddenError(h.log, w)
			return
		}
		// Forbid to edit post after approving
		if post.Moderation.Status == model.ModerationStatusApproved || post.Moderation.Status == model.ModerationStatusAutoApproved {
			h.log.Error("forbidden: you cannot edit approved post")
			helpers.ForbiddenError(h.log, w)
			return
		}
	}
	// DTO (all fields are optional)
	dto := service.UpdatePostDTO{}
	if nameFields := r.PostForm["name"]; len(nameFields) == 1 {
		dto.Name = &nameFields[0]
	} else if len(nameFields) != 0 {
		h.log.Error("failed to parse form: too many name values")
		helpers.TooManyFieldsError(h.log, w, "name")
		return
	}
	if descriptionFields := r.PostForm["description"]; len(descriptionFields) == 1 {
		dto.Description = &descriptionFields[0]
	} else if len(descriptionFields) != 0 {
		h.log.Error("failed to parse form: too many description values")
		helpers.TooManyFieldsError(h.log, w, "description")
		return
	}
	// Update post
	postResponse, err := h.postService.UpdatePost(r.Context(), postID, dto)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to update the post: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"post": postResponse,
	})
}

func (h *PostHandler) Delete(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodDelete {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Check if user deleting his own post
	if slices.Contains(userPermissions, permissions.PostDeleteOwn) && !slices.Contains(userPermissions, permissions.PostDeleteAny) {
		// Get and convert user ID
		userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
		if !ok {
			h.log.Error("failed to get userID from context and convert it to UUID")
			helpers.InternalError(h.log, w)
			return
		}
		// Get post
		post, err := h.postService.GetPostByID(r.Context(), postID)
		if err != nil || post == nil {
			helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to find the post by ID: %w", err))
			return
		}
		// Check if the post belongs to the user
		if userID != post.Author.ID {
			h.log.Error("forbidden: you do not have permission to delete this post")
			helpers.ForbiddenError(h.log, w)
			return
		}
	}
	// Delete post
	if err := h.postService.DeletePost(r.Context(), postID); err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to delete the post: %w", err))
		return
	}
	// Return response
	helpers.JsonResponse(w, map[string]interface{}{}, http.StatusNoContent)
}

func (h *PostHandler) RemovePhoto(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodDelete {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Check if user deleting photo of his own post
	if slices.Contains(userPermissions, permissions.PostPhotoDeleteOwn) && !slices.Contains(userPermissions, permissions.PostPhotoDeleteAny) {
		// Get and convert user ID
		userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
		if !ok {
			h.log.Error("failed to get userID from context and convert it to UUID")
			helpers.InternalError(h.log, w)
			return
		}
		// Get post
		post, err := h.postService.GetPostByID(r.Context(), postID)
		if err != nil || post == nil {
			helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to find the post by ID: %w", err))
			return
		}
		// Check if the post belongs to the user
		if userID != post.Author.ID {
			h.log.Error("forbidden: you do not have permission to delete photo of this post")
			helpers.ForbiddenError(h.log, w)
			return
		}
		// Forbid to remove post photo after post approving
		if post.Moderation.Status == model.ModerationStatusApproved || post.Moderation.Status == model.ModerationStatusAutoApproved {
			h.log.Error("forbidden: you cannot remove photo of the approved post")
			helpers.ForbiddenError(h.log, w)
			return
		}
	}
	// Remove post photo file
	if err := h.postService.RemovePhoto(r.Context(), postID); err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to remove post photo file: %w", err))
		return
	}
	// Return response
	helpers.JsonResponse(w, map[string]interface{}{}, http.StatusNoContent)
}

func (h *PostHandler) UpdatePhoto(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodPut {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Restrictions
	r.Body = http.MaxBytesReader(w, r.Body, 15<<20) // 15 MB
	// Parse form
	if err := r.ParseMultipartForm(15 << 20); err != nil {
		h.log.Error("failed to parse multipart/formdata form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Check if user deleting photo of his own post
	if slices.Contains(userPermissions, permissions.PostPhotoUpdateOwn) && !slices.Contains(userPermissions, permissions.PostPhotoUpdateAny) {
		// Get and convert user ID
		userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
		if !ok {
			h.log.Error("failed to get userID from context and convert it to UUID")
			helpers.InternalError(h.log, w)
			return
		}
		// Get post
		post, err := h.postService.GetPostByID(r.Context(), postID)
		if err != nil || post == nil {
			helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to find the post by ID: %w", err))
			return
		}
		// Check if the post belongs to the user
		if userID != post.Author.ID {
			h.log.Error("forbidden: you do not have permission to update photo of this post")
			helpers.ForbiddenError(h.log, w)
			return
		}
		// Forbid to update post photo of the approved post
		if post.Moderation.Status == model.ModerationStatusApproved || post.Moderation.Status == model.ModerationStatusAutoApproved {
			h.log.Error("forbidden: you cannot update photo of the approved post")
			helpers.ForbiddenError(h.log, w)
			return
		}
	}
	// Get photo file from the request
	formFiles := r.MultipartForm.File["photo"]
	if len(formFiles) > 1 {
		h.log.Error("failed to parse form: too many photo files")
		helpers.TooManyFieldsError(h.log, w, "photo")
		return
	} else if len(formFiles) == 0 {
		h.log.Error("failed to parse form: post photo cannot be empty")
		helpers.FieldRequiredError(h.log, w, "photo")
		return
	}
	// Update post photo
	if err := h.postService.UpdatePhoto(r.Context(), postID, formFiles[0]); err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to update post photo: %w", err))
		return
	}
	// Return response
	helpers.JsonResponse(w, map[string]interface{}{}, http.StatusNoContent)
}

func (h *PostHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodGet {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Parse query parameters (for filter)
	authorIDString := r.URL.Query().Get("authorId")
	moderationStatusStrings := r.URL.Query()["moderationStatus"]
	thingReturnedToOwnerString := r.URL.Query().Get("thingReturnedToOwner")
	limitString := r.URL.Query().Get("limit")
	offsetString := r.URL.Query().Get("offset")
	// Pre-assemble filter (fill with default values)
	filter := repository.PostFilter{
		Limit:  20,
		Offset: 0,
	}
	// Parse author ID if passed
	if authorIDString != "" {
		// Convert to UUID
		authorID, err := uuid.Parse(authorIDString)
		if err != nil {
			h.log.Error("cannot convert author id (i.e. user id) to uuid")
			helpers.BadRequestFieldError(h.log, w, "authorId")
			return
		}
		// Add to filter
		filter.AuthorIDs = []uuid.UUID{authorID}
	}
	// Parse moderation statuses if passed
	if len(moderationStatusStrings) > 0 {
		moderationStatuses := []model.ModerationStatus{}
		for _, statusString := range moderationStatusStrings {
			status, err := model.ParseModerationStatus(statusString)
			if err != nil || status == nil {
				h.log.Error("cannot parse moderation status")
				helpers.BadRequestFieldError(h.log, w, "moderationStatus")
				return
			}
			moderationStatuses = append(moderationStatuses, *status)
		}
		filter.ModerationStatuses = moderationStatuses
	}
	// Parse thing returning to owner status if passed
	if thingReturnedToOwnerString != "" {
		thingReturnedToOwner, err := strconv.ParseBool(thingReturnedToOwnerString)
		if err != nil {
			h.log.Error("cannot convert thing returning to owner status from string to boolean")
			helpers.BadRequestFieldError(h.log, w, "thingReturnedToOwner")
			return
		}
		filter.ThingReturnedToOwner = &thingReturnedToOwner
	}
	// Parse limit if passed
	// TODO: move limit and offset parsing to a separate helper
	if limitString != "" {
		if limit, err := strconv.Atoi(limitString); err == nil && limit > 0 {
			if limit > 100 {
				limit = 100 // max value
			}
			filter.Limit = limit
		} else {
			h.log.Error("invalid limit")
			helpers.BadRequestFieldError(h.log, w, "limit")
			return
		}
	}
	// Parse offset if passed
	if offsetString != "" {
		if offset, err := strconv.Atoi(offsetString); err == nil && offset >= 0 {
			filter.Offset = offset
		} else {
			h.log.Error("invalid offset")
			helpers.BadRequestFieldError(h.log, w, "offset")
			return
		}
	}
	// Get posts
	posts, err := h.postService.GetPosts(r.Context(), filter)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get posts: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"posts": posts,
	})
}

func (h *PostHandler) GetPostByID(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodGet {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get post
	post, err := h.postService.GetPostByID(r.Context(), postID)
	if err != nil {
		h.log.Error("Failed to get post by id", "error", err.Error())
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get post by id: %w", err))
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Get ID of the authorized user
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		h.log.Error("failed to get userID from context and convert it to UUID")
		helpers.InternalError(h.log, w)
		return
	}
	// Return post in three cases:
	// 1. if post verified (public access)
	// 2. if post was not verified, but the user is the author of this post
	// 3. if the user is not the author of the post, but he has permission to read any post
	if post.Moderation.Status == model.ModerationStatusApproved ||
		post.Moderation.Status == model.ModerationStatusAutoApproved ||
		(slices.Contains(userPermissions, permissions.PostReadOwn) && (post.Author.ID == userID)) ||
		slices.Contains(userPermissions, permissions.PostReadAny) {
		helpers.SuccessResponse(w, map[string]interface{}{
			"post": post,
		})
		return
	}
	h.log.Error("forbidden: you do not have permission to view this post")
	helpers.ForbiddenError(h.log, w)
}

func (h *PostHandler) GetPostsPublic(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodGet {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Parse query parameters (for filter)
	authorIDString := r.URL.Query().Get("authorId")
	thingReturnedToOwnerString := r.URL.Query().Get("thingReturnedToOwner")
	authorString := r.URL.Query().Get("author") // filter posts by owners
	limitString := r.URL.Query().Get("limit")
	offsetString := r.URL.Query().Get("offset")
	// Pre-assemble filter (fill with default values)
	filter := repository.PostFilter{
		Limit:  20,
		Offset: 0,
	}
	// Parse author ID if passed
	if authorIDString != "" {
		// Convert to UUID
		authorID, err := uuid.Parse(authorIDString)
		if err != nil {
			h.log.Error("cannot convert author id (i.e. user id) to uuid")
			helpers.BadRequestFieldError(h.log, w, "authorId")
			return
		}
		// Add to filter
		filter.AuthorIDs = []uuid.UUID{authorID}
	}
	// Show only approved posts
	filter.ModerationStatuses = []model.ModerationStatus{
		model.ModerationStatusApproved,
		model.ModerationStatusAutoApproved,
	}
	// Parse thing returning to owner status if passed
	if thingReturnedToOwnerString != "" {
		thingReturnedToOwner, err := strconv.ParseBool(thingReturnedToOwnerString)
		if err != nil {
			h.log.Error("cannot convert thing returning to owner status from string to boolean")
			helpers.BadRequestFieldError(h.log, w, "thingReturnedToOwner")
			return
		}
		filter.ThingReturnedToOwner = &thingReturnedToOwner
	}
	// Get and convert user ID
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		h.log.Error("failed to get userID from context and convert it to UUID")
		helpers.InternalError(h.log, w)
		return
	}
	// Parse author if passed
	if authorString != "" {
		switch authorString {
		case "all":
			// empty filter, return all posts
		case "me":
			filter.AuthorIDs = []uuid.UUID{userID} // filter never empty
		case "students": // my students (for teacher role)
			teacher, err := h.teacherService.GetTeacherByID(r.Context(), userID)
			if err != nil {
				helpers.HandleServiceError(h.log, w, err)
				return
			}
			studentIDs := []uuid.UUID{}
			for _, group := range teacher.StudentGroups {
				for _, student := range group.Students {
					studentIDs = append(studentIDs, student.UserID)
				}
			}
			if len(studentIDs) == 0 {
				helpers.SuccessResponse(w, map[string]interface{}{
					"posts": []interface{}{},
				})
				return
			}
			filter.AuthorIDs = studentIDs
		case "children": // my children (for parent role)
			parent, err := h.parentService.GetParentByID(r.Context(), userID)
			if err != nil {
				helpers.HandleServiceError(h.log, w, err)
				return
			}
			studentIDs := []uuid.UUID{}
			for _, student := range parent.Students {
				studentIDs = append(studentIDs, student.UserID)
			}
			if len(studentIDs) == 0 {
				helpers.SuccessResponse(w, map[string]interface{}{
					"posts": []interface{}{},
				})
				return
			}
			filter.AuthorIDs = studentIDs
		case "children_groups": // my children student groups (for parent role)
			parent, err := h.parentService.GetParentByID(r.Context(), userID)
			if err != nil {
				helpers.HandleServiceError(h.log, w, err)
				return
			}
			childrenIDs := []uuid.UUID{}
			for _, child := range parent.Students {
				childrenIDs = append(childrenIDs, child.UserID)
			}
			studentIDs := []uuid.UUID{}
			usedGroupIDs := []uint16{}
			for _, child := range parent.Students {
				if !slices.Contains(usedGroupIDs, child.StudentGroup.ID) {
					group, err := h.studentGroupService.GetStudentGroupByID(r.Context(), child.StudentGroup.ID)
					if err != nil {
						helpers.HandleServiceError(h.log, w, err)
						return
					}
					for _, classmate := range group.Students {
						if !slices.Contains(childrenIDs, classmate.UserID) {
							studentIDs = append(studentIDs, classmate.UserID)
						}
					}
					usedGroupIDs = append(usedGroupIDs, group.ID)
				}
			}
			if len(studentIDs) == 0 {
				helpers.SuccessResponse(w, map[string]interface{}{
					"posts": []interface{}{},
				})
				return
			}
			filter.AuthorIDs = studentIDs
		case "parents": // my parents (for student role)
			student, err := h.studentService.GetStudentByID(r.Context(), userID)
			if err != nil {
				helpers.HandleServiceError(h.log, w, err)
				return
			}
			parentIDs := []uuid.UUID{}
			for _, parent := range student.Parents {
				parentIDs = append(parentIDs, parent.UserID)
			}
			if len(parentIDs) == 0 {
				helpers.SuccessResponse(w, map[string]interface{}{
					"posts": []interface{}{},
				})
				return
			}
			filter.AuthorIDs = parentIDs
		case "classmates": // my student group, i.e. my classmates (for student role)
			student, err := h.studentService.GetStudentByID(r.Context(), userID)
			if err != nil {
				helpers.HandleServiceError(h.log, w, err)
				return
			}
			classmateIDs := []uuid.UUID{}
			for _, classmate := range student.StudentGroup.Students {
				if classmate.UserID != userID {
					classmateIDs = append(classmateIDs, classmate.UserID)
				}
			}
			if len(classmateIDs) == 0 {
				helpers.SuccessResponse(w, map[string]interface{}{
					"posts": []interface{}{},
				})
				return
			}
			filter.AuthorIDs = classmateIDs
		default:
			h.log.Error("failed to parse author query parameter")
			helpers.BadRequestFieldError(h.log, w, "author")
			return
		}
	}
	// Parse limit if passed
	if limitString != "" {
		if limit, err := strconv.Atoi(limitString); err == nil && limit > 0 {
			if limit > 100 {
				limit = 100 // max value
			}
			filter.Limit = limit
		} else {
			h.log.Error("invalid limit")
			helpers.BadRequestFieldError(h.log, w, "limit")
			return
		}
	}
	// Parse offset if passed
	if offsetString != "" {
		if offset, err := strconv.Atoi(offsetString); err == nil && offset >= 0 {
			filter.Offset = offset
		} else {
			h.log.Error("invalid offset")
			helpers.BadRequestFieldError(h.log, w, "offset")
			return
		}
	}
	// Get posts
	posts, err := h.postService.GetPosts(r.Context(), filter)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get posts: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"posts": posts,
	})
}

func (h *PostHandler) GetOwnPosts(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodGet {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Parse query parameters (for filter)
	moderationStatusStrings := r.URL.Query()["moderationStatus"]
	thingReturnedToOwnerString := r.URL.Query().Get("thingReturnedToOwner")
	limitString := r.URL.Query().Get("limit")
	offsetString := r.URL.Query().Get("offset")
	// Pre-assemble filter (fill with default values)
	filter := repository.PostFilter{
		Limit:  20,
		Offset: 0,
	}
	// Get and convert user ID
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		h.log.Error("failed to get userID from context and convert it to UUID")
		helpers.InternalError(h.log, w)
		return
	}
	// Set author ID to user ID
	filter.AuthorIDs = []uuid.UUID{userID}
	// Parse moderation statuses if passed
	if len(moderationStatusStrings) > 0 {
		moderationStatuses := []model.ModerationStatus{}
		for _, statusString := range moderationStatusStrings {
			status, err := model.ParseModerationStatus(statusString)
			if err != nil || status == nil {
				h.log.Error("cannot parse moderation status")
				helpers.BadRequestFieldError(h.log, w, "moderationStatus")
				return
			}
			moderationStatuses = append(moderationStatuses, *status)
		}
		filter.ModerationStatuses = moderationStatuses
	}
	// Parse thing returning to owner status if passed
	if thingReturnedToOwnerString != "" {
		thingReturnedToOwner, err := strconv.ParseBool(thingReturnedToOwnerString)
		if err != nil {
			h.log.Error("cannot convert thing returning to owner status from string to boolean")
			helpers.BadRequestFieldError(h.log, w, "thingReturnedToOwner")
			return
		}
		filter.ThingReturnedToOwner = &thingReturnedToOwner
	}
	// Parse limit if passed
	if limitString != "" {
		if limit, err := strconv.Atoi(limitString); err == nil && limit > 0 {
			if limit > 100 {
				limit = 100 // max value
			}
			filter.Limit = limit
		} else {
			h.log.Error("invalid limit")
			helpers.BadRequestFieldError(h.log, w, "limit")
			return
		}
	}
	// Parse offset if passed
	if offsetString != "" {
		if offset, err := strconv.Atoi(offsetString); err == nil && offset >= 0 {
			filter.Offset = offset
		} else {
			h.log.Error("invalid offset")
			helpers.BadRequestFieldError(h.log, w, "offset")
			return
		}
	}
	// Get posts
	posts, err := h.postService.GetPosts(r.Context(), filter)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get posts: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"posts": posts,
	})
}

func (h *PostHandler) ChangeModerationStatus(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodPatch {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Restrictions
	// TODO: think about the restrictions in the whole code
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
	// Parse form
	if err := r.ParseForm(); err != nil {
		h.log.Error("failed to parse x-www-form-urlencoded form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get and parse new moderation status
	moderationStatusFields := r.PostForm["moderationStatus"]
	if len(moderationStatusFields) != 1 {
		h.log.Error("failed to parse form: moderationStatus value must be provided exactly once")
		helpers.FieldExactlyOneError(h.log, w, "moderationStatus")
		return
	}
	moderationStatus, err := model.ParseModerationStatus(moderationStatusFields[0])
	if err != nil || moderationStatus == nil {
		h.log.Error("failed to parse moderation status")
		helpers.BadRequestFieldError(h.log, w, "moderationStatus")
		return
	}
	// Get reject reason
	var rejectReason *string
	rejectReasonFields := r.PostForm["rejectReason"]
	if len(rejectReasonFields) > 1 {
		h.log.Error(fmt.Sprintf("failed to parse form: too many rejectReason values (%d)", len(rejectReasonFields)))
		helpers.TooManyFieldsError(h.log, w, "rejectReason")
		return
	} else if len(rejectReasonFields) != 0 && strings.TrimSpace(rejectReasonFields[0]) != "" {
		rejectReason = &rejectReasonFields[0]
	}
	// Get and convert user ID
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		h.log.Error("failed to get userID from context and convert it to UUID")
		helpers.InternalError(h.log, w)
		return
	}
	// Get user
	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get user by id from the context: %w", err))
		return
	}
	// Check if user is human
	// TODO: is it necessary? The bot cannot be logged in
	if user.Type != model.UserTypeHuman {
		h.log.Error("the user must be a human, but current user type is %s", string(user.Type))
		helpers.ForbiddenError(h.log, w)
		return
	}
	// Change moderation status
	postResponse, err := h.postService.ChangePostModerationStatus(r.Context(), postID, *moderationStatus, &userID, rejectReason)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to change post moderation status: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"post": postResponse,
	})
}

func (h *PostHandler) ReturnToOwner(w http.ResponseWriter, r *http.Request) {
	// Check method
	if r.Method != http.MethodPatch {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	// Restrictions
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
	// Parse form
	if err := r.ParseForm(); err != nil {
		h.log.Error("failed to parse x-www-form-urlencoded form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get and convert post ID
	postID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		h.log.Error("cannot convert post id to uuid")
		helpers.BadRequestFieldError(h.log, w, "id")
		return
	}
	// Get post
	post, err := h.postService.GetPostByID(r.Context(), postID)
	if err != nil || post == nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to find the post by ID: %w", err))
		return
	}
	// Check if the post is approved
	if post.Moderation.Status != model.ModerationStatusApproved && post.Moderation.Status != model.ModerationStatusAutoApproved {
		h.log.Error("forbidden: you cannot close unapproved post")
		helpers.ForbiddenError(h.log, w)
		return
	}
	// Get user permissions
	userPermissions, ok := r.Context().Value(middleware.UserPermissionsKey).([]string)
	if !ok {
		h.log.Error("failed to get user permissions from the context")
		helpers.InternalError(h.log, w)
		return
	}
	// Check if user updating his own post
	if slices.Contains(userPermissions, permissions.PostMarkReturnedOwn) && !slices.Contains(userPermissions, permissions.PostMarkReturnedAny) {
		// Get and convert user ID
		userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
		if !ok {
			h.log.Error("failed to get userID from context and convert it to UUID")
			helpers.InternalError(h.log, w)
			return
		}
		// Check if the post belongs to the user
		if userID != post.Author.ID {
			h.log.Error("forbidden: you do not have permission to change status of this post")
			helpers.ForbiddenError(h.log, w)
			return
		}
	}
	// Update post
	postResponse, err := h.postService.ReturnToOwner(r.Context(), postID)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to change post status: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"post": postResponse,
	})
}

func (h *PostHandler) GetSimilar(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 15<<20) // 15 MB
	if err := r.ParseMultipartForm(15 << 20); err != nil {
		h.log.Error("failed to parse multipart/formdata form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// All fields are optional
	dto := service.GetSimilarDTO{}
	// Get post ID
	if idFields := r.PostForm["id"]; len(idFields) == 1 {
		postID, err := uuid.Parse(idFields[0])
		if err != nil {
			h.log.Error("cannot convert post id to uuid")
			helpers.BadRequestFieldError(h.log, w, "id")
			return
		}
		dto.ID = &postID
	} else if len(idFields) != 0 {
		h.log.Error("failed to parse form: too many id values")
		helpers.TooManyFieldsError(h.log, w, "id")
		return
	}
	// Get hasPhoto
	if hasPhotoFields := r.PostForm["hasPhoto"]; len(hasPhotoFields) == 1 {
		hasPhoto, err := strconv.ParseBool(hasPhotoFields[0])
		if err != nil {
			h.log.Error("cannot convert hasPhoto from string to boolean")
			helpers.BadRequestFieldError(h.log, w, "hasPhoto")
			return
		}
		dto.HasPhoto = hasPhoto
	} else {
		h.log.Error("failed to parse form: hasPhoto must be specified exactly once")
		helpers.FieldExactlyOneError(h.log, w, "hasPhoto")
		return
	}
	// Get photo file
	formFiles := r.MultipartForm.File["photo"]
	if len(formFiles) == 1 {
		dto.Photo = formFiles[0]
	} else if len(formFiles) != 0 {
		h.log.Error("failed to parse form: too many photo files")
		helpers.TooManyFieldsError(h.log, w, "photo")
		return
	}
	// Get name
	if nameFields := r.PostForm["name"]; len(nameFields) == 1 {
		dto.Name = &nameFields[0]
	} else if len(nameFields) != 0 {
		h.log.Error("failed to parse form: too many name values")
		helpers.TooManyFieldsError(h.log, w, "name")
		return
	}
	// Get description
	if descriptionFields := r.PostForm["description"]; len(descriptionFields) == 1 {
		dto.Description = &descriptionFields[0]
	} else if len(descriptionFields) != 0 {
		h.log.Error("failed to parse form: too many description values")
		helpers.TooManyFieldsError(h.log, w, "description")
		return
	}
	// Get similar posts (if post has photo, the photo by ID has the priority
	// over the passed file)
	posts, err := h.postService.GetSimilar(r.Context(), &dto)
	if err != nil {
		helpers.HandleServiceError(h.log, w, fmt.Errorf("failed to get similar posts: %w", err))
		return
	}
	// Return response
	helpers.SuccessResponse(w, map[string]interface{}{
		"posts": posts,
	})
}
