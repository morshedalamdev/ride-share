package service

import (
	"context"
	"strings"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
)

type service struct {
	repo domain.TripRepository
}

func NewService(repo domain.TripRepository) *service {
	return &service{
		repo: repo,
	}
}

func (s *service) CreateTrip(
	ctx context.Context,
	rider string,
	quoteID string,
) (*domain.TripModel, error) {
	if strings.TrimSpace(rider) == "" || strings.TrimSpace(quoteID) == "" {
		return nil, domain.ErrInvalidBooking
	}
	return s.repo.BookQuote(ctx, rider, quoteID)
}
