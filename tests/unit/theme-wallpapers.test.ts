import { existsSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { SHELL_BOOTSTRAP } from "@/components/os/shell-bootstrap";
import { listAvailableWallpapers, resolveAppearance } from "@/lib/appearance";
import { themeRegistry } from "@/registry/themes";
import { wallpaperRegistry } from "@/registry/wallpapers";
import { createInitialPreferences, preferencesReducer } from "@/state/preferences";

const unlocks = { unlockedThemeIds: ["corporate-beige"], unlockedWallpaperIds: [], discoveredSecretIds: [] };

describe("theme wallpaper collections", () => {
  it.each(themeRegistry)("gives $name exactly three exclusive, bundled choices", theme => {
    const choices = listAvailableWallpapers(unlocks, theme.id);
    expect(choices).toHaveLength(3);
    expect(choices[0].id).toBe(theme.recommendedWallpaperId);
    for (const choice of choices) {
      expect(choice.recommendedThemeId).toBe(theme.id);
      for (const source of [choice.desktop, choice.pocket]) {
        if (source.kind === "image") expect(existsSync(`public${source.src}`)).toBe(true);
      }
    }
  });

  it.each(themeRegistry)("keeps runtime and pre-paint recovery consistent for $name", theme => {
    for (const wallpaperId of [...wallpaperRegistry.map(wallpaper => wallpaper.id), "graphite-field", "missing"]) {
      const resolved = resolveAppearance(theme.id, wallpaperId, unlocks);
      const dataset: Record<string, string> = {};
      runInNewContext(SHELL_BOOTSTRAP, {
        document: { documentElement: { dataset, style: { setProperty() {} } } },
        location: { search: "", pathname: "/" },
        URLSearchParams, innerWidth: 1440, matchMedia: () => ({ matches: false }),
        localStorage: { getItem: (key: string) => JSON.stringify(key === "wcl.discoveries.v1"
          ? { version: 1, data: unlocks }
          : { version: 2, data: { themeId: theme.id, wallpaperId } }) },
      });
      expect(dataset.theme).toBe(resolved.theme.id);
      expect(dataset.wallpaper).toBe(resolved.wallpaper.id);
      expect(resolved.wallpaper.recommendedThemeId).toBe(theme.id);
    }
  });

  it("changes theme and wallpaper atomically and rejects cross-theme selections", () => {
    let state = createInitialPreferences();
    for (const theme of themeRegistry) {
      state = preferencesReducer(state, { type: "theme/set", themeId: theme.id });
      expect(state.wallpaperId).toBe(theme.recommendedWallpaperId);
      const alternate = listAvailableWallpapers(unlocks, theme.id)[1];
      state = preferencesReducer(state, { type: "wallpaper/set", wallpaperId: alternate.id });
      expect(state.wallpaperId).toBe(alternate.id);
      expect(preferencesReducer(state, { type: "theme/set", themeId: theme.id })).toBe(state);
      for (const wallpaper of wallpaperRegistry.filter(entry => entry.recommendedThemeId !== theme.id)) {
        expect(preferencesReducer(state, { type: "wallpaper/set", wallpaperId: wallpaper.id })).toBe(state);
      }
    }
  });

  it("unlocks the whole hidden collection only through its theme", () => {
    expect(listAvailableWallpapers(undefined, "corporate-beige")).toEqual([]);
    expect(listAvailableWallpapers({ ...unlocks, unlockedThemeIds: [], unlockedWallpaperIds: ["standard-issue"] }, "corporate-beige")).toEqual([]);
    expect(listAvailableWallpapers(unlocks, "corporate-beige")).toHaveLength(3);
  });
});
