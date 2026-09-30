// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, open, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, HEAD } from "@/app/api/planet-assets/[file]/route";
import * as assetSource from "@/lib/planet/asset-source";

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, open: vi.fn(actual.open) };
});

const originalAsset = assetSource.getPlanetAsset("w.gltf")!;
// A tiny synthetic fixture, not a copied or re-exported source model.
const fixture = Buffer.from('{"asset":{"version":"2.0"},"nodes":[],"scenes":[]}\n');
const fixtureAsset = {
  ...originalAsset,
  bytes: fixture.length,
  sha256: createHash("sha256").update(fixture).digest("hex"),
};
const context = (file = "w.gltf") => ({ params: Promise.resolve({ file }) });
const request = (method = "GET", headers?: HeadersInit) =>
  new Request("http://localhost/api/planet-assets/w.gltf", { method, headers });

describe("planet asset allowlist", () => {
  it("exposes only the center and canonical full/compact exports", () => {
    const manifest = assetSource.planetSourceManifest;
    expect(manifest.sourceProject).toBe("westcose-designs");
    expect(manifest.sourceConfig).toBe("lib/home/orbit-worlds.ts");
    expect(manifest.files).toHaveLength(7);
    expect(assetSource.planetAssetUrl(manifest.center.path)).toBe("/api/planet-assets/w.gltf");
    for (const world of manifest.worlds) {
      for (const quality of ["full", "compact"] as const) {
        expect(assetSource.planetAssetUrl(world.assets[quality])).toMatch(/\.web-(full|compact)\.glb$/);
      }
      expect(() => assetSource.planetAssetUrl(world.assets.source)).toThrow("Unknown planet asset.");
    }
  });

  it.each(["../w.gltf", "%2e%2e%2fw.gltf", "..\\w.gltf", "/w.gltf", "w.gltf?x=1", "W.GLTF", "westcose_world.glb"])(
    "rejects non-allowlisted input %s",
    async (filename) => {
      expect(assetSource.getPlanetAsset(filename)).toBeUndefined();
      expect(() => assetSource.planetAssetUrl(filename)).toThrow();
      const response = await GET(request(), context(filename));
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Unknown planet asset." });
    },
  );
});

describe("planet source delivery", () => {
  let root: string;
  let filename: string;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "westcose-planet-test-"));
    filename = path.join(root, "public", originalAsset.path.slice(1));
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, fixture);
    vi.stubEnv("WESTCOSE_DESIGNS_ROOT", root);
    vi.stubEnv("WESTCOSE_DESIGNS_ASSET_ORIGIN", "");
    const lookup = assetSource.getPlanetAsset;
    vi.spyOn(assetSource, "getPlanetAsset").mockImplementation((name) =>
      name === fixtureAsset.filename ? fixtureAsset : lookup(name),
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    if (root && path.basename(root).startsWith("westcose-planet-test-")) {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("streams original bytes without transforming them and uses safe MIME/cache headers", async () => {
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("model/gltf+json");
    expect(response.headers.get("Content-Length")).toBe(String(fixture.length));
    expect(response.headers.get("ETag")).toBe(`"${fixtureAsset.sha256}"`);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(Buffer.from(await response.arrayBuffer())).toEqual(fixture);
  });

  it("returns HEAD metadata without a body", async () => {
    const response = await HEAD(request("HEAD"), context());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Length")).toBe(String(fixture.length));
    expect(await response.text()).toBe("");
  });

  it.each(["body cancellation", "request abortion"])(
    "releases a pending read exactly once after %s without touching a closed controller",
    async (kind) => {
      // Warm validation so the delayed read below belongs to response delivery.
      await HEAD(request("HEAD"), context());
      const file = await open(filename, "r");
      const close = vi.spyOn(file, "close");
      const originalRead = file.read.bind(file);
      let releaseRead!: () => void;
      let readStarted!: () => void;
      const gate = new Promise<void>((resolve) => { releaseRead = resolve; });
      const started = new Promise<void>((resolve) => { readStarted = resolve; });
      const read = vi.spyOn(file, "read").mockImplementationOnce(async () => {
        const result = await originalRead(new Uint8Array(64 * 1024), 0, 64 * 1024, 0);
        readStarted();
        await gate;
        return result;
      });
      vi.mocked(open).mockResolvedValueOnce(file);
      const abort = new AbortController();
      const req = new Request("http://localhost/api/planet-assets/w.gltf", { signal: abort.signal });
      const removeListener = vi.spyOn(req.signal, "removeEventListener");
      try {
        const response = await GET(req, context());
        expect(response.status).toBe(200);
        await started;
        if (kind === "body cancellation") {
          const cancelled = response.body!.cancel();
          abort.abort();
          await expect(cancelled).resolves.toBeUndefined();
        } else {
          const reader = response.body!.getReader();
          const rejected = expect(reader.read()).rejects.toMatchObject({ name: "AbortError" });
          abort.abort();
          await rejected;
          reader.releaseLock();
        }
        releaseRead();
        await read.mock.results[0].value;
        await vi.waitFor(() => expect(file.fd).toBe(-1));
        expect(close).toHaveBeenCalledOnce();
        expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
      } finally {
        releaseRead();
        if (file.fd !== -1) await file.close();
      }
    },
  );

  it.each([`"${fixtureAsset.sha256}"`, `W/"${fixtureAsset.sha256}"`, `"old", "${fixtureAsset.sha256}"`, "*"])(
    "honors If-None-Match %s after verifying the source",
    async (etag) => {
      const response = await GET(request("GET", { "If-None-Match": etag }), context());
      expect(response.status).toBe(304);
      expect(await response.text()).toBe("");
    },
  );

  it("serves bytes for a stale ETag", async () => {
    const response = await GET(request("GET", { "If-None-Match": '"old"' }), context());
    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(fixture);
  });

  it("reports missing sources cleanly without leaking their absolute path", async () => {
    await rm(filename);
    const response = await GET(request(), context());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Planet source assets are unavailable." });
    const head = await HEAD(request("HEAD"), context());
    expect(head.status).toBe(503);
    expect(await head.text()).toBe("");
  });

  it("rejects size changes instead of serving an unreviewed source revision", async () => {
    await writeFile(filename, Buffer.concat([fixture, Buffer.from("extra")]));
    const response = await GET(request(), context());
    expect(response.status).toBe(503);
  });

  it("rehashes changed files even when their byte length is unchanged", async () => {
    const first = await GET(request(), context());
    await first.arrayBuffer();
    const changed = Buffer.from(fixture);
    changed[0] = 32;
    await writeFile(filename, changed);
    const later = new Date(Date.now() + 1000);
    await utimes(filename, later, later);
    const response = await GET(request("GET", { "If-None-Match": `"${fixtureAsset.sha256}"` }), context());
    expect(response.status).toBe(503);
  });

  it("uses the exact canonical path at a configured existing origin and validates byte identity", async () => {
    vi.stubEnv("WESTCOSE_DESIGNS_ASSET_ORIGIN", "https://assets.example.test");
    const fetchSource = vi.fn().mockResolvedValue(new Response(fixture));
    vi.stubGlobal("fetch", fetchSource);
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(String(fetchSource.mock.calls[0][0])).toBe(`https://assets.example.test${originalAsset.path}`);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(fixture);
  });

  it("rejects bytes from an origin that differ from the inspected source", async () => {
    vi.stubEnv("WESTCOSE_DESIGNS_ASSET_ORIGIN", "https://assets.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(Buffer.alloc(fixture.length))));
    expect((await GET(request(), context())).status).toBe(503);
  });

  it("does not fetch an origin with a rewritten base path", async () => {
    vi.stubEnv("WESTCOSE_DESIGNS_ASSET_ORIGIN", "https://assets.example.test/copied-models/");
    const fetchSource = vi.fn();
    vi.stubGlobal("fetch", fetchSource);
    expect((await GET(request(), context())).status).toBe(503);
    expect(fetchSource).not.toHaveBeenCalled();
  });
});
