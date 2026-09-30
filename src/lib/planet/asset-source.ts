import manifest from "./source-manifest.json";

/** Metadata only; no source model or texture bytes are bundled into Labs. */
export const planetSourceManifest = manifest;
export type PlanetAsset = (typeof manifest.files)[number];

const files = new Map<string, PlanetAsset>(
  manifest.files.map((file) => [file.filename, file]),
);

export function getPlanetAsset(filename: string): PlanetAsset | undefined {
  // Exact names only. Never decode or normalize a user-controlled filesystem path.
  return files.get(filename);
}

export function planetAssetUrl(pathOrFilename: string): string {
  const asset = getPlanetAsset(pathOrFilename) ??
    manifest.files.find((file) => file.path === pathOrFilename);
  if (!asset) throw new Error("Unknown planet asset.");
  return `/api/planet-assets/${encodeURIComponent(asset.filename)}`;
}
