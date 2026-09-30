# WestCose Labs OS

WestCose Labs OS is a route-backed portfolio presented through two public OS
shells:

- Desktop OS for pointer-oriented desktop interaction.
- Pocket OS for touch-oriented phones and tablets.

A server-rendered semantic document remains underneath both presentations for
accessibility, indexing, direct routes, automated checks, and no-JavaScript
behavior.

The pathname owns the content; the shell only changes its presentation. Local
MDX and typed registries remain the source of truth, and no database, auth,
CMS, upload service, or stored contact submission is used.

## Local development

Use Node 22 and npm 10, then run:

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Useful verification commands are:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm run test:a11y
```

Playwright requires Chromium, Firefox, and WebKit binaries. Install them once
with `npx playwright install chromium firefox webkit`.

## Presentation behavior

- `?view=os` restores automatic Desktop/Pocket selection.
- Display, motion, contrast, sound, and session reset controls live in Settings.

## Appearance system

Themes and wallpapers are registry-driven and shared by both shells. Nothing in
`src/components/desktop` or `src/components/pocket` hardcodes an appearance.

- `src/registry/themes.ts` selects a named behavior per axis: palette, surface
  material, borders, depth, typography, window chrome, taskbar, widgets, icons,
  effects, and a recommended wallpaper.
- `src/registry/wallpapers.ts` owns a separate desktop and pocket source for
  each wallpaper id, plus per-surface scrims and picker preview metadata.
- `src/lib/appearance.ts` resolves the persisted ids against the shared
  discovery/unlock state and falls back to the defaults when an id is unknown or
  re-locked. It also emits the `--wallpaper-*` variables and `data-theme-*`
  attributes, and serializes the same tables into the pre-paint bootstrap.
- `src/styles/appearance.css` carries the default Dusk values so the document is
  correct before hydration and without JavaScript.

To add a skin, add a theme entry, add any wallpapers it needs, and write
presentation styles keyed off `[data-theme]` or the `data-theme-*` attributes.
The shells do not change. Accessibility overrides are applied where a variable
is consumed rather than on the variable, so high contrast and forced colors stay
authoritative over any theme treatment.

Personalization is reachable from the desktop context menu on empty space
(Shift+F10 is the keyboard equivalent), from a long press on either Pocket home
page, and from Settings → Appearance in both shells.

WestCose 95 is the first public alternate skin. Its generated teal wallpaper
has separate workstation and handheld compositions, and stays independent of
the theme. Settings offers the recommended wallpaper as an explicit opt-in.
See [the WestCose 95 implementation notes](docs/WESTCOSE_95.md) for its treatment
map, changed files, verification, and constraints for the next skin.

Liquid Glass adds coastal glass controls over opaque reading surfaces, with a
distinct touch presentation on Pocket. Its original Tidal Light SVG wallpaper
has separate Desktop and Pocket compositions. Shared CSS material classes keep
blur on navigation and chrome, with opaque high-contrast, reduced-transparency,
and unsupported-browser fallbacks. See [the Liquid Glass implementation notes](docs/LIQUID_GLASS.md)
for the material contract, design rationale, verification, and limitations.

## Repository map

The Projects folder presents 14 curated projects, including four client websites
and GitPress. The interactive showcase includes actual website captures, desktop
and mobile previews, search, category filters, gallery/list views, and quick look.
Source access and beta/preview status are labeled. See [project source and design notes](docs/PROJECT_SOURCES.md) for asset
provenance and the reviewed content snapshot.

- `src/app`: semantic routes, metadata, loading/error boundaries, sitemap, robots.
- `src/content`: local MDX case studies and static content.
- `src/registry`: typed apps, routes, projects, placements, notifications, site data.
- `src/components`: shared applications plus Desktop, Pocket, semantic fallback, and material UI.
- `src/state` and `src/lib`: reducers, storage, URI, routing, shell, and geometry helpers.
- `src/styles`: exact Dusk tokens, typography, material, motion, appearance defaults, and accessibility.
- `tests`: unit, component, browser, accessibility, and visual coverage.

## Production configuration gates

The **WestCose World / 3D Experiment** at `/experiments/westcose-world` loads the
original WestCose Designs planets individually on demand. It uses the source checkout's
existing exports, including embedded textures, without copying or re-exporting
models. Designs, Labs, and Shop each open in a full-screen viewer with slow spin,
rotate/move controls, zoom, reset, and a compact inspector for named parts,
clay/wireframe, and runtime statistics. Only the selected planet is loaded.
See the [source audit](docs/PLANET_SOURCE_AUDIT.md) and
[asset delivery configuration](docs/PLANET_ASSET_PIPELINE.md). Deployment needs
the original source checkout or an existing host serving those exact files;
`npm run planet:check` checks the recorded source hashes.

Development fixtures are deliberately labeled and must not ship as invented
facts. Before production acceptance, provide or approve:

- `NEXT_PUBLIC_SITE_URL` (optional override; defaults to the confirmed `https://westcoselabs.com` origin)
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GITHUB_URL`
- verified active social destinations
- final desktop and portrait wallpaper approval
- approval for the FightClub concept cover and final project credits
- any approved local sound assets

The documented telephone actions use `+1 612-741-7277`. Contact submission is a
native `mailto:` handoff; the site never claims a message was sent or stores it.

## Search visibility

Canonical URLs, social metadata, robots.txt, and the sitemap use
`https://westcoselabs.com`. An invalid `NEXT_PUBLIC_SITE_URL` override fails
instead of silently producing localhost canonical URLs. An override must be a
public HTTPS origin, without credentials, a path, a query, or a fragment.

The interactive homepage stays within the OS viewport. Services opens from a
desktop shortcut, the Start menu, or the first Pocket home page. Its content
scrolls inside the app window or mobile app frame. The explicit document view
and JavaScript-disabled fallback retain the homepage's service overview.

Website design and web development have dedicated routes under `/services`.
Settings, Notes, Recycle, Terminal, and GitHub utility pages use `noindex, follow`
and are excluded from the sitemap. Public project and experiment pages are
included; `/games/arcade` declares `/games` as its canonical to consolidate the
shared game directory. Keep robots.txt permissive so crawlers can read these
page-level directives.

Before release, run `npm run check` and
`npx playwright test tests/e2e/seo.spec.ts --project=chromium --project=mobile-chromium`.
After deployment, verify the HTTPS/www redirect policy at the host, fetch the
live robots.txt and sitemap, and inspect the homepage plus both service pages
in Google Search Console. Submit `https://westcoselabs.com/sitemap.xml` and
confirm Google's mobile rendering of the service pages includes their text. Track relevant
non-brand impressions, clicks, and qualified inquiries; deployment and Search
Console submission are separate from the repository changes.

## Runtime boundaries

FightClub remains remotely hosted and loads only after an explicit Play action;
no game engine is bundled with the portfolio. TV, World,
Arcade, Archive, PWA/offline support, persistent window layouts, database
infrastructure, and multi-route live desktop windows remain intentionally
outside V1. The appearance system offers Dusk, WestCose 95, and Liquid Glass as public themes;
Corporate Beige stays hidden behind its existing discovery.
