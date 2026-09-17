import { normalizePathname } from "@/lib/routes";

import type { RouteDescriptor, ShellId } from "./types";

export const routeRegistry = [
  {
    path: "/",
    kind: "landing",
    title: "WestCose Labs OS",
    description: "Portfolio home and operating-system entry point.",
    availableIn: ["desktop", "pocket", "normal"],
  },
  {
    path: "/projects",
    kind: "app-index",
    title: "Projects",
    description: "Selected software and web work.",
    appId: "projects",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/projects/[slug]",
    kind: "project",
    title: "Project",
    description: "Project case study.",
    appId: "projects",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/projects",
  },
  {
    path: "/games",
    kind: "app-index",
    title: "Games",
    description: "Game projects and launchers.",
    appId: "games",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/games/fightclub",
    kind: "project",
    title: "FightClub",
    description: "FightClub project launcher.",
    appId: "fightclub",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/games",
  },
  {
    path: "/experiments",
    kind: "app-index",
    title: "Experiments",
    description: "Small prototypes and technical studies.",
    appId: "experiments",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/experiments/[slug]",
    kind: "experiment",
    title: "Experiment",
    description: "Experiment detail.",
    appId: "experiments",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/experiments",
  },
  {
    path: "/services",
    kind: "app-index",
    title: "Services",
    description: "Product and engineering capabilities.",
    appId: "services",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/about",
    kind: "app-index",
    title: "About",
    description: "Background and working approach.",
    appId: "about",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/contact",
    kind: "app-index",
    title: "Contact",
    description: "Native email, text, and phone contact actions.",
    appId: "contact",
    availableIn: ["desktop", "normal"],
    parentPath: "/",
  },
  {
    path: "/notes",
    kind: "app-index",
    title: "Notes",
    description: "README and field notes.",
    appId: "notes",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/settings",
    kind: "utility",
    title: "Settings",
    description: "Display and accessibility preferences.",
    appId: "settings",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/github",
    kind: "app-index",
    title: "GitHub",
    description: "Verified repository and profile directory.",
    appId: "github",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/settings/[category]",
    kind: "utility",
    title: "Settings category",
    description: "A WestCose OS settings category.",
    appId: "settings",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/settings",
  },
  {
    path: "/notes/folder/[folderId]",
    kind: "utility",
    title: "Notes folder",
    description: "A Notes folder.",
    appId: "notes",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/notes",
  },
  {
    path: "/notes/[noteId]",
    kind: "utility",
    title: "Note",
    description: "A note in the shared Notes library.",
    appId: "notes",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/notes",
  },
  {
    path: "/recycle",
    kind: "utility",
    title: "Recycle",
    description: "Nonessential archive material.",
    appId: "recycle",
    availableIn: ["desktop", "pocket", "normal"],
    parentPath: "/",
  },
  {
    path: "/terminal",
    kind: "utility",
    title: "Terminal",
    description: "A small command utility.",
    appId: "terminal",
    availableIn: ["desktop", "normal"],
    parentPath: "/",
  },
] as const satisfies readonly RouteDescriptor[];

export function routeSupportsShell(
  pathname: string,
  shell: ShellId,
): boolean {
  const route = getRouteDescriptor(pathname);
  return route
    ? (route.availableIn as readonly ShellId[]).includes(shell)
    : true;
}

export function getRouteDescriptor(
  pathname: string,
): RouteDescriptor | undefined {
  const normalizedPathname = normalizePathname(pathname);
  const exact = routeRegistry.find(
    (route) => route.path === normalizedPathname,
  );
  if (exact) return exact;

  if (/^\/projects\/[^/]+$/.test(normalizedPathname)) {
    return routeRegistry.find((route) => route.path === "/projects/[slug]");
  }

  if (/^\/experiments\/[^/]+$/.test(normalizedPathname)) {
    return routeRegistry.find((route) => route.path === "/experiments/[slug]");
  }

  if (/^\/notes\/folder\/[^/]+$/.test(normalizedPathname)) {
    return routeRegistry.find(
      (route) => route.path === "/notes/folder/[folderId]",
    );
  }

  if (/^\/notes\/[^/]+$/.test(normalizedPathname)) {
    return routeRegistry.find((route) => route.path === "/notes/[noteId]");
  }

  if (/^\/settings\/[^/]+$/.test(normalizedPathname)) {
    return routeRegistry.find((route) => route.path === "/settings/[category]");
  }

  return undefined;
}

export function getParentPath(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);
  if (normalizedPathname === "/") return null;

  return getRouteDescriptor(normalizedPathname)?.parentPath ?? "/";
}
