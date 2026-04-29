package handler

import (
	"backend/internal/service"
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

type DocumentHandler struct {
	documentServiceConfig service.DocumentServiceConfig
	log                   logger.Logger
}

func NewDocumentHandler(documentServiceConfig service.DocumentServiceConfig, log logger.Logger) *DocumentHandler {
	return &DocumentHandler{
		documentServiceConfig: documentServiceConfig,
		log:                   log,
	}
}

func (h *DocumentHandler) UploadPrivacy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		helpers.MethodNotAllowedError(h.log, w)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, h.documentServiceConfig.FileMaxSize)
	// TODO: check if r.MultipartForm == nil and r.PostForm == nil (in all handlers)
	if err := r.ParseMultipartForm(h.documentServiceConfig.FileMaxSize); err != nil {
		h.log.Error("failed to parse multipart/formdata form")
		helpers.BadRequestError(h.log, w)
		return
	}
	// Get document from the form
	file, header, err := r.FormFile("file")
	if err != nil {
		h.log.Error("failed to get privacy document file", "error", err.Error())
		helpers.BadRequestFieldError(h.log, w, "file")
		return
	}
	defer file.Close()
	// Check file size
	if header.Size > h.documentServiceConfig.FileMaxSize {
		h.log.Error("file too large")
		helpers.BadRequestFieldError(h.log, w, "file")
		return
	}
	// Check Content-Type
	if header.Header.Get("Content-Type") != "application/pdf" {
		h.log.Error("invalid file type")
		helpers.BadRequestFieldError(h.log, w, "file")
		return
	}
	// Check MIME type
	buffer := make([]byte, 512)
	file.Read(buffer)
	if mimeType := http.DetectContentType(buffer); mimeType != "application/pdf" {
		h.log.Error("invalid file type", "detected_file_type", mimeType)
		helpers.BadRequestFieldError(h.log, w, "file")
		return
	}
	file.Seek(0, io.SeekStart)
	// Create directory (if not exists)
	if err := os.MkdirAll(h.documentServiceConfig.FileUploadPath, 0755); err != nil {
		h.log.Error("failed to create directory for file", "error", err.Error())
		helpers.InternalError(h.log, w)
		return
	}
	// Save file
	dst, err := os.Create(filepath.Join(h.documentServiceConfig.FileUploadPath, "privacy.pdf"))
	if err != nil {
		h.log.Error("failed to save file", "error", err.Error())
		helpers.InternalError(h.log, w)
		return
	}
	defer dst.Close()
	// Write file
	if _, err := io.Copy(dst, file); err != nil {
		h.log.Error("failed to write file", "error", err.Error())
		helpers.InternalError(h.log, w)
		return
	}
	h.log.Info("successfully uploaded new privacy document")
	helpers.JsonResponse(w, nil, http.StatusNoContent)
}
