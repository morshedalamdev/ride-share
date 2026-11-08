package repository

import (
	"context"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
)

type inmemRepo struct {
	trips     map[string]*domain.TripModel
	rideFares map[string]*domain.RideFareModel
}

func NewInmemRepo() *inmemRepo {
	return &inmemRepo{
		trips:     make(map[string]*domain.TripModel),
		rideFares: make(map[string]*domain.RideFareModel),
	}
}

func (r *inmemRepo) CreateTrip(ctx context.Context, trip *domain.TripModel) (*domain.TripModel, error) {
	r.trips[trip.ID.Hex()] = trip

	return trip, nil
}
