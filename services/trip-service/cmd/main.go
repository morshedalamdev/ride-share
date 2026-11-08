package main

import (
	"context"
	"log"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/infrastructure/repository"
	"github.com/morshedalamdev/ride-share/services/trip-service/internal/service"
)

func main() {
	ctx := context.Background()
	fare := &domain.RideFareModel{
		UserID: "42",
	}

	inmemRepo := repository.NewInmemRepo()
	svc := service.NewService(inmemRepo)
	t, err := svc.CreateTrip(ctx, fare)
	if err != nil {
		log.Println(err)
	}

	log.Printf("Trip created: %+v\n", t)
}
