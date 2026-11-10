"use client";

import { useState } from "react";
import { ActivitySection } from "@/features/activity/activity-section";
import { RideMap } from "@/features/map/ride-map";
import { ArrowRight } from "lucide-react";
import { formatMoney, vehicles } from "@/features/rides/data";
import { useTripPreview } from "@/features/rides/use-trip-preview";
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
  const { preview, failed, retry } = useTripPreview(draft.pickup.id, draft.dropoff.id);
  const quote = preview?.quotes.find(q => q.ride_class === draft.rideClass);

  const fare = quote ? quote.total_usd_cents / 100 : null;
  const miles = preview ? preview.distance_meters / 1609.344 : null;
  const minutes = preview ? Math.round(preview.duration_seconds / 60) : null;

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
      {!preview && (
        <div role="status" className="mt-4">
          {failed ? "Fares are unavailable. " : "Getting fares…"}
          {failed && (
            <button type="button" onClick={retry} className="underline">
              Retry
            </button>
          )}
        </div>
      )}

      {preview && (
        <RideOptions
          selected={draft.rideClass}
          quotes={preview.quotes}
          onSelect={(rideClass) => setDraft({ ...draft, rideClass })}
        />
      )}
      <button
        type="button"
        onClick={() => setBooking(true)}
        disabled={fare === null}
        className="primary-button mt-4 w-full justify-between md:hidden"
      >
        Request {vehicle.name} {fare !== null && `· ${formatMoney(fare)}`}
        <ArrowRight size={17} />
      </button>
      <ActivitySection role="rider" compact />
      {booking && fare !== null && minutes !== null && (
        <BookingDialog
          draft={draft}
          total={fare}
          minutes={minutes}
          onClose={() => setBooking(false)}
          onRecord={addTrip}
        />
      )}
    </>
  );
}
