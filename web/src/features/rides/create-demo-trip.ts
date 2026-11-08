import type { RideDraft, Trip } from "./types";

export function createDemoTrip(
  draft: RideDraft,
  details: Pick<Trip, "role" | "status" | "total">,
): Trip {
  // A local HTTP preview on a phone can lack crypto.randomUUID.
  const id =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    ...draft,
    ...details,
    id,
    date: new Date().toISOString(),
    total: details.status === "Canceled" ? 0 : details.total,
  };
}
