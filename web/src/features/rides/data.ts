import type { Place, RideDraft, Trip, Vehicle } from "./types";

export const places: Place[] = [
  {
    id: "ferry",
    name: "Ferry Building",
    address: "1 Ferry Building",
    x: 790,
    y: 155,
  },
  {
    id: "dolores",
    name: "Mission Dolores Park",
    address: "Dolores St & 19th St",
    x: 235,
    y: 530,
  },
  { id: "union", name: "Union Square", address: "333 Post St", x: 605, y: 194 },
  {
    id: "oracle",
    name: "Oracle Park",
    address: "24 Willie Mays Plaza",
    x: 745,
    y: 415,
  },
  { id: "sfmoma", name: "SFMOMA", address: "151 3rd St", x: 660, y: 263 },
  {
    id: "city-hall",
    name: "City Hall",
    address: "1 Dr Carlton B Goodlett Pl",
    x: 421,
    y: 270,
  },
  {
    id: "alamo",
    name: "Alamo Square",
    address: "Hayes St & Steiner St",
    x: 237,
    y: 247,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Sedan",
    description: "Everyday comfort",
    seats: 4,
    minutes: 3,
    baseFare: 18.4,
  },
  {
    id: "suv",
    name: "SUV",
    description: "A little extra room",
    seats: 6,
    minutes: 5,
    baseFare: 25.8,
  },
  {
    id: "van",
    name: "Van",
    description: "Bring the whole crew",
    seats: 7,
    minutes: 7,
    baseFare: 32.5,
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "A premium ride",
    seats: 4,
    minutes: 6,
    baseFare: 48.2,
  },
];

export const initialDraft: RideDraft = {
  pickup: places[0],
  dropoff: places[1],
  rideClass: "sedan",
};

export const sampleTrips: Trip[] = [
  {
    id: "sample-103",
    pickup: places[2],
    dropoff: places[0],
    rideClass: "sedan",
    total: 12.6,
    date: "2026-11-06T17:15:00-08:00",
    status: "Completed",
    role: "rider",
  },
  {
    id: "sample-102",
    pickup: places[3],
    dropoff: places[1],
    rideClass: "suv",
    total: 26.5,
    date: "2026-11-05T10:30:00-08:00",
    status: "Completed",
    role: "rider",
  },
  {
    id: "sample-101",
    pickup: places[5],
    dropoff: places[4],
    rideClass: "sedan",
    total: 14.8,
    date: "2026-11-02T13:05:00-08:00",
    status: "Completed",
    role: "rider",
  },
];

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(value: number) {
  return dollars.format(value);
}
