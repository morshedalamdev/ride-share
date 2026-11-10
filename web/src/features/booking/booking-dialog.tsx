"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  CarFront,
  Check,
  CreditCard,
  LoaderCircle,
  Navigation,
  X,
} from "lucide-react";

import { createDemoTrip } from "@/features/rides/create-demo-trip";
import { vehicles } from "@/features/rides/data";
import type { RideDraft, Trip } from "@/features/rides/types";
import { BookingDetails, DriverDetails } from "./booking-details";

type BookingStage = "searching" | "matched" | "riding" | "checkout" | "receipt";

const stages = {
  searching: { title: "Finding your driver", icon: LoaderCircle, action: null },
  matched: {
    title: "Your driver is on the way",
    icon: CarFront,
    action: "Start demo ride",
  },
  riding: {
    title: "Your ride is underway",
    icon: Navigation,
    action: "Finish demo ride",
  },
  checkout: {
    title: "Review your fare",
    icon: CreditCard,
    action: "Confirm demo payment",
  },
  receipt: { title: "Ride complete", icon: Check, action: "Done" },
};

interface BookingDialogProps {
  draft: RideDraft;
  total: number;
  minutes: number;
  onClose: () => void;
  onRecord: (trip: Trip) => void;
}

export function BookingDialog({
  draft,
  total,
  minutes,
  onClose,
  onRecord,
}: BookingDialogProps) {
  const [stage, setStage] = useState<BookingStage>("searching");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const recorded = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const vehicle = vehicles.find((option) => option.id === draft.rideClass)!;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (stage !== "searching" || confirmCancel) return;
    const timeout = window.setTimeout(() => setStage("matched"), 1800);
    return () => window.clearTimeout(timeout);
  }, [stage, confirmCancel]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [stage, confirmCancel]);

  function requestClose() {
    if (stage === "receipt") onClose();
    else setConfirmCancel(true);
  }

  function record(status: Trip["status"]) {
    if (recorded.current) return;
    recorded.current = true;
    onRecord(createDemoTrip(draft, { role: "rider", status, total }));
  }

  function cancelRide() {
    record("Canceled");
    onClose();
  }

  function advanceRide() {
    switch (stage) {
      case "matched":
        setStage("riding");
        break;
      case "riding":
        setStage("checkout");
        break;
      case "checkout":
        record("Completed");
        setStage("receipt");
        break;
      case "receipt":
        onClose();
        break;
    }
  }

  const descriptions = {
    searching: `Looking for a nearby driver for your ${vehicle.name} ride.`,
    matched: `Meet Jordan at ${draft.pickup.name} in about ${vehicle.minutes} minutes.`,
    riding: `Your trip to ${draft.dropoff.name} takes about ${minutes} minutes.`,
    checkout:
      "Confirm the simulated payment to finish this trip. No money will be charged.",
    receipt:
      "Your demo payment is complete. Your receipt is saved in Activity.",
  };
  const { icon: Icon, title, action } = stages[stage];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (confirmCancel) setConfirmCancel(false);
        else requestClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-[#202722]/45 backdrop:backdrop-blur-[3px]"
    >
      <div className="relative p-5 sm:p-7">
        <button
          type="button"
          aria-label={confirmCancel ? "Return to ride" : "Close ride details"}
          onClick={confirmCancel ? () => setConfirmCancel(false) : requestClose}
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <span
          aria-hidden="true"
          className={`mb-4 grid size-11 place-items-center rounded-2xl ${stage === "receipt" ? "bg-[#e8f2e8] text-[#376248]" : "bg-peach text-[#b74121]"}`}
        >
          {confirmCancel ? (
            <X size={21} />
          ) : (
            <Icon
              size={21}
              className={
                stage === "searching" ? "motion-safe:animate-spin" : undefined
              }
            />
          )}
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          id={titleId}
          className="section-title outline-none"
        >
          {confirmCancel ? "Cancel this demo ride?" : title}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-relaxed text-muted"
        >
          {confirmCancel
            ? "Your activity will show a canceled ride with a $0.00 fare."
            : descriptions[stage]}
        </p>
        {confirmCancel ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              className="primary-button"
            >
              Keep ride
            </button>
            <button
              type="button"
              onClick={cancelRide}
              className="secondary-button"
            >
              Cancel ride
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3">
              {(stage === "matched" || stage === "riding") && (
                <DriverDetails vehicle={vehicle} />
              )}
              <BookingDetails draft={draft} total={total} />
            </div>
            <div className="mt-5 grid gap-2">
              {action && (
                <button
                  type="button"
                  onClick={advanceRide}
                  className="primary-button"
                >
                  {action}
                  {stage !== "receipt" && (
                    <ArrowRight size={16} aria-hidden="true" />
                  )}
                </button>
              )}
              {(stage === "searching" || stage === "matched") && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={requestClose}
                >
                  Cancel request
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
