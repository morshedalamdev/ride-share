package tripgrpc

import (
	"context"
	"errors"
	"log"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"github.com/morshedalamdev/ride-share/shared/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	tripv1.UnimplementedTripServiceServer
	routes service.RouteProvider
	quotes domain.QuoteRepo
}

func NewServer(routes service.RouteProvider, quotes domain.QuoteRepo) *Server {
	return &Server{routes: routes, quotes: quotes}
}

func validCoordinate(c types.Coordinate) bool {
	return c.Latitude >= -90 && c.Latitude <= 90 && c.Longitude >= -180 && c.Longitude <= 180
}

func (s *Server) PreviewTrip(ctx context.Context, req *tripv1.PreviewTripRequest) (*tripv1.PreviewTripResponse, error) {
	if req.GetUserId() == "" || req.GetPickup() == nil || req.GetDestination() == nil {
		return nil, status.Error(codes.InvalidArgument, "user_id, pickup and destination are required")
	}

	pickup := types.Coordinate{
		Latitude:  req.Pickup.Latitude,
		Longitude: req.Pickup.Longitude,
	}

	destination := types.Coordinate{
		Latitude:  req.Destination.Latitude,
		Longitude: req.Destination.Longitude,
	}

	if !validCoordinate(pickup) || !validCoordinate(destination) {
		return nil, status.Error(codes.InvalidArgument, "latitude must be within [-90, 90] and longitude within [-180, 180]")
	}

	route, err := s.routes.Route(ctx, pickup, destination)
	if err != nil {
		if ctx.Err() != nil {
			return nil, status.FromContextError(ctx.Err()).Err()
		}

		if errors.Is(err, service.ErrNoRoute) {
			return nil, status.Error(codes.NotFound, "no driving route found for these coordinates")
		}

		return nil, status.Error(codes.Unavailable, "route provider unavailable")
	}

	fares, err := service.CalculateQuotes(route.Distance)
	if err != nil {
		return nil, status.Error(codes.Internal, "could not price route")
	}

	stored := make([]domain.RideFareModel, 0, len(fares))
	for _, fare := range fares {
		id, err := primitive.ObjectIDFromHex(fare.ID)
		if err != nil {
			return nil, status.Error(codes.Internal, "invalid generated quote ID")
		}

		stored = append(stored, domain.RideFareModel{
			ID:              id,
			UserID:          req.GetUserId(),
			RideClass:       fare.RideClass,
			TotalCents:      fare.TotalUsdCents,
			Pickup:          pickup,
			Destination:     destination,
			DistanceMeters:  route.Distance,
			DurationSeconds: route.Duration,
		})
	}
	if err := s.quotes.SaveQuote(ctx, stored); err != nil {
		if ctx.Err() != nil {
			return nil, status.FromContextError(ctx.Err()).Err()
		}
		log.Printf("save quotes: %v", err)
		return nil, status.Error(codes.Unavailable, "quote storage unavailable")
	}

	quotes := make([]*tripv1.FareQuote, 0, len(fares))
	for _, fare := range fares {
		quotes = append(quotes, &tripv1.FareQuote{
			RideClass:     fare.RideClass,
			TotalUsdCents: fare.TotalUSDCents,
			QuoteId:       fare.ID,
		})
	}

	return &tripv1.PreviewTripResponse{
		DistanceMeters:  route.Distance,
		DurationSeconds: route.Duration,
		Quotes:          quotes,
	}, nil
}
