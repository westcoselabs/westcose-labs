import { siteConfig } from "./site";
import { getRouteDescriptor } from "./routes";
import type { AppId, OSApp } from "./types";

const githubTarget = siteConfig.githubUrl
  ? ({ kind: "external", href: siteConfig.githubUrl } as const)
  : ({ kind: "route", href: "/about#links" } as const);

export const appRegistry = [
  {
    id: "projects",
    name: "Projects",
    desktopLabel: "Projects",
    pocketLabel: "Projects",
    description: "Selected product, web, and software work.",
    accessibilityLabel: "Open Projects",
    iconKey: "projects",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/projects" },
    defaultPocketPage: 0,
  },
  {
    id: "games",
    name: "Games",
    desktopLabel: "Games",
    pocketLabel: "Games",
    description: "Playable work and game development notes.",
    accessibilityLabel: "Open Games",
    iconKey: "games",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/games" },
    defaultPocketPage: 0,
  },
  {
    id: "experiments",
    name: "Experiments",
    desktopLabel: "Experiments",
    pocketLabel: "Experiments",
    description: "Small prototypes and technical studies.",
    accessibilityLabel: "Open Experiments",
    iconKey: "experiments",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/experiments" },
    defaultPocketPage: 0,
  },
  {
    id: "services",
    name: "Services",
    desktopLabel: "Services",
    pocketLabel: "Services",
    description: "Capabilities for thoughtful digital products.",
    accessibilityLabel: "Open Services",
    iconKey: "services",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/services" },
    defaultPocketPage: 0,
  },
  {
    id: "about",
    name: "About",
    desktopLabel: "About",
    pocketLabel: "About",
    description: "Background, approach, and system information.",
    accessibilityLabel: "Open About",
    iconKey: "about",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/about" },
    defaultPocketPage: 0,
  },
  {
    id: "contact",
    name: "Contact",
    desktopLabel: "Contact",
    pocketLabel: "Contact",
    description: "Start a project through native email, text, or phone.",
    accessibilityLabel: "Open Contact",
    iconKey: "contact",
    status: siteConfig.contactEmailConfigured
      ? "available"
      : "needs-configuration",
    availableIn: ["desktop", "normal"],
    target: { kind: "route", href: "/contact" },
  },
  {
    id: "fightclub",
    name: "FightClub",
    desktopLabel: "FightClub.exe",
    pocketLabel: "FightClub",
    description: "Project launcher and development presentation.",
    accessibilityLabel: "Open FightClub project launcher",
    iconKey: "fightclub",
    status: "fixture",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/games/fightclub" },
    defaultPocketPage: 1,
  },
  {
    id: "terminal",
    name: "Terminal",
    desktopLabel: "Terminal",
    pocketLabel: "Terminal",
    description: "A small command utility with keyboard equivalents.",
    accessibilityLabel: "Open Terminal",
    iconKey: "terminal",
    status: "available",
    availableIn: ["desktop", "normal"],
    target: { kind: "route", href: "/terminal" },
  },
  {
    id: "github",
    name: "GitHub",
    desktopLabel: "GitHub",
    pocketLabel: "GitHub",
    description: siteConfig.githubConfigured
      ? "Open the verified GitHub profile."
      : "Profile link awaiting owner configuration.",
    accessibilityLabel: siteConfig.githubConfigured
      ? "Open GitHub profile in a new tab"
      : "Review pending GitHub profile configuration",
    iconKey: "github",
    status: siteConfig.githubConfigured
      ? "available"
      : "needs-configuration",
    availableIn: ["desktop", "pocket", "normal"],
    target: githubTarget,
    defaultPocketPage: 0,
  },
  {
    id: "recycle",
    name: "Recycle",
    desktopLabel: "Recycle Bin",
    pocketLabel: "Recycle",
    description: "Nonessential archive material and harmless oddities.",
    accessibilityLabel: "Open Recycle",
    iconKey: "recycle",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/recycle" },
    defaultPocketPage: 1,
  },
  {
    id: "notes",
    name: "Notes",
    desktopLabel: "README.txt",
    pocketLabel: "Notes",
    description: "A short field guide to WestCose Labs OS.",
    accessibilityLabel: "Open README notes",
    iconKey: "notes",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/notes" },
    defaultPocketPage: 0,
  },
  {
    id: "settings",
    name: "Settings",
    desktopLabel: "Settings",
    pocketLabel: "Settings",
    description: "Display, contrast, motion, sound, and session controls.",
    accessibilityLabel: "Open Settings",
    iconKey: "settings",
    status: "available",
    availableIn: ["desktop", "pocket", "normal"],
    target: { kind: "route", href: "/settings" },
    defaultPocketPage: 0,
  },
  {
    id: "messages",
    name: "Messages",
    desktopLabel: "Messages",
    pocketLabel: "Messages",
    description: "Start a native text message.",
    accessibilityLabel: `Text ${siteConfig.ownerName} at ${siteConfig.phoneDisplay}`,
    iconKey: "messages",
    status: "available",
    availableIn: ["pocket"],
    target: { kind: "sms", href: `sms:${siteConfig.phoneE164}` },
    defaultPocketPage: 0,
  },
  {
    id: "phone",
    name: "Phone",
    desktopLabel: "Phone",
    pocketLabel: "Phone",
    description: "Start a native phone call.",
    accessibilityLabel: `Call ${siteConfig.ownerName} at ${siteConfig.phoneDisplay}`,
    iconKey: "phone",
    status: "available",
    availableIn: ["pocket"],
    target: { kind: "telephone", href: `tel:${siteConfig.phoneE164}` },
    defaultPocketPage: 0,
  },
] as const satisfies readonly OSApp[];

export type RegisteredApp = (typeof appRegistry)[number];

export const appsById = Object.fromEntries(
  appRegistry.map((app) => [app.id, app]),
) as Record<AppId, RegisteredApp>;

export function getAppById(id: AppId): RegisteredApp {
  return appsById[id];
}

export function getAppByPath(pathname: string): RegisteredApp | undefined {
  const appId = getRouteDescriptor(pathname)?.appId;
  return appId ? appsById[appId] : undefined;
}
