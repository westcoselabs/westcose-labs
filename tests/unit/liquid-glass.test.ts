import { describe, expect, it } from "vitest";
import { readFileSync, statSync } from "node:fs";
import { resolveAppearance, APPEARANCE_BOOTSTRAP_DATA, themeDataset } from "@/lib/appearance";
import { getRegistryIssues } from "@/registry/validate";

describe("Liquid Glass appearance", () => {
  it("validates as a public skin using the existing treatment vocabulary", () => {
    expect(getRegistryIssues()).toEqual([]);
    const { theme } = resolveAppearance("liquid-glass", "dusk-cliffs");
    expect(theme).toMatchObject({ id: "liquid-glass", hidden: false, effects: ["backdrop-blur"], recommendedWallpaperId: "liquid-glass" });
    expect(themeDataset(theme)).toMatchObject({ themeSurface: "translucent", themeChrome: "translucent", themeDepth: "drop-shadow", themeWidget: "translucent-card", themeIcons: "filled" });
    expect(APPEARANCE_BOOTSTRAP_DATA.themes["liquid-glass"].dataset).toEqual(themeDataset(theme));
  });

  it("keeps artwork independent and uses separate small, self-contained SVG compositions", () => {
    const glass = resolveAppearance("liquid-glass", "dusk-cliffs");
    expect(glass.wallpaper.id).toBe("dusk-cliffs");
    const mixed = resolveAppearance("dusk", "liquid-glass");
    expect(mixed.theme.id).toBe("dusk");
    expect(mixed.wallpaper.id).toBe("liquid-glass");
    const sources = [mixed.wallpaper.desktop, mixed.wallpaper.pocket];
    expect(sources[0]).not.toEqual(sources[1]);
    for (const source of sources) {
      expect(source.kind).toBe("image");
      if (source.kind !== "image") continue;
      const path = `public${source.src}`;
      expect(statSync(path).size).toBeLessThan(5000);
      const svg = readFileSync(path, "utf8");
      expect(svg).not.toMatch(/<script|<image|<animate|<filter|href=/);
    }
  });
});
