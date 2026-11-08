export type RideClass = "sedan" | "suv" | "van" | "luxury";

export interface Place {
  id: string;
  name: string;
  address: string;
  /** Coordinates on the local San Francisco map. */
  x: number;
  y: number;
}

export interface Vehicle {
  id: RideClass;
  name: string;
  description: string;
  seats: number;
  minutes: number;
  baseFare: number;
}

export interface RideDraft {
  pickup: Place;
  dropoff: Place;
  rideClass: RideClass;
}

export interface Trip extends RideDraft {
  id: string;
  total: number;
  date: string;
  status: "Completed" | "Canceled";
  role: "rider" | "driver";
}
