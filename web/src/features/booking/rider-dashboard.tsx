"use client";

import { useState } from "react";
import { ActivitySection } from "@/features/activity/activity-section";
import { RideMap } from "@/features/map/ride-map";
import { vehicles } from "@/features/rides/data";
import { estimateFare, estimateRoute } from "@/features/rides/estimate";
import { useRideDraft } from "@/features/rides/ride-provider";
import { useTripHistory } from "@/features/rides/use-trip-history";
import { BookingDialog } from "./booking-dialog";
import { RideOptions } from "./ride-options";
import { TripPlanner } from "./trip-planner";

export function RiderDashboard() {
  const { draft, setDraft } = useRideDraft();
  const { addTrip } = useTripHistory();
  const [booking, setBooking] = useState(false);
  const vehicle = vehicles.find((option) => option.id === draft.rideClass)!;
  const { miles, minutes } = estimateRoute(draft.pickup, draft.dropoff);
  const fare = estimateFare(vehicle, miles);

  return (
    <>
      <div className="grid items-stretch gap-4 md:grid-cols-[minmax(295px,0.85fr)_minmax(0,2fr)] lg:gap-5">
        <TripPlanner
          draft={draft}
          onChange={setDraft}
          onRequest={() => setBooking(true)}
          vehicle={vehicle}
          miles={miles}
          minutes={minutes}
          fare={fare}
        />
        <div className="relative h-[290px] min-w-0 sm:h-[340px] md:h-auto md:min-h-[362px]">
          <RideMap
            pickup={draft.pickup}
            dropoff={draft.dropoff}
            onSelectPlace={(place) => {
              if (place.id !== draft.pickup.id)
                setDraft({ ...draft, dropoff: place });
            }}
          />
        </div>
      </div>
      <RideOptions
        selected={draft.rideClass}
        miles={miles}
        onSelect={(rideClass) => setDraft({ ...draft, rideClass })}
      />
      <ActivitySection role="rider" compact />
      {booking && (
        <BookingDialog
          draft={draft}
          total={fare}
          onClose={() => setBooking(false)}
          onRecord={addTrip}
        />
      )}
    </>
  );
}
