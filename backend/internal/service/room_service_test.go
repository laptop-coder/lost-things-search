package service

import (
	"backend/internal/model"
	"github.com/google/uuid"
	"testing"
	"time"
)

func TestRoomToDTO(t *testing.T) {
	teacherID := uuid.New()
	createdAt := time.Now()
	updatedAt := time.Now()

	room := &model.Room{
		ID:        17,
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		Name:      "305",
		TeacherID: &teacherID,
	}

	dto := RoomToDTO(room)
	if dto.ID != 17 {
		t.Errorf("expected ID 17, got %d", dto.ID)
	}
	if dto.Name != "305" {
		t.Errorf("expected Name '305', got '%s'", dto.Name)
	}
	if dto.CreatedAt != createdAt.Format(time.RFC3339) {
		t.Errorf("expected CreatedAt '%s', got '%s'", createdAt.Format(time.RFC3339), dto.CreatedAt)
	}
	if dto.UpdatedAt != updatedAt.Format(time.RFC3339) {
		t.Errorf("expected UpdatedAt '%s', got '%s'", updatedAt.Format(time.RFC3339), dto.UpdatedAt)
	}
	if *dto.TeacherID != teacherID {
		t.Errorf("expected TeacherID '%s', got '%s'", teacherID, *dto.TeacherID)
	}
}

func TestRoomToDTONoTeacher(t *testing.T) {
	room := &model.Room{
		ID:        1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Name:      "Без преподавателя",
		TeacherID: nil,
	}

	dto := RoomToDTO(room)

	if dto.TeacherID != nil {
		t.Error("expected TeacherID to be nil")
	}
}
