"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { createDemoTrip } from "@/features/rides/create-demo-trip";
import { places, vehicles } from "@/features/rides/data";
import { estimateFare, estimateRoute } from "@/features/rides/estimate";
import type { RideClass } from "@/features/rides/types";
import { useTripHistory } from "@/features/rides/use-trip-history";

export type DriverStatus =
  | "offline"
  | "offer"
  | "available"
  | "pickup"
  | "driving"
  | "completed";

const riders = [
  { name: "Jamie Chen", initials: "JC", rating: "4.94" },
  { name: "Sam Rivera", initials: "SR", rating: "4.97" },
  { name: "Avery Brooks", initials: "AB", rating: "4.91" },
];

function useDriverSessionState() {
  const [status, setStatus] = useState<DriverStatus>("offline");
  const [rideClass, setRideClass] = useState<RideClass>("sedan");
  const [requestIndex, setRequestIndex] = useState(0);
  const { addTrip } = useTripHistory();

  const vehicle = vehicles.find((option) => option.id === rideClass)!;
  const pickup = places[requestIndex % places.length];
  const dropoff = places[(requestIndex + 1) % places.length];
  const rider = riders[requestIndex % riders.length];
  const fare = estimateFare(vehicle, estimateRoute(pickup, dropoff).miles);

  function nextRequest() {
    setRequestIndex((previous) => previous + 1);
    setStatus("offer");
  }

  function completeTrip() {
    addTrip(
      createDemoTrip(
        { pickup, dropoff, rideClass },
        { role: "driver", status: "Completed", total: fare },
      ),
    );
    setStatus("completed");
  }

  return {
    status,
    setStatus,
    vehicle,
    setRideClass,
    pickup,
    dropoff,
    rider,
    fare,
    nextRequest,
    completeTrip,
  };
}

const DriverSessionContext = createContext<ReturnType<
  typeof useDriverSessionState
> | null>(null);

export function DriverSessionProvider({ children }: { children: ReactNode }) {
  const session = useDriverSessionState();
  return (
    <DriverSessionContext.Provider value={session}>
      {children}
    </DriverSessionContext.Provider>
  );
}

export function useDriverSession() {
  const session = useContext(DriverSessionContext);
  if (!session)
    throw new Error(
      "useDriverSession must be used inside DriverSessionProvider.",
    );
  return session;
}
