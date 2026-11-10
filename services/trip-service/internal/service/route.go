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
