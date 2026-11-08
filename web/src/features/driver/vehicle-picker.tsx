import Image from "next/image";
import { Check } from "lucide-react";

import { vehicles } from "@/features/rides/data";
import type { RideClass } from "@/features/rides/types";

interface VehiclePickerProps {
  selected: RideClass;
  onSelect: (value: RideClass) => void;
}

export function VehiclePicker({ selected, onSelect }: VehiclePickerProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">Vehicle class</legend>
      <div className="grid gap-2">
        {vehicles.map((vehicle) => {
          const checked = vehicle.id === selected;
          return (
            <label key={vehicle.id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="driver-vehicle-class"
                value={vehicle.id}
                checked={checked}
                onChange={() => onSelect(vehicle.id)}
                className="peer sr-only"
              />
              <span
                className={`flex min-h-[54px] items-center gap-3 rounded-xl border px-3 py-1.5 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#b34024] ${checked ? "border-[#e67c62] bg-[#fff5ef]" : "border-[#e5e5df] bg-white hover:border-[#c8c9c2]"}`}
              >
                <Image
                  src={`/vehicles/${vehicle.id}.webp`}
                  width={64}
                  height={40}
                  alt=""
                  className="h-9 w-16 object-contain mix-blend-multiply"
                />
                <span className="flex-1 text-sm font-semibold">
                  {vehicle.name}
                </span>
                <span className="text-xs text-[#626761]">
                  {vehicle.seats} seats
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-4 place-items-center rounded-full border ${checked ? "border-[#d64e2f] bg-[#d64e2f] text-white" : "border-[#c8cbc3]"}`}
                >
                  {checked && <Check size={11} strokeWidth={3} />}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
