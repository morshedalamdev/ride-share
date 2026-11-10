package service

import (
	"context"
	"errors"

	"github.com/morshedalamdev/ride-share/shared/types"
)

var ErrNoRoute = errors.New("no driving route found")

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
