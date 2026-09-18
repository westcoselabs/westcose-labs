import {
  useReducer,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { AppearanceProvider } from "@/components/os/AppearanceContext";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { SettingsProvider } from "@/components/os/SettingsContext";
import {
  listAvailableThemes,
  listAvailableWallpapers,
  resolveAppearance,
} from "@/lib/appearance";
import {
  createDiscoveryService,
  type DiscoveryService,
} from "@/lib/discovery-service";
import {
  createInitialPreferences,
  preferencesReducer,
} from "@/state/preferences";

const noop = () => undefined;

/**
 * Mirrors how OSRoot assembles appearance: one preference reducer and one
 * discovery service feeding a single resolved appearance, shared by the
 * appearance and settings contexts. Shell surfaces under test therefore read
 * exactly what they read in the running application.
 */
export function AppearanceHarness({
  children,
  service: providedService,
}: {
  readonly children: ReactNode;
  readonly service?: DiscoveryService;
}) {
  const [preferences, dispatch] = useReducer(
    preferencesReducer,
    undefined,
    createInitialPreferences,
  );
  const [service] = useState(
    () => providedService ?? createDiscoveryService(null),
  );
  const discoveryState = useSyncExternalStore(
    service.subscribe,
    service.getState,
    service.getState,
  );
  const unlocks = {
    unlockedThemeIds: discoveryState.unlockedThemeIds,
    unlockedWallpaperIds: discoveryState.unlockedWallpaperIds,
    discoveredSecretIds: discoveryState.discoveredSecretIds,
  };
  const resolved = resolveAppearance(
    preferences.themeId,
    preferences.wallpaperId,
    unlocks,
  );

  return (
    <DiscoveryServiceProvider service={service}>
      <AppearanceProvider
        value={{
          theme: resolved.theme,
          wallpaper: resolved.wallpaper,
          availableThemes: listAvailableThemes(unlocks),
          availableWallpapers: listAvailableWallpapers(unlocks),
          setThemeId: (themeId) => dispatch({ type: "theme/set", themeId }),
          setWallpaperId: (wallpaperId) =>
            dispatch({ type: "wallpaper/set", wallpaperId }),
        }}
      >
        <SettingsProvider
          value={{
            dispatch,
            effectiveAccessibility: {
              highContrast: preferences.highContrast,
              reducedMotion: preferences.extraReducedMotion,
            },
            lockPocket: noop,
            preferences,
            previewLock: noop,
            replayStartup: noop,
            resetAllLocalState: noop,
            resetDiscoveries: noop,
            resetLocalNotes: noop,
            resetPreferences: noop,
            resetSession: noop,
          }}
        >
          {children}
        </SettingsProvider>
        <output data-testid="appearance-state">
          {`${resolved.theme.id}|${resolved.wallpaper.id}`}
        </output>
      </AppearanceProvider>
    </DiscoveryServiceProvider>
  );
}

export const appearanceState = (): string =>
  document.querySelector('[data-testid="appearance-state"]')?.textContent ?? "";
