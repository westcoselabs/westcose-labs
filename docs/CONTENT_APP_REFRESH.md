# Content and app pass, November 7, 2026

## Experiments shipped

The writing source is the supplied `EXPERIMENTS_REWRITE.md`, interpreted against
the actual repository and the existing WestCose voice guide.

- The five existing demo routes and their controls remain. The legacy
  `westcose-world` experiment is now titled **The WestCose Orbit Scene** to
  distinguish the Designs orbit assets from the playable World project.
- `concept-to-glb` documents the verified Dead Coast Pier sign pipeline, using
  the already-published model capture, model exhibit, game placement, and Note.
  Its generation path is Tripo and Blender. The unavailable private `3d-assets`
  checkout does not support broader TRELLIS.2 claims in this pass.
- `world-builder-lab` uses the existing Builder capture and links to the World
  case study's placement, walkthrough, and saved-version review evidence.
- `combat-feel-lab` uses the existing zombie lab capture and documented animation,
  damage-range, and effects labs. It makes no promise of a public combat demo.
- `theme-workshop` describes the four public theme treatments and links to the
  real Appearance settings. Hidden discoveries are not named.

Optional WordPress rebuild, creative automation, motion intro, and game mechanics
research entries remain deferred. They need their own verified public material.
Useful next assets would be owner-reviewed before/after model views, a short
Builder placement/review recording, and a capture of a specific combat change.
No count-padding pages or fake live controls were added.

## Contact, games, and links

- Contact uses the owner-confirmed `westcose.co@gmail.com`, project-type choices,
  direct contact links, visible labels, inline errors, and first-error focus.
  It composes an email draft. It does not submit to a server or claim delivery.
- Pocket game tiles reuse the existing approved game cover artwork, including
  across theme treatments. Their separate overflow buttons are removed; long
  press, context menu, and Shift+F10 retain secondary actions.
- The desktop selection overlay is removed. Double-click and Enter/Space still
  launch shortcuts.
- FightClub opens the existing Higgsfield URL in a new tab. Its old URL redirects.
  The iframe launcher and obsolete screenshots/tests were removed. Launch
  achievements still work; legacy player-only achievements remain hidden.
- The GitHub profile and public repository links are connected. The `public`
  WordPress workspace is removed from the curated site, not deleted on GitHub.
- Client actions point to the supplied live domains. Existing project maturity
  labels are retained, including the separate Trends redesign preview.

## Estate Sales Bakersfield evidence

The case study was checked against the local project's current README, application
routes, Explore component, active UI/UX plan, and architecture documents. Public
home and search pages were captured from `https://estatesalesbakersfield.com/` on
November 7, 2026, at 1440 × 1000 and 390 × 844. These replace the old hero artwork
as the primary preview. A search screenshot supports the expanded product and
design explanation.

The upstream project still identifies itself as a noindex production beta with
Stripe test payments. Those are deliberate product boundaries, not missing Labs
configuration. No live payment or adoption claims were added.

## Google setup

The root layout installs Tag Manager `GTM-NT39N3WH` and the supplied Search Console
verification token. The published container contains GA4 `G-EJGDC1TZK9`; no second
Google tag is installed. The form does not push visitor-entered fields into the
data layer. Search Console verification and sitemap submission are checked in the
owner's existing browser session after deployment.

## Outbreak motion

Imagegen revisions repeated the leading leg, so they were rejected. The shipped
illustrated source art is retained. Independent far and near leg layers now use
opposite stride and passing phases, baked into twelve 192px frames once at load
time. The original pose remains for idle and reduced motion. See
`OUTBREAK_CREATURES.json` for provenance and runtime details. The phantom floats.

## Existing deployment gap found during the audit

The production original-planet asset endpoint returned HTTP 503 during the
pre-release audit. The viewer is functional locally, where the original Designs
checkout is available. Production needs the original source files or an existing
origin serving their exact recorded bytes, configured through the server-only
planet asset setting described in `PLANET_ASSET_PIPELINE.md`. The viewer's
unavailable/retry state remains in place. No different or unverified model is
substituted. This is separate from the playable World project's bundled exhibits.

## Validation

- `npm run check` passed, including all 294 unit/component tests and a production
  build. A final focused run passed all 11 tests for experiment references, gait
  phases, projects, FightClub, and contact validation. Final lint and build passed.
- 50 targeted Chromium checks passed for the contact form, experiments, client
  links, direct game launches, library behavior, accessibility, and SEO.
- 11 mobile Chromium checks passed, including phone/landscape contact layouts,
  game launch, metadata, no-JavaScript content, robots.txt, and sitemap.
- Nine outbreak and planet-viewer checks passed. Five final checks confirmed the
  twelve-frame walk binding, Pocket containment, app covers, and contact layouts.
- 48 visual checks passed across the existing themes. Affected baselines were
  refreshed and representative Desktop/Pocket screenshots reviewed.

Device checks use browser emulation; no physical phone test is claimed.
