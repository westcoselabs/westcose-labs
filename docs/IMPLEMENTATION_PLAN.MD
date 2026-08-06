WestCose Labs OS — Repository Inspection and Implementation Plan
1. Executive Summary
WestCose Labs OS will be one Next.js website with one route and content model rendered through three presentation shells:
Desktop OS for pointer-oriented desktop interaction.
Pocket OS for touch-oriented phones and tablets.
Normal View for conventional, low-effect, accessible navigation.
The repository is a stock Next.js starter plus approved design documentation. Implementation should proceed in 13 gated phases, beginning with tokens, semantic routes, and shared content before adding window management or mobile gestures.
Decisions locked by this plan:
Mobile deep links bypass startup and lock, open the requested app immediately, and mark that session unlocked.
Pocket Page Two initially contains FightClub, Recycle, and verified active social shortcuts only.
Desktop Contact uses a compose interface that hands off through mailto:; no backend or stored submissions.
Desktop V1 supports one route-backed portfolio window plus coexisting lightweight utility windows.
Dusk is the only complete decorative theme in V1; high contrast and reduced effects are accessibility modes, not additional themes.
FightClub V1 is a launcher and project presentation. The game engine is a separate lazy boundary and is not part of the initial bundle.
Normal View uses the existing pathname with ?view=normal; /normal is only a compatibility redirect.
2. Current Repository Audit
Area	Confirmed state
Framework	Next.js 16.3.0, App Router
UI	React and React DOM 19.2.8
Language	TypeScript 5.9.3, strict: true, noEmit: true
Runtime tooling	Node 22.20.0, npm 10.9.3
Source layout	src/app is enabled; only / exists
Styling	Stock global CSS and one CSS Module
Icons	@phosphor-icons/react 2.1.10 is installed but unused
Scripts	dev, build, start, and lint only
App Router files	Stock layout.tsx, page.tsx, globals.css, page.module.css, and favicon
Metadata/fonts	Stock Create Next App metadata and Geist fonts
Public assets	Five stock Next/Vercel SVG files
Tailwind	Not installed or configured
React Compiler	Not enabled and its plugin is absent
Turbopack	Implicitly active for next dev and next build in Next 16
Tests	No runner, configuration, scripts, or tests
Hosting	No .openai/hosting.json; normal Vercel deployment applies
Baseline quality	Current stock source passes npm run lint
Git	master at the initial Create Next App commit; no remote
Working tree	User-owned changes: deleted CLAUDE.md, modified package files, and untracked design/docs/prompt files
Dependency health	Two extraneous optional packages are present; normalize during the first authorized install


Everything under src/app, public, and the root starter configuration remains stock. The custom work consists of [DESIGN.md](D:/westcose-labs/DESIGN.md), the documents under docs, the desktop mockup, the planning prompt, and the Phosphor dependency.
The implementation must preserve the dirty working tree and must not reset, overwrite, or silently commit the existing user changes.
3. Documentation-Derived Project Understanding
WestCose Labs OS is a professional portfolio presented as a fictional product family from an alternate 2009:
Desktop OS is a personal creative workstation with wallpaper, files, windows, utilities, taskbar, and restrained personality.
Pocket OS is its touch-first companion with startup, lock screen, exactly two home pages, a fixed home-screen dock, and one full-screen app at a time.
Normal View is the same portfolio content in semantic document flow without OS interaction requirements.
The route selects the active content; the shell selects its presentation. For example, /projects/estate-sales-bakersfield renders the same project content inside a desktop window, a Pocket full-screen app, or a conventional article.
The visual source of truth is the YAML front matter and body of [DESIGN.md](D:/westcose-labs/DESIGN.md). The design is Retro Soft-Tech Neumorphism: matte graphite, fixed upper-left lighting, lower-right shadows, restrained system blue, photographic wallpaper, sparse chrome, and custom icon art. It must not become a SaaS dashboard, cyberpunk launcher, glassmorphism template, or direct OS clone.
Confirmed documentation conflicts and resolutions:
YAML declares primary-pressed: #3269B3; the prose later says #377BCC. Use #3269B3 because the requested hierarchy makes YAML normative.
The architecture’s CSS examples use different surface colors and 80px/84px taskbar/dock heights. Use DESIGN values: #2A2F39, #181B21, 72px, and 88px.
Pocket Page Two lists Arcade, TV, World, and Archive, while the V1 section defers them. Per the selected scope, omit those icons until the apps are functional.
TV appears in desktop mockups and example launch lists but is explicitly post-V1. It is not a V1 icon, taskbar item, route, or README action.
The architecture requires a theme system while the creative briefs defer multiple themes. Build the token/theme engine with Dusk only.
/normal appears inconsistently in the route diagrams. Preserve each content pathname and use ?view=normal; redirect /normal to /?view=normal.
Desktop Contact describes a real form while V1 forbids stored submissions and names no delivery provider. Use a clearly labeled native email handoff and never claim the message was sent.
The visual mockup shows three right-side widgets while the written rules allow one or two. V1 uses one clock/date widget and a compact README window.
True multi-route windows conflict with a single route-backed Server Component tree. V1 uses one route content window plus lightweight utility windows.
Database and storage decisions are final: curated content and design assets remain in the repository; no database, authentication, CMS, Blob storage, or runtime uploads are needed.
4. Confirmed V1 Scope
Shared foundation:
Next.js App Router, strict TypeScript, CSS custom properties, vanilla CSS, and CSS Modules.
Local MDX case studies plus typed app, project, route, placement, notification, and site registries.
Server-rendered, indexable route content with route metadata and canonical URLs.
Dusk theme infrastructure, reduced motion, high contrast, sound preference, and Normal View.
Local wallpapers, custom app icons, project images, small sounds, and Open Graph assets.
Unit, component, end-to-end, accessibility, and visual-regression coverage.
Desktop OS:
Photographic wallpaper with significant empty space.
Nine primary destinations plus README: Projects, Games, Experiments, About, Contact, FightClub.exe, Terminal, GitHub, Recycle Bin, and README.
Services and Settings in Start rather than crowding the desktop.
Compact first-session README window and one clock/date widget.
One route-backed content window plus lightweight README, Terminal, and Settings utility windows.
Bounded drag/resize, minimize, maximize/restore, close, focus/z-order, and useful snap positions.
Taskbar, Start menu, registry search, running indicators, context menus, theme/sound controls, clock/date, and Normal View control.
Keyboard and menu alternatives for double-click, drag, resize, and context-menu interactions.
Basic safe Easter eggs.
Pocket OS:
Root-only startup sequence, lock screen, slide/tap unlock, and one or two dismissible notifications.
Exactly two non-vertically-scrolling home pages.
Featured Project and Labs Status widgets.
Page One apps: Experiments, Services, About, GitHub, Notes, Settings.
Page Two apps: FightClub, Recycle, and only verified active social shortcuts.
Home-only dock: Projects, Games, Messages, Phone.
Full-screen apps, sticky visible Back control, real browser routes, internal scrolling, and correct home-page restoration.
Native sms:+16127417277 and tel:+16127417277 actions.
Visual Viewport, safe-area, browser-toolbar, orientation, and standalone-display accommodation.
Long-press menus with visible alternatives; no feature depends on long press.
Normal View:
Conventional responsive header/navigation, skip link, main landmarks, project grid, app indexes, case studies, contact actions, and footer.
Same content, color tokens, typography, imagery, and routes.
Reduced neumorphic depth and no startup, lock, desktop icons, windows, or home paging.
Discoverable from every OS shell and retained as a user preference.
5. Explicit V1 Exclusions
Do not build or install infrastructure for:
Database, Prisma, Postgres, migrations, authentication, accounts, CMS, admin tools, or cloud sync.
Vercel Blob, runtime uploads, or stored contact submissions.
Online FightClub scores, achievements, or saved game progress.
FightClub game engine unless a verified existing build is supplied separately.
TV, Arcade, World, Archive, media player, browser parody, or full Three.js experience.
Multiple decorative themes, wallpaper browser, hidden themes, or saved desktop layouts.
True simultaneous live rendering of several route-backed projects/apps.
Mobile Terminal, Browser, Media Player, File Explorer, voice assistant, fake permissions, or fake status bar.
More than two Pocket home pages, swipe-up-to-home, vertical home/lock scrolling, or mobile windows.
Redux, Zustand, drag/resize packages, Tailwind, Bootstrap, component frameworks, generic neumorphism libraries, or large animation libraries.
PWA installability, service worker, offline cache, or push notifications.
Inert “Coming Soon” icons for deferred apps.
6. Repository Gap Analysis
Category	State
Already present	Next/React/TypeScript toolchain, App Router root, strict mode, @/* alias, ESLint, npm lockfile, Phosphor icons, approved documentation, desktop mockup
Present but stock	Root layout/page, metadata, Geist fonts, global and module CSS, favicon, public SVGs, README, empty Next config
Missing for foundation	Project metadata, fonts, global token/theme CSS, surface primitives, MDX configuration, route map, app/project registries, site config, shell resolver, providers/reducers, storage utilities, Normal fallback, tests
Missing later in V1	Desktop shell/window manager/taskbar/Start/context menus, Pocket startup/lock/home/dock/apps, shared application UIs, Contact handoff, FightClub launcher, Easter eggs, local production assets, metadata/OG/sitemap/robots
Optional after V1	TV, Arcade, World, extra themes/wallpapers, persistent desktop layout, expanded long-press menus, additional socials/widgets, game engine, large media
Explicitly unnecessary	Database/auth/CMS/Blob, backend contact persistence, global state library, generic UI framework, drag library, animation framework
Accessibility gaps	No skip link, semantic shell handling, focus management, high contrast, reduced motion, gesture alternatives, touch-target validation, route-change announcements
Performance gaps	No budgets, shell splitting, optimized wallpaper/icons, heavy-boundary assertions, route-level loading, bundle analysis, or Web Vitals verification
Testing gaps	No scripts, unit/component/E2E tools, browser matrix, a11y automation, or visual baselines


The stock public SVGs, metadata, Geist setup, and starter page should be removed only when their project-specific replacements exist.
7. Proposed Repository Structure
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── normal/page.tsx
│   ├── projects/page.tsx
│   ├── projects/[slug]/page.tsx
│   ├── games/page.tsx
│   ├── games/fightclub/page.tsx
│   ├── experiments/page.tsx
│   ├── experiments/[slug]/page.tsx
│   ├── services/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── notes/page.tsx
│   ├── settings/page.tsx
│   ├── recycle/page.tsx
│   ├── terminal/page.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── os/
│   ├── desktop/
│   ├── pocket/
│   ├── normal/
│   ├── apps/
│   ├── ui/
│   │   └── surfaces/
│   └── icons/
│       ├── system/
│       └── app/
├── content/
│   ├── projects/
│   ├── notes/
│   └── recycle/
├── registry/
│   ├── apps.ts
│   ├── projects.ts
│   ├── placements.ts
│   ├── notifications.ts
│   └── site.ts
├── state/
├── hooks/
├── lib/
├── styles/
├── assets/
└── mdx-components.tsx

public/
├── images/projects/
├── icons/apps/
├── sounds/
└── og/

tests/
├── unit/
├── component/
├── e2e/
└── visual/

docs/
└── existing approved project documentation
Directory lifecycle:
Directory	Purpose and permitted contents	Must not contain	Create
src/app	Public routes, layouts, metadata, loading/error/not-found boundaries	Window state, content duplication, large client controllers	Foundation
components/os	Shell resolution, shared providers, one route viewport, shell-level accessibility	Project copy or shell-specific geometry	Foundation
components/desktop	Desktop chrome, windowing, taskbar, menus, icons, widgets	Pocket behavior or case-study source content	First desktop feature
components/pocket	Startup, lock, home carousel, dock, app frame, menus	Desktop windows or generic route content	First Pocket feature
components/normal	Conventional navigation and low-depth document framing	Duplicated project data	Normal View phase
components/apps	App-specific presentation shared where practical	Route truth or global shell state	As each app is built
components/ui	Surface primitives and small semantic controls	Business content or arbitrary raw design values	Design foundation
content	MDX case studies, notes, and Recycle content	Metadata duplicated from registries	Route/content phase
registry	Typed source of truth for apps, projects, placement, links, and static notifications	React state, browser APIs, or component instances	Route/content phase
state	Separate desktop, Pocket, and preference reducers	Route content or browser side effects	Shell/state phase
hooks	Focused browser hooks for media, viewport, storage, long press	Shared business data	When first consumed
lib	Pure route, metadata, URI, storage, bounds, and asset helpers	React components	Foundation
styles	Reset, tokens, themes, typography, material, motion, accessibility	Component-specific layout	Design foundation
src/assets	Critical statically imported wallpaper/icon artwork	Large galleries or runtime media	When approved assets arrive
public subfolders	Registry-addressed galleries, OG images, app art, small sounds	Unreviewed source files or large video	As assets arrive
tests	Cross-feature verification grouped by level	Production code	Phase 0
docs	Approved creative and architecture sources	Generated build output	Already present


Do not pre-create empty TV, World, Arcade, database, API, upload, or authentication folders.
8. Server and Client Component Boundaries
Server Components:
Root layout, route pages, metadata, project indexes, MDX case studies, services, About, Notes content, Recycle content, and Normal View document content.
Dynamic route params are treated as promises, as required by installed Next 16 documentation.
Project and experiment pages use registry-backed generateStaticParams, generateMetadata, and notFound.
Server-rendered route content is passed into the shell as children; client shells must never import MDX or server content modules.
Client Components:
Shell controller and providers.
Desktop reducer, pointer interactions, window manager, taskbar, menus, search, focus restoration, and sound.
Pocket startup/unlock, viewport measurements, home paging, app launch/close, long press, notification dismissal, and native URI actions.
Preference and session storage hydration.
Small interactive controls such as toggles and slide-to-unlock.
Shell boot strategy:
Server HTML defaults to a semantic Normal View representation so content remains accessible without JavaScript.
A small pre-paint bootstrap reads view, guarded storage, and matchMedia, then sets data-shell on <html>.
Shell markup contains one route-content slot. Desktop window chrome, Pocket app chrome, and Normal document framing are shown around that slot through the resolved shell; route content is never duplicated.
Inactive shell chrome is hidden, inert, and aria-hidden after hydration.
The bootstrap must be deterministic, guarded against unavailable storage, and produce no hydration warning.
Avoid headers() or user-agent server sniffing so content routes can remain statically generated.
Heavy client experiences are dynamically imported from a Client Component. Any future ssr: false boundary must live inside that client wrapper, matching Next 16’s installed lazy-loading guidance.
9. Routing and Shell Architecture
Canonical route model
Route	Content	Shell availability
/	Desktop, Pocket entry flow, or Normal landing	All
/projects	Project index	All
/projects/[slug]	Shared project case study	All
/games	Game library	All
/games/fightclub	FightClub launcher	All
/experiments	Experiment index	All
/experiments/[slug]	Experiment detail when content exists	All
/services	Capabilities	All
/about	About/system information	All
/contact	Mail compose/contact actions	Desktop and Normal; route-level Normal fallback on Pocket
/notes	README and notes	All
/settings	Real preferences and restrained fictional settings	All
/recycle	Nonessential archive/personality content	All
/terminal	Basic command utility	Desktop and Normal; route-level Normal fallback on Pocket
/normal	Compatibility redirect to /?view=normal	Redirect only


TV, World, Arcade, and Archive routes are not created in V1.
Shell selection precedence
?view=normal forces Normal View for the current URL.
?view=os forces automatic OS selection.
Stored display preference applies when no query override exists.
Automatic Pocket selection applies below 768px, or below 1024px when the primary pointer is coarse.
Desktop applies otherwise.
Routes unsupported by the resolved shell receive a route-scoped Normal fallback without changing the stored preference.
No JavaScript falls back to Normal View.
Normal View links preserve view=normal. Canonical metadata always points to the pathname without presentation query parameters.
Desktop routing behavior
Launching a primary app calls router.push(); the route effect opens or replaces the single route-backed content window.
Lightweight README, Terminal, and Settings utility windows may coexist in client state.
Opening a second primary route reuses the route window rather than trying to retain two live Server Component trees.
Minimize retains the route identifier in reducer state and navigates home; restore pushes that route again.
Close navigates home and removes the relevant window.
Browser Back/Forward drives the active route/window. Reducer actions do not independently invent route truth.
Refresh restores the current route and only the minimum relevant window state, not the previous full desktop layout.
Pocket routing behavior
A fresh direct non-root route bypasses startup/lock and initializes the session as unlocked.
Returning from that route to / opens the correct home page directly.
Launching from a home page records its origin page in Pocket state/session storage, then pushes the route.
Home-page swipes do not create browser-history entries.
Nested project Back goes to /projects; app-root Back returns to the stored origin page.
A fresh direct route without an origin uses the app registry’s default page: Page One for essentials and Page Two for FightClub, Recycle, and socials.
Browser Back matches the visible Back path for in-site navigation. On a true external deep-link entry, browser Back retains normal browser behavior while the visible control provides the safe in-site Home fallback.
The dock is hidden inside full-screen apps.
10. State and Persistence Architecture
State	Owner	Persistence
Active app/project/nested content	URL pathname	Browser history
Explicit presentation override	view=normal|os query	URL only
Desktop windows, z-order, geometry, minimized/maximized state, menus	Desktop reducer	Memory only in V1
Pocket startup, unlock, page, launch origin, long-press menu, dismissed lock notifications	Pocket reducer	Selected session fields
Theme, sound, extra reduced motion, high contrast, preferred view	Preferences reducer	Versioned local storage
System reduced-motion/contrast preferences	matchMedia	Never overwritten
README already shown, startup played, unlocked, Pocket home page	Session state	Versioned session storage
Route content, project data, contact submissions, identity, scores	Repository or future server	Never browser storage


Use versioned keys such as wcl.preferences.v1 and wcl.session.v1. Every read must handle malformed JSON, quota/security errors, and server rendering. Unknown versions reset safely. Settings exposes separate Reset Preferences and Reset Session actions.
Effective reduced motion is true when either the operating system requests it or the stored preference enables it. V1 must not provide a control that overrides a system request for reduced motion.
Desktop window geometry is clamped to the current viewport and reset after major viewport changes. Persistent icon/window placement remains post-V1.
11. Design-System Implementation
Global CSS responsibilities:
reset.css: predictable box sizing, inherited typography, media defaults, and focus-safe resets.
tokens.css: exact YAML colors, typography values, radii, spacing, dimensions, timing, and layer scale.
themes.css: Dusk mappings and semantic neumorphic variables.
typography.css: token classes and content typography.
neumorphism.css: the five surface primitives and state recipes.
motion.css: shared transform/opacity timings and reduced-motion overrides.
accessibility.css: high contrast, forced colors, focus, skip links, and reduced effects.
globals.css: imports and document-level layout only.
CSS Modules own component geometry, responsive layout, and local variants. They consume tokens and may not introduce unrelated raw colors, radii, spacing, or shadow colors.
Canonical values include:
Colors: #4F9CFF, #66AEFF, #3269B3, #45D3E6, #1C1F25, #242831, #2A2F39, #181B21, #20242C, #303A49, #E7E9EC, #F2F4F7, #A8AFBB, #7B8492, #07111F, #39404C, #15181E, #303641, #8CC2FF, #55C58A, #D99A43, and #EF5B5B.
Radii: 0, 6, 10, 14, 18, 22, 28, 36, and 999px.
Spacing: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, and 96px.
Desktop gutter 24px; Pocket gutter 16px; dock gap 12px.
Desktop icon 72px; taskbar 72px; Pocket icon 64px; Pocket dock 88px.
Minimum button/input/touch control 44px.
Fonts:
Load Manrope and IBM Plex Mono with next/font.
Expose font variables in the root layout.
Preserve Inter/system and platform monospace fallbacks.
Do not retain Geist in the product implementation.
Material primitives:
SurfaceRaised
SurfaceRecessed
SurfaceFloating
PressableSurface
ActiveSurface
They consume --neu-bg, --neu-shadow-dark, --neu-shadow-light, --neu-accent, and --neu-focus. Their public props permit semantic elements, selected/disabled state, and class composition, but not arbitrary color, radius, or shadow values.
Lighting and states:
Raised: upper-left light shadow, lower-right dark shadow, and one subtle inner highlight.
Recessed: dark inset lower-right relationship with the matching light inset.
Pressed: inset shadows plus a 1px downward translation.
Floating: larger soft dark shadow plus the same upper-left material highlight.
Hover applies only to hover-capable pointers and moves no more than 1–2px.
Focus retains depth and adds a visible #8CC2FF outline.
Selected uses surface-active and restrained blue.
Disabled flattens depth and reduces emphasis while remaining legible.
Strong depth affects no more than roughly one-third of visible elements.
No more than two elevated layers may be nested.
text-subdued is limited to recessed metadata because it does not meet normal-text AA on base or raised surfaces. Borders and shadows never serve as the sole state cue.
High contrast removes most shadow dependence, adds stronger structural outlines, enlarges focus to at least 3px, and supports forced-colors. Normal View uses the same tokens but restricts strong neumorphism to controls and selected cards.
A unit contract test should reject raw hex values, new box-shadow colors, and undocumented radii outside the global token/theme files.
12. Content and Asset Architecture
Typed interfaces
Contract	Required information
OSApp	Stable ID/name, desktop and Pocket labels, shell availability, icon reference, V1 status, default Pocket page, placement metadata, accessibility label, discriminated launch target
Launch target	Exactly one of internal route, external URL, SMS, telephone, or mail
Project	Slug, title, short description, confirmed status/category, technologies, cover/gallery assets, optional live/GitHub URLs, featured state, relations, publication date
RouteDescriptor	Path, route kind, app ID, shell availability, parent route, metadata source
SiteConfig	Site URL, owner name, confirmed email, documented phone, GitHub, and active social destinations
Preferences	Dusk theme ID, sound enabled, extra reduced motion, high contrast, display preference
DesktopWindow	Stable ID, route/utility kind, title, rectangle, restore rectangle, status, z-order
PocketState	Startup/unlock flags, page 0|1, origin page, menu target, dismissed notifications


Use discriminated launch targets instead of loosely related optional fields. Registries use satisfies and unit validation to prevent duplicate IDs/routes, missing labels, unavailable placements, invalid phone/URL values, or deferred apps leaking into V1.
Content model:
Project metadata lives once in the project registry.
Case-study prose lives once in MDX.
A server-only explicit import map connects each approved slug to its MDX module.
generateStaticParams and metadata use the same registry.
The initial architecture slice uses estate-sales-bakersfield only after its real status, copy, and assets are confirmed; documentation examples must not be treated as production facts.
Notes and Recycle content remain local, static, and nonessential.
Assets:
Critical Dusk desktop and portrait wallpapers are statically imported.
Project galleries and registry-addressed artwork live under public/images.
System controls use the existing Phosphor family through local wrappers with one stroke policy.
Primary WestCose app icons must be custom local vector or optimized raster assets; Phosphor placeholders are not production acceptance.
The desktop mockup is a visual reference, not a runtime wallpaper or production screenshot.
Use AVIF/WebP where suitable, explicit dimensions/aspect ratios, and descriptive alt text.
Audio remains local, small, off by default, and loaded after user interaction.
No remote image dependency or runtime asset store is introduced.
Before production acceptance, the owner must provide or approve: contact email, site URL, GitHub/social URLs, project facts/copy, desktop and portrait wallpaper, custom app icons, project art, FightClub artwork/build status, and any sound assets.
13. Phased Implementation Plan
Phase 0 — Repository Verification and Cleanup
Objective and work: Preserve the dirty tree, document existing ownership, replace stock files only when successors exist, normalize the dependency tree during the authorized install, and add typecheck, unit-test, E2E, and CI-oriented scripts.
Boundaries/dependencies: Add the testing toolchain only; retain Next 16, React 19, npm, App Router, Turbopack, strict TypeScript, and Phosphor. Do not enable React Compiler or Tailwind.
Verification: Run dependency validation, lint, typecheck, unit smoke test, and production build. Confirm no remote is created and existing documentation remains unchanged.
Done/deferred: Tooling is reproducible, extraneous packages are gone, and all starter assumptions are catalogued. No product UI exists yet.
Phase 1 — Design-System Foundation
Objective and work: Add all global style layers, Manrope/IBM Plex Mono, exact Dusk tokens, layer/timing scales, surface primitives, semantic buttons/icon buttons, and a development-only material fixture.
Boundaries/dependencies: Root layout remains Server; interactive controls are narrow client leaves. Native CSS only.
Verification: Token contract tests, state/focus component tests, contrast checks, reduced-motion/forced-colors checks, and visual review at dark and high-contrast settings.
Done/deferred: Every later component can be built without raw design values. Alternate decorative themes and production app art remain deferred.
Phase 2 — Route and Content Foundation
Objective and work: Configure MDX, create mdx-components.tsx, route/site/project/app registries, shared RouteDocument components, the full V1 route skeleton, 404 behavior, canonical metadata, and one confirmed project case study.
Boundaries/dependencies: Route pages and MDX remain Server Components. Add only the official Next MDX packages.
Verification: Registry validation, static-param tests, metadata tests, unknown-slug behavior, semantic-heading tests, direct route build output, and E2E coverage for async Server Components.
Done/deferred: Every V1 pathname works as an ordinary semantic website before OS interaction is added. Deferred routes do not exist.
Phase 3 — Shell Selection and Shared OS State
Objective and work: Build the pre-paint resolver, stable shell frame, single route viewport, Desktop/Pocket/Preference providers, reducers, versioned storage, query override, /normal redirect, route availability fallback, and reset behavior.
Boundaries/dependencies: Client shell/provider boundaries receive server-rendered children. No MDX or route registry implementation is pulled into the client graph beyond serializable descriptors.
Verification: Shell-precedence matrix, storage corruption/version tests, resize/pointer media tests, no-JS Normal fallback, no hydration warnings, and canonical-query tests.
Done/deferred: One route changes presentation correctly across all three modes. Full desktop and Pocket chrome remain placeholders.
Phase 4 — Desktop Shell Foundation
Objective and work: Add approved wallpaper, sparse icon grid, ten-item V1 desktop placement, one clock/date widget, compact first-session README, and basic taskbar silhouette.
Boundaries/dependencies: Registry and initial wallpaper data remain server-safe; icon selection and README dismissal are client interactions.
Verification: Desktop at 1024, 1440, and 1920px; keyboard selection/Open; single-click versus double-click; visible wallpaper; icon labels; focus order; image loading and CLS.
Done/deferred: The desktop is recognizable and navigable with a static route frame. Dragging, resizing, Start, search, and full taskbar behavior wait for Phase 5.
Phase 5 — Desktop Window and Taskbar System
Objective and work: Implement the one-route-window model, utility windows, reducer actions, pointer-captured drag/resize, bounds recovery, snap presets, min/max/restore/close, taskbar, Start menu, registry search, running indicators, context menus, sound/Normal controls, and focus restoration.
Boundaries/dependencies: No drag or animation library. During pointer movement, update CSS transform/size through requestAnimationFrame; commit final geometry to the reducer on pointer release.
Verification: Reducer invariants, geometry helpers, pointer and keyboard tests, browser history, minimized restore, viewport resize, taskbar state, menu escape/focus return, and no frame-long React rerender loop.
Done/deferred: Several utility windows may coexist, but only one route-backed portfolio window is live. Persistent geometry and true multi-route windows remain deferred.
Phase 6 — Pocket Viewport, Startup, and Lock Screen
Objective and work: Add dynamic viewport CSS, guarded Visual Viewport synchronization, safe-area variables, portrait/landscape layouts, root-only startup, static notifications, slide/tap unlock, and session initialization for direct routes.
Boundaries/dependencies: Browser measurement and unlock are client-only. Visual viewport updates are throttled through one animation frame and written to CSS variables rather than continuous React state.
Verification: iOS/WebKit toolbar expansion, rotation, standalone display mode, small-height layout, once-per-session startup, reduced-motion skip, slide reset/threshold, tap alternative, dismissible notifications, and zero system-screen vertical scroll.
Done/deferred: Lock and direct-route behavior are complete. Home pages and dock wait for Phase 7.
Phase 7 — Pocket Home Pages and Dock
Objective and work: Build exactly two CSS scroll-snap pages, widgets, four-column icon grid, page indicators, origin-page session state, fixed dock, home-only visibility, app expansion/close transitions, and basic accessible long-press menus.
Boundaries/dependencies: Use native horizontal scrolling and scroll snapping; no gesture library. Dot controls are at least 44px targets and scroll instantly under reduced motion.
Verification: Page count/content contract, swipe/dot navigation, page restoration, dock safe-area offset calc(env(safe-area-inset-bottom) + 12px), system-edge gesture compatibility, landscape composition, large touch targets, and no deferred Page Two apps.
Done/deferred: Page One, Page Two, and dock match the locked V1 registry. App rearrangement, saved cross-session page, expanded menus, and optional icons remain deferred.
Phase 8 — Shared Applications and Project Content
Objective and work: Complete Projects, Games, Experiments, Services, About, Contact, Notes, Settings, Recycle, Terminal, GitHub, social, Messages, and Phone presentation using shared registries/content.
Boundaries/dependencies: Content-heavy views remain Server Components; filters, compose form, Terminal commands, Settings, copy actions, and native URI actions are client leaves.
Verification: Every app’s three-shell rendering, mailto field encoding and validation, no false “sent” confirmation, SMS/tel hrefs, external-link treatment, copy fallbacks, app availability, route metadata, and content parity.
Done/deferred: All required V1 information and contact paths work. Final acceptance waits on real site/contact/social/project data.
Phase 9 — Normal View
Objective and work: Finish conventional navigation, skip link, route headings, project index/case study flow, contact actions, footer, shell switch controls, and reduced-depth component variants.
Boundaries/dependencies: Mostly Server Components; only menu and preference controls require client code.
Verification: No OS-only gate, complete keyboard navigation, ?view=normal persistence, /normal redirect, canonical URLs, direct routes, 200% zoom, screen-reader landmarks, and conventional browser scrolling.
Done/deferred: Normal View exposes all essential portfolio content without OS interactions and does not duplicate content sources.
Phase 10 — FightClub Launcher and Heavy-Experience Boundaries
Objective and work: Build /games/fightclub as a polished launcher with confirmed artwork, status, controls, development notes, and a future GameMount boundary.
Boundaries/dependencies: Launcher content is server-rendered; an actual game mount is a client dynamic import activated only by Play. Do not install a game engine preemptively.
Verification: No game/Three/video request on root or game index, accessible Play/exit states, disabled/unavailable language when no build exists, full-screen escape, and reduced motion.
Done/deferred: The launcher is production-ready. The engine, online scores, and game persistence remain separate future work.
Phase 11 — Easter Eggs and Personality
Objective and work: Add a small set only: one hidden Terminal command, several joke Recycle files, and one dismissible “Do not open” interaction. Add approved local sound feedback, default off, after a user gesture.
Boundaries/dependencies: Personality content comes from registries; session-only discoveries use session storage.
Verification: Nothing essential is hidden, every experience exits cleanly, no deceptive malware imitation, no loud autoplay, and reduced-motion/sound settings are honored.
Done/deferred: Humor supports the product without expanding navigation. Hidden themes, achievements, moving icons, and complex update screens remain deferred.
Phase 12 — Testing, Accessibility, Performance, and Production Readiness
Objective and work: Complete automated and manual test matrices, screenshots, asset optimization, loading/error states, sitemap/robots, OG assets, security review, browser coverage, and Vercel preview/production configuration.
Boundaries/dependencies: Add no runtime infrastructure unless testing demonstrates a real gap. Use production builds for E2E.
Verification: Lint, typecheck, unit/component tests, three-browser Playwright, automated a11y, manual keyboard/touch/screen-reader passes, performance budgets, and deferred-network assertions.
Done/deferred: Every definition of done below passes on a clean install and production build. Database, large media hosting, analytics, and future apps remain outside V1.
14. First Implementation Milestone
The smallest architecture-proving milestone is a vertical slice, not a miniature full OS.
Exact checklist:

Preserve and inventory the existing dirty tree.

Add lint/typecheck/unit/E2E scripts and baseline configuration.

Configure Manrope and IBM Plex Mono.

Implement exact Dusk colors, typography, spacing, radii, dimensions, and shadow variables.

Implement SurfaceRaised, SurfaceRecessed, and PressableSurface.

Add high-contrast, focus, and reduced-motion foundations.

Configure MDX and create the typed site/app/project registries.

Add /projects and one confirmed /projects/estate-sales-bakersfield case study.

Add route metadata, canonical URL, static params, and unknown-slug behavior.

Implement deterministic Desktop/Pocket/Normal shell resolution.

Implement ?view=normal, ?view=os, and /normal redirect behavior.

Add an approved desktop Dusk wallpaper and one custom Projects icon.

Render a sparse desktop, one non-draggable route window frame, and taskbar placeholder.

Add Pocket visual-viewport sizing and a basic fixed lock-screen composition.

Render direct project routes as immediate Pocket full-screen apps, bypassing lock.

Render the same project content conventionally in Normal View.

Add unit tests for tokens, registries, routes, and shell precedence.

Add E2E tests for desktop, phone, Normal View, direct route, refresh, and query overrides.

Verify keyboard focus, 44px touch targets, reduced motion, no hydration warnings, and no unexpected scroll.

Confirm no FightClub engine, TV, World, full window manager, game dependency, database, or animation package enters the bundle.
Milestone acceptance: the same server-rendered project content must work at one pathname in all three presentation modes, with project-specific typography/materials and no duplicated content implementation.
15. Dependency Recommendations
Keep
Package	Reason
Next/React/React DOM	Approved framework and current installed runtime
TypeScript and Next ESLint config	Strict typing and existing quality baseline
@phosphor-icons/react	Suitable for consistent generic system controls; not primary app artwork


Add when required
Packages	Phase	Why browser/native APIs are insufficient	Bundle impact
@next/mdx, @mdx-js/loader, @mdx-js/react	2	Next needs a compiler integration for local MDX imports	Build/content processing; no large interactive runtime
@types/mdx	2	Type declarations for imported MDX	Development only
vitest, @vitejs/plugin-react, jsdom, Testing Library, vite-tsconfig-paths	0	Reducers/components need deterministic unit and DOM tests	Development only
Testing Library user-event and jest-dom matchers	0	Realistic keyboard/pointer semantics and readable assertions	Development only
@playwright/test	0	Real history, WebKit viewport, pointer, and browser behavior cannot be validated in jsdom	Development/CI only
@axe-core/playwright	12	Automated route-level accessibility checks supplement manual review	Development/CI only


Do not add Redux/Zustand, a drag/resize library, Motion/GSAP, Tailwind, Bootstrap, shadcn, a generic design system, a database client, authentication, Three.js, video-player dependencies, or a search library in V1. Registry search is small enough for native array filtering.
React Compiler remains off until profiling identifies a concrete benefit. Turbopack remains the default with no customization unless MDX or build evidence requires it.
16. Testing Strategy
Required commands:
Lint.
Typecheck without emit.
Unit/component tests in watch and single-run modes.
Production build.
Playwright against the production server.
Automated accessibility pass.
Unit coverage:
Desktop, Pocket, and Preferences reducers.
Window bounds, snapping, and viewport recovery.
Registry uniqueness, availability, placement, routes, and launch targets.
Project/content import mapping.
Route parent/back resolution.
Storage parsing, version reset, and failure handling.
SMS/tel/mail URI helpers.
Shell selection precedence.
Design-token contract and raw-value rejection.
Component coverage:
Surface, button, icon button, toggles, and focus states.
Desktop single/double-click and keyboard Open.
Window controls and menu alternatives.
Taskbar/Start/search behavior.
Lock notifications and slide/tap unlock.
Pocket indicators, dock, long-press cancellation, and visible alternatives.
Contact form validation and native handoff.
Route-change focus and announcement.
E2E coverage:
Desktop, Pocket, and Normal direct loads.
Refresh and Back/Forward for app indexes and nested projects.
Root-only startup/lock and deep-link bypass.
One content window plus coexisting utilities.
Minimize/restore/close.
Two Pocket pages and correct return page.
Dock hidden inside apps.
/contact and /terminal Pocket fallback.
SMS/tel exact URLs.
Normal preference/query/redirect behavior.
Reduced motion and high contrast.
No FightClub/TV/World/Three requests before launch.
Unknown route/slug and loading/error behavior.
No horizontal document overflow and no system-screen vertical scroll.
Playwright runs Chromium, Firefox, and WebKit. Async Server Components are covered in E2E because the installed Next guidance does not treat Vitest as sufficient for them.
Visual baselines cover desktop root, Pocket lock, both Pocket home pages, project route in each shell, and Normal project view. Freeze or mask clocks, dates, and dynamic notification text.
17. Accessibility Requirements
Semantic headings, landmarks, lists, links, buttons, fields, dialogs, and menus underneath the OS presentation.
Skip-to-content link in Normal View and an equivalent shell escape path.
Sequential keyboard order matching the visible composition.
Visible focus using outline plus depth; never glow or color alone.
44×44px minimum targets, with at least 8px separation where possible.
Enter/Space opens selected icons; a visible Open action replaces double-click dependence.
Shift+F10/Menu key and overflow buttons replace right-click and long-press dependence.
Window menus provide Center, Snap Left, Snap Right, Maximize, Restore, and Close so drag/resize is never the only way to recover content.
Tap-to-unlock sits beside slide-to-unlock semantically.
App Back remains visible and sticky; Escape closes desktop menus/dialogs/full-screen experiences.
Route changes focus the app/page heading and announce the new context politely.
Closing a menu/window returns focus to its trigger.
Native contact controls have descriptive labels and direct-link fallbacks.
Meaningful images have descriptive alt text; decorative texture/grain is ignored.
Status never relies solely on blue, red, or glow.
Body text meets WCAG AA; subdued text remains restricted to safe surfaces.
Reduced motion removes startup delay, smooth scrolling, window travel, parallax, app expansion, and nonessential animation.
High contrast reduces shadows and introduces explicit structural boundaries.
Browser zoom and text enlargement must not hide content or controls; full-screen apps may scroll, but lock/home screens use compact responsive layouts.
Normal View always remains reachable without completing startup, unlock, drag, long press, or an Easter egg.
18. Performance Requirements
Initial-load guardrails:
p75 LCP at or below 2.5s.
p75 INP at or below 200ms.
CLS at or below 0.1.
Initial compressed client JavaScript target at or below approximately 180KB for an OS entry route; increases require measured justification.
Desktop wallpaper target at or below 350KB; Pocket wallpaper at or below 250KB.
Project thumbnails at or below 150KB.
Primary app icons average at or below 30–40KB.
No deferred game, video, Three.js, gallery, or audio payload before explicit launch.
Implementation requirements:
Preload only the active wallpaper, critical fonts, and immediately visible icons.
Use next/image with correct sizes, dimensions, and priority only for true LCP imagery.
Lazy-load galleries and below-fold project art.
Animate transform and opacity, not layout properties.
Commit pointer geometry on release rather than rendering reducer updates for every pointer event.
Use native scroll snap for Pocket paging.
Avoid heavy blur, scrolling noise filters, and stacked shadows.
Keep providers narrow and never promote static route content into the client graph.
Use route-level loading states shaped like the final content.
Validate bundles and network requests on a production build.
Test current and previous major iOS Safari, current Android Chrome, and the latest two desktop browser releases.
19. Risks and Open Decisions
Resolved by this plan
Canonical pressed blue is #3269B3.
DESIGN tokens override illustrative architecture examples.
Mobile deep links bypass startup/lock.
Page Two omits deferred apps.
Contact is a native mail handoff.
Desktop uses one route-backed content window.
Normal View uses a query override and canonical pathname.
Dusk is the only complete V1 decorative theme.
TV, World, Arcade, Archive, and the FightClub engine remain deferred.
Inputs required before the affected phase can reach production acceptance
Confirm the documented phone number.
Supply the desktop contact email.
Supply production site, GitHub, and verified active social URLs.
Confirm the first project’s status, copy, technology list, live/GitHub links, and assets.
Approve desktop and portrait wallpaper, custom app icons, FightClub art, and optional sound effects.
Development fixtures may be clearly labeled, but they cannot ship as invented production facts.
Risks resolved during their implementation phase
Safari Visual Viewport and browser-toolbar movement.
Landscape and small-height Pocket layouts.
Route/reducer synchronization and history loops.
Window bounds, pointer capture cancellation, and resize recovery.
Dark-neumorphic contrast and forced-colors behavior.
Initial client bundle growth as both shell controllers mature.
MDX/Turbopack configuration.
Cross-platform native email/SMS behavior.
Focus management across windows, menus, routes, and app close.
Asset licensing and optimization.
Each receives explicit tests and a phase definition of done rather than speculative infrastructure.
Intentionally deferred risks
Multi-route desktop windows.
Online game state and leaderboards.
Large TV/World media hosting.
Additional themes and wallpaper persistence.
PWA/offline installation.
Runtime content editing and user accounts.
20. Recommended Immediate Next Action
Begin with Phase 0 and the first vertical-slice milestone on a dedicated codex/westcose-os-foundation branch, preserving all current user-owned changes and creating no remote.
Before Phase 2 content is marked complete, collect the contact/site/social configuration and confirm the Estate Sales Bakersfield facts. Before the visual slice is accepted, obtain one approved desktop wallpaper, one portrait wallpaper, and the first custom Projects icon.
The first implementation handoff should stop once one shared project route renders successfully through the basic Desktop, Pocket, and Normal shells. The full window manager, complete app set, FightClub launcher, and personality layer begin only after that architectural proof passes its tests.