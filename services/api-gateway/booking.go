package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func handleBooking(client tripv1.TripServiceClient, action string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")

		var input struct {
			UserID     string `json:"user_id"`
			QuoteID    string `json:"quote_id"`
			RequestKey string `json:"request_key"`
		}
		input.UserID = r.URL.Query().Get("user_id")

		if r.Method == http.MethodPost {
			decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096))
			if err := decoder.Decode(&input); err != nil {
				http.Error(w, "invalid JSON", http.StatusBadRequest)
				return
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		req := &tripv1.TripRequest{
			UserId: input.UserID,
			TripId: r.PathValue("id"),
		}
		var trip *tripv1.Trip
		var err error

		switch action {
		case "book":
			trip, err = client.BookTrip(ctx, &tripv1.BookTripRequest{
				UserId:     input.UserID,
				QuoteId:    input.QuoteID,
				RequestKey: input.RequestKey,
			})
		case "read":
			trip, err = client.GetTrip(ctx, req)
		case "cancel":
			trip, err = client.CancelTrip(ctx, req)
		}

		if err != nil {
			code := http.StatusBadGateway
			switch status.Code(err) {
			case codes.InvalidArgument:
				code = http.StatusBadRequest
			case codes.NotFound:
				code = http.StatusNotFound
			case codes.FailedPrecondition:
				code = http.StatusConflict
			case codes.Unavailable:
				code = http.StatusServiceUnavailable
			case codes.DeadlineExceeded:
				code = http.StatusGatewayTimeout
			}
			http.Error(w, status.Convert(err).Message(), code)
			return
		}

		q := trip.GetQuote()
		writeJSON(w, http.StatusOK, map[string]any{
			"trip_id": trip.TripId,
			"status":  trip.Status,
			"quote": quoteJSON{
				RideClass:     q.GetRideClass(),
				QuoteID:       q.GetQuoteId(),
				TotalUSDCents: q.GetTotalUsdCents(),
			},
			"amount_due_cents": trip.AmountDueCents,
			"pickup":           trip.Pickup,
			"destination":      trip.Destination,
			"distance_meters":  trip.DistanceMeters,
			"duration_seconds": trip.DurationSeconds,
			"created_at":       trip.CreatedAt,
		})
	}
}
