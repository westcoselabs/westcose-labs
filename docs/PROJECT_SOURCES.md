# Projects source notes

Reviewed September 21, 2026. The collection contains 14 selected projects:
ten from [WestCose Labs](https://github.com/westcoselabs) and four client websites
supplied by the owner. SaleScout and Mission Control were removed at the owner's
request; GitPress is now featured. Content is a checked-in snapshot. Browsing
does not make GitHub API requests or embed third-party websites.

## Content

READMEs establish scope, terminology, and development status. Citryn Fight Club
has no README: its `index.html`, JavaScript game files, and assets establish the
browser-game context. Broseph has no README: `broseph.php` supplies its description
and version. The `public` repository contains WordPress and themes, so it is
labeled as a workspace without claiming authorship of WordPress or Divi.

Estate Sales Bakersfield and Doopify website links come from their GitHub
repository homepage fields. Fight Club retains the existing hosted-game URL.
Both repository-listed website homepages responded with HTTP 200 during verification.
Other projects link directly to their public source. Beta and preview labels
follow repository documentation, without claiming commercial results.

### Client websites

- **First Medical Associates**: [live website](https://drsfirst.com/) and
  [source](https://github.com/firstmedicalassociates/fma-website/tree/f2800a458346c0930d9fb76e06e2b9c4844ebe05).
  The README is the scaffold template, so package.json and the live provider,
  location, services, and appointment navigation establish the description.
- **Barber Refinery**: [live website](https://barberrefinery.com/) and the supplied
  [private repository](https://github.com/citrynmarketingdevelopment/barberrefinery-frontend).
  The README was read through the owner's GitHub connection. It identifies a
  Next.js marketing frontend, Squire booking, and location-specific membership
  handoffs. Public copy describes these visible features, without claiming that
  the marketing site implements a booking backend or payment processor.
- **Simply Decorated by Riley**: [live website](https://decoratedbyriley.com/).
  Its homepage and service pages establish interior design, home staging, and
  estate sale services. The rendered site's Divi and WordPress assets establish
  the stack. No source repository was supplied or invented.
- **Trends Collision Center**: [current site](https://trendsautocollision.com/),
  [redesign preview](https://trends-frontend-eight.vercel.app/), and
  [source](https://github.com/citrynmarketingdevelopment/trends-frontend/tree/7884f5868b7202463c851d9c914ac00a3947aabc).
  The README and preview describe the newer cinematic, optional-3D design.
  The current domain still shows a different contact-focused layout. Captures
  and links explicitly distinguish the redesign from the current website.

## Artwork

These are optimized WebP derivatives of assets in the owner's repositories,
maximum 1440px wide. Captions distinguish illustrations, concept art, sample
product photography, and actual screenshots. WestCose Labs OS keeps its existing
concept cover. Repositories without dedicated art use Phosphor category icons.

| Local file under public/images/projects | Original repository asset and revision |
| --- | --- |
| westcose-designs.webp | [Original Impala illustration](https://github.com/westcoselabs/westcose-designs/blob/b87e27965159c98c5cbb38823077a160a03346ad/public/experience/sketchbook/impala-green.webp) |
| westcose-world.webp | [In-engine coast overview](https://github.com/westcoselabs/westcose-world/blob/be0155d578ac3052e0d50d49eda14969b65226a7/docs/qa/westcose-coast/views/01-coast-overview.jpg) |
| estate-sales-bakersfield.webp | [Marketplace hero artwork](https://github.com/westcoselabs/estate-sales-bakersfield/blob/30372e23104d0003aa39fac4bfcf0f58dc06806e/public/images/marketplace-hero.webp) |
| gitpress-forms.webp | [Builder verification screenshot](https://github.com/westcoselabs/gitpress-forms/blob/1bda708ca8e612a3eeef1cd3d8e85a297b0afbf3/docs/evidence/builder.png) |
| citryn-fight-club.webp | [Main menu artwork](https://github.com/westcoselabs/CITRYN-FIGHT-CLUB/blob/f09b389c620f27197af300eeccbb7fe6e72bfdcc/references/MainMenu.png) |
| doopify.webp | [Sample storefront product photograph](https://github.com/westcoselabs/doopify/blob/fa2b95a58a1b86f5f622d9486f30630f6468a9c5/public/images/product-large.jpg) |
| barber-refinery-desktop.webp / barber-refinery-mobile.webp | Actual [live website](https://barberrefinery.com/) captures at 1440 × 1000 and 390 × 844, September 21, 2026 |
| first-medical-associates-desktop.webp / first-medical-associates-mobile.webp | Actual [live website](https://drsfirst.com/) captures at 1440 × 1000 and 390 × 844, September 21, 2026 |
| trends-collision-desktop.webp / trends-collision-mobile.webp | Actual [redesign preview](https://trends-frontend-eight.vercel.app/) captures at 1440 × 1000 and 390 × 844, September 21, 2026 |
| simply-decorated.webp | [Original homepage artwork](https://decoratedbyriley.com/wp-content/uploads/2025/04/Simply-decorated-by-riley.webp), exported from the rendered website using the browser's page-assets capability |

These are actual project assets and captures, as requested, rather than generated
mockups. GitPress has no dedicated repository artwork; its graphic illustrates
GitHub-to-content publishing with Phosphor icons and typography, without claiming
to be a product screenshot. Phone and desktop preview controls switch between
separate real captures; they do not distort the desktop capture into a phone.

## Design and behavior

This is a visual overhaul within the existing OS identity: Manrope, IBM Plex
Mono, Phosphor, semantic theme tokens, and existing corner radii. Design variance
8, motion 4, density 5: a client-work preview stage, a thumbnail selector, a varied
project gallery, and a compact workbench directory. The phone layout stacks the
stage and copy, uses a two-column client selector, and offers an optional compact
list view. Search matches names, descriptions, categories, and technologies;
category filters compose with it. Empty results offer a reset.

Quick look uses a native modal dialog with a mobile sheet layout, a close action,
Escape handling, background scroll locking, and focus restoration. Previous/next
controls browse the filtered collection. Website projects offer device previews;
all projects retain detail routes and live/source actions. Private source links
are labeled. Motion only marks selection changes and hover affordances, with
system and in-app reduced-motion fallbacks. No game engine is loaded by the gallery.

Start menu results use a bounded grid track. Very short desktop viewports scroll
the entire menu to keep all actions reachable. Four invisible corner handles
support pointer capture and keyboard arrows (Shift for larger increments).
Resizing respects minimum dimensions, the workspace, and the opposite corner.

LOW TIDE LOOT keeps its 1280 by 720 simulation in either orientation. In portrait,
the HUD and touch controls use the space outside the canvas. Rotation pauses
the current run for an explicit Resume. The scavenger's visible feet (source
y=553 of 600) align with a shoreline deck shared by the winch and crane.
Physics, loot distribution, and save formats are unchanged.

## Earlier shell and game verification

- Lint, TypeScript, and production build pass; all 198 unit/component tests pass.
- 48 production browser checks pass across desktop Chromium and Pixel 7
  emulation, including all four resize corners, short Start menus, filters,
  navigation, rotation, game loading/errors, and complete timed shop/save/retry
  flows. Two desktop-only corner/menu checks are skipped in the mobile project.
- 22 further checks pass for the affected visual baselines and accessibility
  in Dusk, WestCose 95, and Liquid Glass. Desktop and Pocket screenshots were
  reviewed, including portrait and landscape gameplay.
- The final short-landscape character adjustment was checked again at small
  landscape and portrait sizes. Physical phone browsers were not tested.

## Client-project showcase verification

- Production build, lint, and TypeScript pass. All 199 unit/component tests pass.
- 14 targeted browser checks pass in desktop Chromium and Pixel 7 emulation;
  two desktop-only shell checks are intentionally skipped in the mobile project.
  Coverage includes all 14 entries, composed search and filters, empty results,
  gallery/list switching, desktop/mobile captures, quick-look navigation, Escape,
  focus restoration, scroll restoration, private repository labels, the source
  link for featured GitPress, the website-only Riley detail page, and existing
  four-corner resize and Start menu containment.
- Ten affected screenshot baselines were refreshed. Dusk, WestCose 95, and
  Liquid Glass layouts were inspected, along with collection and quick-look
  screenshots at 1440 × 900 and 375 × 667. Automated accessibility checks pass
  for the showcase in all three themes and for the quick-look dialog in Dusk.
- Screenshots are dated captures, not live embeds. Physical phones were not
  available; responsive and touch behavior was checked in browser emulation.
