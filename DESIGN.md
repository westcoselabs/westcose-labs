---
version: alpha
name: WestCose Labs OS
description: A shared visual design system for the WestCose Labs desktop OS, WestCose Pocket OS, and accessible Normal View. The style combines late-2000s computing nostalgia with tactile dark neumorphism, restrained system-blue accents, moody analog photography, and dry technical humor.
colors:
  primary: "#4F9CFF"
  primary-hover: "#66AEFF"
  primary-pressed: "#3269B3"
  secondary: "#242831"
  tertiary: "#45D3E6"
  neutral: "#1C1F25"
  surface-base: "#242831"
  surface-raised: "#2A2F39"
  surface-recessed: "#181B21"
  surface-overlay: "#20242C"
  surface-active: "#303A49"
  surface-light: "#E7E9EC"
  text-primary: "#F2F4F7"
  text-secondary: "#A8AFBB"
  text-subdued: "#7B8492"
  text-dark: "#07111F"
  border-subtle: "#39404C"
  shadow-dark: "#15181E"
  shadow-light: "#303641"
  focus: "#8CC2FF"
  success: "#55C58A"
  warning: "#D99A43"
  danger: "#EF5B5B"
typography:
  display-lg:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.04em
  display-md:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.035em
  headline-lg:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.03em
  headline-md:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.015em
  body-lg:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.005em
  body-md:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  body-sm:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  label-lg:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.01em
  label-md:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.025em
  caption:
    fontFamily: "Manrope, Inter, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0.03em
  mono-md:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  mono-sm:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.015em
rounded:
  none: 0px
  xs: 6px
  sm: 10px
  md: 14px
  lg: 18px
  xl: 22px
  2xl: 28px
  3xl: 36px
  full: 999px
spacing:
  micro: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  2xl: 32px
  3xl: 40px
  4xl: 48px
  5xl: 64px
  6xl: 80px
  7xl: 96px
  desktop-gutter: 24px
  pocket-gutter: 16px
  dock-gap: 12px
components:
  desktop-background:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: 0px
  surface-raised:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: 16px
  surface-recessed:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 16px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px
  button-secondary-pressed:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 44px
  icon-button:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: 10px
    size: 44px
  icon-button-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.focus}"
    rounded: "{rounded.md}"
    padding: 10px
    size: 44px
  desktop-icon:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 10px
    size: 72px
  desktop-icon-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.focus}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 10px
    size: 72px
  window:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: 0px
  window-content:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  taskbar:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.2xl}"
    padding: 12px
    height: 72px
  taskbar-app:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: 10px
    size: 48px
  taskbar-app-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.focus}"
    rounded: "{rounded.md}"
    padding: 10px
    size: 48px
  pocket-app-icon:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 10px
    size: 64px
  pocket-app-icon-active:
    backgroundColor: "{colors.surface-active}"
    textColor: "{colors.focus}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: 10px
    size: 64px
  pocket-dock:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.3xl}"
    padding: 12px
    height: 88px
  widget:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: 20px
  notification:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 12px
    height: 44px
  toggle-track:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.full}"
    width: 52px
    height: 30px
  toggle-track-on:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.full}"
    width: 52px
    height: 30px
  toggle-thumb:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.full}"
    size: 24px
  badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.text-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 4px
    size: 20px
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.text-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 6px
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.text-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 6px
  technical-label:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.tertiary}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.sm}"
    padding: 6px
  metadata:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.text-subdued}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 4px
  normal-view-card:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 24px
  soft-silver-surface:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.xl}"
    padding: 16px
  border-reference:
    backgroundColor: "{colors.border-subtle}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xs}"
    padding: 2px
---

# WestCose Labs OS Design System

## Overview

WestCose Labs OS is a shared visual identity for three presentations of the same portfolio content:

1. **WestCose Labs OS** — a desktop operating-system experience with icons, files, draggable windows, a taskbar, system widgets, games, and hidden interactions.
2. **WestCose Pocket OS** — a touch-first mobile operating system with a lock screen, two home-screen pages, a fixed dock, and full-screen apps.
3. **Normal View** — a conventional, accessible portfolio layout using the same colors, typography, content, and component language without the operating-system metaphor.

The design language is **Retro Soft-Tech Neumorphism**. It combines late-2000s computing and early-smartphone nostalgia with modern layout discipline, dark molded surfaces, soft physical depth, restrained system-blue accents, and moody analog photography.

The desired emotional response is:

> Familiar enough to use immediately, unusual enough to remember, polished enough to trust, and playful enough to explore.

The interface should feel like a personal creative workstation and its matching pocket device from an alternate 2009. It is not a direct recreation of Windows, macOS, Linux, or iOS. Familiar patterns are used for comprehension; all visual assets, icons, system language, and interactions should remain distinctly WestCose Labs.

The visual references establish the following non-negotiable qualities:

- Controls appear molded from one consistent material.
- Raised and recessed states are obvious without hard outlines.
- Blue and cyan communicate activity, not decoration.
- Empty wallpaper space is part of the composition.
- The shell remains calm while games, project art, and Easter eggs can become more expressive.
- Humor is dry, technical, and secondary to usability.
- The portfolio must never look like a generic SaaS dashboard or cyberpunk game menu.

## Colors

The default theme is **Dusk**, a dark graphite system placed over a nostalgic, low-saturation photographic wallpaper.

### Core palette

- **Primary / System Blue (`#4F9CFF`):** The main interaction color. Use for active applications, selected controls, running indicators, progress, keyboard focus, and primary actions.
- **Primary Hover (`#66AEFF`):** A brighter hover state used only when a pointer is available.
- **Primary Pressed (`#377BCC`):** A deeper pressed or active state.
- **Tertiary / Signal Cyan (`#45D3E6`):** Technical readouts, meters, small status accents, and rare highlights. It must not compete with System Blue.
- **Neutral / Desktop Ink (`#1C1F25`):** The foundational dark field.
- **Surface Base (`#242831`):** Standard app, window, card, and shell surface.
- **Surface Raised (`#2A2F39`):** Raised controls, icons, buttons, cards, and widgets.
- **Surface Recessed (`#181B21`):** Input wells, slider tracks, content wells, selected segments, and pressed controls.
- **Surface Overlay (`#20242C`):** Taskbars, docks, menus, and other large system overlays.
- **Surface Active (`#303A49`):** Selected app wells and active navigation.
- **Text Primary (`#F2F4F7`):** Main text on dark surfaces.
- **Text Secondary (`#A8AFBB`):** Supporting text and labels.
- **Text Subdued (`#7B8492`):** Metadata and low-priority information.
- **Text Dark (`#07111F`):** Text placed on bright blue, cyan, warning, success, or danger fills.
- **Border Subtle (`#39404C`):** Rare separators and edge reinforcement. Borders should not replace depth.
- **Focus (`#8CC2FF`):** Visible keyboard focus and high-contrast active outlines.
- **Success (`#55C58A`):** Stable builds, online status, and completed actions.
- **Warning (`#D99A43`):** Cautions, incomplete work, and playful system warnings.
- **Danger (`#EF5B5B`):** Notification badges, destructive actions, and critical errors.

### Color behavior

- Keep approximately 80–90% of every system screen neutral.
- Blue indicates interaction or system state.
- Cyan is a secondary technical signal, not a second primary color.
- Game art, project screenshots, and social icons may introduce richer color inside contained surfaces.
- Notification red should be used sparingly so a badge remains meaningful.
- Warm amber should appear primarily in warnings, nostalgic media details, and select Easter eggs.
- Never use white text on the primary blue for normal-size labels. Use `text-dark` to preserve contrast.
- Never apply bright accent colors to large backgrounds unless a deliberate theme or game is active.

### Themes

Alternate themes may remap color tokens and wallpaper, but they must preserve component geometry, typography, spacing, and depth rules.

Every theme must define a complete **neumorphic shadow pair** derived from its own surface color:

- `surface-base`
- `shadow-dark`
- `shadow-light`
- `primary`
- `focus`

Do not reuse the Dusk shadow colors unchanged across light, warm, or high-contrast themes. The shadow pair should be visually related to the active surface so controls appear molded from one material rather than dropped onto it.

The shadow contract belongs in implementation CSS and in this Markdown guidance. It is intentionally not represented as a `components` entry in the YAML because the DESIGN.md alpha schema only accepts component properties such as `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, and `width`.

Recommended CSS theme contract:

```css
[data-theme] {
  --neu-bg: var(--color-surface-base);
  --neu-shadow-dark: var(--color-shadow-dark);
  --neu-shadow-light: var(--color-shadow-light);
  --neu-accent: var(--color-primary);
  --neu-focus: var(--color-focus);
}
```

Approved theme directions:

- **Dusk:** Default graphite and blue.
- **Graphite:** More neutral and monochromatic.
- **Soft Silver:** Light neumorphism inspired by molded off-white hardware.
- **Arcade Blue:** Slightly stronger blue and cyan for Games.
- **Warm CRT:** Warm charcoal with muted amber highlights.
- **2008 Computer Lab:** Hidden nostalgia theme with cooler gray hardware tones.

## Typography

The typography system balances modern product readability with retro operating-system familiarity.

### Primary family

Use **Manrope** for the interface and portfolio content, with Inter and system fonts as fallbacks. Manrope supplies clean geometric forms without becoming overtly futuristic.

Use it for:

- App names
- Window titles
- Navigation
- Project headings
- Case studies
- Buttons
- Widgets
- Lock-screen time
- Home-screen labels
- Notifications

### Monospaced family

Use **IBM Plex Mono** for technical and file-oriented information, with standard monospace fallbacks.

Use it for:

- README and Notes metadata
- Terminal
- Version numbers
- File details
- Build status
- System messages
- Routes and code
- Archived or corrupted content
- Technical labels

### Hierarchy rules

- Use `display-lg` only for large desktop marketing or project moments.
- Use `display-md` for the Pocket OS lock-screen clock or major project introductions.
- Use `headline-lg` and `headline-md` for project and app content.
- Use `headline-sm` for windows, widgets, cards, and section titles.
- Use `body-md` as the default readable content size.
- Use `body-sm` for widgets, compact cards, and secondary descriptions.
- Use `label-lg` for controls and actions.
- Use `label-md` for desktop icon labels and mobile app names.
- Use `caption` for metadata and supporting system information.
- Do not set long paragraphs in monospaced type.
- Avoid all-caps paragraphs. Uppercase is reserved for short status labels, file categories, and system headings.
- Do not use novelty, pixel, or science-fiction fonts for normal reading. Those may appear inside game art or isolated Easter eggs only.

## Layout

The system uses a disciplined 4px-based spacing rhythm. The token scale is authoritative; avoid arbitrary values unless a component requires optical adjustment.

### Desktop OS

The desktop is the homepage and should retain visible wallpaper.

- Use a full-viewport desktop shell.
- Keep approximately 8–10 primary icons visible on initial load.
- Place desktop icons in a familiar grid beginning at the upper-left.
- Maintain at least `24px` desktop gutter from viewport edges.
- Keep at least `16px` between icon hit areas.
- Preserve large areas of empty wallpaper; do not fill the screen with cards or controls.
- Place one or two compact widgets on the right side.
- Use a bottom taskbar with a nominal height of `72px`.
- Keep the taskbar inset from the viewport by approximately `12–16px`.
- A compact README window may open on first visit, but no large dashboard should cover the desktop.
- Windows may overlap, but only one should be visually active.
- Project routes open in windows while remaining directly addressable.

Recommended visible desktop destinations:

- Projects
- Games
- Experiments
- About WestCose Labs
- Contact or Mail
- FightClub.exe
- TV.exe
- Terminal
- GitHub
- Recycle Bin

Secondary utilities belong in the Start menu or File Explorer rather than the default desktop.

### Pocket OS

Pocket OS is not a reduced desktop.

- Use the current visual viewport and safe-area insets.
- Do not render a fake top status bar; the device and browser already provide one.
- Startup, lock screen, Home Page One, and Home Page Two must fit the available viewport and must not vertically scroll.
- Full-screen apps may scroll internally.
- Use exactly two horizontally swipeable home-screen pages in V1.
- Use a four-column app grid on common phone widths.
- Page One contains two top widgets and the essential apps.
- Page Two contains games, entertainment, archive content, and individual social apps.
- Use two small page indicators above the dock.
- The Pocket Dock contains Projects, Games, Messages, and Phone.
- The dock must remain above mobile Safari or other browser bottom controls.
- Use `env(safe-area-inset-bottom)` and dynamic viewport units.
- Every full-screen app includes a visible upper-left back control.
- Do not invent a swipe-up-to-home gesture.

### Normal View

Normal View uses standard document flow and conventional responsive navigation.

- Use a readable content max-width of approximately `1200px`.
- Use `24px` desktop page gutters and `16px` mobile gutters.
- Use the same colors, typography, project art, and component surfaces.
- Do not reproduce the lock screen, desktop icons, draggable windows, or home-screen paging.
- Preserve clear headings, semantic landmarks, keyboard navigation, and direct project routes.

## Elevation & Depth

Depth is functional. It communicates whether an element is raised, recessed, pressed, active, selected, disabled, or floating.

### Lighting direction

The virtual light source is fixed in the **upper-left** across the entire system.

- Light highlights appear on upper and left edges.
- Dark shadows fall toward the lower-right.
- Inset controls preserve the same lighting direction.
- Do not reverse lighting direction between adjacent components.
- Do not use multiple competing light sources in one screen.
- Project artwork and wallpaper may contain natural lighting, but UI surfaces keep the system light source.

### Theme-derived shadow pairs

The numerical shadow shape may remain consistent, but every theme must supply its own light and dark shadow colors. The relationship between `surface-base`, `shadow-dark`, and `shadow-light` is part of the theme contract.

Dark themes should use:

- A dark shadow materially darker than the base surface
- A light shadow only slightly lighter than the base surface
- Low-opacity highlights to avoid a chalky edge

Light themes should use:

- A cool or neutral gray dark shadow
- A near-white light shadow
- Stronger tonal separation than dark themes while preserving text contrast

### Interaction-state depth map

| Interaction state | Required depth behavior | Accent behavior |
|---|---|---|
| Resting | Raised | No glow unless the item is currently running |
| Hover | Slightly reduced elevation; move no more than 1–2px | Optional subtle blue edge or label change |
| Focus | Preserve the resting or selected depth | Add a visible focus ring using `focus`; never rely on glow alone |
| Pressed | Full inset or clearly depressed | Reduce glow and darken the active fill |
| Selected / toggled | Shallow inset or stable active well | Use `surface-active` plus restrained blue emphasis |
| Disabled | Flatten or reduce elevation | Lower contrast while keeping labels readable |
| Floating | Larger, softer outer shadow | Accent is optional and should reflect active state, not elevation |

The state sequence must be consistent across buttons, taskbar items, dock icons, app icons, toggles, segmented controls, and window controls.

Use four structural depth states:

1. **Base:** The wallpaper or primary system field.
2. **Recessed:** Inputs, tracks, wells, selected areas, and content cavities.
3. **Raised:** Icons, buttons, widgets, controls, and cards.
4. **Floating:** Windows, menus, taskbars, docks, notifications, and modal surfaces.

### Raised recipe

Use a restrained dual-shadow effect:

```css
box-shadow:
  -5px -5px 12px var(--neu-shadow-light),
  7px 7px 16px var(--neu-shadow-dark),
  inset 1px 1px 0 color-mix(in srgb, var(--neu-shadow-light) 72%, transparent);
```

### Recessed recipe

```css
box-shadow:
  inset 5px 5px 12px var(--neu-shadow-dark),
  inset -4px -4px 10px var(--neu-shadow-light);
```

### Pressed recipe

```css
box-shadow:
  inset 4px 4px 10px var(--neu-shadow-dark),
  inset -3px -3px 8px var(--neu-shadow-light);
transform: translateY(1px);
```

### Floating recipe

```css
box-shadow:
  0 24px 64px color-mix(in srgb, var(--neu-shadow-dark) 88%, transparent),
  -4px -4px 14px var(--neu-shadow-light),
  inset 1px 1px 0 color-mix(in srgb, var(--neu-shadow-light) 72%, transparent);
```

### Active glow

Use glow only in addition to physical depth:

```css
box-shadow:
  0 0 0 1px rgba(79, 156, 255, 0.34),
  0 0 18px rgba(79, 156, 255, 0.20);
```

Rules:

- Do not stack every shadow recipe on one component.
- Do not create depth using thick bright borders.
- Avoid heavy backdrop blur. Neumorphism, not glassmorphism, is the primary language.
- Maintain visible tonal separation between adjacent surfaces.
- Reduce shadows in high-contrast and reduced-effects modes.
- Active, hover, focus, and pressed states must remain distinguishable without relying on glow alone.

### Neumorphism usage limits

Use strong neumorphism for:

- System controls
- Desktop and Pocket OS app icons
- Docks and taskbars
- Window frames
- Widgets
- Buttons
- Sliders, toggles, knobs, and segmented controls
- Menus and compact notifications

Use reduced or no neumorphism for:

- Long-form case-study text
- Large screenshot galleries
- Full-bleed project artwork
- Dense data tables
- Repeated list rows
- Normal View document sections
- Large app content canvases

A screen should not treat every element as raised. Each view needs a clear base surface, a limited number of raised controls, and enough flat or recessed space for content to breathe.

As a practical rule:

- Use strong depth on no more than roughly one-third of the visible UI elements.
- Avoid nesting more than two elevated surfaces.
- Do not place a raised card inside another raised card unless the inner element is an interactive control.
- Prefer tonal grouping and spacing over adding another shadow layer.
- When content density rises, reduce shadow blur and elevation rather than increasing contrast.

## Shapes

The shape language is soft, tactile, and hardware-inspired.

### Corner radii

- `6px`: Small metadata chips and tight technical elements.
- `10px`: Compact menu rows and small controls.
- `14px`: Standard buttons and icon buttons.
- `18px`: Inputs, notification cards, and content wells.
- `22px`: Desktop icons, Pocket OS app icons, cards, and widgets.
- `28px`: Windows, taskbars, large panels, and menus.
- `36px`: Pocket Dock and highly tactile system trays.
- `999px`: Sliders, badges, search fields, toggles, and progress tracks.

### Shape rules

- Desktop icons may use more object-like silhouettes within a consistent soft container.
- Pocket OS icons use uniform rounded-square containers with simpler central symbols.
- Docks and taskbars should feel like molded trays, not transparent glass bars.
- Window controls are circular or softly rounded, with clear familiar symbols.
- Use full circles for knobs, progress dials, app badges, and small media controls.
- Do not mix sharp-edged cards with heavily rounded controls in the same shell.
- Avoid excessive blob shapes and asymmetry.
- Social icons may retain recognizable brand marks but must sit within the shared Pocket OS container system.

## Components

### Neumorphic surface primitives

Build every major component from reusable surface primitives:

- `SurfaceRaised`
- `SurfaceRecessed`
- `SurfaceFloating`
- `PressableSurface`
- `ActiveSurface`

These primitives define material, radius, lighting direction, theme-derived shadow pair, focus, and pressed behavior. Do not rewrite shadow logic separately in every component.

All primitives should consume the same semantic CSS variables:

```css
--neu-bg
--neu-shadow-dark
--neu-shadow-light
--neu-accent
--neu-focus
```

Component modules may adjust blur, spread, or elevation scale, but they must not introduce unrelated hard-coded shadow colors.

### Buttons

Primary buttons use System Blue with dark text.

- Minimum desktop height: `44px`.
- Minimum touch target: `44px`.
- Use short, direct labels such as Open, Launch, Play, View Source, and Send.
- Hover brightens the blue only on pointer-capable devices.
- Pressed controls visibly sink into the surface.
- Disabled controls lose glow and contrast but remain readable.
- Secondary buttons remain graphite and use raised depth.
- Destructive buttons use Danger sparingly and require clear language.

### Desktop icons

Desktop icons combine a familiar object or app symbol with a soft 3D tile.

- Nominal icon tile: `72px`.
- Label appears beneath the tile.
- Single click selects.
- Double click opens.
- Right click exposes a context menu.
- Hover raises the tile slightly.
- Selected icons use a subtle blue focus field.
- Icons must remain recognizable without reading the label.
- Avoid a generic outline-only icon library for major destinations.

### Pocket OS app icons

Pocket app icons are uniform, tactile rounded squares.

- Nominal icon tile: `64px`.
- Use one strong central symbol.
- Keep labels short.
- Use custom WestCose icon artwork for primary apps.
- Generic system symbols may use a consistent local icon library.
- Long press opens a large-touch-target context menu.
- App icons depress before expanding into a full-screen app.
- Do not copy Apple app artwork or current iOS materials.

### Windows

Desktop windows use a floating raised frame with a recessed content region.

Required anatomy:

- App icon and title
- Draggable title bar
- Minimize
- Maximize or restore
- Close
- Resizable content region
- Optional toolbar
- Optional status bar

Behavior:

- Active window receives a subtle blue indicator.
- Inactive windows reduce glow and emphasis.
- Windows must remain recoverable if resized or moved near an edge.
- Minimized windows return to their taskbar item.
- Avoid opening multiple windows automatically.
- Large project content should scroll inside the window, not behind it.

### Desktop taskbar

The taskbar should feel familiar to PC users while remaining custom.

Required regions:

- WestCose Labs Start button
- Search or app launcher
- Pinned and running applications
- Running-app indicators
- System tray
- Sound
- Theme control
- Full-screen control
- Normal View
- Time and date

Visual behavior:

- Large molded tray with rounded corners.
- App controls sit in shallow wells.
- Active apps use System Blue and a small running indicator.
- Search is visibly recessed.
- Separate functional regions with spacing or subtle tonal shifts, not strong divider lines.

### Start menu and system menus

Menus rise from the taskbar or originate from the interaction point.

- Use floating depth.
- Use `28px` large-panel radius.
- Keep menu rows at least `40px` high.
- Use concise categories such as Recent Builds, Installed Games, System Utilities, Unfinished Business, and Things That Probably Work.
- Humor may appear in secondary items, never in place of an essential label.

### Pocket Dock

The Pocket Dock is a defining mobile component.

- Nominal height: `88px`.
- Contains exactly four apps in V1: Projects, Games, Messages, Phone.
- Uses a raised graphite tray with four recessed app wells.
- Sits above browser controls and the safe-area inset.
- Does not touch the bottom of the web viewport.
- The dock does not persist inside full-screen apps unless a future tested interaction requires it.
- Pressing an icon depresses the well, introduces a blue halo, and expands the app.

### Lock screen

The lock screen uses a portrait nostalgic wallpaper, a large clock, one or two notifications, and a horizontal unlock control.

- Do not add a fake miniature status bar.
- Keep the screen fixed to the visual viewport.
- Provide a tap alternative to slide-to-unlock.
- Use no more than two notifications.
- Notifications remain clear and dismissible.
- Lock-screen shortcuts may lead to Projects, Games, TV, or FightClub, but must not copy flashlight or camera controls.

### Widgets

Widgets are informative, not decorative.

Desktop widgets may include:

- Clock
- Date
- Media
- System status
- README preview

Pocket Page One includes:

- Featured Project
- Labs Status

Rules:

- Use raised or gently recessed surfaces.
- Keep widget information readable at a glance.
- Avoid dense dashboards.
- Limit the number of widgets so the wallpaper remains visible.
- Use color only for status, artwork, and interaction.

### Notifications

- Use one or two lock-screen notifications.
- Use small session banners sparingly.
- Use dry humor in body copy while keeping the source and action clear.
- A notification must remain dismissible.
- Do not imitate security threats or malware so realistically that the user feels deceived.
- Use Danger only for badges and truly critical or destructive states.

### Inputs, sliders, toggles, and segmented controls

These components should closely follow the attached neumorphism references:

- Tracks and fields are recessed.
- Handles and thumbs are raised.
- Active fill uses System Blue or Signal Cyan.
- Selected segments appear pressed into the track or clearly active through tone and focus.
- Do not rely on low-contrast shadow alone.
- Labels remain outside or above controls when clarity requires it.
- Settings sliders should feel tactile but remain easy to operate with keyboard and touch.

### Project cards and case studies

Project cards live inside Projects, Games, Experiments, and Normal View.

- Use raised surfaces with restrained depth.
- Let project art provide color.
- Clearly show title, status, category, and technology.
- Include direct actions for Live Site, Case Study, GitHub, or Play.
- Do not present the entire desktop as a card dashboard.
- Individual project routes must remain readable and indexable outside the OS shell.

### Notes and technical content

- Notes uses dark paper-like recessed surfaces.
- README content uses concise lines and optional monospaced details.
- Terminal is desktop-only.
- Technical labels use Signal Cyan and IBM Plex Mono.
- Code blocks and routes use recessed surfaces with adequate contrast.

### Focus and accessibility states

- All interactive controls require a visible `focus` treatment.
- Focus is never color alone; combine focus color with outline or depth.
- Honor `prefers-reduced-motion`.
- Provide high-contrast and Normal View options.
- Long-press and double-click actions must have standard tap or menu alternatives.
- Every app and folder icon requires an accessible name.
- Text contrast should meet WCAG AA for normal text.

## Do's and Don'ts

### Do

- Do use dark graphite as the dominant system material.
- Do preserve visible wallpaper and empty space.
- Do make raised, recessed, pressed, selected, disabled, and floating states physically distinct.
- Do keep the virtual light source in the upper-left and the dark shadow in the lower-right.
- Do define a new light-shadow and dark-shadow pair for every theme.
- Do reserve System Blue for active and interactive states.
- Do use nostalgic dusk, roadside, industrial, suburban, and low-saturation photographic wallpapers.
- Do keep desktop icon count near 8–10 on initial load.
- Do use one compact default README window rather than a large dashboard.
- Do make the desktop taskbar recognizable to PC users.
- Do keep Pocket OS to two home-screen pages in V1.
- Do account for Safari browser chrome and safe-area insets.
- Do use a visible back button in every Pocket OS app.
- Do keep humor dry, optional, and secondary to clear actions.
- Do share the same project content and routes across Desktop, Pocket, and Normal View.
- Do test keyboard, pointer, touch, reduced-motion, and high-contrast states.
- Do create custom icons for major WestCose destinations.

### Don't

- Don't turn the desktop into a SaaS dashboard or permanent sidebar.
- Don't cover the wallpaper with too many folders, cards, or widgets.
- Don't use giant planets, cyberpunk skylines, or generic futuristic backgrounds.
- Don't make neon glow the primary method of hierarchy.
- Don't reverse the UI lighting direction between components.
- Don't reuse the Dusk shadow pair unchanged for every theme.
- Don't apply strong neumorphic shadows to every content container.
- Don't nest more than two raised surfaces without a clear interactive reason.
- Don't use glassmorphism as the base material.
- Don't copy Windows, macOS, or iOS component artwork exactly.
- Don't add a fake mobile status bar.
- Don't vertically scroll the Pocket OS lock screen or home screens.
- Don't add more than two Pocket OS home pages in V1.
- Don't add a mobile Terminal, Browser, Media Player, voice assistant, or fake permission prompts.
- Don't use swipe-up-to-home navigation.
- Don't hide essential information inside Easter eggs.
- Don't require double click or long press without an accessible alternative.
- Don't use arbitrary radii, spacing, colors, or shadows outside this system without updating DESIGN.md.
- Don't use bright accent backgrounds behind long-form content.
- Don't sacrifice contrast to preserve a neumorphic effect.
