package tripgrpc

import (
	"context"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func bookingID(rider, raw string) (primitive.ObjectID, error) {
	id, err := primitive.ObjectIDFromHex(raw)
	if strings.TrimSpace(rider) == "" || err != nil || id.IsZero() {
		return primitive.NilObjectID, status.Error(
			codes.InvalidArgument, "ride and valid IDare required",
		)
	}
	return id, nil
}

func bookingReply(trip *domain.TripModel, err error) (*tripv1.Trip, error) {
	switch {
	case errors.Is(err, domain.ErrQuoteNotFound),
		errors.Is(err, domain.ErrTripNotFound):
		return nil, status.Error(codes.NotFound, err.Error())
	case errors.Is(err, domain.ErrTransition),
		errors.Is(err, domain.ErrRequestConflict):
		return nil, status.Error(codes.FailedPrecondition, err.Error())
	case errors.Is(err, context.Canceled),
		errors.Is(err, context.DeadlineExceeded):
		return nil, status.FromContextError(err).Err()
	case err != nil:
		log.Printf("booking operation: %v", err)
		return nil, status.Error(codes.Unavailable, "trip storage unavailable")
	}

	f := trip.RideFare
	return &tripv1.Trip{
		TripId: trip.ID.Hex(),
		Status: string(trip.Status),
		Quote: &tripv1.FareQuote{
			QuoteId:       f.ID.Hex(),
			RideClass:     f.RideClass,
			TotalUsdCents: f.TotalCents,
		},
		AmountDueCents: trip.AmountDueCents(),
		Pickup: &tripv1.Coordinate{
			Latitude:  f.Pickup.Latitude,
			Longitude: f.Pickup.Longitude,
		},
		Destination: &tripv1.Coordinate{
			Latitude:  f.Destination.Latitude,
			Longitude: f.Destination.Longitude,
		},
		DistanceMeters:  f.DistanceMeters,
		DurationSeconds: f.DurationSeconds,
		CreatedAt:       trip.ID.Timestamp().UTC().Format(time.RFC3339),
	}, nil
}

func (s *Server) BookTrip(
	ctx context.Context,
	req *tripv1.BookTripRequest,
) (*tripv1.Trip, error) {
	id, err := bookingID(req.GetUserId(), req.GetQuoteId())
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(req.GetRequestKey()) == "" || len(req.GetRequestKey()) > 128 {
		return nil, status.Error(
			codes.InvalidArgument, "request_key must contain 1 to 128 bytes",
		)
	}
	if err := s.trips.BindRequest(ctx, req.UserId, req.RequestKey, id); err != nil {
		return bookingReply(nil, err)
	}

	return bookingReply(service.NewService(s.trips).CreateTrip(ctx, req.UserId, id))
}

func (s *Server) CancelTrip(
	ctx context.Context,
	req *tripv1.TripRequest,
) (*tripv1.Trip, error) {
	id, err := bookingID(req.GetUserId(), req.GetTripId())
	if err != nil {
		return nil, err
	}

	return bookingReply(s.trips.CancelTrip(ctx, req.UserId, id))
}
