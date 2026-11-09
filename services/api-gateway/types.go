package main

import "github.com/morshedalamdev/ride-share/shared/types"

type previewTripReq struct {
	UserID      string           `json:"user_id"`
	Pickup      types.Coordinate `json:"pickup"`
	Destination types.Coordinate `json:"destination"`
}
