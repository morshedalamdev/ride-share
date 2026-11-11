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

type MongoRepo struct {
	quotes *mongo.Collection
	trips  *mongo.Collection
}

var _ domain.TripRepo = (*MongoRepo)(nil)
var _ domain.QuoteRepo = (*MongoRepo)(nil)

func NewMongoRepo(ctx context.Context, db *mongo.Database) (*MongoRepo, error) {
	r := &MongoRepo{
		quotes: db.Collection("quotes"),
		trips:  db.Collection("trips"),
	}

	_, err := r.trips.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "ride_fare._id", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, err
	}
	return r, nil
}

func (r *MongoRepo) SaveQuotes(
	ctx context.Context,
	fares []domain.RideFareModel,
) error {
	for _, fare := range fares {
		_, err := r.quotes.UpdateOne(
			ctx,
			bson.M{"_id": fare.ID},
			bson.M{"$setOnInsert": fare},
			options.Update().SetUpsert(true),
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *MongoRepo) BookQuote(
	ctx context.Context,
	rider string,
	id primitive.ObjectID,
) (*domain.TripModel, error) {
	var fare domain.RideFareModel
	err := r.quotes.FindOne(
		ctx,
		bson.M{"_id": id, "user_id": rider},
	).Decode(&fare)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, domain.ErrQuoteNotFound
	}
	if err != nil {
		return nil, err
	}

	filter := bson.M{"ride_fare._id": id, "user_id": rider}
	candidate := domain.TripModel{
		ID:       primitive.NewObjectID(),
		UserID:   rider,
		Status:   domain.Pending,
		RideFare: fare,
	}

	var trip domain.TripModel
	err = r.trips.FindOneAndUpdate(
		ctx,
		filter,
		bson.M{"$setOnInsert": candidate},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	).Decode(&trip)

	if mongo.IsDuplicateKeyError(err) {
		err = r.trips.FindOne(ctx, filter).Decode(&trip)
	}

	if err != nil {
		return nil, err
	}

	return &trip, nil
}
