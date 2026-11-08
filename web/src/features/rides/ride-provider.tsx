"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { initialDraft } from "./data";
import type { RideDraft } from "./types";

interface RideContextValue {
  draft: RideDraft;
  setDraft: Dispatch<SetStateAction<RideDraft>>;
}

const RideContext = createContext<RideContextValue | null>(null);

export function RideProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(initialDraft);
  return (
    <RideContext.Provider value={{ draft, setDraft }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRideDraft() {
  const context = useContext(RideContext);
  if (!context)
    throw new Error("useRideDraft must be used inside RideProvider.");
  return context;
}
