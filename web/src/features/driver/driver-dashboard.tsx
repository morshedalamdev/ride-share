import { ActivitySection } from "@/features/activity/activity-section";
import { DriverWorkspace } from "./driver-workspace";

export function DriverDashboard() {
  return (
    <>
      <DriverWorkspace />
      <ActivitySection role="driver" compact />
    </>
  );
}
