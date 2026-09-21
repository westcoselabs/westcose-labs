# Game presentation redesign

The Games library contains SHITBIRD, LOW TIDE LOOT and FightClub in three landscape tiles on desktop and three compact horizontal rows on phones. `/games/arcade` renders the same library. Pocket Home Page Two puts the illustrated LOW TIDE LOOT shortcut beside SHITBIRD.

## Ownership and behavior

`games/catalog.ts` holds engine-free presentation metadata. `GameHost` is a stable sibling of the responsive shells in `OSRoot`; the normal shell content is hidden and inert during a game. Rotation and responsive shell changes update presentation without remounting the canvas. The host restores body scrolling on cleanup. Exit navigates to the library and returns focus to the game tile. Normal View links preserve their mode.

Original engines load only after their route is selected. Artwork loading and error states retain Exit. Start requests browser fullscreen directly from the click and falls back to viewport mode if the browser declines. Gameplay begins after the transition. Focus loss, visibility loss, resizing and fullscreen exit pause originals; returning requires Resume. Saves retain the existing `wcl.games.v1` format.

FightClub loads no remote iframe before Start. The existing embed URL, sandbox, permissions and achievement service are preserved. The full-screen player includes loading, a 20-second retry state, external launch and Exit. The remote game has no pause message contract; its gameplay remains hosted.

SHITBIRD keeps the 360 × 540 simulation, physics, obstacles, milestones and portrait proportions. LOW TIDE LOOT uses a real 1280 × 720 simulation and proportional 16:9 stage. Portrait presents a rotation gate while keeping the run mounted and paused. Its HUD uses independently sized HTML controls. Layout generation and cable travel reserve the bottom of the world for touch controls and labels.

The 60-second salvage round continues after quota. A successful day leads to results, then the optional Surf Shop, then the next level. Four rotating offers preserve the existing prices and effects. Purchases reduce cash, not lifetime score; duplicate purchases and insufficient funds are rejected; bombs carry up to five; other buffs last exactly the next day.

## New artwork

Original artwork was generated with the built-in image generation tool, then encoded as WebP with Sharp (quality 88), preserving its 1672 × 941 output dimensions. The renderer fits the beach to its 1280 × 720 world. No Gold Miner artwork was copied.

- `public/games/low-tide-loot/beach-wide.webp`: widescreen beach plate.
- `public/games/low-tide-loot/surf-shop.webp`: surf shack with original skeleton shopkeeper.

Beach prompt direction: “Create an original 16:9 game background matching the existing WestCose coastal screenprint/woodcut illustrations: imperfect cream-black outlines, carved turquoise surf, warm yellow sun, stippled texture. Top 28 percent: dark teal sky, ocean, old pier and small salvage shack. Bottom 72 percent: calm empty tan sand cross-section with subtle layers and edge pebbles. No characters, crane, cable, loot, typography, logos or UI. Keep the sand readable for gameplay objects.”

Shop prompt direction: “Original widescreen 16:9 surf-shack interior in the same coastal woodcut/screenprint style. Friendly relaxed skeleton shopkeeper in yellow sunhat, teal shirt and sunglasses occupies the left 22 percent behind a weathered counter. Surfboards, shells, ropes, yellow lamps and turquoise wooden walls frame the scene. Right 75 percent stays visually quiet for merchandise cards. Cream, black, turquoise, yellow and restrained pink; textured carved lines. No text, lettering, prices, UI or copied game characters.”

The interface uses existing Manrope, monospace numbers, illustrated title lettering, Phosphor icons, the SHITBIRD orange and LOW TIDE LOOT turquoise/yellow palettes. Artwork colors live in shared game tokens independently of the surrounding OS theme.

## Verification

Lint, typecheck, 190 unit/component tests and the production build pass. Simulation checks cover 480 generated layouts and feasible first-five-day runs across 16 seeds, including valid collision bounds, value availability and reserved control space. Shop tests cover insufficient funds, duplicate prevention, bomb capacity, score preservation and one-day buff expiry.

The production browser pass completed **40 scenarios** across desktop Chromium and Pixel 7 / mobile Chromium. It covers library fit at 375 × 667, Pocket shortcut placement, fullscreen success and rejection, title screens, 568 × 320 touch controls, light-theme contrast, Normal View, focus restoration, Back/Forward, refresh, repeated launches, rotation without remounting, failed asset recovery, WebGL recovery, sound, reduced motion, shared saves and both complete timed shop/save/retry flows.

Two additional FightClub WCAG A/AA accessibility checks passed. Four affected visual baselines were refreshed and reviewed: desktop FightClub title/player, Pocket FightClub title, and Pocket Home Page Two. Actual screenshot review also covered both original games, the compact library, the portrait rotation gate and desktop/mobile Surf Shop. The final 44px touch-target adjustment passed the design-token checks, a fresh production build and the FightClub browser checks.

Commands:

```sh
npm run check
npm run test:e2e:run -- tests/e2e/game-library.spec.ts tests/e2e/shitbird.spec.ts tests/e2e/fightclub.spec.ts tests/e2e/low-tide-loot.spec.ts --project=chromium --project=mobile-chromium --workers=1
npm run test:e2e:run -- tests/e2e/visual.spec.ts tests/e2e/accessibility.spec.ts --grep 'FightClub|Pocket Home Page Two' --project=chromium --workers=1
```

Windows Playwright WebKit does not supply Web Audio. This pass verified mobile emulation; physical iPhone/Safari gameplay remains unverified.

Browser fullscreen follows the [Fullscreen API contract](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen): request it from Start, handle rejection and observe `fullscreenchange`. FightClub boundary tests use a controlled hosted-frame fixture; they do not claim to test the remote provider's combat engine.
