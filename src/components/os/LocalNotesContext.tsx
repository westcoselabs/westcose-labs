"use client";

import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
} from "react";

import type { LocalNotesAction, LocalNotesState } from "@/state/local-notes";

type LocalNotesContextValue = {
  readonly dispatch: Dispatch<LocalNotesAction>;
  readonly state: LocalNotesState;
};

const LocalNotesContext = createContext<LocalNotesContextValue | null>(null);

export function LocalNotesProvider({
  children,
  dispatch,
  state,
}: LocalNotesContextValue & { readonly children: ReactNode }) {
  return (
    <LocalNotesContext.Provider value={{ dispatch, state }}>
      {children}
    </LocalNotesContext.Provider>
  );
}

export function useLocalNotes(): LocalNotesContextValue | null {
  return useContext(LocalNotesContext);
}
