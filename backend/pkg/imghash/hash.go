package imghash

import (
	"github.com/corona10/goimagehash"
	"image"
)

type HashCalculator interface {
	PerceptualHash(img image.Image) (uint64, error)
}

type hashCalculator struct{}

func NewHashCalculator() HashCalculator {
	return &hashCalculator{}
}

func (s *hashCalculator) PerceptualHash(img image.Image) (uint64, error) {
	hash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		return 0, err
	}
	hashUint64 := hash.GetHash()
	return hashUint64, nil
}
