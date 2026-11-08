"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRideDraft } from "@/features/rides/ride-provider";
import { useTripHistory } from "@/features/rides/use-trip-history";
import type { Trip } from "@/features/rides/types";
import { TripHistory } from "./trip-history";

interface ActivitySectionProps {
  role: Trip["role"];
  compact?: boolean;
}

export function ActivitySection({
  role,
  compact = false,
}: ActivitySectionProps) {
  const { trips } = useTripHistory();
  const { setDraft } = useRideDraft();
  const router = useRouter();
  const [filter, setFilter] = useState<"All" | Trip["status"]>("All");
  const roleTrips = trips.filter((trip) => trip.role === role);
  const visibleTrips = roleTrips.filter(
    (trip) => filter === "All" || trip.status === filter,
  );

  function rebook({ pickup, dropoff, rideClass }: Trip) {
    setDraft({ pickup, dropoff, rideClass });
    router.push("/");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <section
      aria-label={compact ? "Recent trips" : "Trip history"}
      className={compact ? "mt-8" : undefined}
    >
      {compact ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="section-title">Recent trips</h2>
          <Link
            href={role === "driver" ? "/driver/activity" : "/activity"}
            className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
          >
            View activity <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <div
          role="group"
          aria-label="Filter trip status"
          className="mb-4 flex flex-wrap gap-2"
        >
          {(["All", "Completed", "Canceled"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold ${filter === status ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-ink"}`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
      <TripHistory trips={visibleTrips} onRebook={rebook} compact={compact} />
    </section>
  );
}
