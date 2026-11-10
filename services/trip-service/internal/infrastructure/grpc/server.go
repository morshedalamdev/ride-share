package tripgrpc

import (
	"context"
	"errors"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"github.com/morshedalamdev/ride-share/shared/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Server struct {
	tripv1.UnimplementedTripServiceServer
	routes service.RouteProvider
}

func NewServer(routes service.RouteProvider) *Server {
	return &Server{routes: routes}
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

	return &tripv1.PreviewTripResponse{
		DistanceMeters:  route.Distance,
		DurationSeconds: route.Duration,
	}, nil
}
