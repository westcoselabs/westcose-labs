import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const origin = process.argv[2];
if (!origin) throw new Error("Usage: node scripts/check-planet-delivery.mjs <site-origin>");
const manifest = JSON.parse(await readFile(new URL("../src/lib/planet/source-manifest.json", import.meta.url), "utf8"));

for (const asset of manifest.files) {
  const url = new URL(`/api/planet-assets/${asset.filename}`, origin);
  const head = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(30_000) });
  assert.equal(head.status, 200, `${asset.filename}: HEAD must succeed`);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  assert.equal(response.status, 200, `${asset.filename}: GET must succeed`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, asset.bytes, `${asset.filename}: byte length`);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, `${asset.filename}: checksum`);
  assert.match(response.headers.get("content-type") ?? "", asset.filename.endsWith(".glb") ? /model\/gltf-binary/ : /model\/gltf\+json/);
  console.log(`Verified ${asset.filename} (${bytes.length} bytes)`);
}
const unknown = await fetch(new URL("/api/planet-assets/unknown.glb", origin));
assert.equal(unknown.status, 404, "Unknown assets must remain unavailable");
