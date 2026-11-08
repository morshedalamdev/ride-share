"use client";

import { useState } from "react";
import { Route } from "lucide-react";

import type { Trip } from "@/features/rides/types";
import { TripRow } from "./trip-row";

interface TripHistoryProps {
  trips: Trip[];
  onRebook: (trip: Trip) => void;
  compact?: boolean;
}

export function TripHistory({
  trips,
  onRebook,
  compact = false,
}: TripHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sorted = [...trips].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  const visible = compact ? sorted.slice(0, 3) : sorted;

  if (!visible.length) {
    return (
      <div className="rounded-[18px] border border-[#dedfd8] bg-white px-6 py-9 text-center text-[#60695e]">
        <Route size={24} className="mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm">No trips to show.</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-[18px] border border-[#dedfd8] bg-white text-[#262c26] shadow-[0_2px_6px_#262a2204] divide-y divide-[#e7e8e1]">
      {visible.map((trip) => (
        <TripRow
          key={trip.id}
          trip={trip}
          expanded={expandedId === trip.id}
          onToggle={() =>
            setExpandedId((current) => (current === trip.id ? null : trip.id))
          }
          onRebook={onRebook}
        />
      ))}
    </ul>
  );
}
