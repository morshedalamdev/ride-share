import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { DriverDashboard } from "@/features/driver/driver-dashboard";

export const metadata = { title: "Driver dashboard" };

export default function DriverPage() {
  return (
    <>
      <WorkspaceHeading
        title="Driver dashboard"
        description="Manage your availability and take local ride requests."
      />
      <DriverDashboard />
    </>
  );
}
