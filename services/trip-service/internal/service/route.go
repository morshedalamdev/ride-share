package service

import (
	"context"

	"github.com/morshedalamdev/ride-share/shared/types"
)

type RouteProvider interface {
	Route(ctx context.Context, pickup, destination types.Coordinate) (types.Route, error)
}

type FixedRouteProvider struct{}

func (FixedRouteProvider) Route(_ context.Context, _, _ types.Coordinate) (types.Route, error) {
	return types.Route{
		Distance: 7400,
		Duration: 1080,
	}, nil
}
