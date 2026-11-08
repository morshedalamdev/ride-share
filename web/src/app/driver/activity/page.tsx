import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { ActivitySection } from "@/features/activity/activity-section";

export const metadata = { title: "Driver activity" };

export default function DriverActivityPage() {
  return (
    <>
      <WorkspaceHeading
        title="Driver activity"
        description="Review the trips you’ve driven and their fares."
      />
      <ActivitySection role="driver" />
    </>
  );
}
