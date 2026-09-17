import type { PocketPage } from "../state/pocket";

const NESTED_ROUTE_PARENTS = new Map<string, string>([
  ["games/fightclub", "/games"],
]);

export interface PocketBackTarget {
  readonly pathname: string;
  readonly homePage?: PocketPage;
  readonly kind: "parent" | "home";
}

export function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/u, 1)[0] ?? "/";
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/gu, "/");
  const withoutTrailingSlash = collapsed.replace(/\/+$/u, "");

  return withoutTrailingSlash || "/";
}

export function isRootRoute(pathname: string): boolean {
  return normalizePathname(pathname) === "/";
}

export function isPocketDirectRoute(pathname: string): boolean {
  return !isRootRoute(pathname);
}

export function getRouteParent(pathname: string): string | null {
  const normalized = normalizePathname(pathname);

  if (normalized === "/") {
    return null;
  }

  const segments = normalized.slice(1).split("/");
  const explicitParent = NESTED_ROUTE_PARENTS.get(segments.join("/"));

  if (explicitParent) {
    return explicitParent;
  }

  if (
    segments.length > 1 &&
    (segments[0] === "projects" || segments[0] === "experiments")
  ) {
    return `/${segments[0]}`;
  }

  if (segments[0] === "notes" && segments.length > 1) {
    return "/notes";
  }

  if (segments[0] === "settings" && segments.length > 1) {
    return "/settings";
  }

  return "/";
}

export function resolvePocketBackTarget(options: {
  readonly pathname: string;
  readonly originPage: PocketPage | null;
  readonly defaultPage: PocketPage;
}): PocketBackTarget {
  const pathname = normalizePathname(options.pathname);
  const parent = getRouteParent(pathname);

  if (parent && parent !== "/") {
    return { pathname: parent, kind: "parent" };
  }

  return {
    pathname: "/",
    homePage: options.originPage ?? options.defaultPage,
    kind: "home",
  };
}

export function isPocketUnsupportedRoute(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === "/contact" || normalized === "/terminal";
}
