package main

import (
	"log"
	"net/http"

	"github.com/morshedalamdev/ride-share/shared/env"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	httpAdd = env.GetString("HTTP_ADDR", ":8080")
)

func main() {
	target := env.GetString("TRIP_GRPC_TARGET", "localhost:50051")

	conn, err := grpc.NewClient(target, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("create trip client: %v", err)
	}
	defer conn.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handleHealthCheck)
	mux.HandleFunc("POST /trip/preview", handleTripPreview(tripv1.NewTripServiceClient(conn)))

	addr := env.GetString("HTTP_ADDR", ":8080")
	log.Printf("Starting API Gateway on %s with trip target %s", addr, target)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Printf("HTTP server error: %v", err)
	}
}
