package routing

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
	"github.com/morshedalamdev/ride-share/shared/types"
)

type OSRM struct {
	baseURL string
	client  *http.Client
}

func NewOSRM(baseURL string, client *http.Client) *OSRM {
	return &OSRM{baseURL: strings.TrimRight(baseURL, "/"), client: client}
}

func (p *OSRM) Route(ctx context.Context, pickup, destination types.Coordinate) (types.Route, error) {
	url := fmt.Sprintf("%s/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false&steps=false",
		p.baseURL, pickup.Longitude, pickup.Latitude, destination.Longitude, destination.Latitude)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return types.Route{}, err
	}

	res, err := p.client.Do(req)
	if err != nil {
		return types.Route{}, err
	}
	defer res.Body.Close()

	// OSRM uses HTTP 400 for routing outcomes such as NoSegment and NoRoute
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusBadRequest {
		return types.Route{}, fmt.Errorf("OSRM HTTP status %d", res.StatusCode)
	}
	var result struct {
		Code   string `json:"code"`
		Routes []struct {
			Distance *float64 `json:"distance"`
			Duration *float64 `json:"duration"`
		} `json:"routes"`
	}

	if err := json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(&result); err != nil {
		return types.Route{}, fmt.Errorf("decode OSRM response: %e", err)
	}
	if result.Code == "NoRoute" || result.Code == "NoSegment" {
		return types.Route{}, service.ErrNoRoute
	}
	if res.StatusCode != http.StatusOK || result.Code != "Ok" || len(result.Routes) == 0 {
		return types.Route{}, fmt.Errorf("unexpected OSRM route response: HTTP %d, code %q", res.StatusCode, result.Code)
	}

	first := result.Routes[0]
	if first.Distance == nil || first.Duration == nil || *first.Distance < 0 || *first.Duration < 0 {
		return types.Route{}, fmt.Errorf("invalid OSRM route metrics")
	}

	return types.Route{Distance: *first.Distance, Duration: *first.Duration}, nil
}
