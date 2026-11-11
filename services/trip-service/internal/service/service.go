package service

import (
	"context"
	"strings"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type service struct {
	repo domain.TripRepo
}

func NewService(repo domain.TripRepo) *service {
	return &service{
		repo: repo,
	}
}

func (s *service) CreateTrip(
	ctx context.Context,
	rider string,
	quoteID primitive.ObjectID,
) (*domain.TripModel, error) {
	if strings.TrimSpace(rider) == "" || quoteID.IsZero() {
		return nil, domain.ErrInvalidBooking
	}
	return s.repo.BookQuote(ctx, rider, quoteID)
}

var _ domain.TripService = (*service)(nil)
