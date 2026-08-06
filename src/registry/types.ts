export type ShellId = "desktop" | "pocket" | "normal";

export type AppStatus = "available" | "fixture" | "needs-configuration";

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
