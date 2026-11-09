package main

import (
	"encoding/json"
	"net/http"
)

func handleTripPreview(w http.ResponseWriter, r *http.Request) {
	var reqBody previewTripReq
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "failed to parse JSON data", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()

	// validation
	if reqBody.UserID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, "Trip preview created successfully")
}
