package main

import (
	"log"
	"net"
	"net/http"
	"time"

	tripgrpc "github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/grpc"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/routing"
	"github.com/morshedalamdev/ride-share/shared/env"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"google.golang.org/grpc"
)

func main() {
	addr := env.GetString("TRIP_GRPC_ADDR", "127.0.0.1:50051")
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatal(err)
	}

	routes := routing.NewOSRM(
		env.GetString("OSRM_BASE_URL", "https://router.project-osrm.org"),
		&http.Client{Timeout: 8 * time.Second},
	)

	server := grpc.NewServer()
	tripv1.RegisterTripServiceServer(server, tripgrpc.NewServer(routes))

	log.Printf("Trip gRPC server listening on %v", listener.Addr())
	if err := server.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
