package repository

import (
	"context"
	"errors"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var _ domain.BookingRepo = (*MongoRepo)(nil)

func (r *MongoRepo) BindRequest(
	ctx context.Context,
	rider,
	key string,
	quoteID primitive.ObjectID,
) error {
	requests := r.trips.Database().Collection("booking_requests")
	id := bson.D{
		{Key: "rider", Value: rider},
		{Key: "key", Value: key},
	}
	filter := bson.M{"_id": id}

	var saved struct {
		QuoteID primitive.ObjectID `bson:"quote_id"`
	}
	err := requests.FindOneAndUpdate(
		ctx,
		filter,
		bson.M{"$setOnInsert": bson.M{"quote_id": quoteID}},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	).Decode(&saved)

	if mongo.IsDuplicateKeyError(err) {
		err = requests.FindOne(ctx, filter).Decode(&saved)
	}
	if err != nil {
		return err
	}

	if saved.QuoteID != quoteID {
		return domain.ErrRequestConflict
	}

	return nil
}

func (r *MongoRepo) GetTrip(
	ctx context.Context,
	rider string,
	id primitive.ObjectID,
) (*domain.TripModel, error) {
	var trip domain.TripModel
	err := r.trips.FindOne(
		ctx,
		bson.M{"_id": id, "user_id": rider},
	).Decode(&trip)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, domain.ErrTripNotFound
	}
	if err != nil {
		return nil, err
	}

	return &trip, nil
}

func (r *MongoRepo) CancelTrip(
	ctx context.Context,
	rider string,
	id primitive.ObjectID,
) (*domain.TripModel, error) {
	filter := bson.M{
		"_id":     id,
		"user_id": rider,
		"status": bson.M{"$in": []domain.TripStatus{
			domain.Pending,
			domain.Accepted,
			domain.Canceled,
		}},
	}

	var trip domain.TripModel
	err := r.trips.FindOneAndUpdate(
		ctx,
		filter,
		bson.M{"$set": bson.M{"status": domain.Canceled}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&trip)

	if errors.Is(err, mongo.ErrNoDocuments) {
		if _, err := r.GetTrip(ctx, rider, id); err != nil {
			return nil, err
		}
		return nil, domain.ErrTransition
	}
	if err != nil {
		return nil, err
	}

	return &trip, nil
}
