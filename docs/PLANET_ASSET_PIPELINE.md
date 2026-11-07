# Planet asset source

The Labs planet breakdown reads the original WestCose Designs exports. Its source is `westcose-designs/lib/home/orbit-worlds.ts`, with the center from `ORBIT_CENTER_MODEL_SRC` and both quality variants from each entry in `ORBIT_WORLDS`. The newer WestCose World assets, original unoptimized GLBs, and unused duplicates are outside the allowlist.

The source project is read-only. Models are never re-exported or modified. `src/lib/planet/source-manifest.json` contains metadata and SHA-256 digests only. It preserves the original world configuration, model node names and transforms, primitive descriptions, material properties, and texture/image references. Embedded binary data is omitted. All seven allowed exports are self-contained; the inspector fails if a source revision introduces an external dependency requiring review. Builds generate verified distribution copies under the gitignored `public/planet-assets/` directory; model binaries are not committed to Labs.

## Inspect and verify

```powershell
$env:WESTCOSE_DESIGNS_ROOT = 'C:\path\to\westcose-designs'
npm run planet:inspect
npm run planet:check
```

The default source root is the sibling `../westcose-designs` project. The environment variable names the project root, not its `public` directory. The inspector transpiles the original TypeScript config with the already-installed TypeScript package and imports the resulting pure config module from a data URL. It reads the exact `.web-full.glb`, `.web-compact.glb`, and `w.gltf` bytes, then writes only the manifest in Labs. `planet:check` performs the same read-only inspection and fails when generated metadata differs; there are no timestamps in the manifest.

The manifest currently includes the 217 KB center and six quality exports. The largest is the 15.2 MB Designs full model. Labs full and compact currently have identical bytes, but both canonical paths remain recorded to preserve the source configuration and to detect future source changes.

`planet:check` intentionally flags configuration drift if the local Designs checkout is newer than the audited revision. Review that separately before regenerating the manifest. Build preparation preserves the committed viewer configuration and enforces its recorded model digests.

## Runtime delivery

`planetAssetUrl()` accepts an exact manifest filename or canonical source path and returns `/api/planet-assets/<filename>`. Next.js rewrites these seven exact URLs to the generated `/planet-assets/<sha256>/<filename>` files before route handlers run. Models use static delivery, including the 15.2 MB export, without depending on a sibling checkout or proxying large responses through a serverless function. API URLs retain the correct MIME type, checksum ETag, and revalidation headers. Unknown names return 404 through the fallback route.

The fallback route accepts only exact allowlisted filenames; it does not normalize or decode filenames into filesystem paths. Its GET and HEAD share validation. Missing or changed source files return 503 with a generic message and no local path details if the route is invoked without prepared static assets.

Local delivery opens the original file under `<source root>/public`, checks its size and SHA-256, and streams its unchanged bytes. Verified digests are reused only while size, modification time, creation/change time, and inode remain unchanged. No model buffers or handles are retained in this cache. HEAD and matching `If-None-Match` responses have no body; streams release their handles on completion or cancellation. Responses use a SHA-256 ETag and `public, max-age=0, must-revalidate`, so the fixed URLs are not incorrectly cached forever after a reviewed source update.

## Build and deployment

`npm run dev` and `npm run build` run `planet:prepare` before Next.js. Preparation reads the local source checkout when present; clean deployments fetch the original exports from the public `westcoselabs/westcose-designs` repository, pinned to the audited configuration revision `8e293c4698110b7f664b007c154b6dbdb99c0b63`. Every output must match both the manifest byte count and SHA-256. Downloads are bounded, timed out, and reject redirects. Missing or changed exports fail the build instead of publishing a viewer with unavailable models. Generated files are verified again before reuse.

The GLB copies are byte-for-byte identical. The unused center `w.gltf` is stored with LF in Git and was audited with Windows CRLF. Its downloaded JSON line endings are restored only when the result matches the recorded byte count and checksum. No geometry, materials, textures, or embedded data are changed.

To reproduce a clean deployment, run `node scripts/prepare-planet-assets.mjs --remote` with an empty generated directory, then build and start without a source checkout. No production asset environment variable is required. The server-only `WESTCOSE_DESIGNS_ROOT` still overrides the optional local source root. The fallback route also retains `WESTCOSE_DESIGNS_ASSET_ORIGIN` for an existing HTTP(S) origin serving exact original paths; that origin accepts no credentials, path prefix, query, or fragment and verifies upstream bytes before responding. Normal builds use static delivery rather than this fallback.

## Validation

`tests/unit/planet-assets.test.ts` covers exact allowlists, traversal rejection, synthetic fixture byte identity, safe MIME, missing files, changed bytes, HEAD, ETag validation, the existing-origin path/checksum contract, and cancellation while a file read is pending. Fixtures are generated in temporary directories; no original models are copied for tests. `planet:check` verifies the real source digests and canonical metadata.

`tests/unit/planet-build.test.ts` covers preparation without a checkout, verified cache reuse, corrupt cache replacement, upstream failure, oversized or changed bytes, and the center JSON line endings. Browser tests deliberately start with a nonexistent source root and no asset origin, so successful model rendering depends on the deployed static files. Run `node scripts/check-planet-delivery.mjs <site-origin>` to verify HEAD, GET, byte counts, MIME types, and checksums for all seven URLs against a local production build or the live deployment.

The visitor opens **Designs**, **Labs**, or **Shop** individually in a full-screen native dialog, following the modal/portal pattern used by ProjectQuickView. Planets never appear together. Only the selected GLB is fetched and parsed; the audited center mark remains in the source manifest but is not requested by the viewer. Closing releases the model before another planet opens.

The inspector changes visibility and presentation transforms without re-exporting or cloning model geometry/textures. Technical materials are temporary and original material references return for Final Materials. Runtime counts follow selected primitives. Designs contains 1 mesh primitive / 102,838 triangles; Labs 286 / 72,736; Shop 37 / 276,682. Named families come from audited Labs/Shop mesh names; fused Designs remains one asset. Original lighting, embedded textures, presentation rotations, color multipliers, and imported quantization transforms are preserved. Combined orbital movement and support geometry are not part of this individual presentation.

Each planet slowly rotates by default (0.08 radians/second), pausing during pointer interaction, while hidden, and under Reduced Motion. Visitors can pause it explicitly. Rotate/Move changes one-finger/left-button dragging; two fingers pan/pinch, and right-drag pans. Keyboard arrows follow the selected mode, Shift + arrows always move, +/− zoom, and Home resets. Pan is bounded and reset recenters the planet. Escape or Close returns focus to the originating planet button. Closing, retrying, navigation, and context loss dispose the renderer, controls, pending request, parsed resources, observers, and animation work. Browser coverage verifies one source request per planet, full-screen bounds, slow spin, independent pan/orbit/zoom/reset, technical views, Reduced Motion, retry, focus restoration, and repeat loading.
