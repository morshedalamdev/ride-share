package main

import (
	"log"
	"net/http"

	"github.com/morshedalamdev/ride-share/shared/env"
)

var (
	httpAdd = env.GetString("HTTP_ADDR", ":8080")
)

func main() {
	log.Println("Starting API Gateway")

	mux := http.NewServeMux()

	mux.HandleFunc("POST /trip/preview", handleTripPreview)

	server := &http.Server{
		Addr:    httpAdd,
		Handler: mux,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Printf("HTTP server error: %v", err)
	}
}
