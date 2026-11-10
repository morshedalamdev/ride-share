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
        ];
      },
    };
  }

  return { ...common, output: "export" }
}