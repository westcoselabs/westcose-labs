"use client";

import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
} from "react";

import type {
  EffectiveAccessibilityPreferences,
  Preferences,
  PreferencesAction,
} from "@/state/preferences";

export type SettingsContextValue = {
  readonly dispatch: Dispatch<PreferencesAction>;
  readonly effectiveAccessibility: EffectiveAccessibilityPreferences;
  readonly lockPocket: () => void;
  readonly preferences: Preferences;
  readonly previewLock: () => void;
  readonly replayStartup: () => void;
  readonly resetAllLocalState: () => void;
  readonly resetDiscoveries: () => void;
  readonly resetLocalNotes: () => void;
  readonly resetPreferences: () => void;
  readonly resetSession: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
  children,
  value,
}: {
  readonly children: ReactNode;
  readonly value: SettingsContextValue;
}) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue | null {
  return useContext(SettingsContext);
}
