# SHITBIRD — WestCose original 001

Launch **Games → SHITBIRD**, or visit `/games/shitbird`. Wait for the artwork, then press **Start game** to request browser fullscreen and begin. If fullscreen is unavailable, the host fills the browser viewport. Space, click, or tap the flight area to flap. P, Escape, or Pause pauses. Resume supplies a flap; retry starts a fresh flight. Scores count completely cleared obstacles, not time survived.

## OS integration and ownership

- `src/registry/routes.ts` assigns the route to the existing `games` app with `/games` as its parent. A Pocket-only `shitbird` launcher entry puts a bird icon immediately beside FightClub on Home Page Two and opens this same route. The game runs in the shared viewport-filling GameHost outside the OS frames; routing, settings, discoveries and saves remain OS-owned.
- `src/components/apps/games/catalog.ts` lists local originals for the Games folder. FightClub remains its existing hosted launcher. Future games can join the catalog without changing SHITBIRD.
- `shitbird/ShitbirdGame.tsx` owns accessible DOM controls, status reports, preferences, storage, and the dynamic engine import. Kaboom loads only when this game mounts, never from the Games index or OS boot.
- `shitbird/engine.ts` owns the Kaboom instance, artwork loading, input, update/draw callbacks, audio, pause, and disposal. `model.ts` is the pure simulation used by the runtime and tests. `art.ts` combines illustrated coast/gull textures with procedural signs, parallax, and animation.
- React receives updates at phase changes and obstacle clears. Positions, velocity, scenery, and animation never enter React state.
- The Desktop clock decoration now sits below windows so it cannot obscure Pause or window controls.

## Flight and difficulty

The same 360 × 540 logical corridor runs everywhere. The bird stays at x=82, with a forgiving radius-10 circular hitbox inside its larger, irregular drawing. Ceiling is y=34, boardwalk y=500. Gravity is 920 units/s², flap velocity −300 units/s, downward terminal velocity 430 units/s. A fixed 1/120-second simulation prevents frame-rate-dependent physics and collision tunneling at the capped speed.

For score `s`, `t = clamp(s / 40, 0, 1)` and `r = t²(3 − 2t)`:

| Value | First flight | Score 20 | Score 40 and beyond |
|---|---:|---:|---:|
| World speed, units/s | 116 | 156 | 196 |
| Gap height, units | 190 | 165 | 140 |
| Maximum next-center step, units | 28 | 46 | 64 |
| Obstacle spacing, units | 250 | 250 | 250 |
| Obstacle width, units | 46 | 46 | 46 |

Speed eases toward its target over about half a second; visible gaps are immutable after generation. The first obstacle always opens at y=260, starting at x=400. Later centers take bounded random steps and remain between y=172 and y=362. Sign variants change artwork only; there are no hidden hazards or moving gaps.

At maximum difficulty there are 184 units of clear travel between expanded collision regions (250 − 46 − 2×10), about 0.94 seconds at 196 units/s. The minimum gap leaves 120 units for the bird center. A flap has about 49 units of upward travel and can be repeated, so the bounded 64-unit center changes remain reachable. Generation and scoring continue after 40; all difficulty values stay fixed. The obstacle queue discards offscreen entries, so memory does not grow with score.

The deterministic tests fly 19 courses (16 seeds, always-up, always-down, alternating extreme steps) for 250 clears each from scores 0, 20, and 40: **14,250 clears**. Their controller makes discrete decisions every 8 physics steps and spaces taps by at least 100 ms. This demonstrates sustained feasible paths, not that every mistake is recoverable or that human play is guaranteed indefinitely.

## Responsive presentation and interruptions

The arena is designed for portrait touch use. A ResizeObserver fits that corridor into the available app body without changing gameplay or obstacle preview distance. Desktop fills the side space with subdued coastal scenery. Both desktop and Pocket retain full-size DOM navigation and safe-area padding. Short landscape layouts pause and request more vertical room. Resize pauses an active run rather than moving the bird or continuing behind an orientation message.

Canvas input uses pointer events, with touch-to-mouse translation disabled to avoid double flaps. Keyboard input is canvas-scoped and ignores held-Space repeats. Tab remains available for navigation; moving focus away pauses. Visibility loss, window blur, an inactive Desktop game window, and frame stalls longer than 200 ms also pause. Returning never auto-resumes. The game remains mounted through shell changes and rotation. Browser fullscreen exit pauses play. Exit unmounts the engine, restores scrolling and returns focus to its Games tile; reopening starts at the title screen with saved progress.

Cleanup cancels update/draw controllers, disconnects observers, removes native listeners, stops synthesized voices, and calls `kaboom.quit()`. Kaboom releases its own GL resources and listeners on the next frame end; its AudioContext closes in that cleanup callback. Canceled dynamic imports cannot create a late instance after unmount.

## Art, sound, and appearance

The visual revision follows the user's West Cose Design Co. reference: near-black paper, aged cream, burnt orange, deep teal, carved surf, distressed motel signage, and vintage arched serif lettering. Original AI-generated illustrations were made with the built-in image tool, using the supplied artwork as a style reference. They are committed as local optimized WebP assets, with no third-party game assets or remote image dependencies. [Art direction, files, and generation prompts](SHITBIRD_ART.md) document their provenance.

`public/games/shitbird/coast.webp` (720 × 1080, 136 KB) supplies the detailed motel, palms, ocean and carved wave. `gull.webp` (1024 × 683, 150 KB, alpha) supplies two hand-registered wing poses of the scruffy seagull. Kaboom uses linear texture filtering and renders these with drifting cloud scratches, utility wires, water marks and moving boardwalk lines. The scenic plate drifts within overscan without seams. Solid, cream-edged roadside signs remain procedurally drawn inside their exact collision rectangles; the generous torso hitbox and all flight/difficulty values are unchanged. `cover.webp` (1200 × 800, 267 KB) supplies the Games-folder poster at its native aspect ratio. It is not loaded by the game engine.

The engine waits for both gameplay textures before enabling Start or canvas input. Failed downloads and a 15-second loading timeout show an accessible retry/exit state. Reload creates a fresh canvas/engine. Loading callbacks are guarded after destruction, and the timeout is cleared on load and cleanup. The DOM title uses a lightweight native SVG text arc; pause/death reports remain accessible HTML.

Canvas colors belong to the fixed Dead Coast artwork. DOM game colors use scoped tokens in `src/styles/games.css`; the surrounding OS chrome continues to follow Dusk, WestCose 95, Liquid Glass, and other themes. Scores sit in the solid top strip above the collision corridor, so no gap is obscured. Scenery dims during flight to keep the gull and bright obstacle edges distinct. Reduced motion freezes decorative parallax and title bobbing; the essential flight mechanic remains active. Native keyboard focus, buttons, error states, and pause/retry controls stay outside the canvas.

Three brief, original oscillator effects use Kaboom's AudioContext for flap, score, and impact. They follow the OS `soundEnabled` preference, default silent, and only resume audio after a gesture. There is no background music, audio fetch, or second audio engine.

## Persistence and milestones

`games/storage.ts` uses the existing safe storage helpers and a versioned `wcl.games.v1` envelope:

```json
{ "version": 1, "data": { "shitbird": { "best": 25, "hasFlown": true } } }
```

Best scores save on improvement and merge with the stored record; blocked/malformed storage does not prevent play. First-flight state saves on start. Runs are not serialized. Reset All Local State also removes Games progress; resetting discoveries alone retains the best score.

Milestones use the existing achievement registry and DiscoveryService:

| Trigger | Achievement |
|---|---|
| Start | Unlicensed pilot |
| First collision | Direct collision with feedback |
| Die before 3 seconds with zero points | Failed the onboarding (hidden) |
| 10 | Local nuisance |
| 25 | Coastal management |
| 40 | Peak bullshit |

Reaching 40 also records `games.shitbird-cap`, visible in Settings → Discoveries → Games. The shared discovery envelope now has generic `achievementIds`; old `fightClubAchievementIds` are migrated into it and preserved as a compatible FightClub-only view. Repeated events are deduplicated by the service. New milestone titles appear on the next flight report (up to two), never as mid-flight popups.

## Verification and limits

- `npm run check`: lint, TypeScript, 174 unit/component tests, production build.
- `tests/unit/shitbird.test.ts`: capped curve, extreme courses, actual collision/scoring, pause, fresh retries, storage recovery, shared milestones, and legacy migration.
- `tests/e2e/shitbird.spec.ts`: Games launch, keyboard/touch, axe on the game UI, pause/resume, visibility, resize/orientation, theme readability, progress, exit/reopen, failed artwork downloads/reload, and runtime failure navigation.
- Final browser regression command after the art revision: `npx playwright test tests/e2e/shitbird.spec.ts tests/e2e/fightclub.spec.ts` — **32 passed, 8 explicitly skipped** across Chromium, Firefox, WebKit, Pixel 7 emulation, and iPhone 14 emulation. Skips are the four SHITBIRD gameplay/artwork/context-recovery checks on each Windows WebKit project; their failure-state navigation and all FightClub checks passed. Canvas focus stacking and graphics-context recovery are included.
- After the final score-strip/cover refinements, the launch flow was rerun across all five projects: **3 passed, 2 runtime skips**. The cover is scrolled into view and verified decoded before the audio capability check, so its display was checked in all five browsers. The final production build/typecheck and lint also pass.
- `node scripts/verify-shitbird.mjs` (site running on port 3101, or set `SHITBIRD_URL`): optional real-time Chromium endurance run. Reads the rendered bird pixels and sends normal Space events along a fixed-center course, saving screenshots at scores 4, 20, and 50, then verifies persistence and the capped milestone after reload. It exposes no test controls in the production game. A browser flight cleared **54 obstacles** during implementation, with the long-frame safeguard safely pausing under concurrent build load.
- The saved endurance script completed successfully at **50** with the revised illustrated scenery and gull, including reload verification of the best score, `shitbird.max`, and `games.shitbird-cap`. It tracks the orange beak, so two-frame wing animation does not affect steering. Final Desktop/Pocket title, gameplay and Games-folder screenshots were also visually inspected. Small Desktop title layouts use a compact gliding pose to preserve control clearance.
- Kaboom is pinned at `3000.1.17`. Its upstream package is no longer maintained; this pass follows the requested Kaboom dependency. Engine-specific code is isolated for future maintenance.
- Kaboom requires WebGL and constructs Web Audio even with sound disabled. Unsupported runtimes receive a useful error and accessible return to Games. The bundled **Windows Playwright WebKit lacks Web Audio**; its gameplay tests are explicitly skipped while failure handling is tested. This is not physical iPhone/Safari validation; a real-device Safari playtest remains advisable.
- No account, database, cloud sync, leaderboards, run recovery, or other game is included.

Kaboom references: [API](https://kaboomjs.com/), [upstream source](https://github.com/replit/kaboom).
