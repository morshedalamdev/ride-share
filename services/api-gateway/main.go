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

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("API Gateway is running..."))
	})

	http.ListenAndServe(httpAdd, nil)
}
