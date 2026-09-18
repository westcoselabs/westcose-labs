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
export const wallpaperRegistry = [
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
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 28%, transparent), color-mix(in srgb, var(--color-neutral) 78%, transparent))",
      pocketLock:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 26%, transparent), color-mix(in srgb, var(--color-neutral) 82%, transparent))",
    },
    preview: {
      image: 'url("/images/wallpapers/dusk-pocket.webp")',
      label: "Bundled landscape photograph",
    },
  },
  {
    id: "graphite-field",
    name: "Graphite Field",
    description:
      "A quiet token-built gradient for people who would rather read the windows.",
    default: false,
    hidden: false,
    recommendedThemeId: "dusk",
    desktop: {
      kind: "generated",
      image: [
        "radial-gradient(120% 96% at 22% 12%, color-mix(in srgb, var(--color-surface-active) 62%, transparent), transparent 62%)",
        "linear-gradient(158deg, var(--color-surface-recessed), var(--color-neutral) 54%, var(--color-surface-base))",
      ].join(", "),
    },
    pocket: {
      kind: "generated",
      image: [
        "radial-gradient(130% 56% at 50% 8%, color-mix(in srgb, var(--color-surface-active) 58%, transparent), transparent 64%)",
        "linear-gradient(186deg, var(--color-surface-recessed), var(--color-neutral) 58%, var(--color-surface-base))",
      ].join(", "),
    },
    scrim: {
      desktop:
        "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-neutral) 28%, transparent))",
      pocketHome:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 18%, transparent), color-mix(in srgb, var(--color-neutral) 64%, transparent))",
      pocketLock:
        "linear-gradient(to bottom, color-mix(in srgb, var(--color-neutral) 16%, transparent), color-mix(in srgb, var(--color-neutral) 70%, transparent))",
    },
    preview: {
      image:
        "linear-gradient(158deg, var(--color-surface-recessed), var(--color-neutral) 54%, var(--color-surface-base))",
      label: "Token-built graphite gradient",
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

export type RegisteredWallpaper = (typeof wallpaperRegistry)[number];
export type WallpaperId = RegisteredWallpaper["id"];

export const defaultWallpaper: RegisteredWallpaper =
  wallpaperRegistry.find((wallpaper) => wallpaper.default) ??
  wallpaperRegistry[0];

export function getWallpaper(id: string): RegisteredWallpaper | undefined {
  return wallpaperRegistry.find((wallpaper) => wallpaper.id === id);
}
