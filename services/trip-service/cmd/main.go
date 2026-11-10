package main

import (
	"log"
	"net"

	tripgrpc "github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/grpc"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
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

	server := grpc.NewServer()
	tripv1.RegisterTripServiceServer(
		server,
		tripgrpc.NewServer(service.FixedRouteProvider{}),
	)

	log.Printf("Trip gRPC server listening on %v", listener.Addr())
	if err := server.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
