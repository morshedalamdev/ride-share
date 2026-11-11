package repository

import (
	"context"
	"sync"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type inmemRepo struct {
	mu           sync.Mutex
	quotes       map[primitive.ObjectID]domain.RideFareModel
	tripsByQuote map[primitive.ObjectID]domain.TripModel
}

func NewInmemRepo() *inmemRepo {
	return &inmemRepo{
		quotes:       make(map[primitive.ObjectID]domain.RideFareModel),
		tripsByQuote: make(map[primitive.ObjectID]domain.TripModel),
	}
}

func (r *inmemRepo) BookQuote(
	ctx context.Context,
	rider string,
	id primitive.ObjectID,
) (*domain.TripModel, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if err := ctx.Err(); err != nil {
		return nil, err
	}

	fare, ok := r.quotes[id]
	if !ok || fare.UserID != rider {
		return nil, domain.ErrQuoteNotFound
	}

	if trip, exists := r.tripsByQuote[id]; exists {
		return &trip, nil
	}

	trip := domain.TripModel{
		ID:       primitive.NewObjectID(),
		UserID:   fare.UserID,
		Status:   domain.Pending,
		RideFare: fare,
	}
	r.tripsByQuote[id] = trip

	return &trip, nil
}
