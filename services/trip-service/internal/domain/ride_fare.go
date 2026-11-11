package domain

import (
	"github.com/morshedalamdev/ride-share/shared/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RideFareModel struct {
	ID          primitive.ObjectID
	UserID      string
	RideClass   string
	TotalCents  float64
	Pickup      types.Coordinate
	Destination types.Coordinate
}
