# LOW TIDE LOOT — WestCose Arcade No. 002

**Make rent before the tide comes back.**

Open **Games → LOW TIDE LOOT**, the matching Pocket shortcut, or `/games/arcade/low-tide-loot`. Selecting the route loads the original artwork and engine into the shared full-screen host. **Start game** requests browser fullscreen and starts the first 60-second day; declined or unavailable fullscreen uses the browser viewport. See [the presentation redesign](GAME_PRESENTATION.md).

## Integration and ownership

- `/games` and `/games/arcade` show the same compact three-game library. Existing game URLs and save formats are unchanged.
- Game routes belong to the existing `games` library. LOW TIDE LOOT also has a Pocket-only shortcut beside SHITBIRD on Home Page Two. Exit returns to Games and restores focus to the corresponding tile.
- `GameHost` is outside the responsive desktop, Pocket and semantic shell branches. It fills the viewport, hides/inerts site chrome, manages browser fullscreen and body scrolling, and stays mounted through shell changes.
- `LowTideLootLauncher.tsx` creates a dynamic client boundary on route selection. `LowTideLootMount.tsx` imports `engine.ts` after mounting and guards late import resolution. KAPLAY and gameplay textures stay out of OS boot and library browsing; the title's Start button alone begins play.
- `engine.ts` owns one KAPLAY instance, fixed-step updates, texture loading, input, audio and cleanup. `model.ts` is the deterministic simulation; `data.ts` contains loot, environments, upgrades and weighted rewards; `art.ts` contains replaceable art references and rendering. React receives event/phase changes and whole-second timer updates, not every animation frame.
- Added dependency: **`kaplay@3001.0.19`**, pinned. Existing Kaboom remains owned by SHITBIRD. KAPLAY runs with `global: false`; no engine globals or development mutation API are exported.

## Controls and interruptions

| Action | Desktop | Touch |
|---|---|---|
| Fire | Space, Down Arrow, click playfield, Drop Claw | Tap playfield or Drop Claw |
| Release hauled object | Up Arrow, B or Beach Bomb | Beach Bomb |
| Pause | Escape, P, or Pause | Pause |
| Resume / retry | Visible menu buttons | Same buttons |
| Exit | Games button | Games button |

Bombs only activate while an object is attached. Menus and buttons are semantic HTML with visible focus; primary touch controls are at least 44px. Sound defaults off and follows the OS preference; a local toggle is available when no settings provider exists. Sounds are brief original synthesized effects, with no fetched music.

The complete 1280 × 720 logical playfield fits both orientations proportionally with letterboxing. Portrait permits immediate play and places the HUD and touch controls outside the canvas. Loot and cable bounds reserve space for independently sized touch controls; no object or value label is placed beneath them. A ResizeObserver refits and pauses the game. Visibility loss, window blur, leaving game controls, browser fullscreen exit and long frame stalls pause gameplay; returning does not automatically resume. Pause freezes timer, claw, crabs and gameplay effects. Reduced motion removes decorative movement, object wiggle and particles while retaining the essential aiming mechanic.

Exit removes listeners and observers, cancels update/draw controllers and load timeouts, stops synthesized voices, quits KAPLAY and closes its AudioContext through cleanup. Failed texture loading, load timeout and lost graphics context have retry/exit states. Imports resolving after unmount cannot create a new engine.

## Mechanics and economy

The claw swings between ±1.13 radians at 0.86 radians/second. A shot locks that angle, travels at 550 logical pixels/second, captures the first swept circle intersection and retracts along the same bearing. Its jaws rotate with the cable and retain the actual contact offset while carrying an object. The sweep resumes from that angle only after returning. Empty hooks return at 670 pixels/second. Loaded retrieval speed is `400 / (1 + effectiveWeight × 1.05)`, optionally multiplied by 1.45 for Energy. Reaching a screen boundary retracts an empty hook; it never strands the player.

Debris comes in visibly different sizes. Anchors, concrete and tires use 0.65×, 1× and 1.45× silhouettes; radius scales linearly and weight scales with size squared. For a 400-pixel loaded haul, a ring takes about 1.4 seconds, a gold chain 6 seconds, small concrete 5.9 seconds, medium concrete 12.6 seconds and large concrete 25.3 seconds. A large piece of concrete still pays just $3. These are LOW TIDE LOOT tuning values, not claimed measurements of Gold Miner's source code.

The 22 definitions cover premium jewelry, cash, phone, camera, normal valuables, seven kinds of garbage, two crab variants, mystery coolers and a rare suspicious hard drive. Prices are visible under objects; cooler contents stay unknown until recovery. Jewelry crabs start on day four. Small horizontal crab lanes stay within their allotted positions.

Every round runs the full 60 seconds. Reaching the target shows “QUOTA MET · KEEP DIGGING” and leaves the claw, controls and clock running. At zero, the bank balance determines success or failure; an unfinished haul earns nothing. A passed day shows its earnings, best find and banked cash, then opens the shop through the visible button. Failure saves the run's cumulative salvage score, completed days, best find and date.

Targets are cumulative bank-balance goals, as in the classic game: unspent money counts toward the next target, and shopping reduces that head start. Today's earnings remain a separate result statistic. Lifetime salvage score never decreases when shopping. Buffs bought between rounds apply to the following round.

| Day | Place | Quota | Layout emphasis |
|---|---|---:|---|
| 1 | Public Beach | $1,000 | 3 valuables + 1 cooler among 18 objects; one free bomb |
| 2 | The Pier | $2,150 | 4 valuables + 1 cooler; mostly heavy debris |
| 3 | Boardwalk | $3,450 | Moving crabs |
| 4 | Motel Beach | $4,900 | Moving jewelry, denser formations |
| 5 | Dead Coast | $6,600 | 5 valuables + 1 cooler; narrow shots and large junk |
| 6+ | Storm Drain, Hidden Beach, then coastline repeats | +$1,900 per day | Up to 24 objects, changing palettes/props/weather |

At least 68% of each seeded board is debris. Day one's two best guaranteed finds total $950, short of the $1,000 target: collect the third valuable or make up the difference with salvage/luck. Every beach has a large concrete obstruction on the gold chain's direct line, forcing a bomb, a slow clearance haul or a careful alternate shot. Fewer fallback valuables and fewer total objects make each choice matter. Valuable finds occupy deeper authored pockets with small seeded variation; other junk uses irregular, size-aware placement. One modest find is shallow, with its type rotating after day one. Collision silhouettes retain clearance and stay inside the claw cone. Targets and spacing were exercised against actual swing, haul time, obstacle clearing and shop decisions. The late-game target increment and object count cap rather than growing forever. Development builds accept `?lootSeed=123` for replay; production ignores it.

## Gold Miner mechanics research

The September 2026 revision was researched before implementation, using the user's [Steam Community reference](https://steamcommunity.com/app/3777060) and its [developer/publisher store description](https://store.steampowered.com/app/3777060/Gold_MinerClassic_Edition/), plus the playable classic's [instructions](https://goldmineronline.com/) and [controls/economy description](https://www.crazygames.com/game/gold-miner).

Confirmed classic behaviors: automatic swinging; Down to fire along the current bearing; first object caught; value and weight are independent; large rocks waste time; Up destroys an attached object; the one-minute round continues beyond the target; the shop comes between rounds; unspent money carries toward later targets; strength/luck/polish/book buffs last one round. The Steam edition also advertises extra modes and tools, which are outside this game's scope. The public descriptions do not supply exact speed constants or hitboxes, so these are tuned locally rather than presented as an exact reproduction.

After the full 60 seconds, successful rounds show **Level results → Continue to Surf Shop → Next level**. Shopping is optional. The shop occupies the stage with an illustrated keeper, merchandise symbols, prices, effects, available cash and next target.

Salty's offers four of the five upgrades in a shuffled selection. Each offer can be bought once per visit; nothing is guaranteed every day. Bombs cost $75, Energy $150, Lucky Shell $125, Jewelry Polish $200 and the Scrap Guide $100. Bomb inventory caps at five. Other shop upgrades activate on the next day and expire before the following shop. Jewelry pays 35% extra; scrap pays 12× with a $40 minimum. Cooler gifts activate for the current day; a bomb gift at full capacity pays $75 instead.

Coolers use explicit normal/lucky weight columns. Lucky Shell improves the chance of large cash and jewelry rewards while reducing damp-dollar and mayonnaise outcomes, rather than adding a flat bonus. Rare `Final_FINAL_v8.psd` pays $404.

## Storage

Uses the existing safe `wcl.games.v1` envelope. The optional `lowTideLoot.scores` field holds up to ten validated records:

```json
{ "score": 825, "days": 1, "bestItem": "Expensive watch", "bestValue": 450, "timestamp": "2026-09-19T12:00:00.000Z" }
```

SHITBIRD saves preserve salvage records, and salvage saves preserve SHITBIRD progress. Malformed records are filtered; unavailable storage does not stop gameplay. Reset All Local State clears both through the existing Games reset. No mid-round state is saved. Scores are recorded on a completed failed run, not an abandoned session.

## Art provenance and replacement

The supplied `Floatin-01.webp` is a style reference. Three original illustrations were generated with the built-in imagegen tool, then optimized to local WebP:

- `public/games/low-tide-loot/cover.webp` — 1200 × 800; launcher/catalog illustration.
- `public/games/low-tide-loot/scavenger.webp` — 900 × 600 with alpha; skeleton winch operator.
- `public/games/low-tide-loot/beach.webp` — legacy portrait plate, retained for compatibility.
- `public/games/low-tide-loot/beach-wide.webp` — 1672 × 941; original widescreen beach used by the 1280 × 720 renderer.
- `public/games/low-tide-loot/surf-shop.webp` — 1672 × 941; original illustrated shack and shopkeeper. New generation prompts are recorded in [GAME_PRESENTATION.md](GAME_PRESENTATION.md).

Palette: black/cream, turquoise, warm yellow and restrained magenta. Thick imperfect outlines and stippled screen-print textures follow the reference. These are original generated assets, not copied Gold Miner material. The 22 loot icons are original code-native SVG development art, centralized in `art.ts`; final custom illustrated loot sprites can replace those without changing mechanics. Environment variants share the beach plate with palette, prop and weather changes. Seven independently illustrated background plates are intentionally deferred.

Generation prompts used the supplied artwork as a **style reference only**:

1. **Cover:** “One original wide 3:2 landscape illustrated game cover. Match thick irregular cream/black outlines, detailed stippled screenprint crosshatching, black paper, washed turquoise, yellow and restrained magenta. A lanky laid-back skeleton in teal board shorts, worn pink high-tops, sunglasses and broad yellow sunhat lounges beside a homemade salvage winch in a shabby seaside shack. Rusty claw reaches toward gold chain, ring, cooler, tire and crab. Tiny surf lines, sand, distant pier and yellow sun. Hand-painted plank: WESTCOSE SALVAGE. No game title or UI; original apparel-print composition.”
2. **Character:** “One original 2D sprite on a genuinely transparent background. Scruffy relaxed skeleton in teal board shorts, yellow sunhat, turquoise sunglasses and magenta high-tops, slouched on a battered beach chair; one hand operates a rusty winch on his left, the other holds a generic energy drink. Full figure, no cutoff. No crane arm, cable, scenery, ground, text or frame. Thick cream sticker outlines, engraved black detail and fine stippled halftones. Compact readable silhouette, landscape 3:2.”
3. **Beach:** “One portrait 5:6 game background. Top 28%: black-teal sky, yellow sun upper-left, etched turquoise sea, distant wooden pier left, small empty driftwood shack upper-right. Below a horizontal ground line: empty warm tan sand cross-section, subtle layers, etched stipples, thin scratches and tiny edge pebbles. No character, crane, cable, treasure, buried loot, UI or text. Streetwear screenprint/woodcut with imperfect cream-black outlines. Underground remains calm and readable for overlaid game objects.”

Optional achievements and background music are deferred. No multiplayer, accounts, online leaderboard, inventory system, crafting, or mid-run recovery.

## Verification

- Difficulty revision: `npm run check` passed lint, TypeScript, all **188 unit/component tests across 33 files**, and the production build. Coverage checks full-timer quota success, surplus collection, banked targets, locked aiming, unpaid unfinished hauls, size-dependent collision/weight, scarce valuables and the large gold-chain obstruction.
- `tests/unit/low-tide-loot.test.ts`: first-contact swept collision, hit/miss/retrieval, weights, bomb release, pause, deadline failure, quotas, economy, all upgrades and expiry, cooler distributions, generation bounds, feature progression, storage corruption and route parents.
- The generation audit checks 480 day/seed combinations for reachability, clearance, debris ratio, size variation and sufficient new value. The actual simulation clears days 1–5 across 16 seeds with discrete 67ms aiming decisions, clearing obstructions, bombs and available shop upgrades. This demonstrates feasible routes, not guaranteed human success.
- `tests/e2e/low-tide-loot.spec.ts`: production network checks that KAPLAY and gameplay textures stay absent before Play; Desktop/Pocket launch and three exit/relaunch cycles; keyboard/pointer/touch, pause, sound, reduced motion, axe accessibility, Normal View, Back/Forward, refresh, rotation, asset recovery, unsupported runtime navigation, and UI-driven quota/shop/failure/score persistence.
- Mechanics revision: **18 browser cases verified** across Chromium, Firefox and Pixel 7 / mobile Chromium: 15 launch, input, accessibility, interruption, navigation and recovery checks, plus the complete timed flow in each browser. The full-loop test collects surplus beyond quota, pauses during that period, waits for the deadline, shops, checks cash carryover, fails the next day, saves the score and retries. SHITBIRD and FightClub regressions passed during the original V1 integration.
- Difficulty revision: the updated full timed flow passed in Chromium with the harder board and $1,000 opening target. The production preview's new layout was also visually checked; the earlier cross-browser matrix was not repeated for this balance-only change.
- Browser screenshots cover launcher, active gameplay, shop and game over. Browser tests use the production build, not development-only game controls.
- The full timed browser test uses a seeded random source and ordinary keyboard input, including Up Arrow for bombs. It clears the obstruction guarding the gold chain, collects enough for the $1,000 quota, continues firing, waits for zero, shops, carries cash into day two, fails, saves and retries. It uses device scale factor 1 to keep two minutes of software-rendered WebGL practical; separate mobile visual/touch checks retain the Pixel 7 device's full scale factor.
- KAPLAY requires WebGL and Web Audio even when sound is off. Windows Playwright WebKit lacks Web Audio, so its gameplay cases are explicitly skipped while fallback navigation is checked. Physical iPhone/Safari play remains unverified.

Engine reference: [KAPLAY API](https://kaplayjs.com/docs/api/reference/).
