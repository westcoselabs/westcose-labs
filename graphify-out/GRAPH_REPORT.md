# Graph Report - C:\Users\citry\OneDrive\Desktop\westcose-labs  (2026-08-05)

## Corpus Check
- 118 files · ~213,275 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 473 nodes · 974 edges · 27 communities (22 shown, 5 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e98dd61`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Pocket Shell Layer
- Root Layout and Normal Bridge
- Desktop Shell Layer
- Registry and Route Docs
- Package and Tooling
- Persistence and Session State
- Content and Utility Pages
- TypeScript Config
- Project Fixture Flow
- Icon and Glyph System
- Route Helpers
- Native URI Helpers
- Experiments and Notes
- Games and Services Pages
- Normal View QA
- Contact Composer
- Projects Index
- Recycle Route
- Design Token Tests
- Style Coverage Test
- ESLint Config
- Project Prompt

## God Nodes (most connected - your core abstractions)
1. `OSRoot()` - 22 edges
2. `createRouteMetadata()` - 18 edges
3. `RouteDocument()` - 17 edges
4. `compilerOptions` - 16 edges
5. `RouteSection()` - 14 edges
6. `scripts` - 12 edges
7. `Three-shell architecture` - 12 edges
8. `Dusk visual system` - 11 edges
9. `DesktopShell()` - 10 edges
10. `PocketAppItem` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Pocket OS direction` --informs--> `MailtoFields`  [INFERRED]
  docs/WESTCOSE_POCKET_OS_MOBILE_CREATIVE_DIRECTION.md → src/lib/native-uri.ts
- `DesktopShell()` --indirect_call--> `app()`  [INFERRED]
  src/components/desktop/DesktopShell.tsx → tests/component/pocket-home.test.tsx
- `PocketHome()` --indirect_call--> `app()`  [INFERRED]
  src/components/pocket/PocketHome.tsx → tests/component/pocket-home.test.tsx
- `generateMetadata()` --calls--> `createRouteMetadata()`  [EXTRACTED]
  src/app/experiments/[slug]/page.tsx → src/registry/metadata.ts
- `generateMetadata()` --calls--> `createRouteMetadata()`  [EXTRACTED]
  src/app/projects/[slug]/page.tsx → src/registry/metadata.ts

## Import Cycles
- None detected.

## Communities (27 total, 5 thin omitted)

### Community 0 - "Pocket Shell Layer"
Cohesion: 0.06
Nodes (47): Dusk visual system, Pocket shell mockup, Pocket OS direction, Pocket lock baseline, DoNotOpen(), PocketAppFrame(), PocketAppFrameProps, PocketAppMenu() (+39 more)

### Community 1 - "Root Layout and Normal Bridge"
Cohesion: 0.05
Nodes (43): nextConfig, withMDX, Next.js agent rules, Desktop wallpaper, Pocket wallpaper, ibmPlexMono, manrope, metadata (+35 more)

### Community 2 - "Desktop Shell Layer"
Cohesion: 0.07
Nodes (45): Desktop shell mockup, Desktop OS direction, DesktopShell(), DesktopShellProps, initialWorkspace, useDesktopClock(), DesktopWindow(), DesktopWindowProps (+37 more)

### Community 3 - "Registry and Route Docs"
Cohesion: 0.07
Nodes (30): V1 implementation plan, Three-shell architecture, Repo overview and setup, robots(), sitemap(), appsById, getAppByPath(), RegisteredApp (+22 more)

### Community 4 - "Package and Tooling"
Cohesion: 0.05
Nodes (41): dependencies, @mdx-js/loader, @mdx-js/react, next, @next/mdx, @phosphor-icons/react, react, react-dom (+33 more)

### Community 5 - "Persistence and Session State"
Cohesion: 0.15
Nodes (23): DEFAULT_SESSION, isDisplayPreference(), isPocketPage(), isRecord(), parsePreferencesStorage(), parseSessionStorage(), readEnvelopeData(), readPreferences() (+15 more)

### Community 6 - "Content and Utility Pages"
Cohesion: 0.12
Nodes (9): metadata, ErrorPageProps, metadata, metadata, metadata, RouteAction, RouteDocument(), RouteDocumentProps (+1 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Project Fixture Flow"
Cohesion: 0.19
Nodes (9): Estate Sales Bakersfield fixture, metadata, generateMetadata(), ProjectPage(), ProjectPageProps, DevelopmentFixture(), getProjectContent(), ProjectContentSlug (+1 more)

### Community 9 - "Icon and Glyph System"
Cohesion: 0.24
Nodes (7): Projects app icon, ProjectsAppIcon(), ProjectsAppIconProps, AppGlyph(), AppGlyphProps, PocketAppGlyph(), PocketAppGlyphProps

### Community 10 - "Route Helpers"
Cohesion: 0.42
Nodes (9): getRouteParent(), isPocketDirectRoute(), isPocketUnsupportedRoute(), isRootRoute(), NESTED_ROUTE_PARENTS, normalizePathname(), PocketBackTarget, resolvePocketBackTarget() (+1 more)

### Community 11 - "Native URI Helpers"
Cohesion: 0.44
Nodes (8): createMailtoHref(), createSmsHref(), createTelHref(), encodeQueryValue(), isValidEmailAddress(), MailtoFields, normalizePhoneNumber(), requireEmail()

### Community 12 - "Experiments and Notes"
Cohesion: 0.25
Nodes (4): ExperimentPageProps, generateMetadata(), metadata, createRouteMetadata()

### Community 13 - "Games and Services Pages"
Cohesion: 0.25
Nodes (4): metadata, capabilityAreas, metadata, RouteCardGrid()

### Community 14 - "Normal View QA"
Cohesion: 0.33
Nodes (4): Desktop visual baseline, Normal project baseline, navigation, NormalShellProps

### Community 15 - "Contact Composer"
Cohesion: 0.38
Nodes (3): metadata, ContactComposer(), ContactComposerProps

### Community 16 - "Projects Index"
Cohesion: 0.38
Nodes (4): metadata, formatProjectStatus(), ProjectCard(), RegisteredProject

## Knowledge Gaps
- **128 isolated node(s):** `eslintConfig`, `nextConfig`, `withMDX`, `name`, `version` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Three-shell architecture` connect `Registry and Route Docs` to `Pocket Shell Layer`, `Root Layout and Normal Bridge`, `Desktop Shell Layer`, `Content and Utility Pages`, `Project Fixture Flow`, `Route Helpers`, `Normal View QA`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `Dusk visual system` connect `Pocket Shell Layer` to `Root Layout and Normal Bridge`, `Desktop Shell Layer`, `Icon and Glyph System`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Pocket OS direction` connect `Pocket Shell Layer` to `Registry and Route Docs`, `Native URI Helpers`, `Contact Composer`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `OSRoot()` (e.g. with `createInitialPocketState()` and `pocketReducer()`) actually correct?**
  _`OSRoot()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `withMDX` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pocket Shell Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06220095693779904 - nodes in this community are weakly interconnected._
- **Should `Root Layout and Normal Bridge` be split into smaller, more focused modules?**
  _Cohesion score 0.05257936507936508 - nodes in this community are weakly interconnected._