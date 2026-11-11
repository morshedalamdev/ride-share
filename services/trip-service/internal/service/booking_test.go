package service_test

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/repository"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type bookingRepo struct {
	mu    sync.Mutex
	quote domain.RideFareModel
	trip  *domain.TripModel
}

func (r *bookingRepo) saveQuote(quote domain.RideFareModel) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.quote = quote
}

func (r *bookingRepo) BookQuote(_ context.Context, userID string, quoteID primitive.ObjectID) (*domain.TripModel, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.quote.ID != quoteID || r.quote.UserID != userID {
		return nil, domain.ErrQuoteNotFound
	}
	if r.trip == nil {
		r.trip = &domain.TripModel{
			ID:       primitive.NewObjectID(),
			UserID:   userID,
			RideFare: r.quote,
			Status:   domain.Pending,
		}
	}
	return r.trip, nil
}

type TripRepoAdapter struct {
	repo interface {
		BookQuote(context.Context, string, primitive.ObjectID) (*domain.TripModel, error)
	}
}

func (r *TripRepoAdapter) BookQuote(ctx context.Context, userID, quoteID string) (*domain.TripModel, error) {
	id, err := primitive.ObjectIDFromHex(quoteID)
	if err != nil {
		return nil, domain.ErrQuoteNotFound
	}
	return r.repo.BookQuote(ctx, userID, id)
}

func TestBookSelectedQuote(t *testing.T) {
	repo := repository.NewInmemRepo()
	bookings := service.NewService(repo)
	ctx := t.Context()

	fare := domain.RideFareModel{
		ID:         primitive.NewObjectID(),
		UserID:     "rider-1",
		RideClass:  "suv",
		TotalCents: 2402,
	}
	repo.SaveQuote(fare)

	_, err := bookings.CreateTrip(ctx, "rider-2", fare.ID)
	if !errors.Is(err, domain.ErrQuoteNotFound) {
		t.Fatalf("wrong rider: got %v", err)
	}

	type result struct {
		trip *domain.TripModel
		err  error
	}
	results := make(chan result, 16)

	for range cap(results) {
		go func() {
			trip, err := bookings.CreateTrip(ctx, fare.UserID, fare.ID)
			results <- result{trip, err}
		}()
	}

	var first primitive.ObjectID
	for range cap(results) {
		r := <-results
		if r.err != nil {
			t.Fatal(r.err)
		}
		trip := r.trip
		if trip.ID.IsZero() || trip.ID == fare.ID ||
			trip.UserID != fare.UserID || trip.RideFare != fare ||
			trip.Status != domain.Pending {
			t.Fatalf("unexpected booking: %+v", trip)
		}
		if !first.IsZero() && first != trip.ID {
			t.Fatal("same quote produced different trip IDs")
		}
		first = trip.ID
	}
}

func TestCancellation(t *testing.T) {
	trip := domain.TripModel{
		Status:   domain.Pending,
		RideFare: domain.RideFareModel{TotalCents: 2402},
	}
	if err := trip.Transition(domain.Accepted); err != nil {
		t.Fatal(err)
	}

	afterPickup := trip
	if err := trip.Transition(domain.Canceled); err != nil {
		t.Fatal(err)
	}
	if trip.AmountDueCents() != 0 || trip.RideFare.TotalCents != 2402 {
		t.Fatal("incorrect cancellation fare")
	}

	if err := afterPickup.Transition(domain.InProgress); err != nil {
		t.Fatal(err)
	}
	err := afterPickup.Transition(domain.Canceled)
	if !errors.Is(err, domain.ErrTransition) || afterPickup.Status != domain.InProgress {
		t.Fatal("canceled after pickup")
	}
}
