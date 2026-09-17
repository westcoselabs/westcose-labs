"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  useDiscoveryService,
  useDiscoveryState,
} from "@/components/os/DiscoveryServiceContext";
import {
  useSettings,
  type SettingsContextValue,
} from "@/components/os/SettingsContext";
import {
  discoveryRegistry,
  settingsCategoryRegistry,
  themeRegistry,
  type Discovery,
  type SettingsCategoryId,
} from "@/registry";
import {
  DEFAULT_PREFERENCES,
  type FocusMode,
  type PreferencesAction,
} from "@/state/preferences";

export type SettingsRouteView =
  | { readonly kind: "home" }
  | { readonly kind: "category"; readonly categoryId: SettingsCategoryId };

export type DiscoveryGroup = {
  readonly id: string;
  readonly label: string;
  readonly items: readonly {
    readonly description: string;
    readonly discovered: boolean;
    readonly id: string;
    readonly title: string;
  }[];
};

const noop = () => undefined;
const fallbackSettings: SettingsContextValue = {
  dispatch: noop,
  effectiveAccessibility: { highContrast: false, reducedMotion: false },
  lockPocket: noop,
  preferences: DEFAULT_PREFERENCES,
  previewLock: noop,
  replayStartup: noop,
  resetAllLocalState: noop,
  resetDiscoveries: noop,
  resetLocalNotes: noop,
  resetPreferences: noop,
  resetSession: noop,
};

const groupForDiscovery = (category: Discovery["category"]) => {
  if (category === "notes") return "notes";
  if (category === "terminal") return "terminal";
  if (category === "recycle") return "recycle";
  if (category === "fightclub") return "fightclub";
  if (category === "theme") return "themes";
  return "system";
};

const discoveryTeasers: Record<string, string> = {
  system: "Something is hidden in the system chrome.",
  notes: "Something is hidden in Notes.",
  terminal: "A harmless command remains undiscovered.",
  recycle: "Recycle is keeping one detail to itself.",
  fightclub: "The launcher has not revealed everything.",
  themes: "Another appearance option may exist.",
};

export function useSettingsController(view: SettingsRouteView) {
  const router = useRouter();
  const settings = useSettings() ?? fallbackSettings;
  const discoveryService = useDiscoveryService();
  const discoveryState = useDiscoveryState();

  const dispatch = useCallback(
    (action: PreferencesAction) => settings.dispatch(action),
    [settings],
  );

  const setTolerance = useCallback(
    (value: number) => {
      dispatch({ type: "bad-idea-tolerance/set", value });
      discoveryService?.incrementCounter("settingsToleranceChanges");
      if (value < 100 || discoveryService?.hasDiscovery("settings.bad-ideas-max")) {
        return;
      }
      discoveryService?.recordDiscovery("settings.bad-ideas-max");
      discoveryService?.unlockTheme("corporate-beige");
    },
    [discoveryService, dispatch],
  );

  const discoveryGroups = useMemo<DiscoveryGroup[]>(() => {
    const definitions = [
      ["system", "System"],
      ["notes", "Notes"],
      ["terminal", "Terminal"],
      ["recycle", "Recycle"],
      ["fightclub", "FightClub"],
      ["themes", "Themes"],
    ] as const;
    const discovered = new Set(discoveryState?.discoveredSecretIds ?? []);

    return definitions.map(([id, label]) => ({
      id,
      label,
      items: discoveryRegistry
        .filter((item) => groupForDiscovery(item.category) === id)
        .map((item) => ({
          description: discovered.has(item.id)
            ? item.description
            : discoveryTeasers[id],
          discovered: discovered.has(item.id),
          id: item.id,
          title: discovered.has(item.id) ? item.title : "???",
        })),
    }));
  }, [discoveryState?.discoveredSecretIds]);

  const notificationDefinition = discoveryState?.discoveredSecretIds
    .slice()
    .reverse()
    .map((id) => discoveryRegistry.find((item) => item.id === id))
    .find(
      (item) =>
        item !== undefined &&
        "notificationCopy" in item &&
        !discoveryState.dismissedDiscoveryIds.includes(item.id),
    );

  return {
    availableThemes: themeRegistry.filter(
      (theme) =>
        !theme.hidden || discoveryState?.unlockedThemeIds.includes(theme.id),
    ),
    categories: settingsCategoryRegistry,
    discoveryGroups,
    discoveredCount: discoveryState?.discoveredSecretIds.length ?? 0,
    dismissNotification: () => {
      if (notificationDefinition) {
        discoveryService?.dismissDiscovery(notificationDefinition.id);
      }
    },
    dispatch,
    effectiveAccessibility: settings.effectiveAccessibility,
    notification:
      notificationDefinition && "notificationCopy" in notificationDefinition
        ? {
            copy: notificationDefinition.notificationCopy,
            id: notificationDefinition.id,
            title: notificationDefinition.title,
          }
        : null,
    openCategory: (categoryId: SettingsCategoryId) =>
      router.push(`/settings/${categoryId}`),
    preferences: settings.preferences,
    setFocusMode: (focusMode: FocusMode) =>
      dispatch({ type: "focus-mode/set", focusMode }),
    setTolerance,
    systemActions: {
      lockPocket: settings.lockPocket,
      previewLock: settings.previewLock,
      replayStartup: settings.replayStartup,
      resetAllLocalState: settings.resetAllLocalState,
      resetDiscoveries: settings.resetDiscoveries,
      resetLocalNotes: settings.resetLocalNotes,
      resetPreferences: settings.resetPreferences,
      resetSession: settings.resetSession,
    },
    view,
  };
}

export type SettingsController = ReturnType<typeof useSettingsController>;
