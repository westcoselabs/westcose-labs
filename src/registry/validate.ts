import { appRegistry } from "./apps";
import {
  desktopPlacement,
  pocketDockPlacement,
  pocketPageOnePlacement,
  pocketPageTwoPlacement,
  startMenuPlacement,
} from "./placements";
import { projectRegistry } from "./projects";
import { routeRegistry } from "./routes";
import type { AppId, LaunchTarget, OSApp } from "./types";

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }

  return [...repeated];
}

function isValidLaunchTarget(target: LaunchTarget): boolean {
  switch (target.kind) {
    case "route":
      return target.href.startsWith("/");
    case "external":
      return target.href.startsWith("https://");
    case "sms":
      return /^sms:\+\d{10,15}$/.test(target.href);
    case "telephone":
      return /^tel:\+\d{10,15}$/.test(target.href);
    case "mail":
      return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.href);
  }
}

export function getRegistryIssues(): string[] {
  const issues: string[] = [];
  const appIds = appRegistry.map((app) => app.id);
  const routePaths = routeRegistry.map((route) => route.path);
  const projectSlugs = projectRegistry.map((project) => project.slug);

  for (const id of duplicates(appIds)) issues.push(`Duplicate app id: ${id}`);
  for (const path of duplicates(routePaths)) {
    issues.push(`Duplicate route path: ${path}`);
  }
  for (const slug of duplicates(projectSlugs)) {
    issues.push(`Duplicate project slug: ${slug}`);
  }

  for (const app of appRegistry as readonly OSApp[]) {
    if (!app.name || !app.desktopLabel || !app.pocketLabel) {
      issues.push(`App ${app.id} is missing a visible label`);
    }
    if (!app.accessibilityLabel) {
      issues.push(`App ${app.id} is missing an accessibility label`);
    }
    if (app.availableIn.length === 0) {
      issues.push(`App ${app.id} has no available shell`);
    }
    if (!isValidLaunchTarget(app.target)) {
      issues.push(`App ${app.id} has an invalid ${app.target.kind} target`);
    }

    if (app.target.kind === "route") {
      const pathname = app.target.href.split(/[?#]/, 1)[0];
      if (!routePaths.includes(pathname as (typeof routePaths)[number])) {
        issues.push(`App ${app.id} targets an unregistered route: ${pathname}`);
      }
    }
  }

  const placements: readonly [string, readonly AppId[]][] = [
    ["desktop", desktopPlacement],
    ["start menu", startMenuPlacement],
    ["Pocket Page One", pocketPageOnePlacement],
    ["Pocket Page Two", pocketPageTwoPlacement],
    ["Pocket dock", pocketDockPlacement],
  ];

  for (const [placementName, ids] of placements) {
    for (const duplicate of duplicates(ids)) {
      issues.push(`Duplicate ${placementName} placement: ${duplicate}`);
    }
    for (const id of ids) {
      if (!appIds.includes(id)) {
        issues.push(`Unknown ${placementName} app: ${id}`);
      }
    }
  }

  const deferredIds = new Set(["tv", "world", "arcade", "archive"]);
  for (const id of pocketPageTwoPlacement) {
    if (deferredIds.has(id)) {
      issues.push(`Deferred app leaked into Pocket Page Two: ${id}`);
    }
  }

  return issues;
}

export function assertValidRegistries(): void {
  const issues = getRegistryIssues();
  if (issues.length) {
    throw new Error(`Invalid WestCose registry:\n${issues.join("\n")}`);
  }
}
