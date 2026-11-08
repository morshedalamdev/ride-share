import { Star } from "lucide-react";

import { formatMoney } from "@/features/rides/data";
import type { Place } from "@/features/rides/types";

interface DriverRequestProps {
  rider: { name: string; initials: string; rating: string };
  pickup: Place;
  dropoff: Place;
  fare: number;
  vehicleName: string;
}

export function DriverRequest({
  rider,
  pickup,
  dropoff,
  fare,
  vehicleName,
}: DriverRequestProps) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b border-[#e9e9e3] pb-4">
        <span className="grid size-11 place-items-center rounded-full bg-[#e7ece2] text-sm font-bold text-[#41513b]">
          {rider.initials}
        </span>
        <div>
          <p className="text-sm font-semibold">{rider.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#646963]">
            <Star
              size={12}
              className="fill-[#b77b2c] text-[#b77b2c]"
              aria-label="Rating"
            />
            {rider.rating} <span aria-hidden="true">·</span> {vehicleName}
          </p>
        </div>
      </div>
      <dl className="relative my-5 grid gap-5 before:absolute before:top-4 before:bottom-7 before:left-[5px] before:border-l before:border-dashed before:border-[#b9bdb4]">
        {[
          { label: "Pickup", place: pickup },
          { label: "Drop-off", place: dropoff },
        ].map(({ label, place }, index) => (
          <div key={label} className="relative pl-6">
            <span
              aria-hidden="true"
              className={`absolute top-1 left-0 size-[11px] border-[3px] bg-white ${index === 0 ? "rounded-full border-[#ef5b36]" : "rounded-[3px] border-[#29302b]"}`}
            />
            <dt className="text-xs text-[#646963]">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{place.name}</dd>
            <dd className="mt-0.5 text-xs leading-relaxed text-[#646963]">
              {place.address}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between border-t border-[#e9e9e3] pt-4">
        <span className="text-sm text-[#626761]">Trip fare</span>
        <strong className="text-xl tracking-tight">{formatMoney(fare)}</strong>
      </div>
    </div>
  );
}
