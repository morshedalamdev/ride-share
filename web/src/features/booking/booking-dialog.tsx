"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  saveBooking,
  type BookingSession,
} from "@/features/rides/booking-session";
import type { RideClass, Trip } from "@/features/rides/types";
import { BookingDetails } from "./booking-details";

interface SavedTrip {
  trip_id: string;
  status: string;
  quote: {
    ride_class: RideClass;
    quote_id: string;
    total_usd_cents: number;
  };
  amount_due_cents: number;
  created_at: string;
}

class RequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request(
  path: string,
  body?: object,
  signal?: AbortSignal,
): Promise<SavedTrip> {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new RequestError(await response.text(), response.status);
  }
  return response.json();
}

export function BookingDialog({
  session,
  onClose,
  onRecord,
}: {
  session: BookingSession;
  onClose: () => void;
  onRecord: (trip: Trip) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [attempt, setAttempt] = useState(0);
  const [canceling, setCanceling] = useState(false);
  const key = JSON.stringify([session.requestKey, session.tripId, attempt]);

  const [view, setView] = useState<{
    key: string;
    trip: SavedTrip | null;
    error: string;
    canDismiss: boolean;
  } | null>(null);

  const current = view?.key === key ? view : null;
  const trip = current?.trip;

  useEffect(() => {
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const operation = session.tripId
      ? request(
        `/api/trips/${session.tripId}/?user_id=rider-1`,
        undefined,
        controller.signal,
      )
      : request(
        "/api/trips/",
        {
          user_id: "rider-1",
          quote_id: session.quoteId,
          request_key: session.requestKey,
        },
        controller.signal,
      );

    operation.then(trip => {
      if (controller.signal.aborted) return;
      if (!session.tripId) {
        saveBooking({ ...session, tripId: trip.trip_id });
      }
      setView({ key, trip, error: "", canDismiss: false });
    }).catch(error => {
      if (controller.signal.aborted) return;
      setView({
        key,
        trip: null,
        error: error instanceof Error ? error.message : "Request failed",
        canDismiss:
          error instanceof RequestError &&
          [400, 404, 409].includes(error.status),
      });
    });

    return () => controller.abort();
  }, [session, key]);

  async function cancelTrip() {
    if (!trip || canceling) return;
    setCanceling(true);
    try {
      const updated = await request(
        `/api/trips/${trip.trip_id}/cancel/`,
        { user_id: "rider-1" },
      );
      setView({ key, trip: updated, error: "", canDismiss: false });
    } catch (error) {
      setView({
        key,
        trip,
        canDismiss: false,
        error: error instanceof Error ? error.message : "Cancellation failed",
      });
    } finally {
      setCanceling(false);
    }
  }

  function finish() {
    if (trip?.status === "canceled") {
      onRecord({
        ...session.draft,
        id: trip.trip_id,
        rideClass: trip.quote.ride_class,
        total: trip.amount_due_cents / 100,
        date: trip.created_at,
        status: "Canceled",
        role: "rider",
      });
    }
    onClose();
  }

  const terminal = trip?.status === "canceled" || trip?.status === "completed";

  return (
    <dialog
      ref={dialog}
      aria-labelledby={heading}
      onCancel={event => event.preventDefault()}
      className="fixed inset-0 m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line bg-white p-6 text-ink shadow-2xl backdrop:bg-black/40"
    >
      <h2 id={heading} className="section-title">Your trip</h2>

      {!current && (
        <p role="status" className="mt-4">Loading your booking…</p>
      )}
      {current?.error && (
        <p role="alert" className="mt-4 text-red-700">{current.error}</p>
      )}
      {trip && (
        <div className="mt-4 grid gap-3">
          <p>Status: {trip.status.replace(/_/g, " ")}</p>
          <p className="break-all text-xs text-muted">Trip {trip.trip_id}</p>
          <BookingDetails
            draft={session.draft}
            total={trip.amount_due_cents / 100}
          />
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <button
          className="secondary-button"
          disabled={!current || canceling}
          onClick={() => setAttempt(n => n + 1)}
        >
          {current?.error ? "Retry / refresh" : "Refresh status"}
        </button>

        {trip && ["pending", "accepted"].includes(trip.status) && (
          <button
            className="secondary-button"
            disabled={canceling}
            onClick={cancelTrip}
          >
            {canceling ? "Canceling…" : "Cancel trip"}
          </button>
        )}

        {(terminal || current?.canDismiss) && (
          <button
            className="primary-button"
            disabled={canceling}
            onClick={finish}
          >
            Done
          </button>
        )}
      </div>
    </dialog>
  );
}