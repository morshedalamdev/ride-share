import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { RiderDashboard } from "@/features/booking/rider-dashboard";

export default function HomePage() {
  return (
    <>
      <WorkspaceHeading
        title="Ride dashboard"
        description="Plan your route, compare rides, and book your next trip."
      />
      <RiderDashboard />
    </>
  );
}
