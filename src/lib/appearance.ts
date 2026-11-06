import {
  defaultTheme,
  getTheme,
  themeRegistry,
  type RegisteredTheme,
} from "../registry/themes";
import {
  defaultWallpaper,
  getWallpaper,
  wallpaperRegistry,
  type RegisteredWallpaper,
} from "../registry/wallpapers";
import type { WallpaperSource } from "../registry/types";

/**
 * Appearance is resolved once, from the shared preference and discovery state,
 * and consumed identically by Desktop OS and Pocket OS. Nothing here reads the
 * active shell, so a wallpaper or theme unlocked in one presentation is
 * immediately available in the other.
 */
export type AppearanceUnlockState = {
  readonly unlockedThemeIds: readonly string[];
  readonly unlockedWallpaperIds: readonly string[];
  readonly discoveredSecretIds: readonly string[];
};

export const EMPTY_UNLOCK_STATE: AppearanceUnlockState = Object.freeze({
  unlockedThemeIds: Object.freeze([]) as readonly string[],
  unlockedWallpaperIds: Object.freeze([]) as readonly string[],
  discoveredSecretIds: Object.freeze([]) as readonly string[],
});

const unlockedBy = (
  id: string,
  discoveryId: string | undefined,
  unlockedIds: readonly string[],
  discoveredSecretIds: readonly string[],
): boolean =>
  unlockedIds.includes(id) ||
  (discoveryId !== undefined && discoveredSecretIds.includes(discoveryId));

export function isThemeAvailable(
  theme: RegisteredTheme,
  unlocks: AppearanceUnlockState = EMPTY_UNLOCK_STATE,
): boolean {
  if (!theme.hidden) return true;
  return unlockedBy(
    theme.id,
    "discoveryId" in theme ? theme.discoveryId : undefined,
    unlocks.unlockedThemeIds,
    unlocks.discoveredSecretIds,
  );
}

export function isWallpaperAvailable(
  wallpaper: RegisteredWallpaper,
  unlocks: AppearanceUnlockState = EMPTY_UNLOCK_STATE,
): boolean {
  // A theme unlock includes its complete, curated wallpaper collection.
  const theme = getTheme(wallpaper.recommendedThemeId);
  return theme !== undefined && isThemeAvailable(theme, unlocks);
}

export function listAvailableThemes(
  unlocks: AppearanceUnlockState = EMPTY_UNLOCK_STATE,
): readonly RegisteredTheme[] {
  return themeRegistry.filter((theme) => isThemeAvailable(theme, unlocks));
}

export function listAvailableWallpapers(
  unlocks: AppearanceUnlockState = EMPTY_UNLOCK_STATE,
  themeId: string = defaultTheme.id,
): readonly RegisteredWallpaper[] {
  return wallpaperRegistry.filter((wallpaper) =>
    wallpaper.recommendedThemeId === themeId && isWallpaperAvailable(wallpaper, unlocks),
  );
}

export type ResolvedAppearance = {
  readonly theme: RegisteredTheme;
  readonly wallpaper: RegisteredWallpaper;
  /** True when a persisted id was unknown or no longer unlocked. */
  readonly themeRecovered: boolean;
  readonly wallpaperRecovered: boolean;
};

/**
 * Recover unavailable themes to Dusk. Unknown, locked, or mismatched wallpapers
 * recover to the resolved theme's recommendation, including older mixed saves.
 */
export function resolveAppearance(
  themeId: string,
  wallpaperId: string,
  unlocks: AppearanceUnlockState = EMPTY_UNLOCK_STATE,
): ResolvedAppearance {
  const storedTheme = getTheme(themeId);
  const themeAvailable =
    storedTheme !== undefined && isThemeAvailable(storedTheme, unlocks);
  const theme = themeAvailable ? storedTheme : defaultTheme;
  const storedWallpaper = getWallpaper(wallpaperId);
  const wallpaperAvailable =
    storedWallpaper !== undefined &&
    storedWallpaper.recommendedThemeId === theme.id &&
    isWallpaperAvailable(storedWallpaper, unlocks);

  return {
    theme,
    wallpaper: wallpaperAvailable ? storedWallpaper : getWallpaper(theme.recommendedWallpaperId) ?? defaultWallpaper,
    themeRecovered: !themeAvailable,
    wallpaperRecovered: !wallpaperAvailable,
  };
}

export function wallpaperImageValue(source: WallpaperSource): string {
  return source.kind === "image" ? `url("${source.src}")` : source.image;
}

export const APPEARANCE_CSS_VARIABLES = [
  "--wallpaper-desktop-image",
  "--wallpaper-pocket-image",
  "--wallpaper-desktop-scrim",
  "--wallpaper-pocket-home-scrim",
  "--wallpaper-pocket-lock-scrim",
] as const;

export function wallpaperCssVariables(
  wallpaper: RegisteredWallpaper,
): Readonly<Record<string, string>> {
  return {
    "--wallpaper-desktop-image": wallpaperImageValue(wallpaper.desktop),
    "--wallpaper-pocket-image": wallpaperImageValue(wallpaper.pocket),
    "--wallpaper-desktop-scrim": wallpaper.scrim.desktop,
    "--wallpaper-pocket-home-scrim": wallpaper.scrim.pocketHome,
    "--wallpaper-pocket-lock-scrim": wallpaper.scrim.pocketLock,
  };
}

/**
 * Dataset keys published on the document element. Theme-specific presentation
 * styles hook onto these, which is what keeps a future skin out of the shells.
 */
export function themeDataset(
  theme: RegisteredTheme,
): Readonly<Record<string, string>> {
  return {
    theme: theme.dataTheme,
    themePalette: theme.palette.source,
    themeScheme: theme.palette.colorScheme,
    themeSurface: theme.treatments.surface,
    themeBorder: theme.treatments.border,
    themeDepth: theme.treatments.depth,
    themeType: theme.treatments.typography,
    themeChrome: theme.treatments.windowChrome,
    themeTaskbar: theme.treatments.taskbar,
    themeWidget: theme.treatments.widget,
    themeIcons: theme.treatments.icon,
    themeEffects: theme.effects.length > 0 ? theme.effects.join(" ") : "none",
  };
}

export function appearanceDataset(
  theme: RegisteredTheme,
  wallpaper: RegisteredWallpaper,
): Readonly<Record<string, string>> {
  return { ...themeDataset(theme), wallpaper: wallpaper.id };
}

/**
 * Serialisable appearance tables shared with the pre-paint bootstrap script so
 * a stored theme and wallpaper apply before first paint from one source.
 */
export const APPEARANCE_BOOTSTRAP_DATA = {
  defaultThemeId: defaultTheme.id,
  defaultWallpaperId: defaultWallpaper.id,
  themes: Object.fromEntries(
    themeRegistry.map((theme) => [
      theme.id,
      {
        hidden: theme.hidden,
        recommendedWallpaperId: theme.recommendedWallpaperId,
        discoveryId: "discoveryId" in theme ? theme.discoveryId : null,
        dataset: themeDataset(theme),
      },
    ]),
  ),
  wallpapers: Object.fromEntries(
    wallpaperRegistry.map((wallpaper) => [
      wallpaper.id,
      {
        hidden: wallpaper.hidden,
        themeId: wallpaper.recommendedThemeId,
        discoveryId: "discoveryId" in wallpaper ? wallpaper.discoveryId : null,
        variables: wallpaperCssVariables(wallpaper),
      },
    ]),
  ),
} as const;
