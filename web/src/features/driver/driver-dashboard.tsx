"use client";

import { ActivitySection } from "@/features/activity/activity-section";
import { useTripHistory } from "@/features/rides/use-trip-history";
import { DriverWorkspace } from "./driver-workspace";

export function DriverDashboard() {
  const { addTrip } = useTripHistory();
  return (
    <>
      <DriverWorkspace onComplete={addTrip} />
      <ActivitySection role="driver" compact />
    </>
  );
}
