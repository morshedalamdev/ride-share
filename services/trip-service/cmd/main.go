package main

import (
	"context"

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
	svc.CreateTrip(ctx, fare)
}
