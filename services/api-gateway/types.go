package main

import (
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
)

type coordinateInput struct {
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

func (c coordinateInput) toProto() *tripv1.Coordinate {
	if c.Latitude == nil || c.Longitude == nil {
		return nil
	}

	return &tripv1.Coordinate{
		Latitude:  *c.Latitude,
		Longitude: *c.Longitude,
	}
}

type previewTripReq struct {
	UserID      string          `json:"user_id"`
	Pickup      coordinateInput `json:"pickup"`
	Destination coordinateInput `json:"destination"`
}

type quoteJSON struct {
	RideClass     string `json:"ride_class"`
	TotalUSDCents int64  `json:"total_usd_cents"`
	QuoteID       string `json:"quote_id"`
}

type previewTripJSON struct {
	DistanceMeters  float64     `json:"distance_meters"`
	DurationSeconds float64     `json:"duration_seconds"`
	Quotes          []quoteJSON `json:"quotes"`
}

func previewJSON(reply *tripv1.PreviewTripResponse) previewTripJSON {
	out := previewTripJSON{
		DistanceMeters:  reply.DistanceMeters,
		DurationSeconds: reply.DurationSeconds,
		Quotes:          make([]quoteJSON, 0, len(reply.GetQuotes())),
	}

	for _, q := range reply.GetQuotes() {
		out.Quotes = append(out.Quotes, quoteJSON{
			RideClass: q.GetRideClass(), TotalUSDCents: q.GetTotalUsdCents(), QuoteID: q.GetQuoteId(),
		})
	}
	return out
}
