# SHITBIRD — coastal arcade cabinet

Kaboom 3000.1.17 renders a fixed 360 × 540 flight corridor. React 19 and CSS Modules render accessible menus independently of the canvas, so the launch screen can use a wide desktop or a portrait phone. Flight physics, scoring, daily seeds and collision bounds are unchanged.

The visual direction extends the existing inked gull and coastal illustrations: salt-worn cream, charcoal green, sunset orange, bold slanted lettering, restrained metal detailing and tactile orange buttons. This is SHITBIRD's identity rather than the gold salvage controls in Low Tide Loot. Motion is limited to a floating title bird, short menu entrances, button travel and score changes; reduced-motion preferences disable it.

## Asset manifest

| Asset | Source / rights | Rendering / constraints |
| --- | --- | --- |
| Title gull | Existing `public/games/shitbird/gull.webp` | Original atlas reused; first pose cropped with CSS; transparent surround preserved |
| Title coast | Existing `coast-refined.webp` | Cover crop; original illustration unchanged |
| Cabinet coast | Existing `coast-panorama.webp` | Dim background outside the flight corridor |
| Three timber supports | Original project code in `textures.ts` | Baked once at 4× into canvas textures; 46 × 466 logical pixels; linear filtering; square silhouette matches collision bounds |
| Upper / lower timber caps | Original project code in `textures.ts` | 46 × 18 logical pixels; end grain and rope courses; no writing; all solid pixels stay inside the existing obstacle rectangle |
| Interface icons | Existing Phosphor dependency | SVG icons with visible labels or accessible button names |

The timber palette varies between warm wood, salt-grey wood and aged brown. Long grain, sparse knots, iron straps and rope wraps replace the sign pylons. Material detail is deterministic and consumes no gameplay randomness. Body textures are cropped, never vertically stretched; caps are drawn at the same size on every support. Existing SHIT target markers remain separate from the obstacles.

The first frame after launch or resume is a presentation transition: its elapsed time is discarded before physics starts. Subsequent frames retain the existing 200 ms stall safeguard, and visibility, focus and resize still pause the flight.

## Validation — 6 November 2026

- Production build / TypeScript and targeted ESLint passed.
- 19 model tests and 18 browser tests passed across desktop Chromium and mobile Chromium emulation, including target hits, unlocks, daily courses, retries, persistence, resize / visibility pauses, asset failures and WebGL recovery.
- Launch screens checked at 1440 × 900, 1024 × 600, 390 × 760, 375 × 620 and 320 × 568. Menu controls retain 44px minimum targets; the small-phone launch and report actions fit without clipping. Automated accessibility checks passed on launch, hangar and report screens.
- A launch probe measured a 317 ms transition frame that previously caused an immediate protective pause. Resetting transition-frame time resolved the normal-speed launch regressions on desktop and mobile; later pauses remain covered by the browser tests.
- A 90-frame sample of the rendered, paused cabinet averaged 36.0 ms on desktop emulation and 37.9 ms on mobile emulation (95th percentile 65 ms for both). These are headless Chromium measurements on this Windows host, not physical-phone performance or a 60 fps claim. Actual iPhone GPU / Safari performance still requires a device check.
