// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { preparePlanetAssets, sourceRevision } from "../../scripts/prepare-planet-assets.mjs";

let root: string;
const bytes = Buffer.from("original planet export");
const asset = {
  filename: "planet.glb",
  path: "/experience/orbit/models/planet.glb",
  bytes: bytes.length,
  sha256: createHash("sha256").update(bytes).digest("hex"),
};
beforeEach(async () => { root = await mkdtemp(path.join(os.tmpdir(), "planet-build-")); });
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

describe("production planet assets", () => {
  it("prepares exact bytes from the pinned public source without a sibling checkout", async () => {
    const fetchAsset = vi.fn().mockResolvedValue(new Response(bytes));
    const options = { assets: [asset], outputRoot: root, sourceRoot: path.join(root, "missing"), fetchAsset };
    await preparePlanetAssets(options);
    expect(fetchAsset).toHaveBeenCalledWith(expect.stringContaining(`/${sourceRevision}/public${asset.path}`), expect.objectContaining({ redirect: "error" }));
    expect(await readFile(path.join(root, asset.sha256, asset.filename))).toEqual(bytes);
    await preparePlanetAssets(options);
    expect(fetchAsset).toHaveBeenCalledTimes(1);
  });

  it("fails the build before writing when upstream bytes change", async () => {
    const fetchAsset = vi.fn().mockResolvedValue(new Response(Buffer.alloc(bytes.length)));
    await expect(preparePlanetAssets({ assets: [asset], outputRoot: root, fetchAsset })).rejects.toThrow("checksum mismatch");
    await expect(readFile(path.join(root, asset.sha256, asset.filename))).rejects.toThrow();
  });

  it("rejects oversized downloads and upstream failures", async () => {
    for (const response of [new Response(Buffer.alloc(bytes.length + 1)), new Response(null, { status: 503 })]) {
      await expect(preparePlanetAssets({ assets: [asset], outputRoot: root, fetchAsset: vi.fn().mockResolvedValue(response) })).rejects.toThrow();
    }
  });

  it("uses a verified local original and replaces a corrupt generated cache", async () => {
    const sourceRoot = path.join(root, "source");
    const source = path.join(sourceRoot, "public", asset.path.slice(1));
    await mkdir(path.dirname(source), { recursive: true });
    await writeFile(source, bytes);
    await mkdir(path.join(root, asset.sha256));
    await writeFile(path.join(root, asset.sha256, asset.filename), "corrupt");
    const fetchAsset = vi.fn();
    await preparePlanetAssets({ assets: [asset], outputRoot: root, sourceRoot, fetchAsset });
    expect(fetchAsset).not.toHaveBeenCalled();
    expect(await readFile(source)).toEqual(bytes);
    expect(await readFile(path.join(root, asset.sha256, asset.filename))).toEqual(bytes);
  });

  it("reproduces the audited center JSON line endings only with an exact checksum", async () => {
    const original = Buffer.from('{\r\n  "asset": {}\r\n}\r\n');
    const center = { ...asset, filename: "w.gltf", bytes: original.length, sha256: createHash("sha256").update(original).digest("hex") };
    await preparePlanetAssets({ assets: [center], outputRoot: root, fetchAsset: vi.fn().mockResolvedValue(new Response(original.toString().replaceAll("\r\n", "\n"))) });
    expect(await readFile(path.join(root, center.sha256, center.filename))).toEqual(original);
  });
});
