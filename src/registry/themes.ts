import type { ThemeDefinition } from "./types";

/**
 * Themes stay token and registry driven. Each entry selects a named behaviour
 * per appearance axis; the shells publish those selections as `data-theme-*`
 * attributes so a future skin ships as a registry entry plus its own
 * presentation styles instead of a parallel set of shell components.
 */
export const themeRegistry = [
  {
    id: "dusk",
    name: "Dusk",
    description: "The graphite WestCose system theme used across both shells.",
    default: true,
    hidden: false,
    dataTheme: "dusk",
    palette: {
      source: "base-tokens",
      colorScheme: "dark",
      accentRole: "primary",
    },
    treatments: {
      surface: "neumorphic",
      border: "hairline",
      depth: "soft-shadow",
      typography: "modern-sans",
      windowChrome: "modern-flat",
      taskbar: "floating-bar",
      widget: "raised-card",
      icon: "duotone-glyph",
    },
    effects: [],
    recommendedWallpaperId: "dusk-cliffs",
  },
  {
    id: "westcose-95",
    name: "WestCose 95",
    description: "Built for 8MB of RAM and absolutely no client revisions.",
    default: false,
    hidden: false,
    dataTheme: "westcose-95",
    palette: {
      source: "theme-tokens",
      colorScheme: "light",
      accentRole: "primary",
    },
    treatments: {
      surface: "beveled",
      border: "outset",
      depth: "hard-shadow",
      typography: "system-ui",
      windowChrome: "classic-titlebar",
      taskbar: "anchored-bar",
      widget: "flat-panel",
      icon: "outline",
    },
    // No blur, scanlines, or motion overlays over readable content.
    effects: [],
    recommendedWallpaperId: "westcose-95",
    copy: {
      systemLabel: "WESTCOSE 95",
      launcherLabel: "WESTCOSE",
      startupTitle: "WESTCOSE 95",
      startupStatus: "Starting questionable decisions...",
    },
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    description: "A clearer view of beautifully questionable ideas.",
    default: false,
    hidden: false,
    dataTheme: "liquid-glass",
    palette: { source: "theme-tokens", colorScheme: "light", accentRole: "primary" },
    treatments: {
      surface: "translucent",
      border: "hairline",
      depth: "drop-shadow",
      typography: "modern-sans",
      windowChrome: "translucent",
      taskbar: "floating-bar",
      widget: "translucent-card",
      icon: "filled",
    },
    effects: ["backdrop-blur"],
    recommendedWallpaperId: "liquid-glass",
    copy: {
      systemLabel: "LIQUID GLASS",
      launcherLabel: "WestCose",
      startupTitle: "WestCose",
      startupStatus: "A little clarity. Same questionable ideas.",
    },
  },
  {
    id: "corporate-beige",
    name: "Corporate Beige",
    description: "A quietly approved neutral theme unlocked through tolerance.",
    default: false,
    hidden: true,
    discoveryId: "settings.bad-ideas-max",
    dataTheme: "corporate-beige",
    palette: {
      source: "theme-tokens",
      colorScheme: "light",
      accentRole: "primary",
    },
    treatments: {
      surface: "neumorphic",
      border: "hairline",
      depth: "soft-shadow",
      typography: "modern-sans",
      windowChrome: "modern-flat",
      taskbar: "floating-bar",
      widget: "raised-card",
      icon: "duotone-glyph",
    },
    effects: [],
    recommendedWallpaperId: "standard-issue",
  },
] as const satisfies readonly ThemeDefinition[];

export type RegisteredTheme = (typeof themeRegistry)[number];
export type ThemeId = RegisteredTheme["id"];

export const defaultTheme: RegisteredTheme =
  themeRegistry.find((theme) => theme.default) ?? themeRegistry[0];

export function getTheme(id: string): RegisteredTheme | undefined {
  return themeRegistry.find((theme) => theme.id === id);
}
