import Image from "next/image";
import { Circle, Square, Star } from "lucide-react";

import { formatMoney } from "@/features/rides/data";
import type { RideDraft, Vehicle } from "@/features/rides/types";

const demoCars = {
  sedan: { model: "Pearl white sedan", plate: "8LXP412" },
  suv: { model: "Steel blue SUV", plate: "7VRC319" },
  van: { model: "Sage passenger van", plate: "9FHN624" },
  luxury: { model: "Charcoal luxury sedan", plate: "8DML205" },
};

export function DriverDetails({ vehicle }: { vehicle: Vehicle }) {
  const car = demoCars[vehicle.id];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-canvas px-4 py-3">
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-semibold">Jordan Chen</p>
          <span
            aria-label="Driver rating 4.96 out of 5"
            className="inline-flex items-center gap-1 text-xs text-muted"
          >
            <Star size={12} fill="currentColor" aria-hidden="true" /> 4.96
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">{car.model}</p>
        <p className="mt-2 inline-block rounded border border-line bg-white px-1.5 py-0.5 font-mono text-xs font-semibold tracking-wide">
          <span className="sr-only">License plate </span>
          {car.plate}
        </p>
      </div>
      <Image
        src={`/vehicles/${vehicle.id}.webp`}
        alt=""
        width={104}
        height={62}
        unoptimized
        className="h-[62px] w-[104px] shrink-0 object-contain"
      />
    </div>
  );
}

export function BookingDetails({
  draft,
  total,
}: {
  draft: RideDraft;
  total: number;
}) {
  return (
    <div className="rounded-xl border border-line">
      <dl className="relative grid gap-4 p-4 before:absolute before:top-7 before:bottom-8 before:left-[22px] before:border-l before:border-dashed before:border-line">
        {[
          {
            label: "Pickup",
            place: draft.pickup,
            icon: Circle,
            color: "text-accent",
          },
          {
            label: "Drop-off",
            place: draft.dropoff,
            icon: Square,
            color: "text-ink",
          },
        ].map(({ label, place, icon: Icon, color }) => (
          <div key={label} className="relative pl-6">
            <dt className="text-xs text-muted">
              <Icon
                aria-hidden="true"
                className={`absolute top-0.5 left-0 size-[13px] fill-white ${color}`}
                strokeWidth={3.5}
              />
              {label}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold">{place.name}</dd>
          </div>
        ))}
      </dl>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-sm text-muted">Trip fare</span>
        <strong className="text-lg tracking-tight">{formatMoney(total)}</strong>
      </div>
    </div>
  );
}
