package model

import (
	"github.com/google/uuid"
	"time"
)

// PostModeration contains a model of a table with info about post moderation
// status, moderator type, etc
type PostModeration struct {
	// one-to-one (post_moderation-to-post)
	PostID uuid.UUID `gorm:"type:uuid;primaryKey"`

	CreatedAt time.Time
	UpdatedAt time.Time

	Status           string     `gorm:"type:varchar(50)"`
	ModeratorType    string     `gorm:"type:varchar(50)"`
	HumanModeratorID *uuid.UUID `gorm:"type:uuid"`
	HumanModerator   *User      `gorm:"foreignKey:HumanModeratorID;references:ID"`
	RejectReason     *string    `gorm:"type:varchar(100)"`
}
