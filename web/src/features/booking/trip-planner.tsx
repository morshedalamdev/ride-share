import { ArrowDownUp, ArrowRight, Clock3, Route } from "lucide-react";
import { formatMoney } from "@/features/rides/data";
import type { RideDraft, Vehicle } from "@/features/rides/types";
import { PlacePicker } from "./place-picker";

interface TripPlannerProps {
  draft: RideDraft;
  onChange: (draft: RideDraft) => void;
  onRequest: () => void;
  vehicle: Vehicle;
  miles: number | null;
  minutes: number | null;
  fare: number | null;
}

export function TripPlanner({
  draft,
  onChange,
  onRequest,
  vehicle,
  miles,
  minutes,
  fare,
}: TripPlannerProps) {
  return (
    <section
      aria-labelledby="planner-title"
      className="panel flex min-w-0 flex-col p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-[9px] bg-peach text-accent">
          <Route size={18} />
        </span>
        <h2
          id="planner-title"
          className="text-[20px] font-semibold tracking-[-0.05em]"
        >
          Trip planner
        </h2>
      </div>
      <div className="relative rounded-xl border border-line bg-[#fafaf7]">
        <div
          aria-hidden="true"
          className="absolute top-[31px] bottom-[31px] left-[27px] border-l border-dashed border-[#a7aaa0]"
        />
        <PlacePicker
          kind="pickup"
          value={draft.pickup}
          excluded={draft.dropoff}
          onChange={(pickup) => onChange({ ...draft, pickup })}
        />
        <div className="relative mx-3.5 ml-[54px] border-t border-line">
          <button
            type="button"
            onClick={() =>
              onChange({
                ...draft,
                pickup: draft.dropoff,
                dropoff: draft.pickup,
              })
            }
            aria-label="Swap pickup and drop-off"
            title="Swap pickup and drop-off"
            className="absolute right-0 top-0 z-10 grid size-[25px] -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-muted hover:text-ink"
          >
            <ArrowDownUp size={12} />
          </button>
        </div>
        <PlacePicker
          kind="dropoff"
          value={draft.dropoff}
          excluded={draft.pickup}
          onChange={(dropoff) => onChange({ ...draft, dropoff })}
        />
      </div>
      <div className="mt-4 mb-5 flex items-center gap-4 text-xs font-medium text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Route size={14} />
          {miles === null ? "—" : `${miles.toFixed(1)} mi`}
        </span>
        <span className="h-3 w-px bg-line" />
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} />
          {minutes === null ? "—" : `${minutes} min trip`}
        </span>
      </div>
      <div className="mt-auto flex items-end justify-between border-t border-line pt-3.5">
        <div>
          <p className="text-xs text-muted">Estimated fare</p>
          <p className="mt-1 text-[27px] leading-none font-semibold tracking-[-0.065em]">
            {fare === null ? "—" : formatMoney(fare)}
          </p>
        </div>
        <span className="pb-0.5 text-xs font-medium text-muted">
          {vehicle.name} · {vehicle.seats} seats
        </span>
      </div>
      <button
        type="button"
        className="primary-button mt-4 hidden w-full justify-between px-4.5 md:inline-flex"
        onClick={onRequest}
        disabled={fare === null}
      >
        Request {vehicle.name}
        <ArrowRight size={17} />
      </button>
      <a
        href="#ride-options"
        className="primary-button mt-4 justify-between px-4.5 md:hidden"
      >
        Choose a ride <ArrowRight size={17} />
      </a>
    </section>
  );
}
