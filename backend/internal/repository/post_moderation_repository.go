package repository

import (
	"backend/internal/model"
	"backend/pkg/apperrors"
	"backend/pkg/logger"
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostModerationRepository interface {
	Create(ctx context.Context, postModeration *model.PostModeration) error
	FindByID(ctx context.Context, id *uuid.UUID) (*model.PostModeration, error)
	Update(ctx context.Context, post *model.PostModeration) error
}

type postModerationRepository struct {
	db     *gorm.DB
	log    logger.Logger
}

func NewPostModerationRepository(db *gorm.DB, log logger.Logger) PostModerationRepository {
	if db == nil {
		log.Error("DB is nil")
		panic("DB is nil")
	}
	return &postModerationRepository{db: db, log: log}
}

func (r *postModerationRepository) FindByID(ctx context.Context, id *uuid.UUID) (*model.PostModeration, error) {
	if id == nil {
		return nil, fmt.Errorf("post id cannot be nil: %w", apperrors.ErrRequiredField)
	}
	var moderation model.PostModeration
	result := r.db.WithContext(ctx).Preload("ModeratorUser").Preload("ModeratorUser.Roles").First(&moderation, *id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("info about post moderation by post id %s was not found: %s: %w", *id, result.Error.Error(), apperrors.ErrPostNotFound)
		}
		return nil, fmt.Errorf("failed to fetch post moderation by post id (%s): %w", *id, result.Error)
	}
	return &moderation, nil
}

func (r *postModerationRepository) Create(ctx context.Context, moderation *model.PostModeration) error {
	if moderation == nil {
		return fmt.Errorf("post moderation parameter cannot be nil: %w", apperrors.ErrRequiredField)
	}
	result := r.db.WithContext(ctx).Create(moderation)
	if result.Error != nil {
		return fmt.Errorf("failed to create new info about post moderation: %w", result.Error)
	}
	return nil
}

func (r *postModerationRepository) Update(ctx context.Context, moderation *model.PostModeration) error {
	if moderation == nil {
		return fmt.Errorf("post moderation parameter cannot be nil: %w", apperrors.ErrRequiredField)
	}
	var count int64
	err := r.db.WithContext(ctx).
		Model(&model.PostModeration{}).
		Where("post_id = ?", moderation.PostID).
		Count(&count).Error
	if err != nil {
		return fmt.Errorf("failed to check post moderation existence: %w", err)
	}
	if count == 0 {
		return fmt.Errorf("post moderation with post id %s was not found: %w", moderation.PostID.String(), apperrors.ErrPostNotFound)
	}
	result := r.db.WithContext(ctx).Save(moderation)
	if result.Error != nil {
		return fmt.Errorf("failed to update post moderation: %w", result.Error)
	}
	return nil
}
