# WestCose personality pass

These are opt-in shell interactions. No game code, game saves, real files, remote calls, sound, or portfolio content is changed by them.

## Triggers

- Recycle → Quarantine → **DO NOT PRESS** releases 13 desktop / 8 phone creatures. The button senses a mouse within 48px and dodges exactly three approaches, choosing a bounded destination clear of the cursor. Touch also gets three dodges; the next activation releases the creatures. Mouse and touch share one three-dodge budget, so switching inputs cannot extend it. Each dodge updates the escape meter and a one-line reaction. Keyboard and reduced-motion activation are immediate.
- Release answers **WELL, FUCK.** The immediate containment control keeps keyboard focus when Pest Control arrives; cleanup returns focus to the archive or the current shell.
- **Contain outbreak** is available immediately. After 25 seconds, WestCose Pest Control offers **GET THESE FUCKERS OUT**. Cleanup removes the creatures and pending notices; the archive can be pressed again.
- Restore the final-final file to progress from v7 through v10, then medical leave. Restore the weekend project for its never-ending process monitor, or the meeting file for a roughly 12-second unproductive call.
- Terminal: `sudo rm scope-creep`, `sudo fix-client-feedback`, `open quarantine` (three attempts), `sudo contain`, `whoami`, and `sudo update`. The update takes roughly 13 seconds and can be closed at any point. All prior commands remain.

## Integration and lifecycle

`PersonalityProvider` lives in `OSRoot`, above shell selection, and uses the existing discovery service. Final-file version markers live in `recycleRestorationIds`; the existing save version and reset controls still apply. Discoveries use `egg.quarantine-outbreak`, `egg.final-final`, `egg.weekend-process`, `egg.readme-meeting`, and `egg.fake-update`.

Desktop panels use the existing `desktopReducer`, `DesktopWindow`, taskbar, focus, resize, and minimize behavior through one reusable utility slot. Pocket/normal use a compact, closable `SurfaceFloating` panel. Panel sequence state survives route and shell changes. Terminal's existing component also works on its conventional route.

`useEvasiveControl` supports bounded distances, a container or viewport, independent mouse/touch limits plus an optional shared total cap, keyboard bypass, and reduced motion. It reclamps after resizing and clears its offset when the motion preference changes. It is used only on the quarantine button.

`CreatureField` is dynamically imported only after release. One animation loop paints cached, original creature sprites; DOM surface bounds are sampled every 650 ms, not every frame. The Office Gremlin runs quickly, Underpants Cyclops climbs, Runaway Dentures reverses, Slime Royalty favors the dock/taskbar, and Haunted Toaster follows; the chicken, bin goblin, and phantom have their own walking speeds. Window masks hide creatures behind window surfaces. The canvas never accepts pointer events. Reduced motion renders a still scene with no animation loop; hidden tabs cancel the frame loop. Cleanup/unmount removes frames and listeners. Immersive game routes suspend the shell eggs.

Notices are a randomized, bounded subset of 3–6 with at most three displayed on desktop and one on phones. Their text surfaces pass clicks through; dismiss controls remain operable. Cleanup cancels pending alerts immediately. All sequence timers are owned by effects and canceled when their interaction ends or is replaced.

## Assets

Eight original pixel-art monsters and their two walking frames are drawn in `creature-art.ts`: Office Gremlin, Underpants Cyclops, Runaway Dentures, Slime Royalty, Haunted Toaster, Panic Chicken, Bin Goblin, and Decaf Phantom. The 48px transparent sprites use integer pixel shapes and nearest-neighbor rendering. They render at 144–168px on desktop and 68–80px on compact viewports, resizing with the browser. No external art or audio assets are required. The pass is intentionally silent and never overrides sound preferences.

## Verification

Unit/component coverage checks evasion input paths and resize bounds, bounded version persistence, notice selection, repeat cleanup, timer disposal, process non-completion, meeting/update sequences, keyboard focus recovery, minimized-window resize behavior, and contextual Terminal responses. `tests/e2e/personality-eggs.spec.ts` covers the production shell, navigation, desktop/Pocket switching, touch, reduced motion, keyboard recovery, and screenshots.

