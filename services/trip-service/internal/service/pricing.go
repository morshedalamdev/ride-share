package service

import (
	"fmt"
	"math"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FareQuote struct {
	ID            string
	RideClass     string
	TotalUSDCents int64
}

func CalculateQuotes(distanceMeters float64) ([]FareQuote, error) {
	const baseCents = 400
	const referenceMeters = 4.6 * 1609.344

	if math.IsNaN(distanceMeters) || math.IsInf(distanceMeters, 0) || distanceMeters < 0 {
		return nil, fmt.Errorf("invalid route distance")
	}

	rates := [...]struct {
		class          string
		referenceCents int64
	}{
		{"sedan", 1840},
		{"suv", 2580},
		{"van", 3250},
		{"luxury", 4820},
	}

	quotes := make([]FareQuote, 0, len(rates))
	for _, rate := range rates {
		variableCents := float64(rate.referenceCents-baseCents) * (distanceMeters / referenceMeters)

		total := math.Round(baseCents + variableCents)
		if total >= float64(math.MaxInt64) {
			return nil, fmt.Errorf("fare exceeds supported range")
		}

		quotes = append(quotes, FareQuote{
			ID:            primitive.NewObjectID().Hex(),
			RideClass:     rate.class,
			TotalUSDCents: int64(total),
		})
	}
	return quotes, nil
}
