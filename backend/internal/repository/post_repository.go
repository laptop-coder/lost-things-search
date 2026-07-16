package repository

import (
	"backend/internal/model"
	"backend/pkg/apperrors"
	"backend/pkg/logger"
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/valkey-io/valkey-go"
	"gorm.io/gorm"
	"math/bits"
	"slices"
	"strconv"
	"strings"
)

type PostRepository interface {
	Create(ctx context.Context, post *model.Post) error
	FindAll(ctx context.Context, filter *PostFilter) ([]model.Post, error)
	FindByID(ctx context.Context, id *uuid.UUID) (*model.Post, error)
	Update(ctx context.Context, post *model.Post) error
	Delete(ctx context.Context, id *uuid.UUID) error
	FindSimilarByImageHashDistance(ctx context.Context, hash uint64, maxDistance uint16) ([]model.Post, error)
	FindSimilarByName(ctx context.Context, name string) ([]model.Post, error)
	FindSimilarByDescription(ctx context.Context, description string) ([]model.Post, error)
	GetPhotoHash(ctx context.Context, postID uuid.UUID) (uint64, error)
	UpdatePhotoHash(ctx context.Context, postID uuid.UUID, hash uint64) error
	DeletePhotoHash(ctx context.Context, postID uuid.UUID) error
	FindPhotosWithoutHashes(ctx context.Context) ([]uuid.UUID, error)
}

type postRepository struct {
	db     *gorm.DB
	client valkey.Client
	log    logger.Logger
}

type PostFilter struct {
	AuthorIDs            []uuid.UUID
	ModerationStatuses   []model.ModerationStatus
	ThingReturnedToOwner *bool
	Limit                int
	Offset               int
}

func NewPostRepository(db *gorm.DB, client valkey.Client, log logger.Logger) PostRepository {
	if db == nil {
		log.Error("DB is nil")
		panic("DB is nil")
	}
	return &postRepository{db: db, client: client, log: log}
}

func (r *postRepository) FindAll(ctx context.Context, filter *PostFilter) ([]model.Post, error) {
	if filter == nil {
		return nil, fmt.Errorf("posts list filter cannot be nil: %w", apperrors.ErrRequiredField)
	}
	var posts []model.Post
	query := r.db.WithContext(ctx).Model(&model.Post{}).Preload("Moderation")
	// Filters
	// by post's author:
	if len(filter.AuthorIDs) > 0 {
		query = query.
			Where("posts.author_id IN (?)", filter.AuthorIDs)
	}
	// by verification status:
	if len(filter.ModerationStatuses) > 0 {
		query = query.
			Joins("JOIN post_moderations ON post_moderations.post_id = posts.id").
			Where("post_moderations.status IN (?)", filter.ModerationStatuses)
	}
	// by thing return status:
	if filter.ThingReturnedToOwner != nil {
		query = query.
			Where("posts.thing_returned_to_owner = ?", *filter.ThingReturnedToOwner)
	}
	// offset (for pagination):
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	// limit (for pagination):
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	// Sort posts
	query = query.Order("created_at DESC")
	// Find posts
	result := query.Preload("Author").Preload("Author.Roles").Find(&posts)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to fetch posts list: %w", result.Error)
	}
	// Return response
	return posts, nil
}

func (r *postRepository) FindByID(ctx context.Context, id *uuid.UUID) (*model.Post, error) {
	if id == nil {
		return nil, fmt.Errorf("post id cannot be nil: %w", apperrors.ErrRequiredField)
	}
	var post model.Post
	result := r.db.WithContext(ctx).Preload("Moderation").Preload("Author").Preload("Author.Roles").First(&post, *id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("post with id %s was not found: %s: %w", *id, result.Error.Error(), apperrors.ErrPostNotFound)
		}
		return nil, fmt.Errorf("failed to fetch post by id (%s): %w", *id, result.Error)
	}
	return &post, nil
}

func (r *postRepository) Create(ctx context.Context, post *model.Post) error {
	if post == nil {
		return fmt.Errorf("post cannot be nil: %w", apperrors.ErrRequiredField)
	}
	result := r.db.WithContext(ctx).Create(post)
	if result.Error != nil {
		return fmt.Errorf("failed to create new post: %w", result.Error)
	}
	return nil
}

func (r *postRepository) Update(ctx context.Context, post *model.Post) error {
	if post == nil {
		return fmt.Errorf("post cannot be nil: %w", apperrors.ErrRequiredField)
	}
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.Post{}).
		Where("id = ?", post.ID).
		Count(&count).Error
	if err != nil {
		return fmt.Errorf("failed to check post existence: %w", err)
	}
	if count == 0 {
		return fmt.Errorf("post with id %s was not found: %w", post.ID.String(), apperrors.ErrPostNotFound)
	}
	result := r.db.WithContext(ctx).Save(post)
	if result.Error != nil {
		return fmt.Errorf("failed to update post: %w", result.Error)
	}
	return nil
}

func (r *postRepository) Delete(ctx context.Context, id *uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&model.Post{}, *id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete post with id %s: %w", *id, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("post to delete was not found by id: %w", apperrors.ErrPostNotFound)
	}
	return nil
}

func (r *postRepository) FindSimilarByImageHashDistance(ctx context.Context, hash1 uint64, maxDistance uint16) ([]model.Post, error) {
	var similarIDs []uuid.UUID
	var cursor uint64 = 0
	for {
		// Execute command
		res := r.client.Do(ctx, r.client.B().Scan().Cursor(cursor).Match("post:photo:hash:*").Count(1000).Build())
		// Parse result
		scanEntry, err := res.AsScanEntry()
		if err != nil {
			return nil, fmt.Errorf("failed to parse result: %w", err)
		}
		for _, rawKey := range scanEntry.Elements {
			keyString := strings.TrimPrefix(rawKey, "post:photo:hash:")
			// Convert to UUID
			key, err := uuid.Parse(keyString)
			if err != nil {
				r.log.Error("failed to convert post id to uuid", "post_id", keyString)
				return nil, fmt.Errorf("failed to convert post id (%s) to uuid: %w", keyString, err)
			}
			// Get hash (value) by post id (the part of the key)
			hash2, err := r.GetPhotoHash(ctx, key)
			if err != nil {
				r.log.Error("failed to get post photo hash", "error", err.Error())
				return nil, fmt.Errorf("failed to get post photo hash: %w", err)
			}
			// Calculate the Hamming distance
			if bits.OnesCount64(hash1^hash2) <= int(maxDistance) {
				similarIDs = append(similarIDs, key)
			}
		}
		cursor = scanEntry.Cursor
		if cursor == 0 {
			break
		}
	}
	// Get similar posts
	if len(similarIDs) == 0 {
		return nil, nil
	}
	var similarPosts []model.Post
	result := r.db.WithContext(ctx).Model(&model.Post{}).Where("posts.ID IN (?)", similarIDs).Order("created_at DESC").Find(&similarPosts)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to fetch list of similar posts: %w", result.Error)
	}
	return similarPosts, nil
}

func (r *postRepository) FindSimilarByName(ctx context.Context, name string) ([]model.Post, error) {
	var posts []model.Post
	result := r.db.WithContext(ctx).
		Where("name % ?", name).
		Preload("Author").
		Preload("Author.Roles").
		Find(&posts)
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to fetch list of posts similar by name: %w", result.Error)
	}
	return posts, nil
}

func (r *postRepository) FindSimilarByDescription(ctx context.Context, description string) ([]model.Post, error) {
	var posts []model.Post
	result := r.db.WithContext(ctx).
		Where("description % ?", description).
		Preload("Author").
		Preload("Author.Roles").
		Find(&posts)
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to fetch list of posts similar by description: %w", result.Error)
	}
	return posts, nil
}

func (r *postRepository) GetPhotoHash(ctx context.Context, postID uuid.UUID) (uint64, error) {
	// Get hash
	hashString, err := r.client.Do(ctx, r.client.B().
		Get().
		Key(fmt.Sprintf("post:photo:hash:%s", postID.String())).
		Build(),
	).ToString()
	if err != nil {
		r.log.Error("failed to get photo hash by post id", "post_id", postID.String())
		return 0, fmt.Errorf("failed to get photo hash by post id: %w", err)
	}
	// Convert to uint64
	hash, err := strconv.ParseUint(hashString, 10, 64)
	if err != nil {
		r.log.Error("cannot convert post photo hash from string to uint64")
		return 0, fmt.Errorf("cannot convert post photo hash from string to uint64")
	}
	return hash, nil
}

func (r *postRepository) UpdatePhotoHash(ctx context.Context, postID uuid.UUID, hash uint64) error {
	if err := r.client.Do(ctx, r.client.B().
		Set().
		Key(fmt.Sprintf("post:photo:hash:%s", postID.String())).
		Value(strconv.FormatUint(hash, 10)).
		ExSeconds(60*60*24*365). // 1 year
		Build(),
	).Error(); err != nil {
		r.log.Error("failed to update post photo hash", "error", err.Error())
		return fmt.Errorf("failed to update post photo hash: %w", err)
	}
	r.log.Info("successfully updated post photo hash", "post_id", postID.String())
	return nil
}

func (r *postRepository) DeletePhotoHash(ctx context.Context, postID uuid.UUID) error {
	if err := r.client.Do(ctx, r.client.B().
		Del().
		Key(fmt.Sprintf("post:photo:hash:%s", postID.String())).
		Build(),
	).Error(); err != nil {
		r.log.Error("failed to delete post photo hash", "error", err.Error())
		return fmt.Errorf("failed to delete post photo hash: %w", err)
	}
	r.log.Info("successfully deleted post photo hash", "post_id", postID.String())
	return nil
}

func (r *postRepository) FindPhotosWithoutHashes(ctx context.Context) ([]uuid.UUID, error) {
	var idsWithoutHashes []uuid.UUID
	var idsWithHashes []uuid.UUID
	var cursor uint64 = 0
	for {
		// Execute command
		res := r.client.Do(ctx, r.client.B().Scan().Cursor(cursor).Match("post:photo:hash:*").Count(1000).Build())
		// Parse result
		scanEntry, err := res.AsScanEntry()
		if err != nil {
			return nil, fmt.Errorf("failed to parse result: %w", err)
		}
		for _, rawKey := range scanEntry.Elements {
			keyString := strings.TrimPrefix(rawKey, "post:photo:hash:")
			// Convert to UUID
			key, err := uuid.Parse(keyString)
			if err != nil {
				r.log.Error("failed to convert post id to uuid", "post_id", keyString)
				return nil, fmt.Errorf("failed to convert post id (%s) to uuid: %w", keyString, err)
			}
			idsWithHashes = append(idsWithHashes, key)
		}
		cursor = scanEntry.Cursor
		if cursor == 0 {
			break
		}
	}
	// Get IDs of posts with photos
	var postsWithPhotos []model.Post
	result := r.db.WithContext(ctx).Model(&model.Post{}).Where("posts.has_photo = true").Order("created_at DESC").Find(&postsWithPhotos)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to fetch list of posts with photos: %w", result.Error)
	}
	// Collect ids
	for _, p := range postsWithPhotos {
		if !slices.Contains(idsWithHashes, p.ID) {
			idsWithoutHashes = append(idsWithoutHashes, p.ID)
		}
	}
	return idsWithoutHashes, nil
}
