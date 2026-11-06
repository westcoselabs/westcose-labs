import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "@/components/projects/world/catalog.generated.json";
import provenance from "../../docs/WORLD_SHOWCASE_ASSETS.json";
import { media, promotional, videos, weapons } from "@/components/projects/world/content";

describe("portable World exhibit assets", () => {
  it("ships every catalog image and records its provenance without needing the game checkout", () => {
    const images = [...Object.values(catalog.media), ...Object.values(media), ...Object.values(promotional), ...weapons.map(weapon => weapon.image), ...catalog.apparel.flatMap(item => [item.front, item.back, item.artwork]), ...catalog.decks.map(item => item.artwork)];
    for (const image of images) {
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.src.startsWith("/images/projects/westcose-world/")).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", image.src))).toBe(true);
      expect(provenance.sources.some(source => source.output === image.src)).toBe(true);
    }
  });
  it("keeps selectable IDs unique and packages only the two curated model exports", () => {
    expect(new Set(catalog.apparel.map(item => item.id)).size).toBe(catalog.apparel.length);
    expect(new Set(catalog.decks.map(item => item.id)).size).toBe(catalog.decks.length);
    const models = provenance.sources.filter(source => source.output.endsWith(".glb"));
    expect(models.map(model => path.basename(model.output)).sort()).toEqual(["pier-sign.glb", "shop.glb"]);
    for (const model of models) expect(readFileSync(path.join(process.cwd(), "public", model.output)).toString("ascii", 0, 4)).toBe("glTF");
  });
  it("packages both recording formats with their source attribution", () => {
    for (const video of Object.values(videos)) {
      for (const source of [video.src, video.fallback]) {
        expect(existsSync(path.join(process.cwd(), "public", source))).toBe(true);
        expect(provenance.sources.some(asset => asset.output === source)).toBe(true);
      }
    }
  });
});
