import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { RideProvider } from "@/features/rides/ride-provider";

export const metadata: Metadata = {
  title: { default: "Rove — Ride dashboard", template: "%s · Rove" },
  description:
    "Explore the Rove ride-sharing demo in San Francisco as a rider or driver.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#workspace">
          Skip to workspace
        </a>
        <RideProvider>
          <AppHeader />
          <main
            id="workspace"
            className="page-width pb-12 pt-7 sm:pt-9 lg:pt-10"
          >
            {children}
          </main>
        </RideProvider>
      </body>
    </html>
  );
}
