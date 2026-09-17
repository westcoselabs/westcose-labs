import type { ThemeDefinition } from "./types";

export const themeRegistry = [
  {
    id: "dusk",
    name: "Dusk",
    description: "The graphite WestCose system theme used across both shells.",
    default: true,
    hidden: false,
    desktopWallpaper: "/images/wallpapers/dusk-desktop.webp",
    pocketWallpaper: "/images/wallpapers/dusk-pocket.webp",
    dataTheme: "dusk",
  },
  {
    id: "corporate-beige",
    name: "Corporate Beige",
    description: "A quietly approved neutral theme unlocked through tolerance.",
    default: false,
    hidden: true,
    discoveryId: "settings.bad-ideas-max",
    desktopWallpaper: "/images/wallpapers/dusk-desktop.webp",
    pocketWallpaper: "/images/wallpapers/dusk-pocket.webp",
    dataTheme: "corporate-beige",
  },
] as const satisfies readonly ThemeDefinition[];

export type RegisteredTheme = (typeof themeRegistry)[number];
export type ThemeId = RegisteredTheme["id"];

export function getTheme(id: string): RegisteredTheme | undefined {
  return themeRegistry.find((theme) => theme.id === id);
}
