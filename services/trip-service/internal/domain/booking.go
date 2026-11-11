package domain

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	ErrTripNotFound    = errors.New("trip not found for rider")
	ErrRequestConflict = errors.New("request key already used for another quote")
)

type BookingRepo interface {
	TripRepo
	BindRequest(context.Context, string, string, primitive.ObjectID) error
	GetTrip(context.Context, string, primitive.ObjectID) (*TripModel, error)
	CancelTrip(context.Context, string, primitive.ObjectID) (*TripModel, error)
}
