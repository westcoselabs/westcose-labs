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

## Repository map

- `src/app`: semantic routes, metadata, loading/error boundaries, sitemap, robots.
- `src/content`: local MDX case studies and static content.
- `src/registry`: typed apps, routes, projects, placements, notifications, site data.
- `src/components`: shared applications plus Desktop, Pocket, semantic fallback, and material UI.
- `src/state` and `src/lib`: reducers, storage, URI, routing, shell, and geometry helpers.
- `src/styles`: exact Dusk tokens, typography, material, motion, and accessibility.
- `tests`: unit, component, browser, accessibility, and visual coverage.

## Production configuration gates

Development fixtures are deliberately labeled and must not ship as invented
facts. Before production acceptance, provide or approve:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_GITHUB_URL`
- verified active social destinations
- confirmed Estate Sales Bakersfield copy, status, technologies, links, and art
- final desktop and portrait wallpaper approval
- approval for the FightClub concept cover and final project credits
- any approved local sound assets

The documented telephone actions use `+1 612-741-7277`. Contact submission is a
native `mailto:` handoff; the site never claims a message was sent or stores it.

## Runtime boundaries

FightClub remains remotely hosted and loads only after an explicit Play action;
no game engine is bundled with the portfolio. TV, World,
Arcade, Archive, PWA/offline support, multiple decorative themes, persistent
window layouts, database infrastructure, and multi-route live desktop windows
remain intentionally outside V1.
