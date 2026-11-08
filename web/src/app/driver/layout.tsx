import type { ReactNode } from "react";

import { DriverSessionProvider } from "@/features/driver/driver-session";

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <DriverSessionProvider>{children}</DriverSessionProvider>;
}
