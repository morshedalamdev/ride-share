import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { ActivitySection } from "@/features/activity/activity-section";

export const metadata = { title: "Trip activity" };

export default function ActivityPage() {
  return (
    <>
      <WorkspaceHeading
        title="Trip activity"
        description="Review past rides, see receipts, or take a route again."
      />
      <ActivitySection role="rider" />
    </>
  );
}
