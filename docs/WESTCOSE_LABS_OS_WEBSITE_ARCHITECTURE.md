# WestCose Labs OS — Website Architecture Plan

**Project:** WestCose Labs  
**Experiences:** WestCose Labs OS + WestCose Pocket OS  
**Document Type:** Technical Architecture Plan  
**Status:** Approved Initial Architecture  
**Hosting:** Vercel  
**Framework:** Next.js App Router  
**Language:** TypeScript  
**UI:** React  
**Styling:** Vanilla CSS, CSS Modules, CSS custom properties  
**Content:** Local MDX and typed TypeScript registries  
**Database:** Not required for V1  
**File Storage:** Local repository assets for V1; Vercel Blob only when needed

---

## 1. Architecture Goals

The website must support three related presentation modes while sharing the same project content and routes:

1. **WestCose Labs OS**
   - Desktop operating-system experience
   - Draggable windows
   - Desktop icons
   - Taskbar
   - Start menu
   - Context menus
   - Desktop-only utilities and Easter eggs

2. **WestCose Pocket OS**
   - Mobile operating-system experience
   - Lock screen
   - Two swipeable home pages
   - Fixed mobile dock
   - Full-screen apps
   - Visible back navigation
   - Native SMS and phone links

3. **Normal View**
   - Conventional accessible portfolio layout
   - Standard navigation
   - Standard page flow
   - Reduced visual effects
   - Direct access to all content without OS interactions

The architecture should make the experience feel experimental without making the codebase unnecessarily complex.

The main goals are:

- Share project content across desktop, mobile, and Normal View
- Keep routes indexable and shareable
- Keep the initial page fast
- Lazy-load games, video, and Three.js experiences
- Avoid a database until a real feature requires one
- Keep core visual assets versioned with the repository
- Use reusable operating-system and app components
- Preserve accessibility and browser-history behavior

---

## 2. Approved Technology Stack

```text
Framework:
Next.js App Router

UI:
React

Language:
TypeScript with strict mode

Styling:
Global vanilla CSS
CSS custom properties
CSS Modules

Content:
Local MDX files
Typed TypeScript registries

State:
Next.js routes
React Context
useReducer
localStorage and sessionStorage for preferences

Hosting:
Vercel

Database:
None for V1

File Storage:
Local repository assets for V1
Vercel Blob only for large or runtime-managed files

Testing:
Unit tests
Component tests
End-to-end tests
```

---

## 3. Why Next.js App Router

Next.js App Router is the foundation for both the operating-system shell and the underlying portfolio website.

It provides:

- Server-rendered content
- Static generation
- Dynamic routes
- Nested layouts
- Route-level metadata
- Image optimization
- Lazy loading
- Client and Server Component boundaries
- Direct Vercel integration
- Browser-history support
- Shareable project URLs
- Search-engine indexing

The site should behave like a real website underneath the operating-system interface.

A visitor should be able to directly open:

```text
/projects/estate-sales-bakersfield
```

without first navigating through the desktop or mobile home screen.

---

## 4. Core Architectural Principle

> **The route controls what content is active. The operating-system shell controls how that content is presented.**

Example:

```text
/projects/estate-sales-bakersfield
```

The same project route appears differently depending on the active shell.

### Desktop

The project opens inside a draggable window.

### Mobile

The project opens as a full-screen Pocket OS app.

### Normal View

The project opens as a conventional portfolio case-study page.

The project content should exist only once.

---

## 5. Shared Shell Architecture

The application should contain three presentation shells.

```text
DesktopShell
PocketShell
NormalShell
```

Conceptually:

```tsx
<OSRoot>
  <ActiveShell>
    {children}
  </ActiveShell>
</OSRoot>
```

The shell is selected based on:

- Viewport
- User preference
- Normal View setting
- Accessibility preferences
- Explicit query or route state if needed

### DesktopShell responsibilities

- Desktop wallpaper
- Desktop icons
- Window manager
- Taskbar
- Start menu
- Desktop widgets
- Context menus
- Theme switching
- Sound controls
- Desktop Easter eggs

### PocketShell responsibilities

- Startup screen
- Lock screen
- Slide-to-unlock
- Two home pages
- Page indicators
- Fixed mobile dock
- Full-screen apps
- Back navigation
- Long-press menus
- Mobile notifications
- Mobile Easter eggs

### NormalShell responsibilities

- Conventional navigation
- Standard page flow
- Accessible project browsing
- Reduced visual effects
- Direct section links
- Standard browser scrolling

---

## 6. Route Structure

Recommended route structure:

```text
/
├── projects
│   └── [slug]
├── games
│   └── fightclub
├── experiments
│   └── [slug]
├── services
├── about
├── notes
├── settings
├── recycle
├── tv
├── world
└── normal
```

Expanded:

```text
/
/projects
/projects/[slug]
/games
/games/fightclub
/experiments
/experiments/[slug]
/services
/about
/notes
/settings
/recycle
/tv
/world
```

### Route requirements

- Opening an app updates the URL
- Opening a project updates the URL
- Browser back restores the correct app or home screen
- Browser forward restores the next state
- Refresh reopens the active route
- Direct links work without prior OS navigation
- Shared routes include proper metadata
- Desktop and mobile render the same content in different shells
- Normal View uses the same route data

---

## 7. Server and Client Component Boundaries

Use Server Components by default.

Use Client Components only when browser interaction is required.

### Server Components

Use for:

- Project pages
- Project indexes
- Case-study content
- Services content
- About content
- Notes content
- Static experiment descriptions
- Metadata
- Structured project data
- Technology lists
- Screenshot galleries
- SEO content
- Open Graph data

### Client Components

Use for:

- Desktop window manager
- Window dragging
- Window resizing
- Window minimizing
- Taskbar
- Start menu
- Context menus
- Lock screen
- Slide-to-unlock
- Mobile page swiping
- Long-press menus
- Themes
- Sound controls
- Local storage
- Session storage
- App launch animations
- Game launchers
- Browser viewport handling

The operating-system shell may be a Client Component while the route content inside it remains server-rendered.

---

## 8. Styling Architecture

The project should use:

```text
Global CSS
+ CSS custom properties
+ CSS Modules
```

Tailwind is not required.

The custom interface needs precise control over:

- Neumorphic shadows
- Pressed states
- Raised states
- Recessed controls
- Window elevations
- Dock geometry
- Lock-screen layouts
- Responsive viewport behavior
- Theme variables
- Animation timing
- Layering
- Accessibility states

### Global style files

```text
src/styles/
├── reset.css
├── globals.css
├── tokens.css
├── themes.css
├── neumorphism.css
├── typography.css
├── motion.css
└── accessibility.css
```

### Component CSS Modules

Examples:

```text
DesktopIcon.module.css
WindowFrame.module.css
Taskbar.module.css
StartMenu.module.css
LockScreen.module.css
PocketDock.module.css
AppIcon.module.css
Widget.module.css
AppScreen.module.css
```

---

## 9. Design Tokens

Use CSS custom properties as the visual-system foundation.

Example:

```css
:root {
  --color-background: #1c1f25;
  --color-surface: #242831;
  --color-surface-raised: #292e38;
  --color-surface-recessed: #1e222a;

  --color-text: #f2f4f7;
  --color-text-muted: #a8afbb;
  --color-accent: #4f9cff;
  --color-alert: #ef5b5b;
  --color-warning: #d99a43;

  --shadow-light: rgba(255, 255, 255, 0.055);
  --shadow-dark: rgba(0, 0, 0, 0.55);
  --shadow-accent: rgba(79, 156, 255, 0.28);

  --radius-control: 0.875rem;
  --radius-icon: 1.25rem;
  --radius-panel: 1.5rem;
  --radius-window: 1.75rem;

  --desktop-taskbar-height: 5rem;
  --pocket-dock-height: 5.25rem;

  --motion-fast: 120ms;
  --motion-standard: 220ms;
  --motion-window: 320ms;
}
```

### Theme switching

Themes should change variables through a data attribute.

```html
<html data-theme="dusk">
```

Example:

```css
[data-theme="arcade-blue"] {
  --color-background: #171b26;
  --color-surface: #202636;
  --color-accent: #4ba8ff;
}
```

This supports:

- Dusk
- Graphite
- Soft Silver
- Arcade Blue
- Warm CRT
- Hidden themes

---

## 10. Reusable Component Layers

Organize components into four main layers.

### OS components

Shared system-level behavior:

```text
OSRoot
OSProvider
ShellSelector
NormalView
ThemeProvider
PreferenceProvider
```

### Desktop components

```text
DesktopShell
Desktop
DesktopIcon
DesktopWidget
WindowManager
WindowFrame
Taskbar
StartMenu
ContextMenu
DesktopSearch
```

### Pocket components

```text
PocketShell
StartupScreen
LockScreen
SlideToUnlock
HomeScreen
HomePage
PocketDock
AppIcon
PocketWidget
AppScreen
LongPressMenu
PageIndicator
```

### Shared UI primitives

```text
Button
IconButton
Toggle
Slider
SegmentedControl
Badge
Tooltip
Menu
Card
ProgressBar
Notification
```

The shared UI components should implement the neumorphic surface system consistently.

---

## 11. Central App Registry

Do not hardcode applications separately in:

- Desktop icons
- Pocket OS home pages
- Desktop taskbar
- Mobile dock
- Start menu
- Search results
- Accessibility navigation

Use one typed registry.

Example type:

```ts
export type OSApp = {
  id: string;
  name: string;
  desktopLabel: string;
  pocketLabel: string;
  route?: string;
  desktop: boolean;
  mobile: boolean;
  normalView: boolean;
  pinnedDesktop?: boolean;
  pinnedPocket?: boolean;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
  launchType: "route" | "external" | "sms" | "tel";
  externalUrl?: string;
  iconKey: string;
};
```

Example:

```ts
export const osApps: OSApp[] = [
  {
    id: "projects",
    name: "Projects",
    desktopLabel: "Projects",
    pocketLabel: "Projects",
    route: "/projects",
    desktop: true,
    mobile: true,
    normalView: true,
    pinnedDesktop: true,
    pinnedPocket: true,
    launchType: "route",
    iconKey: "projects",
  },
  {
    id: "terminal",
    name: "Terminal",
    desktopLabel: "Terminal",
    pocketLabel: "Terminal",
    route: "/terminal",
    desktop: true,
    mobile: false,
    normalView: false,
    desktopOnly: true,
    launchType: "route",
    iconKey: "terminal",
  },
  {
    id: "messages",
    name: "Messages",
    desktopLabel: "Messages",
    pocketLabel: "Messages",
    desktop: false,
    mobile: true,
    normalView: true,
    mobileOnly: true,
    pinnedPocket: true,
    launchType: "sms",
    iconKey: "messages",
  },
];
```

The app registry should power:

- Desktop icons
- Mobile app grids
- Desktop Start menu
- Desktop taskbar
- Pocket OS dock
- Search
- App launching
- Tooltips
- Accessibility labels

---

## 12. Project Content Architecture

A database is not required for V1.

Projects should be stored using:

```text
Typed TypeScript metadata
+ MDX case studies
```

### Project metadata

Example:

```ts
export type Project = {
  slug: string;
  title: string;
  shortDescription: string;
  status: "live" | "development" | "archived";
  category: "software" | "website" | "game" | "experiment";
  technologies: string[];
  coverImage: string;
  gallery: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  relatedProjects?: string[];
  publishedAt?: string;
};
```

Example project:

```ts
export const projects: Project[] = [
  {
    slug: "estate-sales-bakersfield",
    title: "Estate Sales Bakersfield",
    shortDescription:
      "A local estate-sale discovery and listing platform.",
    status: "development",
    category: "software",
    technologies: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Stripe"
    ],
    coverImage:
      "/images/projects/estate-sales-bakersfield/cover.webp",
    gallery: [
      "/images/projects/estate-sales-bakersfield/screenshot-01.webp",
      "/images/projects/estate-sales-bakersfield/screenshot-02.webp"
    ],
    featured: true
  }
];
```

### MDX case study

```text
src/content/projects/estate-sales-bakersfield.mdx
```

MDX should contain:

- Project overview
- Problem
- Goals
- Role
- Technology
- Design decisions
- Development notes
- Screenshots
- Challenges
- Results
- Related experiments
- Live link
- GitHub link when available

---

## 13. State Architecture

Do not put all state into one large context.

Separate state by responsibility.

### Route state

Handled by Next.js:

- Active app
- Active project
- Nested content
- Browser history
- Shareable URL

### Desktop OS state

```ts
type DesktopOSState = {
  openWindows: WindowInstance[];
  activeWindowId: string | null;
  minimizedWindowIds: string[];
  windowPositions: Record<string, WindowPosition>;
  windowSizes: Record<string, WindowSize>;
  startMenuOpen: boolean;
  contextMenu: ContextMenuState | null;
};
```

### Pocket OS state

```ts
type PocketOSState = {
  startupComplete: boolean;
  unlocked: boolean;
  homePage: 0 | 1;
  activeLongPressMenu: string | null;
  dismissedNotifications: string[];
};
```

### Shared preferences

```ts
type PreferenceState = {
  theme: ThemeId;
  soundEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  normalView: boolean;
};
```

### Recommended state tools

For V1:

```text
React Context
useReducer
Next.js routes
localStorage
sessionStorage
```

Do not add Redux or Zustand unless the system state becomes difficult to manage.

---

## 14. Browser Storage

Use `localStorage` or `sessionStorage` only for noncritical user preferences.

### Good local-storage candidates

- Selected theme
- Sound preference
- Reduced-motion preference
- High-contrast preference
- Normal View preference
- Last Pocket OS page
- Dismissed joke notifications
- Unlocked hidden themes
- Desktop icon positions
- Desktop window positions
- Wallpaper selection

### Good session-storage candidates

- Startup already played
- Pocket OS currently unlocked
- Temporary notification state
- One-session Easter eggs

### Do not store locally

- Project content
- Route source of truth
- Sensitive information
- Contact submissions
- Online game scores
- User identity
- Data that must sync across devices

---

## 15. Database Decision

# V1 does not need a database

The portfolio is curated content controlled through the repository.

Store in the repository:

- Projects
- Project metadata
- Case studies
- Notes
- Services
- About content
- Themes
- App registry
- Desktop icon configuration
- Pocket OS page configuration
- Notifications
- Easter eggs
- Recycle content
- Social links

### Reasons to avoid a database initially

- No user accounts
- No admin dashboard
- No runtime content editing
- No cloud-synced preferences
- No user-generated content
- No public comments
- No required stored contact submissions
- No online leaderboard requirement in V1

Avoid adding:

```text
Prisma
PostgreSQL
Database migrations
Authentication
CMS
Database environment variables
```

### Add a database only when needed

A database becomes appropriate for:

- Online FightClub high scores
- User accounts
- Saved progress across devices
- Cloud-synced themes
- Public comments
- Dynamic activity feeds
- Contact submissions stored in an admin area
- User-created desktop layouts
- Remote project editing
- Runtime-managed portfolio content

A future structured database could use:

- Neon Postgres
- Supabase
- Another Vercel Marketplace Postgres provider

---

## 16. File and Asset Storage Decision

# Use local repository assets for V1

The following should remain local:

- Desktop icons
- Pocket OS icons
- System icons
- Wallpapers
- Project screenshots
- Project cover images
- FightClub artwork
- Widget graphics
- Social icons
- UI textures
- Open Graph images
- Small sound effects
- Small preview media

These assets are part of the product design and should be versioned with the code.

### Asset rule

> **If changing the asset should require a design review and redeployment, keep it local.**

### Use Vercel Blob when

- Files are uploaded at runtime
- Media changes independently from deployments
- Videos become too large for Git
- Users upload content
- An admin interface manages files
- Downloadable packages are added
- Game builds are hosted remotely
- Large showreels are stored outside the repository

---

## 17. Recommended Asset Structure

```text
public/
├── images/
│   ├── wallpapers/
│   │   ├── desktop/
│   │   │   ├── dusk.webp
│   │   │   ├── graphite.webp
│   │   │   └── computer-lab.webp
│   │   └── pocket/
│   │       ├── dusk.webp
│   │       ├── graphite.webp
│   │       └── warm-crt.webp
│   │
│   ├── projects/
│   │   ├── estate-sales-bakersfield/
│   │   │   ├── cover.webp
│   │   │   ├── screenshot-01.webp
│   │   │   └── screenshot-02.webp
│   │   └── project-slug/
│   │
│   ├── games/
│   │   └── fightclub/
│   │       ├── cover.webp
│   │       ├── launcher.webp
│   │       └── thumbnail.webp
│   │
│   ├── experiments/
│   ├── notes/
│   └── easter-eggs/
│
├── icons/
│   ├── desktop/
│   ├── pocket/
│   ├── system/
│   └── socials/
│
├── sounds/
│   ├── startup.mp3
│   ├── notification.mp3
│   ├── click.mp3
│   └── error.mp3
│
└── og/
    ├── default.webp
    └── projects/
```

---

## 18. Icon Architecture

Use two icon approaches.

### System icons as React SVG components

Use for:

- Back
- Search
- Close
- Minimize
- Maximize
- Wi-Fi
- Volume
- Settings
- Play
- Pause
- Chevron
- Notification
- Theme
- Full screen

Structure:

```text
src/components/icons/system/
├── BackIcon.tsx
├── SearchIcon.tsx
├── CloseIcon.tsx
├── WifiIcon.tsx
├── VolumeIcon.tsx
└── PlayIcon.tsx
```

Benefits:

- Themeable fills and strokes
- Hover states
- Active states
- Animation
- Accessibility labels
- Small bundle size
- Shared desktop and mobile usage

### Illustrated app icons as local assets

Use for:

- Projects
- Games
- FightClub
- TV
- World
- Recycle
- Notes
- Services
- About

Possible formats:

- SVG for simple vector icons
- WebP for complex rendered icons
- AVIF for detailed soft 3D artwork
- PNG only when transparency or compatibility requires it

---

## 19. Image Strategy

Use `next/image` for project imagery and wallpapers where appropriate.

### Static imports

Use for:

- Featured wallpaper
- Primary hero artwork
- Major game artwork
- Frequently used fixed assets

Example:

```tsx
import cover from "@/assets/projects/esb/cover.webp";

<Image
  src={cover}
  alt="Estate Sales Bakersfield interface"
/>
```

### Public paths

Use for:

- Project galleries
- Content-driven screenshots
- Notes attachments
- Archived artwork

Example:

```tsx
<Image
  src="/images/projects/estate-sales-bakersfield/screenshot-01.webp"
  alt="Estate Sales Bakersfield listing interface"
  width={1600}
  height={1000}
/>
```

### Image optimization goals

- Prefer WebP or AVIF
- Provide accurate dimensions
- Use descriptive alt text
- Lazy-load noncritical images
- Preload only the active wallpaper and critical icons
- Avoid loading all project galleries on the home screen

---

## 20. Video and Large Media Strategy

Do not commit a large media library into Git.

### Keep local

- Small preview clips
- Short compressed loops
- Lightweight startup media
- Poster images
- TV interface graphics
- Thumbnails

### Use Vercel Blob or dedicated video hosting later

- Full showreels
- Long motion pieces
- Multiple high-resolution videos
- Downloadable game builds
- Large project walkthroughs
- Runtime-managed media

Most likely first use of Vercel Blob:

```text
TV.exe full-length video content
```

The TV interface and poster art should remain local.

---

## 21. Lazy Loading

Heavy experiences should not be part of the initial JavaScript bundle.

Lazy-load:

- FightClub game engine
- Three.js World
- TV video player
- Audio visualization
- Large experiments
- Code editor experiments
- High-resolution galleries

Example:

```tsx
const FightClubGame = dynamic(
  () => import("@/components/apps/games/FightClubGame"),
  {
    loading: () => <GameLoadingScreen />,
    ssr: false,
  }
);
```

The startup screen, lock screen, desktop, and Pocket OS home pages should load quickly.

---

## 22. Animation Architecture

Use CSS transitions for common UI motion.

### CSS transitions

Use for:

- Hover states
- Pressed buttons
- Icon focus
- Dock interactions
- Widget states
- Toggle changes
- Simple app fades
- Window activation
- Notification banners

### Web Animations API or focused dependency

Use only when needed for:

- Window minimizing
- Window restoring
- Drag transitions
- App expansion from icons
- Lock-screen unlock
- Coordinated route transitions

Do not make the entire interface dependent on a large animation framework.

### Reduced motion

All motion must honor:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or reduce nonessential motion */
}
```

The user should also be able to enable Reduced Motion in Settings.

---

## 23. Mobile Viewport Architecture

The Pocket OS system screens must not vertically scroll.

Fixed-height screens:

- Startup
- Lock screen
- Home Page One
- Home Page Two

Scrollable screens:

- Projects
- Games
- Experiments
- Services
- About
- Notes
- Settings
- Recycle
- TV
- World preview

### Viewport behavior

Use:

- Dynamic viewport units
- Visual viewport measurements where needed
- Safe-area insets
- Bottom browser-toolbar allowance
- Responsive dock placement

The Pocket OS dock must not be hidden behind Safari’s URL bar.

---

## 24. Native Contact Links

Pocket OS uses native phone actions.

### Messages

```text
sms:+16127417277
```

Suggested body:

```text
Hey Brandon, I found WestCose Labs and I have a project that might actually be cool.
```

### Phone

```text
tel:+16127417277
```

No database is required for either action.

Normal View may additionally include a standard email link or contact form later.

---

## 25. Recommended Repository Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── games/
│   │   ├── page.tsx
│   │   └── fightclub/
│   │       └── page.tsx
│   │
│   ├── experiments/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── services/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── notes/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── recycle/
│   │   └── page.tsx
│   ├── tv/
│   │   └── page.tsx
│   └── world/
│       └── page.tsx
│
├── components/
│   ├── os/
│   │   ├── OSRoot.tsx
│   │   ├── ShellSelector.tsx
│   │   ├── OSProvider.tsx
│   │   ├── PreferenceProvider.tsx
│   │   └── NormalView.tsx
│   │
│   ├── desktop/
│   │   ├── DesktopShell.tsx
│   │   ├── Desktop.tsx
│   │   ├── DesktopIcon.tsx
│   │   ├── DesktopWidget.tsx
│   │   ├── WindowManager.tsx
│   │   ├── WindowFrame.tsx
│   │   ├── Taskbar.tsx
│   │   ├── StartMenu.tsx
│   │   └── ContextMenu.tsx
│   │
│   ├── pocket/
│   │   ├── PocketShell.tsx
│   │   ├── StartupScreen.tsx
│   │   ├── LockScreen.tsx
│   │   ├── SlideToUnlock.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── HomePage.tsx
│   │   ├── PocketDock.tsx
│   │   ├── AppIcon.tsx
│   │   ├── Widget.tsx
│   │   ├── AppScreen.tsx
│   │   ├── PageIndicator.tsx
│   │   └── LongPressMenu.tsx
│   │
│   ├── apps/
│   │   ├── projects/
│   │   ├── games/
│   │   ├── experiments/
│   │   ├── services/
│   │   ├── about/
│   │   ├── notes/
│   │   ├── settings/
│   │   ├── recycle/
│   │   ├── tv/
│   │   └── world/
│   │
│   ├── icons/
│   │   ├── system/
│   │   └── app/
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── IconButton.tsx
│       ├── Slider.tsx
│       ├── Toggle.tsx
│       ├── SegmentedControl.tsx
│       ├── Badge.tsx
│       ├── Tooltip.tsx
│       ├── Notification.tsx
│       └── Menu.tsx
│
├── content/
│   ├── projects/
│   ├── experiments/
│   ├── notes/
│   └── recycle/
│
├── data/
│   ├── projects.ts
│   ├── apps.ts
│   ├── desktop-icons.ts
│   ├── desktop-taskbar.ts
│   ├── pocket-pages.ts
│   ├── pocket-dock.ts
│   ├── themes.ts
│   ├── notifications.ts
│   └── social-links.ts
│
├── hooks/
│   ├── useMediaQuery.ts
│   ├── useLongPress.ts
│   ├── useLocalStorage.ts
│   ├── useSessionStorage.ts
│   ├── useWindowManager.ts
│   ├── useReducedMotion.ts
│   └── useVisualViewport.ts
│
├── lib/
│   ├── routes.ts
│   ├── metadata.ts
│   ├── storage.ts
│   ├── viewport.ts
│   ├── app-launcher.ts
│   └── asset-paths.ts
│
├── state/
│   ├── desktop-reducer.ts
│   ├── pocket-reducer.ts
│   └── preferences-reducer.ts
│
└── styles/
    ├── reset.css
    ├── globals.css
    ├── tokens.css
    ├── themes.css
    ├── neumorphism.css
    ├── typography.css
    ├── motion.css
    └── accessibility.css
```

---

## 26. Vercel Deployment Architecture

Vercel should host:

- Production deployment
- Preview deployments
- Branch deployments
- Environment variables
- Image optimization
- Route handlers if added later
- Analytics if enabled later
- Performance monitoring if enabled later

### V1 environment variables

The initial site may need very few or no private environment variables.

Potential public configuration:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GITHUB_URL
NEXT_PUBLIC_INSTAGRAM_URL
NEXT_PUBLIC_PHONE_NUMBER
```

Avoid adding storage or database environment variables until required.

---

## 27. Testing Strategy

### Unit tests

Test:

- Desktop reducer
- Pocket reducer
- Preferences reducer
- App registry utilities
- Route mapping
- Storage utilities
- Theme logic

### Component tests

Test:

- Buttons
- Toggles
- Sliders
- Desktop icons
- Pocket app icons
- Dock
- Taskbar
- Start menu
- Lock-screen notifications
- Slide-to-unlock alternatives
- Back navigation

### End-to-end tests

Test:

- Desktop route opens correct window
- Mobile route opens correct full-screen app
- Browser back works
- Direct project routes work
- Normal View works
- Themes persist
- Lock screen unlocks
- Pocket home pages swipe
- SMS link is correct
- Phone link is correct
- Reduced motion disables nonessential animation
- Heavy apps lazy-load

---

## 28. Performance Requirements

### Initial experience

Prioritize fast loading of:

- Desktop shell
- Pocket startup
- Lock screen
- Home-screen icons
- Active wallpaper
- Taskbar or dock
- First route content

### Avoid initial loading of

- FightClub engine
- World Three.js bundle
- TV video library
- Full project galleries
- All social media embeds
- All wallpapers
- Hidden themes
- Large audio files

### Asset budgets

Set budgets for:

- Initial JavaScript
- Critical CSS
- Active wallpaper
- Icon collection
- Project thumbnails
- Game artwork

The OS concept should not create a slow first impression.

---

## 29. Accessibility Requirements

The visual operating systems should sit on top of semantic web content.

Required support:

- Screen-reader labels
- Keyboard navigation
- Visible focus states
- Reduced motion
- High contrast
- Normal View
- Large touch targets
- No color-only meaning
- Tap alternative to slide-to-unlock
- Browser back compatibility
- No long-press-only functionality
- Clear app exit controls
- Direct project routes
- Alt text for project images
- Accessible SMS and phone labels

---

## 30. V1 Architecture Scope

### Required

- Next.js App Router
- TypeScript strict mode
- React
- Vanilla CSS
- CSS Modules
- Design tokens
- Theme system
- Desktop shell
- Pocket shell
- Normal View
- App registry
- Project registry
- MDX case studies
- Local assets
- Vercel deployment
- Route-driven app state
- Desktop reducer
- Pocket reducer
- Preferences reducer
- localStorage preferences
- sessionStorage startup state
- Lazy loading
- Basic testing
- Accessibility controls

### Not required for V1

- Database
- Prisma
- Postgres
- Authentication
- CMS
- Admin dashboard
- Vercel Blob
- User accounts
- Cloud sync
- Online leaderboard
- Stored contact submissions
- Runtime file uploads

---

## 31. Future Architecture Triggers

Add a database when:

- FightClub needs online high scores
- Users need accounts
- Preferences sync across devices
- Contact submissions need storage
- Project content needs an admin editor
- User-generated content is introduced

Add Vercel Blob when:

- TV.exe contains large full-length video
- Game builds become downloadable
- Runtime uploads are introduced
- An admin tool manages images
- Project media becomes too large for Git
- Media changes without redeployment

Add authentication when:

- Admin editing exists
- Private content exists
- Saved user progress exists
- Cloud-synced settings exist

---

## 32. Final Architecture Decision

The approved V1 architecture is:

```text
Next.js App Router
React
TypeScript strict mode
Vanilla CSS
CSS Modules
CSS custom properties
Local MDX
Typed TypeScript registries
React Context
useReducer
localStorage
sessionStorage
Local image and icon assets
Vercel hosting
No database
No Vercel Blob initially
```

The architecture should remain intentionally lean.

The most important decisions are:

1. Routes remain the source of truth.
2. Desktop, mobile, and Normal View share the same content.
3. The OS shell is isolated inside client-side interaction boundaries.
4. Project content remains server-rendered and indexable.
5. Applications are centralized in one registry.
6. Heavy games, video, and Three.js are lazy-loaded.
7. Assets remain local until runtime storage is genuinely required.
8. A database is added only when shared dynamic data exists.
9. CSS variables and reusable neumorphic primitives power the visual system.
10. Accessibility and conventional navigation remain available at all times.

The guiding rule is:

> **Use the smallest architecture that can fully support the experience, then add infrastructure only when a real feature requires it.**
