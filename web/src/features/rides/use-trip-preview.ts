"use client";

import { useEffect, useState } from "react";
import { vehicles } from "./data";
import type { RideClass } from "./types";

const points: Record<string, readonly [number, number]> = {
    ferry: [37.7955, -122.3937],
    dolores: [37.7596, -122.4269],
    oracle: [37.7792, -122.3893],
    union: [37.7881, -122.4075],
    sfmoma: [37.7857, -122.4011],
    "city-hall": [37.7793, -122.4193],
    alamo: [37.7764, -122.4346],
};

function coordinate(id: string) {
    const point = points[id];
    if (!point) throw new Error("Unknown place");
    return { latitude: point[0], longitude: point[1] };
}

export interface FareQuote {
    ride_class: RideClass;
    total_usd_cents: number;
    quote_id: string;
}

interface Preview {
    distance_meters: number;
    duration_seconds: number;
    quotes: FareQuote[];
}

export function useTripPreview(pickup: string, destination: string) {
    const [attempt, setAttempt] = useState(0);
    const key = JSON.stringify([pickup, destination, attempt]);
    const [result, setResult] = useState<{
        key: string;
        data: Preview | null;
    } | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            const response = await fetch("/api/trip/preview/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    user_id: "rider-1",
                    pickup: coordinate(pickup),
                    destination: coordinate(destination),
                }),
            });

            if (!response.ok) throw new Error("Preview request failed");

            const data: Preview = await response.json();
            if (
                !Number.isFinite(data.distance_meters) || data.distance_meters < 0 ||
                !Number.isFinite(data.duration_seconds) || data.duration_seconds < 0 ||
                !Array.isArray(data.quotes) || data.quotes.length !== vehicles.length ||
                !vehicles.every(vehicle =>
                    data.quotes.some(q =>
                        q.ride_class === vehicle.id &&
                        Number.isSafeInteger(q.total_usd_cents) &&
                        q.total_usd_cents >= 0 &&
                        q.quote_id
                    )
                )
            ) {
                throw new Error("Incomplete preview");
            }

            if (!controller.signal.aborted) setResult({ key, data });
        }

        load().catch(() => {
            if (!controller.signal.aborted) setResult({ key, data: null });
        });
        return () => controller.abort();
    }, [pickup, destination, key]);
    if (result && result.key !== key) setResult(null);
    const current = result?.key === key ? result : null;
    return {
        preview: current?.data ?? null,
        failed: current?.data === null,
        retry: () => setAttempt(n => n + 1),
    };
}