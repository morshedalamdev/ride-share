package domain

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	ErrInvalidBooking = errors.New("ride and quote ID are required")
	ErrQuoteNotFound  = errors.New("quote not found for rider")
	ErrTransition     = errors.New("invalid trip transition")
)

type TripStatus string

const (
	Pending         TripStatus = "pending"
	Accepted        TripStatus = "accepted"
	InProgress      TripStatus = "in_progress"
	AwaitingPayment TripStatus = "awaiting_payment"
	Completed       TripStatus = "completed"
	Canceled        TripStatus = "canceled"
)

type TripModel struct {
	ID       primitive.ObjectID
	UserID   string
	Status   TripStatus
	RideFare RideFareModel
}

func (t *TripModel) Transition(next TripStatus) error {
	valid := false
	switch t.Status {
	case Pending:
		valid = next == Accepted || next == Canceled
	case Accepted:
		valid = next == InProgress || next == Canceled
	case InProgress:
		valid = next == AwaitingPayment
	case AwaitingPayment:
		valid = next == Completed
	}

	if !valid {
		return ErrTransition
	}

	t.Status = next
	return nil
}

func (t TripModel) AmountDueCents() float64 {
	if t.Status == Canceled {
		return 0
	}
	return t.RideFare.TotalCents
}

type TripRepository interface {
	BookQuote(ctx context.Context, userID string, quoteID string) (*TripModel, error)
}

type TripService interface {
	CreateTrip(ctx context.Context, fare *RideFareModel) (*TripModel, error)
}
