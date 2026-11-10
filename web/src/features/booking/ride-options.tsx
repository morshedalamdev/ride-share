import type { FareQuote } from "@/features/rides/use-trip-preview";
import { vehicles } from "@/features/rides/data";
import type { RideClass } from "@/features/rides/types";

import { RideOptionCard } from "./ride-option-card";

interface RideOptionsProps {
  selected: RideClass;
  quotes: FareQuote[];
  onSelect: (id: RideClass) => void;
}

export function RideOptions({ selected, quotes, onSelect }: RideOptionsProps) {
  return (
    <section
      id="ride-options"
      aria-labelledby="options-title"
      className="mt-7 scroll-mt-4 sm:mt-8"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 id="options-title" className="section-title">
          Ride options
        </h2>
        <span className="text-xs text-muted">Fares in USD</span>
      </div>
      <div
        role="radiogroup"
        aria-labelledby="options-title"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      >
        {vehicles.map((vehicle) => (
          <RideOptionCard
            key={vehicle.id}
            vehicle={vehicle}
            fare={quotes.find(q => q.ride_class === vehicle.id)!.total_usd_cents / 100}
            active={vehicle.id === selected}
            onSelect={() => onSelect(vehicle.id)}
          />
        ))}
      </div>
    </section>
  );
}
