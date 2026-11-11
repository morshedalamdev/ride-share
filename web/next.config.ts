import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextconfig(phase: string): NextConfig {
  const common: NextConfig = {
    trailingSlash: true,
    images: { unoptimized: true },
    devIndicators: false,
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...common,
      async rewrites() {
        return [
          {
            source: "/api/trip/preview/",
            destination: "http://127.0.0.1:18081/trip/preview",
          },
          {
            source: "/api/trips/",
            destination: "http://127.0.0.1:18081/trips",
          },
          {
            source: "/api/trips/:id/",
            destination: "http://127.0.0.1:18081/trips/:id",
          },
          {
            source: "/api/trips/:id/cancel/",
            destination: "http://127.0.0.1:18081/trips/:id/cancel",
          },
        ];
      },
    };
  }

  return { ...common, output: "export" }
}