export type ShellId = "desktop" | "pocket" | "normal";

export type AppStatus = "available" | "fixture" | "needs-configuration";

export type AppTone =
  | "blue"
  | "indigo"
  | "cyan"
  | "teal"
  | "silver"
  | "graphite"
  | "amber"
  | "cobalt"
  | "green"
  | "red";

export type LaunchTarget =
  | { kind: "route"; href: `/${string}` }
  | { kind: "external"; href: `https://${string}` }
  | { kind: "sms"; href: `sms:${string}` }
  | { kind: "telephone"; href: `tel:${string}` }
  | { kind: "mail"; href: `mailto:${string}` };

export type AppId =
  | "projects"
  | "games"
  | "experiments"
  | "services"
  | "about"
  | "contact"
  | "fightclub"
  | "terminal"
  | "github"
  | "recycle"
  | "notes"
  | "settings"
  | "messages"
  | "phone";

export type OSApp = {
  id: AppId;
  name: string;
  desktopLabel: string;
  pocketLabel: string;
  description: string;
  accessibilityLabel: string;
  iconKey: string;
  tone: AppTone;
  status: AppStatus;
  availableIn: readonly ShellId[];
  target: LaunchTarget;
  defaultPocketPage?: 0 | 1;
};

export type ProjectStatus = "development-fixture" | "published";

export type Project = {
  slug: string;
  title: string;
  shortDescription: string;
  status: ProjectStatus;
  category: string;
  technologies: readonly string[];
  cover?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  gallery: readonly {
    src: string;
    alt: string;
    width: number;
    height: number;
  }[];
  liveUrl?: `https://${string}`;
  githubUrl?: `https://${string}`;
  featured: boolean;
  relatedProjectSlugs: readonly string[];
  publishedAt?: string;
  role?: string;
  objective?: string;
  constraints?: readonly string[];
  decisions?: readonly string[];
  outcomes?: readonly string[];
  versionLabel?: string;
  accentTone?: AppTone;
  pocketSummary?: string;
  desktopPresentation?: "portfolio-explorer" | "game-launcher";
  ownerInputNeeded?: readonly string[];
};

export type ExperimentStatus =
  | "stable"
  | "beta"
  | "unfinished"
  | "archived"
  | "broken-on-purpose";

export type Experiment = {
  slug: string;
  title: string;
  purpose: string;
  status: ExperimentStatus;
  requirements: string;
  proof: string;
  iconKey: string;
  tone: AppTone;
};

export type Note = {
  id: string;
  title: string;
  summary: string;
  body: readonly string[];
  preview: string;
  updatedAt: string;
  tag: string;
  tags?: readonly string[];
  attachmentCount?: number;
  folderId: string;
  pinned?: boolean;
  hidden?: boolean;
  discoveryId?: string;
  desktopFileName?: string;
  titleMutation?: {
    afterOpenCount: number;
    alternateTitle: string;
    discoveryId?: string;
  };
};

export type Discovery = {
  id: string;
  title: string;
  description: string;
  category:
    | "desktop"
    | "notes"
    | "settings"
    | "terminal"
    | "recycle"
    | "fightclub"
    | "theme";
  hidden: boolean;
  notificationCopy?: string;
  badgeTarget?: string;
};

/**
 * Appearance treatments are named behaviours, not literal styles. A theme
 * selects one value per axis and the shells expose the selection as
 * `data-theme-*` attributes, so a future skin is a registry entry plus its own
 * presentation styles rather than a new set of shell components.
 */
export type ThemeSurfaceMaterial =
  | "neumorphic"
  | "flat"
  | "beveled"
  | "translucent"
  | "matte";

export type ThemeBorderTreatment =
  | "hairline"
  | "none"
  | "outset"
  | "inset"
  | "heavy";

export type ThemeDepthTreatment =
  | "soft-shadow"
  | "flat"
  | "hard-shadow"
  | "drop-shadow"
  | "glow";

export type ThemeTypographyTreatment =
  | "modern-sans"
  | "system-ui"
  | "bitmap"
  | "monospace"
  | "editorial";

export type ThemeWindowChrome =
  | "modern-flat"
  | "classic-titlebar"
  | "translucent"
  | "bare";

export type ThemeTaskbarTreatment =
  | "floating-bar"
  | "anchored-bar"
  | "edge-strip";

export type ThemeWidgetTreatment =
  | "raised-card"
  | "flat-panel"
  | "translucent-card"
  | "suppressed";

export type ThemeIconTreatment =
  | "duotone-glyph"
  | "bitmap"
  | "outline"
  | "filled";

export type ThemeEffect =
  | "grain"
  | "scanlines"
  | "backdrop-blur"
  | "vignette"
  | "bloom";

export type ThemeTreatments = {
  readonly surface: ThemeSurfaceMaterial;
  readonly border: ThemeBorderTreatment;
  readonly depth: ThemeDepthTreatment;
  readonly typography: ThemeTypographyTreatment;
  readonly windowChrome: ThemeWindowChrome;
  readonly taskbar: ThemeTaskbarTreatment;
  readonly widget: ThemeWidgetTreatment;
  readonly icon: ThemeIconTreatment;
};

/**
 * `base-tokens` keeps the canonical Dusk palette. `theme-tokens` declares that
 * the theme redefines semantic colour roles in a `[data-theme="<dataTheme>"]`
 * stylesheet block, which keeps accessibility overrides later in the cascade.
 */
export type ThemePaletteSource = "base-tokens" | "theme-tokens";

export type ThemePalette = {
  readonly source: ThemePaletteSource;
  readonly colorScheme: "dark" | "light";
  readonly accentRole: "primary" | "secondary" | "tertiary";
};

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  default: boolean;
  hidden: boolean;
  discoveryId?: string;
  dataTheme: string;
  palette: ThemePalette;
  treatments: ThemeTreatments;
  effects: readonly ThemeEffect[];
  recommendedWallpaperId: string;
  /** Optional chrome copy; omitted entries retain the original shell copy. */
  copy?: {
    systemLabel: string;
    launcherLabel: string;
    startupTitle: string;
    startupStatus: string;
  };
};

/**
 * A wallpaper is either a bundled asset or a token-built CSS image, so a skin
 * can ship artwork without one, and Desktop and Pocket can render different
 * sources for the same wallpaper id.
 */
export type WallpaperSource =
  | {
      readonly kind: "image";
      readonly src: `/${string}`;
      readonly width: number;
      readonly height: number;
    }
  | { readonly kind: "generated"; readonly image: string };

export type WallpaperDefinition = {
  id: string;
  name: string;
  description: string;
  default: boolean;
  hidden: boolean;
  discoveryId?: string;
  recommendedThemeId?: string;
  desktop: WallpaperSource;
  pocket: WallpaperSource;
  /**
   * Decorative scrims layered over the wallpaper by each shell surface. High
   * contrast and forced colours override the resulting property, so a scrim
   * never wins over an accessibility preference.
   */
  scrim: {
    readonly desktop: string;
    readonly pocketHome: string;
    readonly pocketLock: string;
  };
  /** Preview metadata for pickers; no extra asset required. */
  preview: {
    readonly image: string;
    readonly label: string;
  };
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  category: Discovery["category"];
  hidden: boolean;
  discoveryId?: string;
};

export type TerminalCommandDefinition = {
  id: string;
  command: string;
  description: string;
  hidden: boolean;
  aliases?: readonly string[];
  route?: `/${string}`;
  discoveryId?: string;
};

export type NoteFolderDefinition = {
  id: string;
  name: string;
  description: string;
  kind: "collection" | "smart";
};

export type FightClubDefinition = {
  id: string;
  title: string;
  route: `/${string}`;
  buildStatus: "unavailable" | "launcher" | "playable";
  artwork: {
    src: string;
    alt: string;
  };
  hostedBuild: {
    allowedOrigin: `https://${string}`;
    buildLabel: string;
    embedStatus: "verified" | "external-only";
    embedUrl: `https://${string}`;
    embedVerifiedAt: string;
    launchUrl: `https://${string}`;
    messageContract: "none";
    provider: string;
  };
  controls: {
    desktopPlayerOne: string;
    desktopPlayerTwo: string;
    pocket: string;
  };
  modes: readonly string[];
  discoveryIds: readonly string[];
  achievementIds: readonly string[];
};

export type Capability = {
  id: string;
  title: string;
  description: string;
  proofLabel: string;
  proofHref: `/${string}`;
};

export type SystemFact = {
  label: string;
  value: string;
  detail?: string;
};

export type RouteKind =
  | "landing"
  | "app-index"
  | "project"
  | "experiment"
  | "utility";

export type RouteDescriptor = {
  path: `/${string}` | "/";
  kind: RouteKind;
  title: string;
  description: string;
  appId?: AppId;
  availableIn: readonly ShellId[];
  parentPath?: `/${string}` | "/";
};

export type SiteConfig = {
  name: string;
  ownerName: string;
  description: string;
  siteUrl: string;
  siteUrlConfigured: boolean;
  contactEmail: string | null;
  contactEmailConfigured: boolean;
  phoneDisplay: string;
  phoneE164: string;
  githubUrl: `https://${string}` | null;
  githubConfigured: boolean;
  socials: readonly {
    id: string;
    label: string;
    url: `https://${string}`;
  }[];
};
