# Planet asset source

The Labs planet breakdown reads the original WestCose Designs exports. Its source is `westcose-designs/lib/home/orbit-worlds.ts`, with the center from `ORBIT_CENTER_MODEL_SRC` and both quality variants from each entry in `ORBIT_WORLDS`. The newer WestCose World assets, original unoptimized GLBs, and unused duplicates are outside the allowlist.

The source project is read-only. No model or texture is copied into Labs, re-exported, uploaded, or symlinked. `src/lib/planet/source-manifest.json` contains metadata and SHA-256 digests only. It preserves the original world configuration, model node names and transforms, primitive descriptions, material properties, and texture/image references. Embedded binary data is omitted. All seven allowed exports are self-contained; the inspector fails if a source revision introduces an external dependency requiring review.

## Inspect and verify

```powershell
$env:WESTCOSE_DESIGNS_ROOT = 'C:\path\to\westcose-designs'
npm run planet:inspect
npm run planet:check
```

The default source root is the sibling `../westcose-designs` project. The environment variable names the project root, not its `public` directory. The inspector transpiles the original TypeScript config with the already-installed TypeScript package and imports the resulting pure config module from a data URL. It reads the exact `.web-full.glb`, `.web-compact.glb`, and `w.gltf` bytes, then writes only the manifest in Labs. `planet:check` performs the same read-only inspection and fails when generated metadata differs; there are no timestamps in the manifest.

The manifest currently includes the 217 KB center and six quality exports. The largest is the 15.2 MB Designs full model. Labs full and compact currently have identical bytes, but both canonical paths remain recorded to preserve the source configuration and to detect future source changes.

## Runtime delivery

`planetAssetUrl()` accepts an exact manifest filename or canonical source path and returns `/api/planet-assets/<filename>`. The route accepts only exact allowlisted filenames; it does not normalize or decode filenames into filesystem paths. GET and HEAD share the same validation, MIME selection, ETag, and revalidation behavior. Unknown names return 404. Missing or changed source files return 503 with a generic message and no local path details.

Local delivery opens the original file under `<source root>/public`, checks its size and SHA-256, and streams its unchanged bytes. Verified digests are reused only while size, modification time, creation/change time, and inode remain unchanged. No model buffers or handles are retained in this cache. HEAD and matching `If-None-Match` responses have no body; streams release their handles on completion or cancellation. Responses use a SHA-256 ETag and `public, max-age=0, must-revalidate`, so the fixed URLs are not incorrectly cached forever after a reviewed source update.

## Deployment using an existing shared asset host

If the deployment cannot read the source checkout, set `WESTCOSE_DESIGNS_ASSET_ORIGIN` to an **existing** HTTP(S) origin already serving these exact source bytes at their original `/experience/orbit/models/...` paths. It must be an origin without credentials, a path prefix, query, or fragment. The route proxies those original paths, does not follow redirects or forward visitor credentials, and verifies size and SHA-256 before responding. No new upload or asset repackaging is part of this pipeline.

Remote responses are buffered only for the requested file, bounded by the manifest byte size, so their identity can be checked before any bytes reach the viewer. This also applies to HEAD and cache validation requests; it trades an upstream read for strict byte verification. Local serving is preferred when the original source is accessible and uses streams. Upstream requests time out after 20 seconds and unavailable/mismatched responses fail cleanly.

The environment variables are server-only. A deployment without either the original source checkout or an existing host serving the exact files remains unavailable rather than substituting models.

## Validation

`tests/unit/planet-assets.test.ts` covers exact allowlists, traversal rejection, synthetic fixture byte identity, safe MIME, missing files, changed bytes, HEAD, ETag validation, the existing-origin path/checksum contract, and cancellation while a file read is pending. Fixtures are generated in temporary directories; no original models are copied for tests. `planet:check` verifies the real source digests and canonical metadata.

The visitor opens **Designs**, **Labs**, or **Shop** individually in a full-screen native dialog, following the modal/portal pattern used by ProjectQuickView. Planets never appear together. Only the selected GLB is fetched and parsed; the audited center mark remains in the source manifest but is not requested by the viewer. Closing releases the model before another planet opens.

The inspector changes visibility and presentation transforms without re-exporting or cloning model geometry/textures. Technical materials are temporary and original material references return for Final Materials. Runtime counts follow selected primitives. Designs contains 1 mesh primitive / 102,838 triangles; Labs 286 / 72,736; Shop 37 / 276,682. Named families come from audited Labs/Shop mesh names; fused Designs remains one asset. Original lighting, embedded textures, presentation rotations, color multipliers, and imported quantization transforms are preserved. Combined orbital movement and support geometry are not part of this individual presentation.

Each planet slowly rotates by default (0.08 radians/second), pausing during pointer interaction, while hidden, and under Reduced Motion. Visitors can pause it explicitly. Rotate/Move changes one-finger/left-button dragging; two fingers pan/pinch, and right-drag pans. Keyboard arrows follow the selected mode, Shift + arrows always move, +/− zoom, and Home resets. Pan is bounded and reset recenters the planet. Escape or Close returns focus to the originating planet button. Closing, retrying, navigation, and context loss dispose the renderer, controls, pending request, parsed resources, observers, and animation work. Browser coverage verifies one source request per planet, full-screen bounds, slow spin, independent pan/orbit/zoom/reset, technical views, Reduced Motion, retry, focus restoration, and repeat loading.
