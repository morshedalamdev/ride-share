package tripgrpc

import (
	"context"

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

	route, err := s.routes.Route(ctx, pickup, destination)
	if err != nil {
		if ctx.Err() != nil {
			return nil, status.FromContextError(ctx.Err()).Err()
		}
		return nil, status.Error(codes.Unavailable, "route provider unavailable")
	}

	return &tripv1.PreviewTripResponse{
		DistanceMeters:  route.Distance,
		DurationSeconds: route.Duration,
	}, nil
}
