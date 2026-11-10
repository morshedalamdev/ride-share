package main

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func handleTripPreview(trips tripv1.TripServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input previewTripReq
		dec := json.NewDecoder(r.Body)

		if err := dec.Decode(&input); err != nil {
			http.Error(w, "expected a JSON preview request", http.StatusBadRequest)
			return
		}
		if err := dec.Decode(new(json.RawMessage)); err != io.EOF {
			http.Error(w, "expected a single JSON request", http.StatusBadRequest)
			return
		}
		if input.UserID == "" {
			http.Error(w, "user_id is required", http.StatusBadRequest)
			return
		}
		req := &tripv1.PreviewTripRequest{
			UserId:      input.UserID,
			Pickup:      input.Pickup.toProto(),
			Destination: input.Destination.toProto(),
		}
		if req.Pickup == nil || req.Destination == nil {
			http.Error(w, "pickup and destination each require latitude and longitude", http.StatusBadRequest)
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()
		reply, err := trips.PreviewTrip(ctx, req)
		if err != nil {
			if r.Context().Err() == nil {
				writePreviewError(w, err)
			}
			return
		}
		writeJSON(w, http.StatusOK, previewJSON(reply))
	}
}

func writePreviewError(w http.ResponseWriter, err error) {
	s := status.Convert(err)
	switch s.Code() {
	case codes.InvalidArgument:
		http.Error(w, s.Message(), http.StatusBadRequest)
	case codes.NotFound:
		http.Error(w, "no driving route found", http.StatusNotFound)
	case codes.DeadlineExceeded:
		http.Error(w, "trip preview timed out", http.StatusGatewayTimeout)
	case codes.Unavailable:
		http.Error(w, "trip preview temporarily unavailable", http.StatusServiceUnavailable)
	default:
		http.Error(w, "trip preview failed", http.StatusBadGateway)
	}
}

func handleHealthCheck(w http.ResponseWriter, _ *http.Request) {
	if hostname, err := os.Hostname(); err == nil {
		w.Header().Set("X-Served-By", hostname)
	}
	writeJSON(w, http.StatusOK, "API Gateway is healthy")
}
