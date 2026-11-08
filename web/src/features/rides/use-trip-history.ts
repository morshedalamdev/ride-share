"use client";

import { useMemo, useSyncExternalStore } from "react";
import { sampleTrips, vehicles } from "./data";
import type { Place, Trip } from "./types";

const storageKey = "rove.trip-history.v1";
const changeEvent = "rove:trip-history-changed";
let memoryFallback: string | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPlace(value: unknown): value is Place {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.address === "string" &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y)
  );
}

function isTrip(value: unknown): value is Trip {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.date === "string" &&
    Number.isFinite(Date.parse(value.date)) &&
    Number.isFinite(value.total) &&
    (value.status === "Completed" || value.status === "Canceled") &&
    (value.role === "rider" || value.role === "driver") &&
    vehicles.some((vehicle) => vehicle.id === value.rideClass) &&
    isPlace(value.pickup) &&
    isPlace(value.dropoff)
  );
}

function readTrips(snapshot: string | null): Trip[] {
  if (!snapshot) return [];

  try {
    const entries: unknown = JSON.parse(snapshot);
    return Array.isArray(entries) ? entries.filter(isTrip) : [];
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (memoryFallback !== null) return memoryFallback;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function subscribe(notify: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) notify();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}

function addTrip(trip: Trip) {
  const previous = readTrips(getSnapshot()).filter(
    (entry) => entry.id !== trip.id,
  );
  const snapshot = JSON.stringify([trip, ...previous]);
  try {
    window.localStorage.setItem(storageKey, snapshot);
    memoryFallback = null;
  } catch {
    // Keep history available for this session when browser storage is unavailable.
    memoryFallback = snapshot;
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useTripHistory() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const trips = useMemo(
    () => [...readTrips(snapshot), ...sampleTrips],
    [snapshot],
  );
  return { trips, addTrip };
}
