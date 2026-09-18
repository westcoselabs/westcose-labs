# WestCose 95

WestCose 95 is a public skin of the existing Desktop and Pocket OS. Both keep
their routes, app registry, window state, local notes, storage versions, discovery
service, and interaction model. It introduces no dependencies, sounds, external
fonts, shell copies, app forks, or new theme treatment vocabulary.

## Appearance contract

| Axis | Existing treatment used |
| --- | --- |
| Palette | `theme-tokens`, light, primary accent |
| Surface | `beveled` |
| Border | `outset` |
| Depth | `hard-shadow` |
| Typography | `system-ui` (Tahoma / Microsoft Sans Serif / Arial; Courier for mono) |
| Window chrome | `classic-titlebar` |
| Taskbar | `anchored-bar` |
| Widgets | `flat-panel` |
| Icons | `outline` (existing artwork with square wells and labels) |
| Effects | None; no scanlines over text or added blur |

`src/styles/themes.css` owns the palette. `src/styles/westcose-95.css` owns
shared type, bevel, radius, motion, focus, and accessibility primitives. Existing
CSS modules own their local geometry, using the treatment attributes above. No
selector depends on a generated CSS-module class name.

The new `ThemeDefinition.copy` metadata optionally supplies system/launcher labels
and startup copy. Dusk and Corporate Beige omit it and retain their original copy.
No component checks `themeId === "westcose-95"`. Desktop's launch button says
WESTCOSE; Pocket retains its own organizer header, launcher cells, and soft keys.

## Wallpaper and assets

The `westcose-95` wallpaper is entirely generated CSS: a restrained teal weave
with a diagonal workstation motif and a separate vertical handheld composition.
Its colors live under `--wallpaper-95-*` in `appearance.css`, outside theme
selectors. The same teal artwork therefore works under Dusk. There are **no new
production binary assets**, icons, downloaded fonts, or audio. New PNGs are test
baselines only.

Theme selection never changes `wallpaperId`. Settings' shared
`RecommendedWallpaper` control lets the user explicitly adopt the theme's
recommended wallpaper. It resolves only available entries, so hidden wallpaper
recommendations cannot bypass discovery. Corporate Beige and Standard Issue keep
their existing unlock. Dusk Cliffs and social-preview URLs are untouched.

## Files changed in this pass

The working tree already contained the prior appearance-system pass. The list
below describes this pass, rather than attributing all uncommitted work to it.

| Area | Files |
| --- | --- |
| Registry | `src/registry/themes.ts`, `wallpapers.ts`, `types.ts` |
| Global styles | `src/app/globals.css`; `src/styles/themes.css`, `appearance.css`, new `westcose-95.css` |
| Shared controls | `src/components/ui/Button.module.css`, `IconButton.module.css` |
| Appearance metadata/UI | `src/components/os/AppearanceContext.tsx`; new `RecommendedWallpaper.tsx` and `.module.css` |
| Desktop | `DesktopShell.tsx` and `.module.css`; `DesktopWindow.module.css`; `DesktopContextMenu.module.css`; `TerminalUtility.tsx` and `.module.css` |
| Pocket | `PocketHome.tsx` and `.module.css`; `PocketStartup.tsx` and `.module.css`; `PocketAppTile.module.css`, `PocketAppFrame.module.css`, `PocketCustomizeSheet.module.css`, `PocketLockScreen.module.css` |
| Shared apps | `src/components/apps/RouteDocument.module.css`, `InteractiveApps.module.css` |
| Notes | `notes/desktop/DesktopNotepad.tsx` and `.module.css`; `notes/pocket/PocketNotes.module.css` |
| Settings | `settings/desktop/DesktopSettings.tsx` and `.module.css`; `settings/pocket/PocketSettingsHome.tsx` and `PocketSettings.module.css` |
| Unit/component coverage | `tests/unit/appearance.test.ts`; `tests/component/desktop-personalization.test.tsx`, `pocket-customize.test.tsx`, `settings-appearance.test.tsx`, `notes-app.test.tsx` |
| Browser coverage | New `tests/e2e/appearance-helpers.ts`, `westcose-95.spec.ts`, `westcose-95.visual.spec.ts`; adjusted `appearance.spec.ts` invalid-id fixture and `notes.spec.ts` toolbar role assertion |
| Visuals | Twelve new files under `tests/e2e/westcose-95.visual.spec.ts-snapshots/`; no existing baselines overwritten |
| Documentation | `README.md`, this file |

## React changes and accessibility correction

The visual transformation is CSS. React changes consume optional registry copy
in DesktopShell, PocketHome, and PocketStartup, report the resolved theme name in
Terminal, and render the same recommended-wallpaper control in both Settings
presenters. The appearance resolver, bootstrap implementation, routes, and
preference reducers required no changes.

Expanded axe coverage found an existing Notepad `menubar` containing ordinary
buttons. It is now correctly exposed as a menu-button toolbar, with left/right
keyboard navigation and Escape returning focus to the open menu's trigger. Its
appearance is unchanged. Desktop personalization retains sibling menus.

WestCose 95 retains 44px window-control hit boxes and Pocket soft keys. Its
visible title-bar buttons are drawn smaller inside those targets. Discovery
alerts have raised/pressed dismiss keys; Desktop dismiss targets are at least
44px, matching Pocket's existing targets. Reduced motion
still overrides all durations. High contrast flattens bevels and overrides
wallpaper consumers; forced colors removes shadows and uses system color roles.

## Verification

Coverage includes registry resolution, recommendation metadata, both Settings
presenters, keyboard/context-menu switching, long press and touch selection,
independent wallpapers, reload persistence, mounted-shell and Terminal-state
preservation, active/inactive chrome, invalid-id recovery, and Corporate Beige
unlock/reset behavior.

Pre-hydration tests block external JavaScript and verify inline-bootstrap
attributes, palette, and wallpaper variables for both shell sizes. The existing
server fallback is semantic content until hydration; these tests do not claim
that interactive shell markup exists without React.

Keyboard-focus tests wait for the shell's existing initial heading-focus handoff
before operating controls. This removes test races with its two scheduled frames;
the theme does not change route focus behavior.

Responsive checks cover 1024×768, 1366×768, and 1920×1080 desktops with snapped
application windows; 320×568, 390×844, 412×915, and 844×390 Pocket viewports. Axe
checks cover home, menus, customization, Settings, Notes, Projects, Recycle,
FightClub, About, Contact, and Terminal. Visual baselines cover Desktop home,
Projects, Notepad, Appearance, personalization, and launch menu, plus Pocket
home, Projects, Notes, customization, Appearance, and lock screen.

Final verification on Windows:

| Check | Command / result |
| --- | --- |
| Lint | `npm run lint` — passed |
| Types | `npm run typecheck` — passed |
| Unit and component tests | `npm run test:run -- --maxWorkers=2` — 160 passed across 30 files |
| Production build | `npm run build` — passed; 48 routes generated |
| Chromium E2E, axe, and visuals | `npx playwright test --project=chromium --reporter=line` — 98 passed |
| Firefox and WebKit | `npx playwright test tests/e2e/westcose-95.spec.ts --project=firefox --project=webkit --reporter=line` — 38 passed |
| Visual review | All 12 new WestCose 95 baselines manually reviewed; all 27 visual tests pass |
| Dusk protection | All 13 tracked baseline PNGs compared directly with HEAD and are byte-identical; the prior pass's two Corporate Beige baselines were not overwritten |

The Chromium suite includes the original accessibility and appearance suites,
Corporate Beige visuals, the acceptance path, and both shells' responsive checks.
No snapshot update command targeted the existing baseline directory. The existing
Pocket case-study visual passed in the complete parallel Chromium run.

## Architecture limits and next-skin preparation

1. Treatment selectors work, but geometry is necessarily local to CSS modules.
   A registry entry alone cannot remove a hardcoded large heading or restructure
   a dock. Keep those rules alongside each component and share their primitives.
2. `--color-text-dark` currently serves both text on light paper and text on an
   accent fill. This pass explicitly styles selected/chrome foregrounds. Before
   Liquid Glass, introduce dedicated `on-accent` and `on-media` color roles to
   reduce per-component contrast fixes, guarded by Dusk screenshots.
3. Window-responsive layouts need container queries, not just viewport queries.
   WestCose 95 enables an inline-size container on window bodies and adapts
   Settings, Notepad, Projects, and FightClub at narrow window widths.
4. The shell still has one route-backed application window plus utility windows.
   A theme switch preserves those instances; it does not add multi-route windows.
   Its JavaScript workspace bounds still reserve the original 72px taskbar and
   24px gutter, leaving extra clearance above this skin's shorter bar. Before a
   skin needs different window placement, give CSS and geometry one shared sizing
   contract rather than adding theme checks to the window manager.
5. Browser address-bar metadata remains the site's static Dusk color, like social
   previews. Native device status/network functionality was not added.
6. Before Liquid Glass, define a shared translucent-material contract with opaque
   fallbacks, contrast ownership over wallpaper imagery, and reduced-transparency
   behavior. Keep accessibility at the consuming surface and extend this same
   cross-browser matrix. No Liquid Glass implementation is included here.
