import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  APPEARANCE_BOOTSTRAP_DATA,
  appearanceDataset,
  isThemeAvailable,
  isWallpaperAvailable,
  listAvailableThemes,
  listAvailableWallpapers,
  resolveAppearance,
  themeDataset,
  wallpaperCssVariables,
  wallpaperImageValue,
  type AppearanceUnlockState,
} from "@/lib/appearance";
import { defaultTheme, themeRegistry } from "@/registry/themes";
import { defaultWallpaper, wallpaperRegistry } from "@/registry/wallpapers";
import type { ThemeDefinition, WallpaperDefinition } from "@/registry/types";
import { createInitialDiscoveryState, discoveryReducer } from "@/state/discoveries";
import { DEFAULT_PREFERENCES } from "@/state/preferences";

const unlocks = (
  overrides: Partial<AppearanceUnlockState> = {},
): AppearanceUnlockState => ({
  unlockedThemeIds: [],
  unlockedWallpaperIds: [],
  discoveredSecretIds: [],
  ...overrides,
});

const stripWhitespace = (value: string) => value.replace(/\s+/gu, "");

const themes = themeRegistry as readonly ThemeDefinition[];
const wallpapers = wallpaperRegistry as readonly WallpaperDefinition[];

describe("wallpaper registry", () => {
  it("declares exactly one default and keeps ids unique", () => {
    expect(wallpapers.filter((wallpaper) => wallpaper.default)).toHaveLength(1);
    expect(defaultWallpaper.id).toBe("dusk-cliffs");
    expect(new Set(wallpapers.map((wallpaper) => wallpaper.id)).size).toBe(
      wallpapers.length,
    );
  });

  it("gives every wallpaper a separate Desktop and Pocket source", () => {
    for (const wallpaper of wallpapers) {
      expect(wallpaperImageValue(wallpaper.desktop)).not.toBe("");
      expect(wallpaperImageValue(wallpaper.pocket)).not.toBe("");
      expect(wallpaperImageValue(wallpaper.desktop)).not.toBe(
        wallpaperImageValue(wallpaper.pocket),
      );
    }
  });

  it("keeps the Dusk artwork as the default wallpaper for both shells", () => {
    expect(wallpaperImageValue(defaultWallpaper.desktop)).toBe(
      'url("/images/wallpapers/dusk-desktop.webp")',
    );
    expect(wallpaperImageValue(defaultWallpaper.pocket)).toBe(
      'url("/images/wallpapers/dusk-pocket.webp")',
    );
    expect(DEFAULT_PREFERENCES.wallpaperId).toBe(defaultWallpaper.id);
  });

  it("requires an unlocking discovery for every hidden wallpaper", () => {
    for (const wallpaper of wallpapers) {
      if (wallpaper.hidden) expect(wallpaper.discoveryId).toBeTruthy();
    }
    expect(wallpapers.some((wallpaper) => wallpaper.hidden)).toBe(true);
  });

  it("carries preview metadata for every picker entry", () => {
    for (const wallpaper of wallpapers) {
      expect(wallpaper.preview.image.trim()).not.toBe("");
      expect(wallpaper.preview.label.trim()).not.toBe("");
    }
  });
});

describe("theme registry", () => {
  it("keeps Dusk the default, WestCose 95 public, and Corporate Beige hidden", () => {
    expect(defaultTheme.id).toBe("dusk");
    expect(themes.filter((theme) => !theme.hidden).map((theme) => theme.id)).toEqual(
      ["dusk", "westcose-95"],
    );
    expect(themes.map((theme) => theme.id)).toEqual(["dusk", "westcose-95", "corporate-beige"]);
    const beige = themes.find((theme) => theme.id === "corporate-beige");
    expect(beige?.hidden).toBe(true);
    expect(beige?.discoveryId).toBe("settings.bad-ideas-max");
  });

  it("selects a behaviour on every appearance axis", () => {
    for (const theme of themes) {
      expect(Object.keys(theme.treatments).sort()).toEqual([
        "border",
        "depth",
        "icon",
        "surface",
        "taskbar",
        "typography",
        "widget",
        "windowChrome",
      ]);
      expect(theme.palette.colorScheme).toMatch(/^(dark|light)$/u);
      expect(Array.isArray(theme.effects)).toBe(true);
      expect(
        wallpapers.some(
          (wallpaper) => wallpaper.id === theme.recommendedWallpaperId,
        ),
      ).toBe(true);
    }
  });

  it("backs every theme-token palette with a stylesheet block", () => {
    const stylesheet = readFileSync(
      join(process.cwd(), "src/styles/themes.css"),
      "utf8",
    );
    for (const theme of themes) {
      if (theme.palette.source !== "theme-tokens") continue;
      expect(stylesheet).toContain(`[data-theme="${theme.dataTheme}"]`);
    }
  });

  it("publishes each treatment as its own document data attribute", () => {
    const dataset = themeDataset(defaultTheme);
    expect(dataset).toMatchObject({
      theme: "dusk",
      themeSurface: "neumorphic",
      themeChrome: "modern-flat",
      themeTaskbar: "floating-bar",
      themeWidget: "raised-card",
      themeIcons: "duotone-glyph",
      themeEffects: "none",
    });
    expect(appearanceDataset(defaultTheme, defaultWallpaper).wallpaper).toBe(
      "dusk-cliffs",
    );
  });
});

describe("appearance resolution", () => {
  it("recovers from a persisted theme or wallpaper that no longer exists", () => {
    const resolved = resolveAppearance("computer-lab-2008", "vapor-beach");

    expect(resolved.theme.id).toBe("dusk");
    expect(resolved.wallpaper.id).toBe("dusk-cliffs");
    expect(resolved.themeRecovered).toBe(true);
    expect(resolved.wallpaperRecovered).toBe(true);
  });

  it("recovers a hidden selection that is no longer unlocked", () => {
    const locked = resolveAppearance("corporate-beige", "standard-issue");
    expect(locked.theme.id).toBe("dusk");
    expect(locked.wallpaper.id).toBe("dusk-cliffs");
    expect(locked.themeRecovered).toBe(true);

    const unlocked = resolveAppearance(
      "corporate-beige",
      "standard-issue",
      unlocks({
        unlockedThemeIds: ["corporate-beige"],
        unlockedWallpaperIds: ["standard-issue"],
      }),
    );
    expect(unlocked.theme.id).toBe("corporate-beige");
    expect(unlocked.wallpaper.id).toBe("standard-issue");
    expect(unlocked.themeRecovered).toBe(false);
    expect(unlocked.wallpaperRecovered).toBe(false);
  });

  it("accepts a recorded discovery as an unlock, so earlier saves keep working", () => {
    const resolved = resolveAppearance(
      "corporate-beige",
      "standard-issue",
      unlocks({ discoveredSecretIds: ["settings.bad-ideas-max"] }),
    );

    expect(resolved.theme.id).toBe("corporate-beige");
    expect(resolved.wallpaper.id).toBe("standard-issue");
  });

  it("keeps a valid selection untouched", () => {
    const resolved = resolveAppearance("dusk", "graphite-field");

    expect(resolved.wallpaper.id).toBe("graphite-field");
    expect(resolved.wallpaperRecovered).toBe(false);
  });
});

describe("shared unlock state", () => {
  it("hides locked entries from both shells until the discovery is earned", () => {
    expect(listAvailableThemes().map((theme) => theme.id)).toEqual(["dusk", "westcose-95"]);
    expect(listAvailableWallpapers().map((wallpaper) => wallpaper.id)).toEqual([
      "dusk-cliffs",
      "graphite-field",
      "westcose-95",
    ]);

    const earned = unlocks({
      unlockedThemeIds: ["corporate-beige"],
      unlockedWallpaperIds: ["standard-issue"],
    });
    expect(listAvailableThemes(earned).map((theme) => theme.id)).toContain(
      "corporate-beige",
    );
    expect(
      listAvailableWallpapers(earned).map((wallpaper) => wallpaper.id),
    ).toContain("standard-issue");
  });

  it("unlocks through one shared discovery store rather than per shell", () => {
    let state = createInitialDiscoveryState();
    expect(state.unlockedWallpaperIds).toEqual([]);

    state = discoveryReducer(state, {
      type: "theme/unlock",
      themeId: "corporate-beige",
    });
    state = discoveryReducer(state, {
      type: "wallpaper/unlock",
      wallpaperId: "standard-issue",
    });

    const shared = {
      unlockedThemeIds: state.unlockedThemeIds,
      unlockedWallpaperIds: state.unlockedWallpaperIds,
      discoveredSecretIds: state.discoveredSecretIds,
    };
    const beige = themes.find((theme) => theme.id === "corporate-beige");
    const standardIssue = wallpapers.find(
      (wallpaper) => wallpaper.id === "standard-issue",
    );

    // One resolution feeds both presentations, so there is nothing to sync.
    expect(isThemeAvailable(beige as never, shared)).toBe(true);
    expect(isWallpaperAvailable(standardIssue as never, shared)).toBe(true);
    expect(resolveAppearance("corporate-beige", "standard-issue", shared)).toMatchObject(
      { themeRecovered: false, wallpaperRecovered: false },
    );
  });
});

describe("appearance CSS contract", () => {
  it("resolves WestCose 95 without an unlock and keeps its wallpaper independent", () => {
    const classic = resolveAppearance("westcose-95", "dusk-cliffs");
    expect(classic).toMatchObject({
      themeRecovered: false,
      wallpaperRecovered: false,
      theme: { id: "westcose-95", recommendedWallpaperId: "westcose-95" },
      wallpaper: { id: "dusk-cliffs" },
    });
    const mixed = resolveAppearance("dusk", "westcose-95");
    expect(mixed.theme.id).toBe("dusk");
    expect(mixed.wallpaper).toMatchObject({
      recommendedThemeId: "westcose-95",
      desktop: { kind: "generated" },
      pocket: { kind: "generated" },
    });
    expect(themeDataset(classic.theme)).toMatchObject({
      theme: "westcose-95", themeScheme: "light", themeSurface: "beveled",
      themeBorder: "outset", themeDepth: "hard-shadow", themeType: "system-ui",
      themeChrome: "classic-titlebar", themeTaskbar: "anchored-bar",
      themeWidget: "flat-panel", themeIcons: "outline", themeEffects: "none",
    });
    expect(APPEARANCE_BOOTSTRAP_DATA.themes["westcose-95"].dataset).toEqual(themeDataset(classic.theme));
    expect(APPEARANCE_BOOTSTRAP_DATA.wallpapers["westcose-95"].variables).toEqual(wallpaperCssVariables(mixed.wallpaper));
  });

  it("exposes Desktop and Pocket sources from one wallpaper id", () => {
    const variables = wallpaperCssVariables(defaultWallpaper);

    expect(variables["--wallpaper-desktop-image"]).toContain("dusk-desktop");
    expect(variables["--wallpaper-pocket-image"]).toContain("dusk-pocket");
    expect(variables["--wallpaper-desktop-scrim"]).not.toBe("");
    expect(variables["--wallpaper-pocket-home-scrim"]).not.toBe("");
    expect(variables["--wallpaper-pocket-lock-scrim"]).not.toBe("");
  });

  it("matches the stylesheet defaults, so Dusk renders before hydration", () => {
    const stylesheet = stripWhitespace(
      readFileSync(join(process.cwd(), "src/styles/appearance.css"), "utf8"),
    );

    for (const [name, value] of Object.entries(
      wallpaperCssVariables(defaultWallpaper),
    )) {
      expect(stylesheet).toContain(`${name}:${stripWhitespace(value)}`);
    }
  });

  it("keeps hardcoded wallpaper URLs out of the shell stylesheets", () => {
    const shellStyles = [
      "src/components/desktop/DesktopShell.module.css",
      "src/components/pocket/PocketHome.module.css",
      "src/components/pocket/PocketLockScreen.module.css",
      "src/components/pocket/PocketShell.module.css",
    ].map((path) => readFileSync(join(process.cwd(), path), "utf8"));

    for (const stylesheet of shellStyles) {
      expect(stylesheet).not.toMatch(/images\/wallpapers/u);
    }
  });

  it("serialises the same registry tables for the pre-paint bootstrap", () => {
    expect(APPEARANCE_BOOTSTRAP_DATA.defaultThemeId).toBe("dusk");
    expect(APPEARANCE_BOOTSTRAP_DATA.defaultWallpaperId).toBe("dusk-cliffs");
    expect(Object.keys(APPEARANCE_BOOTSTRAP_DATA.wallpapers)).toEqual(
      wallpapers.map((wallpaper) => wallpaper.id),
    );
    expect(
      APPEARANCE_BOOTSTRAP_DATA.wallpapers["dusk-cliffs"].variables,
    ).toEqual(wallpaperCssVariables(defaultWallpaper));
    expect(APPEARANCE_BOOTSTRAP_DATA.themes["corporate-beige"]).toMatchObject({
      hidden: true,
      discoveryId: "settings.bad-ideas-max",
    });
    expect(JSON.stringify(APPEARANCE_BOOTSTRAP_DATA)).not.toContain("</script");
  });
});
