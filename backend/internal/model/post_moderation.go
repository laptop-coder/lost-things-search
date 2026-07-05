package model

import (
	"fmt"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ModerationStatus string

const (
	ModerationStatusPending      ModerationStatus = "pending"
	ModerationStatusInProgress   ModerationStatus = "in_progress"
	ModerationStatusAutoApproved ModerationStatus = "auto_approved"
	ModerationStatusAutoRejected ModerationStatus = "auto_rejected"
	ModerationStatusApproved     ModerationStatus = "approved"
	ModerationStatusRejected     ModerationStatus = "rejected"
	ModerationStatusNeedsReview  ModerationStatus = "needs_review"
)

func ParseModerationStatus(statusString string) (*ModerationStatus, error) {
	switch statusString {
	case "pending":
		s := ModerationStatusPending
		return &s, nil
	case "in_progress":
		s := ModerationStatusInProgress
		return &s, nil
	case "auto_approved":
		s := ModerationStatusAutoApproved
		return &s, nil
	case "auto_rejected":
		s := ModerationStatusAutoRejected
		return &s, nil
	case "approved":
		s := ModerationStatusApproved
		return &s, nil
	case "rejected":
		s := ModerationStatusRejected
		return &s, nil
	case "needs_review":
		s := ModerationStatusNeedsReview
		return &s, nil
	}
	return nil, fmt.Errorf("failed to parse post moderation status")
}

// PostModeration contains a model of a table with info about post moderation
// status, moderator type, etc
type PostModeration struct {
	// one-to-one (post_moderation-to-post)
	PostID uuid.UUID `gorm:"type:uuid;primaryKey"`

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt

	Status        ModerationStatus `gorm:"type:varchar(50);default:pending"`
	ModeratorID   *uuid.UUID        `gorm:"type:uuid;default:null"`
	ModeratorUser *User             `gorm:"foreignKey:ModeratorID;references:ID"`
	RejectReason  *string          `gorm:"type:varchar(100)"`
}
