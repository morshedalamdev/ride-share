"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, CircleDot, MapPin, Search } from "lucide-react";
import { places } from "@/features/rides/data";
import type { Place } from "@/features/rides/types";

interface PlacePickerProps {
  kind: "pickup" | "dropoff";
  value: Place;
  excluded: Place;
  onChange: (place: Place) => void;
}

export function PlacePicker({
  kind,
  value,
  excluded,
  onChange,
}: PlacePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const isPickup = kind === "pickup";
  const label = isPickup ? "Pickup" : "Drop-off";
  const Marker = isPickup ? CircleDot : MapPin;
  const choices = places.filter(
    (place) =>
      place.id !== excluded.id &&
      `${place.name} ${place.address}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div
      ref={root}
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          closeAndFocus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={`${label}: ${value.name}. Change location`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left transition hover:bg-[#f3f3ed]"
        onClick={() => {
          setQuery("");
          setOpen(!open);
        }}
      >
        <span
          className={`relative z-[1] grid size-7 shrink-0 place-items-center rounded-full ${isPickup ? "bg-[#e9ede6] text-[#3a5548]" : "bg-[#ffe6d8] text-[#c24a2b]"}`}
        >
          <Marker size={15} strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold tracking-[0.09em] text-muted uppercase">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold tracking-[-0.025em]">
            {value.name}
          </span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute right-0 left-0 z-30 mt-1 rounded-xl border border-line bg-white p-2 shadow-xl"
        >
          <div className="flex items-center gap-2 rounded-lg bg-canvas px-3">
            <Search size={15} className="text-muted" />
            <input
              ref={search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={`Search ${label.toLowerCase()} locations`}
              placeholder="Search places"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm"
            />
          </div>
          <ul className="mt-1 max-h-52 overflow-auto">
            {choices.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(place);
                    closeAndFocus();
                  }}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left hover:bg-canvas"
                >
                  <MapPin size={14} className="shrink-0 text-muted" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold">
                      {place.name}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {place.address}
                    </span>
                  </span>
                  {value.id === place.id && (
                    <Check size={14} className="text-accent" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          {!choices.length && (
            <p role="status" className="p-3 text-xs text-muted">
              No matching places in the demo area.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
