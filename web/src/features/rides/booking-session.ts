"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { RideDraft } from "./types";

export interface BookingSession {
    requestKey: string;
    quoteId: string;
    draft: RideDraft;
    tripId?: string;
}

const storageKey = "rove.booking.rider-1";
const eventName = "rove:booking";

function snapshot() {
    try {
        return sessionStorage.getItem(storageKey);
    } catch {
        return null;
    }
}

function subscribe(notify: () => void) {
    window.addEventListener(eventName, notify);
    return () => window.removeEventListener(eventName, notify);
}

export function saveBooking(session: BookingSession | null) {
    if (session) {
        sessionStorage.setItem(storageKey, JSON.stringify(session));
    } else {
        sessionStorage.removeItem(storageKey);
    }
    window.dispatchEvent(new Event(eventName));
}

export function useBookingSession() {
    const raw = useSyncExternalStore(subscribe, snapshot, () => null);
    return useMemo(() => {
        if (!raw) return null;
        try {
            return JSON.parse(raw) as BookingSession;
        } catch {
            return null;
        }
    }, [raw]);
}