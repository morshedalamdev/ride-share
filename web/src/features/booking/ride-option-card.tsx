import Image from "next/image";
import { Check, Clock3, UsersRound } from "lucide-react";
import { formatMoney } from "@/features/rides/data";
import type { Vehicle } from "@/features/rides/types";

interface RideOptionCardProps {
  vehicle: Vehicle;
  fare: number;
  active: boolean;
  onSelect: () => void;
}

export function RideOptionCard({
  vehicle,
  fare,
  active,
  onSelect,
}: RideOptionCardProps) {
  return (
    <label
      className={`group relative flex min-w-0 cursor-pointer flex-col rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent sm:p-5 ${active ? "border-accent bg-[#fff7f0] shadow-[inset_0_0_0_1px_var(--color-accent)]" : "border-line bg-white hover:border-[#b3b7ad]"}`}
    >
      <input
        type="radio"
        name="ride-class"
        value={vehicle.id}
        checked={active}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`absolute top-3.5 right-3.5 grid size-[18px] place-items-center rounded-full border sm:top-4 sm:right-4 ${active ? "border-accent bg-accent text-white" : "border-[#c2c6bd] bg-white"}`}
      >
        {active && <Check size={12} strokeWidth={3} />}
      </span>
      <div className="mb-1 flex h-[68px] items-center sm:h-[82px]">
        <Image
          src={`/vehicles/${vehicle.id}.webp`}
          alt=""
          width={155}
          height={82}
          unoptimized
          className="h-full w-[83%] max-w-[155px] object-contain object-left transition-transform group-hover:-translate-y-0.5"
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <span className="text-lg leading-tight font-semibold tracking-[-0.045em]">
          {vehicle.name}
        </span>
        <span className="text-sm font-semibold tracking-[-0.04em] sm:text-base">
          {formatMoney(fare)}
        </span>
      </div>
      <span className="mt-1 text-xs leading-relaxed text-muted">
        {vehicle.description}
      </span>
      <div
        className={`mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-[11px] font-medium text-muted sm:text-xs ${active ? "border-[#eed7c9]" : "border-line"}`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={13} />
          {vehicle.minutes} min
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UsersRound size={13} />
          {vehicle.seats} seats
        </span>
      </div>
    </label>
  );
}
