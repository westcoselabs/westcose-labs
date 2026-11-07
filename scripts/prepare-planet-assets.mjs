import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Immutable upstream revision whose exports match the reviewed source manifest.
export const sourceRevision = "8e293c4698110b7f664b007c154b6dbdb99c0b63";
const sourceBase = `https://raw.githubusercontent.com/westcoselabs/westcose-designs/${sourceRevision}/public`;

function matches(bytes, asset) {
  return bytes.length === asset.bytes && createHash("sha256").update(bytes).digest("hex") === asset.sha256;
}

async function readIfPresent(filename) {
  try {
    return await readFile(filename);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function download(asset, fetchAsset) {
  const response = await fetchAsset(`${sourceBase}${asset.path}`, {
    redirect: "error",
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok || !response.body) throw new Error(`Cannot download planet asset ${asset.filename}: HTTP ${response.status}`);
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > asset.bytes) throw new Error(`Planet asset exceeds recorded size: ${asset.filename}`);
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  let bytes = Buffer.concat(chunks);
  // Git stores the center JSON with LF; the audited Windows export uses CRLF.
  // Accept the conversion only when it reproduces the exact recorded checksum.
  if (asset.filename.endsWith(".gltf") && !matches(bytes, asset)) {
    bytes = Buffer.from(bytes.toString("utf8").replace(/\r?\n/g, "\r\n"));
  }
  return bytes;
}

/**
 * @param {{ assets: Array<{filename: string, path: string, bytes: number, sha256: string}>, outputRoot: string, sourceRoot?: string, fetchAsset?: typeof fetch }} options
 */
export async function preparePlanetAssets({ assets, outputRoot, sourceRoot, fetchAsset = fetch }) {
  for (const asset of assets) {
    const output = path.join(outputRoot, asset.sha256, asset.filename);
    const cached = await readIfPresent(output);
    if (cached && matches(cached, asset)) continue;
    const original = sourceRoot ? await readIfPresent(path.join(sourceRoot, "public", asset.path.slice(1))) : null;
    const bytes = original ?? await download(asset, fetchAsset);
    if (!matches(bytes, asset)) throw new Error(`Planet asset checksum mismatch: ${asset.filename}`);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, bytes);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const manifest = JSON.parse(await readFile(path.join(root, "src/lib/planet/source-manifest.json"), "utf8"));
  await preparePlanetAssets({
    assets: manifest.files,
    outputRoot: path.join(root, "public/planet-assets"),
    sourceRoot: process.argv.includes("--remote") ? undefined : path.resolve(process.env.WESTCOSE_DESIGNS_ROOT ?? path.join(root, "../westcose-designs")),
  });
  console.log(`Prepared ${manifest.files.length} verified planet assets from ${sourceRevision}.`);
}
