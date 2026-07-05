package model

import (
	"gorm.io/gorm"
	"time"
)

type InstitutionAdministratorPosition struct {
	ID        uint16 `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
	Name      string `gorm:"type:varchar(200);unique;check:length(trim(name)) >= 4"`
	// 1. Can't remove position if there are at least one person with it
	// 2. one-to-many (position-to-administrator)
	InstitutionAdministrators []InstitutionAdministrator `gorm:"foreignKey:PositionID;references:ID;constraint:OnDelete:restrict,OnUpdate:restrict"`
}
