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

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  default: boolean;
  hidden: boolean;
  discoveryId?: string;
  desktopWallpaper: string;
  pocketWallpaper: string;
  dataTheme: string;
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
