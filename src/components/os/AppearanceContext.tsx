"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  EMPTY_UNLOCK_STATE,
  listAvailableThemes,
  listAvailableWallpapers,
  resolveAppearance,
} from "@/lib/appearance";
import type { RegisteredTheme } from "@/registry/themes";
import type { RegisteredWallpaper } from "@/registry/wallpapers";
import type { ThemeDefinition } from "@/registry/types";

/**
 * One appearance state for both shells. Desktop OS and Pocket OS read the same
 * resolved theme and wallpaper and call the same setters, so personalising in
 * one presentation is immediately reflected in the other.
 */
export type AppearanceContextValue = {
  readonly theme: RegisteredTheme & Pick<ThemeDefinition, "copy">;
  readonly wallpaper: RegisteredWallpaper;
  /** Public entries plus anything the shared discovery state has unlocked. */
  readonly availableThemes: readonly RegisteredTheme[];
  readonly availableWallpapers: readonly RegisteredWallpaper[];
  readonly setThemeId: (themeId: string) => void;
  readonly setWallpaperId: (wallpaperId: string) => void;
};

const fallbackAppearance = (): AppearanceContextValue => {
  const resolved = resolveAppearance("", "", EMPTY_UNLOCK_STATE);
  return {
    theme: resolved.theme,
    wallpaper: resolved.wallpaper,
    availableThemes: listAvailableThemes(EMPTY_UNLOCK_STATE),
    availableWallpapers: listAvailableWallpapers(EMPTY_UNLOCK_STATE),
    setThemeId: () => undefined,
    setWallpaperId: () => undefined,
  };
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({
  children,
  value,
}: {
  readonly children: ReactNode;
  readonly value: AppearanceContextValue;
}) {
  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

/**
 * Falls back to the registry defaults so a shell surface stays renderable in
 * isolation, such as in component tests, without a provider.
 */
export function useAppearance(): AppearanceContextValue {
  return useContext(AppearanceContext) ?? fallbackAppearance();
}
