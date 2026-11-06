# WestCose World flagship case study

The Projects registry designates one optional `flagship`. The default All/gallery view renders it once as the opening feature; search, filters, and list mode use the normal result collection, sorted with the flagship first. Client spotlight remains in Client sites. World opens its case study directly; other projects retain their quick looks.

## Source and editorial evidence

The source is the private `westcose-world` checkout. The exact snapshot and per-asset source paths, SHA-256 hashes, and packaged sizes are in `WORLD_SHOWCASE_ASSETS.json`. Captions, alt text, chapter definitions, and model credits live in `src/components/projects/world/content.ts`. Clothing and deck definitions are curated from the actual TypeScript catalogs by the preparation script, including their actual front/back renderings.

Graphify's existing graph was reviewed, followed by a focused structural extraction of the current Builder, Outbreak, wardrobe, shop, intro, skater, and runtime sources. Current implementation takes precedence over older proposals. The graph was used to locate relationships; claims were checked in source and supporting development records.

| Subject | Evidence in the source checkout |
| --- | --- |
| Framework and scene responsibilities | `package.json`, `src/features/world/WorldRuntime.tsx`, world scene components |
| Spherical movement, terrain, collision | `src/features/world/data/planet.ts`, `data/world-map.ts`, `data/town-surfaces.ts`, `runtime/planet-collision.ts` |
| Shared combat and map boundaries | `src/features/world/outbreak/gameplay/session.ts`, `contracts.ts`, `maps/` |
| Black Tide | Outbreak flood definitions and `docs/qa/grotto-black-tide/` |
| Reclamation lore | `docs/backroads/BIBLE.md`, current facility interactions, `docs/qa/backroads/P54/` |
| Gary's current rules | `outbreak/gameplay/gary.ts`, `outbreak/maps/reclamation-gary.ts`; first round, six-second arrival, separate from wave quota, two-round absence after defeat |
| Weapon action timing | `outbreak/gameplay/weapon.ts`, `weapons/`, viewmodel action manifests and presentation components |
| Opening, title, pause | `docs/design/world-intro.md`, intro components, pause drawer and WorldRuntime handoffs |
| Shirts and decks | `wardrobe/shirt-designs.ts`, `shirt-skins.ts`, `shirt-material.ts`, `skate/deck-skins.ts`, approved deck manifest |
| Lab workspaces | `outbreak/dev/combat-lab-controller.ts`, lab components, skater lab |
| Builder | `docs/WORLD_BUILDER_GUIDE.md`, `src/features/world/builder/`, applied decoration manifests |
| Asset attribution | `public/models/PIER_SIGN_ASSET_CREDITS.md`, `SHOP_ASSET_CREDITS.md`, `public/world/outbreak/ASSET_CREDITS.md`, `docs/launch/LICENSE_RESTRICTED.md` |

The case study distinguishes original artwork and programming, generated imagery, adapted licensed meshes, and proprietary prototype reference dependencies. Only the original Pier sign and attributed Shop model are shipped as inspectable GLBs. Third-party character and weapon studies use rendered evidence. The page includes source-artist and license links for those captures; no claim of original authorship is made for their meshes or extracted animation.

## Refreshing media

1. Start the source game's local server at `http://127.0.0.1:3002` (or set `WORLD_BASE_URL`).
2. Run `node scripts/capture-world-showcase.mjs`. This navigates the game and development interfaces, records a silent walkthrough, and captures real UI states. It does not save or apply Builder changes. `--world-only` and `--builder-only` support focused refreshes.
3. Run `node scripts/prepare-world-showcase.mjs D:/Projects/westcose-world`. It packages WebP captures, actual catalog artwork/previews, two GLBs, three recordings in WebM and H.264 MP4, and the locally hosted display font. FFmpeg must be on PATH (or set `FFMPEG_PATH`) to prepare the MP4 fallbacks. Partial captures retain the already packaged media and its existing provenance.
4. Review the images and descriptions together. Update claims if the source changed. All production references are portfolio-local; the sibling checkout is only a capture/preparation input.

Raw captures and local visual QA go to ignored `artifacts/world-showcase/`, separate from Playwright's cleaned output directory. Source review captures have their original development-pass paths; newly captured interfaces are recorded separately. Re-run the preparation step after a capture to refresh public assets and provenance.

## Interaction and performance boundaries

`WorldCaseStudy` is a Server Component. All prose, diagrams, chapter anchors, and technical disclosures are HTML. `WorldExhibits` adds image/video dialogs, gallery selection, and a catalog preview that never reads or writes game storage. The chapter rail observes the actual scroll container and has a compact native disclosure. The OS route-focus handoff respects World chapter hashes.

The Three.js inspector is lazy-imported only after opening a model. One native dialog hosts one viewer. It provides pointer and keyboard navigation, material/wireframe mode, reset, explicit loading/failure states, and a static fallback. Closing aborts pending fetches, disconnects observers, releases controls and GPU resources, and restores focus. No model or video is requested on an initial case-study visit. Media dimensions are reserved.

Scoped semantic colors are defined in `src/styles/world-showcase-tokens.css`. CSS Modules inherit theme radii and focus treatments while retaining Manrope, IBM Plex Mono, and local Barlow Condensed for this project. Container queries respond to the app window, including narrowed desktop windows. Reduced-motion and high-contrast preferences remain supported.

## Verification

`tests/e2e/world-showcase.spec.ts` covers placement/counts, direct navigation, catalog state, dialog focus, on-demand models, loading failure and unsupported WebGL, model controls/cleanup, no-JavaScript reading, chapter anchors, and axe checks across public themes. Existing `projects-refresh.spec.ts` continues to cover browsing, quick looks, and OS resizing. `tests/unit/world-showcase-assets.test.ts` checks that packaged media is complete and no extra raw model is introduced.

`node scripts/review-world-showcase.mjs` runs a visual review against a local portfolio server (`PORTFOLIO_BASE_URL`, default `http://localhost:3200`). Production build, lint, typecheck, unit suite, browser tests, and Lighthouse results should be recorded with a release review. This work changes no backend, database, or hosted deployment. A public Play action remains absent until a playable public URL is verified.

### Implementation review — November 5, 2026

- Production build, TypeScript, and lint pass. The final build contains all 66 existing/generated routes, including the separate planet experiment.
- The case-study suite has 67 applicable passing browser checks across Chromium, Firefox, WebKit, Pixel Chrome, and iPhone WebKit configurations. Three live-WebGL checks are deliberately limited to Chromium; failure and unsupported-WebGL coverage runs in every engine. Results include the main suite, one isolated rerun of a WebKit timeout under concurrent load, and focused reruns after the final media-recovery and zoom fixes.
- Actual WebM playback was checked in Chrome and Firefox. Mobile Chromium was forced to reject WebM and successfully played all three MP4 fallbacks. Windows WebKit checked media controls, timing, closing, and focus restoration; native video decoding still requires verification on macOS/iOS. [Playwright documents the platform-dependent media coverage.](https://playwright.dev/docs/browsers#webkit)
- The three packaged-asset unit checks pass. The complete repository unit run recorded 277 passing tests and two pre-existing failures in `tests/unit/design-tokens.test.ts`: raw color/radius rules in the unchanged `DoNotOpen.module.css` and `AppearanceSettings.module.css`. These failures were not suppressed or changed for the showcase.
- All four public themes returned zero axe violations for the case study. Visual checks cover 375px Pocket, tablet, normal and maximized Desktop, a narrowed Desktop window, high contrast, forced colors, and reduced motion. The lab gallery loads all eight views and Builder loads all four workflow views.
- The 200% reflow check models a 1440×1000 screen with a 720×500 CSS viewport and DPR 2. Chapter links clear the responsive document header with and without JavaScript. Native anchor offsets and enhanced navigation share the same clearance.
- Initial visits request no GLB or recording files. Opening an exhibit loads its media on demand; closing releases the viewer or pauses the recording and returns focus. Shirt-preview recovery bypasses the image optimizer on retry so a failed optimized request can recover from the packaged original.

Review screenshots and the machine-readable report are in ignored `artifacts/world-showcase/review/`. Lighthouse JSON/HTML reports are in `artifacts/world-showcase/`. The source revision and asset provenance describe the captured snapshot; subsequent edits to the sibling game checkout remain separate from this portfolio work.

Lighthouse 13.6.0 against the local production build, using document view and default simulated throttling:

| Page / profile | Performance | Accessibility | Best practices | SEO | LCP | Blocking time | Layout shift |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Case study / mobile | 86 | 100 | 100 | 100 | 4.2 s | 60 ms | 0 |
| Projects / desktop | 99 | 100 | 100 | 100 | 0.9 s | 0 ms | 0 |

The case-study audit confirms zero model/recording requests during initial load and high-priority discovery of the opening image. Mobile LCP remains the main performance opportunity; these local measurements are not field performance data.

### Visual refinement — November 6, 2026

The opening now uses cinematic promotional artwork, and the Shop and Gary have dedicated campaign imagery. These three images were made with the **built-in image_gen tool** using actual game images as references. Each generated image is identified as promotional / AI-assisted in its visible caption and alt text. They are not described as gameplay captures, and the project remains labeled active development.

| Final packaged asset | Role |
| --- | --- |
| `public/images/projects/westcose-world/coast-key-art-v2.webp` | Projects feature, case-study opening, and social preview |
| `public/images/projects/westcose-world/shop-art-direction-v2.webp` | Shop art direction, revised against the freshly captured current skull-wave mural |
| `public/images/projects/westcose-world/gary-campaign-v2.webp` | Character campaign based on the verified current Gary v6 silhouette, outfit, badge, and wrench |

The complete prompts, including the targeted shop-mural correction, are saved in `docs/WORLD_PROMOTIONAL_PROMPTS.json`. `WORLD_SHOWCASE_ASSETS.json` records source hashes, attribution, and asset types. The original full-resolution generated PNGs remain under the image tool’s generated-images directory; production consumes only the packaged WebP files.

`scripts/capture-world-refinement.mjs` captured the current working game at 1920×1080 with fixed review cameras and the HUD hidden. The selected interior, exterior, and street views are packaged as `shop-current.webp`, `shop-exterior-current.webp`, and `street-current.webp`. They include the pre-existing local Builder decorations. No game assets or saved layouts were changed. The old graybox Reclamation shot and ambiguous Gary encounter screenshot are removed from the main page; Gary’s actual model comparison is available in an implementation disclosure.

Decks now have an independent, always-visible exhibit: the full 12-design rack, a large selected graphic, brand filtering, previous/next controls, native radio-keyboard selection, and full artwork enlargement. These are the exact catalog graphics, not generated substitutes. Apparel has its own 25-design section, enlarged character previews, front/back controls, and category browsing. Neither exhibit touches the game’s storage.

Fresh captures override older catalog imagery through `refinement.generated.json`; the original catalog preparation script does not overwrite those selections. `scripts/review-world-refinement.mjs` captures the revised Desktop/Pocket composition, shop exhibit, deck rack, and apparel UI. The November 5 Lighthouse figures above describe the earlier visual version and are retained as historical results.

#### Refinement verification

- Production build (including TypeScript), full lint, and all three packaged-asset tests pass.
- All 50 targeted browser checks pass across Chromium, Firefox, WebKit, Pixel Chrome, and iPhone WebKit, counting the initial run and focused reruns after fixes. These cover flagship/filter counts, both collections, keyboard deck selection, artwork enlargement/focus restoration, failed apparel recovery, no-JavaScript reading, 200% reflow, and axe checks in all four themes. A deck image initially intercepted its radio control; raising the control above the image corrected it. Recovery tests now scroll to the separate apparel exhibit and tolerate the mobile shell replacing its document fallback during hydration.
- The visual review reports no page errors or horizontal case-study overflow in its nine Desktop/375px compositions. The opening, shop modal, deck rack, and apparel were visually inspected. Reports and screenshots are in `artifacts/world-showcase/refinement-review/` (ignored).
- Fresh Lighthouse production audits: Projects desktop **98 performance / 100 accessibility / 100 best practices / 100 SEO**, 1.1 s LCP, 0 ms blocking, zero layout shift. Case study mobile **80 / 100 / 100 / 100**, 4.5 s LCP, 240 ms blocking, zero layout shift. These simulated local measurements are not field data; mobile loading remains a performance opportunity. Both HTML and JSON audit reports are in the refinement-review directory.

### Shop, arsenal, and spherical-world refinement — November 6, 2026

The active opening/social artwork is now `coast-key-art-v3.webp`: a complete planet with water following its curved surface, replacing the confusing external ocean plane. Built-in image_gen produced this revision from the actual globe capture and the prior art; the exact prompt is in `WORLD_PLANET_PROMPT.json`. The older v2 remains only as provenance/history.

The Shop has a dedicated three-view gallery (promotional art direction, actual storefront, actual interior), an editorial explanation of the mural and retail identity, and illustrated links directly to apparel and decks. Those links use the same nested-scroll-container behavior as chapter links, with keyboard focus moved to the destination heading. No-JavaScript readers can see the actual shop views beneath the art.

The outdated combat recording and both packaged encodings were removed, including its preparation-script entry. AK-47, MP5, Riptide, and The Blowhole now appear in an always-visible model gallery. These are fresh Blender studio renders of the currently referenced handless models, with unchanged geometry/materials and separate portfolio lighting. `scripts/render-world-weapons.py` renders read-only GLB imports; `scripts/package-world-collection.mjs` packages the WebPs and records source hashes. Raw weapon files are not distributed. AK wall-model and first-person-model credits are distinguished; Riptide and Blowhole are credited as original WestCose assets. Current wonder-weapon names and upgrade descriptions were checked against `p46-assets.ts` and `p46-tuning.ts`. Graphify queries did not match these specific assets, so current source and `ASSET_CREDITS.md` were used directly.

Verification: production build/TypeScript, full lint plus focused lint after navigation edits, and the three asset tests pass. Twenty applicable browser checks pass across all five configurations, including the corrected no-JavaScript chapter-count assertion (eight chapter headings, independently of nested shop/weapon sections). Coverage includes shop view switching, the direct deck link, four model enlargements, no retired video action, axe for the new exhibits, remaining video playback/cleanup, no-JavaScript shop images, and 200% anchor clearance. The refreshed nine-composition visual report has no page errors or horizontal overflow. The preview was opened in Chrome for user review. Game files were not changed.
