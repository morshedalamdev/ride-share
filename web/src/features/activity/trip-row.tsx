import { useId } from "react";
import { ArrowRight, CarFront, ChevronDown, RotateCcw } from "lucide-react";

import { formatMoney, vehicles } from "@/features/rides/data";
import type { Trip } from "@/features/rides/types";

const dateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric",
  year: "numeric",
};

const tripDate = new Intl.DateTimeFormat("en-US", dateOptions);
const tripTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "numeric",
  minute: "2-digit",
});

interface TripRowProps {
  trip: Trip;
  expanded: boolean;
  onToggle: () => void;
  onRebook: (trip: Trip) => void;
}

export function TripRow({ trip, expanded, onToggle, onRebook }: TripRowProps) {
  const detailId = useId();
  const date = new Date(trip.date);
  const vehicleName = vehicles.find(
    (vehicle) => vehicle.id === trip.rideClass,
  )?.name;
  const completed = trip.status === "Completed";
  const canRebook = trip.role === "rider";
  const desktopColumns = canRebook
    ? "lg:grid-cols-[44px_minmax(0,1fr)_92px_72px_100px_32px]"
    : "lg:grid-cols-[44px_minmax(0,1fr)_92px_72px_32px]";

  return (
    <li>
      <div
        className={`grid grid-cols-[36px_minmax(0,1fr)_32px] items-center gap-x-3 gap-y-2.5 px-4 py-4 sm:grid-cols-[44px_minmax(0,1fr)_auto_auto_32px] sm:px-5 lg:gap-x-5 lg:px-6 ${desktopColumns}`}
      >
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-xl bg-[#f0f1eb] text-[#535c50] sm:size-11"
        >
          <CarFront size={20} strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug font-semibold text-[#262b26]">
            <span>{trip.pickup.name}</span>
            <ArrowRight
              size={14}
              aria-label="to"
              className="shrink-0 text-[#858b80]"
            />
            <span>{trip.dropoff.name}</span>
          </p>
          <p className="mt-1 text-xs leading-normal text-[#626960]">
            <time dateTime={trip.date}>{tripDate.format(date)}</time>
            <span className="px-1.5" aria-hidden="true">
              ·
            </span>
            {vehicleName}
            {trip.role === "driver" && " · Driver"}
          </p>
        </div>
        <span
          className={`col-start-2 row-start-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium sm:col-auto sm:row-auto ${completed ? "bg-[#eaf3e8] text-[#3c653d]" : "bg-[#f2eeea] text-[#745f50]"}`}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
          {trip.status}
        </span>
        <strong className="col-start-2 row-start-2 justify-self-end text-sm font-semibold tabular-nums text-[#2b302b] sm:col-auto sm:row-auto sm:justify-self-center">
          {formatMoney(trip.total)}
        </strong>
        {canRebook && (
          <button
            type="button"
            onClick={() => onRebook(trip)}
            className="hidden min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#e1e3da] bg-white px-2.5 text-xs font-semibold text-[#454d44] transition-colors hover:bg-[#f4f5f0] lg:inline-flex"
          >
            <RotateCcw size={13} aria-hidden="true" /> Book again
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-controls={detailId}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} trip details for ${trip.pickup.name} to ${trip.dropoff.name}`}
          className="col-start-3 row-start-1 grid size-8 place-items-center rounded-full text-[#596256] transition-colors hover:bg-[#f0f2eb] sm:col-auto sm:row-auto"
        >
          <ChevronDown
            size={17}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
      <div
        id={detailId}
        hidden={!expanded}
        className="border-t border-dashed border-[#dfe2d9] bg-[#f8f9f5] px-5 py-4 sm:px-6"
      >
        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-[#636c5f]">
              Pickup address
            </dt>
            <dd className="mt-1 leading-snug">{trip.pickup.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#636c5f]">
              Drop-off address
            </dt>
            <dd className="mt-1 leading-snug">{trip.dropoff.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#636c5f]">Trip time</dt>
            <dd className="mt-1 leading-snug">
              {tripTime.format(date)} Pacific
            </dd>
          </div>
        </dl>
        {canRebook && (
          <button
            type="button"
            onClick={() => onRebook(trip)}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d8dcd1] bg-white px-3 text-xs font-semibold text-[#454d44] hover:bg-[#f4f5f0] lg:hidden"
          >
            <RotateCcw size={13} aria-hidden="true" /> Book again
          </button>
        )}
      </div>
    </li>
  );
}
