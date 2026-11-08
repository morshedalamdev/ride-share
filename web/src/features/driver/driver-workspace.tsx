"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, RadioTower, CarFront } from "lucide-react";

import { RideMap } from "@/features/map/ride-map";
import { estimateFare, estimateRoute } from "@/features/rides/estimate";
import { places, vehicles } from "@/features/rides/data";
import type { RideClass, Trip } from "@/features/rides/types";
import { DriverRequest } from "./driver-request";
import { VehiclePicker } from "./vehicle-picker";

type DriverStatus =
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

const headings: Record<DriverStatus, string> = {
  offline: "Go online",
  offer: "Incoming request",
  available: "Ready for a ride",
  pickup: "Meet your rider",
  driving: "Trip in progress",
  completed: "Trip completed",
};

const actionClass =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#232925] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#39413a]";
const secondaryClass =
  "min-h-10 w-full rounded-lg border border-[#d9dcd5] px-4 text-sm font-semibold text-[#454c45] transition-colors hover:bg-[#f5f6f2]";

export function DriverWorkspace({
  onComplete,
}: {
  onComplete: (trip: Trip) => void;
}) {
  const [status, setStatus] = useState<DriverStatus>("offline");
  const [rideClass, setRideClass] = useState<RideClass>("sedan");
  const [requestIndex, setRequestIndex] = useState(0);
  const vehicle = vehicles.find((option) => option.id === rideClass)!;
  const pickup = places[requestIndex % places.length];
  const dropoff = places[(requestIndex + 1) % places.length];
  const rider = riders[requestIndex % riders.length];
  const fare = estimateFare(vehicle, estimateRoute(pickup, dropoff).miles);
  const showRequest =
    status === "offer" || status === "pickup" || status === "driving";

  function nextRequest() {
    setRequestIndex((previous) => previous + 1);
    setStatus("offer");
  }

  function completeTrip() {
    onComplete({
      id: crypto.randomUUID(),
      pickup,
      dropoff,
      rideClass,
      total: fare,
      date: new Date().toISOString(),
      status: "Completed",
      role: "driver",
    });
    setStatus("completed");
  }

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(310px,360px)_minmax(0,1fr)]">
      <section className="flex min-w-0 flex-col rounded-[20px] border border-[#dedfd8] bg-white p-5 text-[#222824] shadow-[0_2px_6px_#262a2205] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <CarFront
              size={22}
              strokeWidth={1.8}
              className="text-[#d74d2c]"
              aria-hidden="true"
            />
            <h2
              aria-live="polite"
              className="text-xl font-semibold tracking-[-0.035em]"
            >
              {headings[status]}
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${status === "offline" ? "bg-[#f0f1ec] text-[#5a6259]" : "bg-[#e8f3e8] text-[#35633b]"}`}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-current"
            />
            {status === "offline" ? "Offline" : "Online"}
          </span>
        </div>

        {status === "offline" && (
          <>
            <p className="mb-5 text-sm leading-relaxed text-[#646963]">
              Choose the vehicle you’re driving to receive local demo requests.
            </p>
            <VehiclePicker selected={rideClass} onSelect={setRideClass} />
            <button
              type="button"
              className={`mt-5 ${actionClass}`}
              onClick={() => setStatus("offer")}
            >
              Go online <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        )}

        {showRequest && (
          <>
            <DriverRequest
              rider={rider}
              pickup={pickup}
              dropoff={dropoff}
              fare={fare}
              vehicleName={vehicle.name}
            />
            <div className="mt-auto grid gap-2 pt-6">
              {status === "offer" && (
                <>
                  <button
                    type="button"
                    className={actionClass}
                    onClick={() => setStatus("pickup")}
                  >
                    Accept request <ArrowRight size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={secondaryClass}
                    onClick={() => setStatus("available")}
                  >
                    Decline request
                  </button>
                </>
              )}
              {status === "pickup" && (
                <button
                  type="button"
                  className={actionClass}
                  onClick={() => setStatus("driving")}
                >
                  Pick up rider <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
              {status === "driving" && (
                <button
                  type="button"
                  className={actionClass}
                  onClick={completeTrip}
                >
                  Complete trip <CircleCheck size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}

        {(status === "completed" || status === "available") && (
          <div className="flex flex-1 flex-col">
            <div className="my-auto py-8 text-center">
              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#edf3e9] text-[#477049]">
                {status === "completed" ? (
                  <CircleCheck aria-hidden="true" />
                ) : (
                  <RadioTower aria-hidden="true" />
                )}
              </div>
              <p
                role="status"
                className="mx-auto max-w-64 text-sm leading-relaxed text-[#626961]"
              >
                {status === "completed"
                  ? "Your completed trip is in Activity. You’re online for your next request."
                  : "Request declined. You’re online and available for the next rider."}
              </p>
            </div>
            <button type="button" className={actionClass} onClick={nextRequest}>
              Find next request <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {(status === "offer" ||
          status === "completed" ||
          status === "available") && (
          <button
            type="button"
            className="mx-auto mt-3 min-h-9 px-3 text-xs font-semibold text-[#586157] underline-offset-4 hover:underline"
            onClick={() => setStatus("offline")}
          >
            Go offline
          </button>
        )}
      </section>
      <div className="relative min-h-[360px] min-w-0 overflow-hidden rounded-[18px] lg:min-h-[480px]">
        <RideMap pickup={pickup} dropoff={dropoff} />
      </div>
    </div>
  );
}
