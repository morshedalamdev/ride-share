package domain

import (
	"github.com/morshedalamdev/ride-share/shared/types"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RideFareModel struct {
	ID              primitive.ObjectID `bson:"_id"`
	UserID          string             `bson:"user_id"`
	RideClass       string             `bson:"ride_class"`
	TotalCents      int64              `bson:"total_cents"`
	Pickup          types.Coordinate   `bson:"pickup"`
	Destination     types.Coordinate   `bson:"destination"`
	DistanceMeters  float64            `bson:"distance_meters"`
	DurationSeconds float64            `bson:"duration_seconds"`
}
