package model

import (
	"gorm.io/gorm"
	"time"
)

type Permission struct {
	ID        uint16 `gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
	Name      string `gorm:"type:varchar(150);unique;check:length(trim(name)) >= 6"`
	// many-to-many (permission-to-role)
	Roles []Role `gorm:"many2many:role_permissions;foreignKey:ID;joinForeignKey:PermissionID;references:ID;joinReferences:RoleID"`
}
