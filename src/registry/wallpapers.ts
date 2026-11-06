import generatedWallpapers from "./wallpapers.generated.json";
import type { WallpaperDefinition } from "./types";

// Light artwork needs a legibility veil in skins with unbacked light labels.
// A skin with independently backed labels can opt out through this token.
const lightArtworkScrim =
  "linear-gradient(color-mix(in srgb, var(--color-neutral) var(--wallpaper-light-art-shade, 72%), transparent), color-mix(in srgb, var(--color-neutral) var(--wallpaper-light-art-shade, 72%), transparent))";

/**
 * Wallpapers are shared by Desktop OS and Pocket OS. Each definition owns both
 * source images so one wallpaper id can present landscape artwork on the
 * desktop and portrait artwork in the pocket without duplicating shell markup.
 *
 * Generated sources are built from semantic colour tokens, so a wallpaper can
 * follow the active theme's palette without shipping an extra asset.
 */
const baseWallpaperRegistry = [
  {
    id: "dusk-cliffs",
    name: "Dusk Cliffs",
    description: "The bundled WestCose landscape shipped with the Dusk system.",
    default: true,
    hidden: false,
    recommendedThemeId: "dusk",
    desktop: {
      kind: "image",
      src: "/images/wallpapers/dusk-desktop.webp",
      width: 1536,
      height: 1024,
    },
    pocket: {
      kind: "image",
      src: "/images/wallpapers/dusk-pocket.webp",
      width: 1024,
      height: 1536,
    },
    scrim: {
      desktop:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 12%, transparent), color-mix(in srgb, var(--color-neutral) 48%, transparent))",
      pocketHome:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 28%, transparent), color-mix(in srgb, var(--color-neutral) 48%, transparent))",
      pocketLock:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 26%, transparent), color-mix(in srgb, var(--color-neutral) 58%, transparent))",
    },
    preview: {
      image: 'url("/images/wallpapers/dusk-pocket.webp")',
      label: "Bundled landscape photograph",
    },
  },
  {
    id: "westcose-95",
    name: "WestCose 95",
    description: "Optimized for CRTs and bad financial decisions.",
    default: false,
    hidden: false,
    recommendedThemeId: "westcose-95",
    desktop: {
      kind: "generated",
      image: [
        "repeating-linear-gradient(0deg, transparent 0 3px, var(--wallpaper-95-weave) 3px 4px)",
        "repeating-linear-gradient(90deg, transparent 0 3px, var(--wallpaper-95-weave) 3px 4px)",
        "linear-gradient(135deg, transparent 0 68%, var(--wallpaper-95-line) 68% 68.2%, transparent 68.2% 70%, var(--wallpaper-95-panel) 70% 84%, var(--wallpaper-95-line) 84% 84.2%, transparent 84.2%)",
        "linear-gradient(var(--wallpaper-95-base), var(--wallpaper-95-base))",
      ].join(", "),
    },
    pocket: {
      kind: "generated",
      image: [
        "repeating-linear-gradient(0deg, transparent 0 3px, var(--wallpaper-95-weave) 3px 4px)",
        "linear-gradient(90deg, transparent 0 12%, var(--wallpaper-95-line) 12% 12.5%, transparent 12.5% 87.5%, var(--wallpaper-95-line) 87.5% 88%, transparent 88%)",
        "linear-gradient(0deg, var(--wallpaper-95-base) 0 18%, transparent 18% 82%, var(--wallpaper-95-base) 82%)",
        "linear-gradient(90deg, var(--wallpaper-95-base) 0 16%, var(--wallpaper-95-panel) 16% 84%, var(--wallpaper-95-base) 84%)",
      ].join(", "),
    },
    scrim: { desktop: "none", pocketHome: "none", pocketLock: "none" },
    preview: {
      image: "repeating-linear-gradient(135deg, var(--wallpaper-95-base) 0 14px, var(--wallpaper-95-panel) 14px 20px, var(--wallpaper-95-line) 20px 21px)",
      label: "Teal workstation weave",
    },
  },
  {
    id: "liquid-glass",
    name: "Tidal Light",
    description: "Pacific light, held in suspension. No oceanfront rent required.",
    default: false,
    hidden: false,
    recommendedThemeId: "liquid-glass",
    desktop: { kind: "image", src: "/images/wallpapers/liquid-glass-desktop.svg", width: 1600, height: 1000 },
    pocket: { kind: "image", src: "/images/wallpapers/liquid-glass-pocket.svg", width: 900, height: 1800 },
    scrim: { desktop: lightArtworkScrim, pocketHome: lightArtworkScrim, pocketLock: lightArtworkScrim },
    preview: {
      image: 'url("/images/wallpapers/liquid-glass-pocket.svg")',
      label: "Pacific light study",
    },
  },
  {
    id: "coastal-hills",
    name: "Coastal Hills",
    description: "An original sunny green coast, made for WestCose XP.",
    default: false,
    hidden: false,
    recommendedThemeId: "westcose-xp",
    desktop: { kind: "image", src: "/images/wallpapers/xp-coastal-hills-desktop.webp", width: 1536, height: 1024 },
    pocket: { kind: "image", src: "/images/wallpapers/xp-coastal-hills-pocket.webp", width: 683, height: 1024 },
    scrim: { desktop: lightArtworkScrim, pocketHome: lightArtworkScrim, pocketLock: lightArtworkScrim },
    preview: {
      image: 'url("/images/wallpapers/xp-coastal-hills-desktop.webp")',
      label: "Original green hills and blue coastal sky",
    },
  },
  {
    id: "standard-issue",
    name: "Standard Issue",
    description:
      "The approved neutral backdrop that arrives with maximum tolerance for bad ideas.",
    default: false,
    hidden: true,
    discoveryId: "settings.bad-ideas-max",
    recommendedThemeId: "corporate-beige",
    desktop: {
      kind: "generated",
      image: [
        "repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-surface-raised) 42%, transparent) 0 2px, transparent 2px 10px)",
        "linear-gradient(168deg, var(--color-surface-raised), var(--color-neutral) 62%, var(--color-surface-recessed))",
      ].join(", "),
    },
    pocket: {
      kind: "generated",
      image: [
        "repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-surface-raised) 42%, transparent) 0 2px, transparent 2px 8px)",
        "linear-gradient(192deg, var(--color-surface-raised), var(--color-neutral) 66%, var(--color-surface-recessed))",
      ].join(", "),
    },
    scrim: {
      desktop:
        "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-neutral) 22%, transparent))",
      pocketHome:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 14%, transparent), color-mix(in srgb, var(--color-neutral) 58%, transparent))",
      pocketLock:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 12%, transparent), color-mix(in srgb, var(--color-neutral) 66%, transparent))",
    },
    preview: {
      image:
        "linear-gradient(168deg, var(--color-surface-raised), var(--color-neutral) 62%, var(--color-surface-recessed))",
      label: "Approved neutral backdrop",
    },
  },
] as const satisfies readonly WallpaperDefinition[];

const generatedDescriptions: Record<string, string> = {
  "dusk-moonwater": "Silver moonlight across a quiet Pacific cove.",
  "dusk-obsidian": "Sculpted black dunes meet a blue-hour sea.",
  "95-tidal-grid": "A pixel-built Pacific wave in workstation teal.",
  "95-pacific-circuit": "Playful teal geometry from a digital coast.",
  "glass-prism-tide": "A glass wave bending soft coastal light.",
  "glass-lagoon-lens": "Frosted lenses, lagoon colors, and warm caustics.",
  "xp-wildflower-bluff": "California poppies above a bright turquoise coast.",
  "xp-blue-reservoir": "Rolling green hills around a winding blue lake.",
  "beige-paper-architecture": "Warm paper arches and sculptural shadows.",
  "beige-sunlit-atrium": "Travertine arches in a quiet sunlit atrium.",
};

export const wallpaperRegistry: readonly WallpaperDefinition[] = [
  ...baseWallpaperRegistry,
  ...generatedWallpapers.map((wallpaper): WallpaperDefinition => {
    const base = baseWallpaperRegistry.find(entry => entry.recommendedThemeId === wallpaper.themeId);
    if (!base) throw new Error(`Unknown wallpaper theme: ${wallpaper.themeId}`);
    const description = generatedDescriptions[wallpaper.id];
    return {
      ...base,
      id: wallpaper.id,
      name: wallpaper.name,
      description,
      default: false,
      desktop: { kind: "image", ...wallpaper.desktop, src: wallpaper.desktop.src as `/${string}` },
      pocket: { kind: "image", ...wallpaper.pocket, src: wallpaper.pocket.src as `/${string}` },
      preview: { image: `url("${wallpaper.preview}")`, label: description },
    };
  }),
];

export type RegisteredWallpaper = (typeof wallpaperRegistry)[number];
export type WallpaperId = RegisteredWallpaper["id"];

export const defaultWallpaper: RegisteredWallpaper =
  wallpaperRegistry.find((wallpaper) => wallpaper.default) ??
  wallpaperRegistry[0];

export function getWallpaper(id: string): RegisteredWallpaper | undefined {
  return wallpaperRegistry.find((wallpaper) => wallpaper.id === id);
}
