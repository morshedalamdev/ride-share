package repository

import (
	"context"
	"errors"
	"os"
	"testing"
	"time"

	"github.com/morshedalamdev/ride-share/services/trip-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func TestMongoBooking(t *testing.T) {
	uri := os.Getenv("MONGO_TEST_URI")
	if uri == "" {
		t.Skip("set MONGO_TEST_URI to run")
	}

	ctx, cancel := context.WithTimeout(t.Context(), 30*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("ride_share_p42_test")
	repo, err := NewMongoRepo(ctx, db)
	if err != nil {
		t.Fatal(err)
	}

	fare := domain.RideFareModel{
		ID:         primitive.NewObjectID(),
		UserID:     "rider-1",
		RideClass:  "suv",
		TotalCents: 2402,
	}
	if err := repo.SaveQuotes(ctx, []domain.RideFareModel{fare}); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.BookQuote(ctx, "rider-2", fare.ID); !errors.Is(err, domain.ErrQuoteNotFound) {
		t.Fatalf("wrong rider: %v", err)
	}

	type result struct {
		trip *domain.TripModel
		err  error
	}
	results := make(chan result, 16)
	for range cap(results) {
		go func() {
			trip, err := repo.BookQuote(ctx, fare.UserID, fare.ID)
			results <- result{trip, err}
		}()
	}

	var id primitive.ObjectID
	for range cap(results) {
		r := <-results
		if r.err != nil {
			t.Fatal(r.err)
		}
		if r.trip.ID.IsZero() || r.trip.RideFare != fare ||
			r.trip.UserID != fare.UserID || r.trip.Status != domain.Pending {
			t.Fatalf("incorrect trip: %+v", r.trip)
		}
		if !id.IsZero() && id != r.trip.ID {
			t.Fatal("duplicate booking")
		}
		id = r.trip.ID
	}

	count, err := db.Collection("trips").CountDocuments(
		ctx, bson.M{"ride_fare._id": fare.ID},
	)
	if err != nil || count != 1 {
		t.Fatalf("count %d: %v", count, err)
	}
	t.Logf("saved quote=%s trip=%s in ride_share_p42_test",
		fare.ID.Hex(), id.Hex())
}
