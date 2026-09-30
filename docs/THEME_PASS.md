# WestCose XP and Liquid Glass theme pass

## Implementation

WestCose XP is a public `westcose-xp` registry entry. It selects four new treatment values: `glossy-plastic`, `sculpted-titlebar`, `blue-taskbar`, and `rendered-object`. It reuses the existing system typography, border, depth, appearance context, pre-paint bootstrap, and persistence pipeline. Optional `launcherLayout` metadata selects the two-column launcher arrangement from the placements registry. Application actions, searching, routing, keyboard handling, games, and easter eggs retain their existing implementations.

XP has opaque cream content, blue plastic window frames, inset edges, red close keys with 44px hit regions, a blue anchored taskbar, green Start button, active application tabs, a tray, cream context menus, and original object icons. Pocket adapts the same materials to its header, dock, app chrome, customization, lock screen, and startup progress bar.

Liquid Glass retains its existing treatment values and shared CSS module. Its optical stack now combines clearer transmission, two directional reflection gradients, bright rims, inner edge contrast, ambient and directional shadows, and a translucent outer window frame. Blur decreases from 20px to 12px while saturation rises from 1.18 to 1.55. Regular/strong/clear fills become 72%/76%/64% rather than 84%/94%/72%. Reading surfaces remain opaque. This is a lightweight CSS optical approximation, without displacement filters, canvas rendering, or continuous pointer tracking.

The existing High contrast preference remains the manual opaque fallback. Reduced transparency, increased contrast, forced colors, unsupported backdrop filtering, and reduced motion retain their fallback paths. New `--glass-edge` and `--glass-frame` tokens also flatten in those modes. XP's material gradients, radii, colors, and bevels live under `--xp-*` tokens.

Theme and wallpaper remain independent. Selecting XP does not overwrite an existing wallpaper. **Use recommended wallpaper** opts into Coastal Hills. No storage version, default preference, or saved theme ID changes. Theme picker thumbnails use each theme's registered recommended wallpaper.

The pass also gives the compact Pocket Back button a stable accessible name and corrects the existing Do Not Open control's ink on dark danger fills in light themes. Finite entrance animations settle before automated contrast audits; the animations themselves are unchanged.

## Assets

- `public/images/wallpapers/xp-coastal-hills-desktop.webp`: 1536 × 1024, about 276 KiB.
- `public/images/wallpapers/xp-coastal-hills-pocket.webp`: 683 × 1024 portrait crop, about 116 KiB.
- `public/icons/xp-objects.svg`: original SVG sprite with folder, computer, controller, flask, document, envelope, globe, bin, terminal, briefcase, crossed swords, phone, and bird artwork.

The wallpaper was generated with the built-in imagegen tool, then encoded as WebP with Sharp. The original generated PNG remains outside the repository. All application references point to bundled repository assets.

Generation prompt:

> Use case: photorealistic-natural. Asset type: original WestCose XP desktop OS wallpaper, wide landscape 1536x1024 or wider. A cheerful early-digital photograph of velvety vivid green rolling coastal hills beneath a saturated cobalt-to-cyan blue sky, soft white cumulus clouds. Distinct composition: a broad low hill rises gently on the left and sweeps down to a tiny pale blue coastal inlet far to the right, a second smaller green ridge in the distance. Sky fills upper 60 percent. Noon sunlight, slightly nostalgic digital-camera softness, simple and iconic with natural fine grass texture and almost no visual clutter. The central crop must also work as a portrait phone wallpaper. Absolutely original landscape, do not reproduce Microsoft's Bliss hill profile or cloud composition. No buildings, people, logos, words, watermark, UI or borders. Optimistic clean photographic realism, lightly saturated early-2000s consumer desktop mood.

## Files changed by this pass

Registry and global materials:

- `src/registry/themes.ts`, `types.ts`, `validate.ts`, `placements.ts`, `wallpapers.ts`
- `src/app/globals.css`
- `src/styles/themes.css`, `westcose-xp.css` (new), `liquid-glass.css`, `glass.module.css`

Desktop and shared components:

- `src/components/desktop/DesktopShell.tsx`, `DesktopShell.module.css`
- `src/components/desktop/DesktopWindow.module.css`
- `src/components/desktop/DesktopContextMenu.tsx`, `DesktopContextMenu.module.css`
- `src/components/icons/AppGlyph.tsx`, `ThemeGlyph.tsx` (new), `ThemeGlyph.module.css` (new)
- `src/components/ui/Button.module.css`
- `src/components/apps/notes/desktop/DesktopNotepad.module.css`
- `src/components/apps/settings/desktop/DesktopSettings.module.css`
- `src/components/apps/settings/pocket/PocketSettings.module.css`
- `src/components/apps/DoNotOpen.module.css`

Pocket:

- `src/components/pocket/PocketAppFrame.tsx`, `PocketAppFrame.module.css`
- `src/components/pocket/PocketAppGlyph.tsx`, `PocketAppTile.module.css`
- `src/components/pocket/PocketCustomizeSheet.tsx`, `PocketCustomizeSheet.module.css`
- `src/components/pocket/PocketHome.module.css`, `PocketLockScreen.module.css`, `PocketStartup.module.css`

Tests and documentation:

- `tests/unit/appearance.test.ts`
- `tests/component/desktop-personalization.test.tsx`, `pocket-customize.test.tsx`, `settings-appearance.test.tsx`
- `tests/e2e/appearance-helpers.ts`, `liquid-glass.spec.ts`, `westcose-95.spec.ts`
- `tests/e2e/westcose-xp.spec.ts`, `westcose-xp.visual.spec.ts` (new)
- XP visual baselines and refreshed Liquid Glass baselines under `tests/e2e/`
- This document

The workspace already contained unrelated changes. This inventory describes only files touched by the theme pass, including additive edits to files that were already modified.

## Validation

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; all 63 static pages generated.
- `npm run test:run`: 211 tests passed across 35 unit/component files.
- `npx playwright test tests/e2e/westcose-xp.spec.ts tests/e2e/liquid-glass.spec.ts tests/e2e/westcose-95.spec.ts tests/e2e/appearance.spec.ts --project=chromium --project=firefox --project=webkit`: 151 checks passed after fixes and a successful rerun of all nine initially failing checks. The 26 intentional skips are appearance tests restricted to Chromium. No remaining failures in these suites.
- `npx playwright test tests/e2e/westcose-xp.visual.spec.ts tests/e2e/liquid-glass.visual.spec.ts --project=chromium`: 24 screenshot comparisons passed after generating/reviewing the new baselines.
- `git diff --check`: passed.

Browser coverage includes keyboard theme switching, an open Terminal retaining its draft while switching, reload persistence, independent wallpaper selection, recommended wallpaper, Desktop and Pocket personalization, launcher search, window maximize/restore, app reading surfaces, 320px/390px Pocket layouts, high contrast, forced colors, reduced motion, and WCAG A/AA automated audits. Existing Liquid Glass tests also cover transmission fallbacks and wallpaper combinations. These are targeted theme regression suites, not a claim that every possible game/easter-egg interaction was manually exercised.

Visual baselines cover home, projects, notes, settings, context/customization, Start menu, and lock screen in the relevant shell. Representative captures:

- [XP desktop launcher](../tests/e2e/westcose-xp.visual.spec.ts-snapshots/desktop-start-menu-chromium-win32.png)
- [XP desktop settings](../tests/e2e/westcose-xp.visual.spec.ts-snapshots/desktop-settings-chromium-win32.png)
- [XP Pocket home](../tests/e2e/westcose-xp.visual.spec.ts-snapshots/pocket-home-chromium-win32.png)
- [Liquid Glass desktop window](../tests/e2e/liquid-glass.visual.spec.ts-snapshots/desktop-projects-chromium-win32.png)
- [Liquid Glass Pocket customization](../tests/e2e/liquid-glass.visual.spec.ts-snapshots/pocket-customize-chromium-win32.png)

## Future refinements

An optional independent Reduce transparency setting could complement the current system-media preference and manual High contrast fallback. Genuine pixel displacement/refraction would require a separate performance and browser-compatibility evaluation; the current material intentionally uses bounded CSS effects. Further custom icon variants could distinguish Settings from the shared computer motif.
