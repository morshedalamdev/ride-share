package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	tripgrpc "github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/grpc"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/repository"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/routing"
	"github.com/morshedalamdev/ride-share/shared/env"
	"github.com/morshedalamdev/ride-share/shared/proto/tripv1"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"google.golang.org/grpc"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(
		env.GetString("MONGO_URI", "mongodb://127.0.0.1:27017"),
	))
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = client.Disconnect(ctx)
	}()

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal(err)
	}

	repo, err := repository.NewMongoRepo(ctx, client.Database("ride_share"))
	if err != nil {
		log.Fatal(err)
	}
	cancel()

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
	tripv1.RegisterTripServiceServer(server, tripgrpc.NewServer(routes, repo, repo))

	log.Printf("Trip gRPC server listening on %v", listener.Addr())
	if err := server.Serve(listener); err != nil {
		log.Fatal(err)
	}
}
