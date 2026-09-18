# Liquid Glass

Liquid Glass is a public WestCose skin with coastal glass controls over calm,
opaque reading surfaces. Pocket expresses it through a floating system header,
a single glass dock, mineral-paper widgets, and a property sheet. Desktop uses
glass title bars, launcher, taskbar, and menus around solid application content.
The route model, applications, preference versions, discoveries, and shell
markup are unchanged. There are no production React changes.

## Design rationale

The requested `apple-design` skill informed the material hierarchy, rather than
the product identity or navigation. Relevant sections in its bundled HIG notes:

- `liquid-glass.md` / `materials.md`: separate functional chrome from content;
  reserve glass for controls and navigation, and keep reading surfaces stable.
- `liquid-glass-web.md`: opaque defaults, progressive enhancement, one material
  per functional surface, and no independently blurred repeated child controls.
- `accessibility.md`: contrast, visible keyboard focus, reduced visual effects,
  and touch targets take precedence over decorative treatment.
- `layout.md` / `typography.md`: clear grouping, existing familiar navigation,
  readable type, and layouts that adapt to the available space.

WestCose supplies its own ink/sea-blue palette, original coastal artwork,
existing application glyphs, restrained personality copy, and familiar routes.
No Apple assets, proprietary fonts, new sounds, or platform navigation patterns
are introduced. This is CSS transmission and light-catching edges, not optical
refraction, adaptive pixel sampling, or Apple's native rendering material.

The layout remains the existing shell structure:

```text
Desktop                           Pocket home             Pocket app
icons         solid clock         glass system header     glass command header
       glass window header        paper status / project  opaque reading canvas
       opaque application         glass icon wells        existing app controls
                                  page indicators
floating glass taskbar            single glass dock
```

## Registry and material contract

No new treatment vocabulary or appearance attributes were needed.

| Axis | Existing treatment |
| --- | --- |
| Palette | `theme-tokens`, light, primary accent |
| Surface | `translucent` |
| Borders | `hairline` |
| Depth | `drop-shadow` |
| Typography | `modern-sans`, existing bundled Manrope and IBM Plex Mono |
| Window chrome | `translucent` |
| Taskbar | `floating-bar` |
| Widgets | `translucent-card` with opaque content fill |
| Icons | `filled`, existing glyphs and artwork in new wells |
| Effects | `backdrop-blur` |

The palette lives in `src/styles/themes.css`. `liquid-glass.css` owns material,
radius, type, motion, and accessibility tokens. `glass.module.css` supplies
reusable material classes, composed into existing local CSS module classes.
Every material rule is treatment-scoped; composition alone changes no other
skin. Component modules own local geometry and content exceptions. No selectors
depend on generated CSS class names, and no components check the theme id.

| Material | Fill when enhanced | Usage |
| --- | --- | --- |
| Regular | Pale mineral at 84% | Window title bars, Pocket command/system headers |
| Strong | Paper at 94% | Menus, launcher, customization sheet |
| Clear | Pale mineral at 72% | Taskbar and Pocket dock with dark monochrome controls |
| Control | White at 82%, no backdrop filter | Icon wells, shared icon buttons |
| Content | Opaque `#f4f8fa` / white | Documents, Settings, Notes, widgets, notifications |
| Terminal | Opaque `#132b37` | Existing live Terminal inside glass window chrome |

Token choices: ink `#17303d`, secondary ink `#3c5360`, accent `#15607d`,
focus `#07546d`; body 16px, labels 13–14px, captions 12px. Radii use the existing
token scale, remapped to 8–32px. The window's inner radius is its outer radius
minus the 6px frame inset. Transitions are 140/200/280ms with no new animation
loops. Controls retain the existing 44px minimum interaction target where used
by the shells; Pocket's native theme select and nested Back link explicitly
retain that size.

Contrast calculations for the chosen colors, before any helpful light sheen:

| Pair | Ratio |
| --- | --- |
| Primary ink on opaque reading surface | 12.87:1 |
| Secondary ink on regular glass over a black backdrop | 5.18:1 |
| Primary ink on clear glass over a black backdrop | 6.11:1 |
| White on accent | 7.00:1 |

These are composited color calculations, not a claim that an automated contrast
scanner can certify every translucent pixel. Menus were also checked over Dusk
Cliffs, Graphite Field, WestCose 95, and Tidal Light. Opaque label backings keep
home icons legible with any wallpaper.

## Wallpaper and assets

The independent wallpaper id is `liquid-glass`, named **Tidal Light**. Both
compositions are original, hand-authored SVGs:

- `public/images/wallpapers/liquid-glass-desktop.svg`: 1600×1000, 1,634 bytes.
- `public/images/wallpapers/liquid-glass-pocket.svg`: 900×1800, 1,579 bytes.

Broad ivory/mint fields cross deeper coastal ribbons, with thin directional
highlights. The portrait composition is drawn separately. Both are static paths
and gradients: no SVG filters, embedded raster files, scripts, animation, remote
references, font assets, or added dependencies. Literal artwork colors keep the
wallpaper independent of theme tokens. Dusk Cliffs and social metadata remain
unchanged.

The new artwork's registry scrim defaults to a 72% neutral veil so Dusk's light
home labels remain readable over its pale areas. Liquid Glass opts out through
`--wallpaper-light-art-shade` because its labels already have opaque backings.
This affects only Tidal Light; no existing wallpaper or Dusk style is changed.

Selecting Liquid Glass changes only `themeId`. The existing recommended-wallpaper
button explicitly opts into Tidal Light. Dusk + Tidal Light and Liquid Glass +
Dusk Cliffs both work, including reloads and switching between shells.

## Accessibility and rendering cost

Opaque fills are the default. A feature query enables backdrop filtering only
when supported. High contrast, native reduced transparency, increased contrast,
and forced colors remove blur and decorative transmission. Reduced motion keeps
the existing authoritative behavior. Forced colors uses system color roles.
Keyboard menu ownership, focus behavior, long press alternatives, and screen
reader semantics are unchanged.

`backdrop-filter` is broadly available in current browsers, but older browsers
need the opaque fallback ([MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)).
Native reduced-transparency detection is still uneven; the existing **High
contrast** setting supplies a manual opaque presentation without adding a new
stored preference ([MDN reduced transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency)).

The blur radius is 20px with modest saturation. Idle Desktop has one filtered
surface; idle Pocket has two. Automated checks bound their combined rectangles
to less than 25% of the viewport. App headers and transient menus add small
filtered regions, but reading canvases, widgets, list rows, icon wells, and
repeated controls never create blur layers. There is no full-screen blur,
pointer-tracking lighting, displacement filter, WebGL effect, or runtime effect code.
This is a compositing budget, not a measured frame-rate or battery guarantee on
physical low-end devices.

The customization sheet constrains its option list and keeps intrinsic row
heights while scrolling; buttons do not overlap the pinned action row. Narrow
Desktop windows use local container queries. Pocket retains touch navigation
and supports narrow, tall, and landscape layouts.
Projects and Appearance also reflow at a 200% root text size. Pocket command
headers wrap when needed, and Desktop project grids respond to the window's
available width rather than retaining a two-column minimum.

## Changed files

| Area | Files |
| --- | --- |
| Registry | `src/registry/themes.ts`, `wallpapers.ts` |
| Global/material CSS | `src/app/globals.css`, `src/styles/themes.css`, new `liquid-glass.css`, new `glass.module.css` |
| Desktop CSS | `DesktopShell.module.css`, `DesktopWindow.module.css`, `DesktopContextMenu.module.css`, `TerminalUtility.module.css` |
| Pocket CSS | `PocketHome.module.css`, `PocketAppTile.module.css`, `PocketAppFrame.module.css`, `PocketCustomizeSheet.module.css`, `PocketLockScreen.module.css`, `PocketStartup.module.css` |
| Shared apps/controls | `RouteDocument.module.css`, `InteractiveApps.module.css`, `Button.module.css`, `IconButton.module.css` |
| Settings/Notes CSS | `DesktopSettings.module.css`, `PocketSettings.module.css`, `DesktopNotepad.module.css`, `PocketNotes.module.css` |
| Semantic fallback | `NormalShell.module.css`, theme-scoped brand-mark contrast correction |
| Tests | New `tests/unit/liquid-glass.test.ts`, `tests/e2e/liquid-glass.spec.ts`, `liquid-glass.visual.spec.ts`; expanded appearance unit/component assertions and `appearance-helpers.ts` |
| Assets/docs | Two SVG wallpapers, Liquid Glass visual baselines, `README.md`, this file |

The existing test files updated are `tests/unit/appearance.test.ts`,
`tests/component/settings-appearance.test.tsx`,
`tests/component/desktop-personalization.test.tsx`,
`tests/component/pocket-customize.test.tsx`, and `tests/e2e/appearance-helpers.ts`.

The resolver, pre-paint bootstrap, storage, reducers, app registry, routes,
discovery service, and all production TSX files are unchanged.

## Verification and limits

Validation on Windows:

- Lint, TypeScript, production build (48 routes), and `git diff --check` pass.
- All 164 unit/component tests pass across 31 files.
- The full Chromium suite reports **128 passed, 4 visual mismatches**. All
  behavior/axe tests and all twelve Liquid Glass visual tests pass.
- Liquid Glass and WestCose 95 behavior checks pass in Firefox and WebKit;
  enlarged-text and application accessibility checks were repeated after the
  final reflow changes.

All 27 pre-existing PNG baselines remain byte-identical to HEAD. The four
mismatches are WestCose 95's Desktop Appearance, Desktop theme submenu, Pocket
Appearance, and Pocket customization sheet. They show the newly visible Liquid
Glass / Tidal Light catalog entries; their skin styling is unchanged. The other
23 existing visual tests pass, including every Dusk and Corporate Beige view.
Refreshing only these four catalog baselines is pending the user's decision
because the brief explicitly restricts changes to existing snapshots. The suite
is not reported as fully green while those baselines remain unchanged.

Coverage includes registry validation; Settings, context-menu and touch-sheet
switching; preservation of a mounted Terminal input; independent wallpapers;
cross-shell persistence; invalid ids; Corporate Beige unlock/reset; pre-hydration
attributes/palette/wallpaper; keyboard menus; contrast audits; unsupported blur;
reduced motion/transparency; forced colors; and bounded backdrop area.

Responsive browser checks cover Desktop 1024, 1366, and 1920 widths with snapped
windows, plus Pocket 320×568, 390×844, 412×915, and 844×390 with touch enabled.
The visual suite adds twelve Liquid Glass views: Desktop home, Projects, Notes,
Appearance, context menu, and launcher; Pocket home, Projects, Notes, Appearance,
customization sheet, and lock screen. Every new image is reviewed manually.

Pre-hydration tests block external JS and verify the inline bootstrap. The
server still supplies semantic content until React mounts the interactive shell.
Contact deliberately retains the existing semantic fallback on Pocket.

Chromium uses native media emulation for reduced transparency. Firefox/WebKit
verification activates that same CSS media branch through response interception,
because Playwright has no cross-engine emulator for the preference. Unsupported
blur is tested by disabling the feature-query enhancement in the CSS response.
These tests verify fallback presentation, not the host OS preference plumbing.

Before a future skin: preserve the distinction between on-accent text and normal
ink (legacy `--color-text-dark` serves both roles in older app styles), keep
materials composed at control-layer boundaries, and profile on actual mobile
hardware before increasing blur area. A standalone manual reduced-transparency
preference could be added if product requirements call for it. No shell rewrite
or new treatment axis was required. Dead Coast is not implemented.
