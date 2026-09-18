import { achievementRegistry } from "./achievements";
import { appRegistry } from "./apps";
import { discoveryRegistry } from "./discoveries";
import { fightClubRegistry } from "./fightclub";
import { noteFolderRegistry } from "./note-folders";
import { noteRegistry } from "./notes";
import {
  desktopPlacement,
  desktopTaskbarPinnedPlacement,
  pocketDockPlacement,
  pocketPageOnePlacement,
  pocketPageTwoPlacement,
  startMenuPlacement,
} from "./placements";
import { projectRegistry } from "./projects";
import { routeRegistry } from "./routes";
import { terminalCommandRegistry } from "./terminal-commands";
import { themeRegistry } from "./themes";
import { wallpaperRegistry } from "./wallpapers";
import type {
  AchievementDefinition,
  AppId,
  FightClubDefinition,
  LaunchTarget,
  Note,
  OSApp,
  TerminalCommandDefinition,
  ThemeDefinition,
  ThemeTreatments,
  WallpaperDefinition,
  WallpaperSource,
} from "./types";

/**
 * The allowed value per appearance axis. A future skin selects from these
 * instead of inventing a private vocabulary the shells cannot style.
 */
const THEME_TREATMENT_VALUES: {
  readonly [Axis in keyof ThemeTreatments]: readonly ThemeTreatments[Axis][];
} = {
  surface: ["neumorphic", "flat", "beveled", "translucent", "matte"],
  border: ["hairline", "none", "outset", "inset", "heavy"],
  depth: ["soft-shadow", "flat", "hard-shadow", "drop-shadow", "glow"],
  typography: [
    "modern-sans",
    "system-ui",
    "bitmap",
    "monospace",
    "editorial",
  ],
  windowChrome: ["modern-flat", "classic-titlebar", "translucent", "bare"],
  taskbar: ["floating-bar", "anchored-bar", "edge-strip"],
  widget: ["raised-card", "flat-panel", "translucent-card", "suppressed"],
  icon: ["duotone-glyph", "bitmap", "outline", "filled"],
};

const THEME_EFFECT_VALUES = [
  "grain",
  "scanlines",
  "backdrop-blur",
  "vignette",
  "bloom",
] as const;

function isValidWallpaperSource(source: WallpaperSource): boolean {
  return source.kind === "image"
    ? source.src.startsWith("/") && source.width > 0 && source.height > 0
    : source.image.trim().length > 0;
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }

  return [...repeated];
}

function reportDuplicates(
  issues: string[],
  label: string,
  values: readonly string[],
): void {
  for (const duplicate of duplicates(values)) {
    issues.push(`Duplicate ${label}: ${duplicate}`);
  }
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
  const discoveryIds = discoveryRegistry.map((discovery) => discovery.id);
  const achievementIds = achievementRegistry.map((achievement) => achievement.id);
  const themeIds = themeRegistry.map((theme) => theme.id);
  const terminalCommandIds = terminalCommandRegistry.map((command) => command.id);
  const terminalCommandNames = terminalCommandRegistry.flatMap((command) => [
    command.command,
    ...("aliases" in command ? command.aliases : []),
  ]);
  const noteIds = noteRegistry.map((note) => note.id);
  const noteFolderIds = noteFolderRegistry.map((folder) => folder.id);
  const fightClubIds = fightClubRegistry.map((game) => game.id);
  const appIdSet = new Set<string>(appIds);
  const routePathSet = new Set<string>(routePaths);
  const projectSlugSet = new Set<string>(projectSlugs);
  const discoveryIdSet = new Set<string>(discoveryIds);
  const achievementIdSet = new Set<string>(achievementIds);
  const noteFolderIdSet = new Set<string>(noteFolderIds);

  reportDuplicates(issues, "app id", appIds);
  reportDuplicates(issues, "route path", routePaths);
  reportDuplicates(issues, "project slug", projectSlugs);
  reportDuplicates(issues, "discovery id", discoveryIds);
  reportDuplicates(issues, "achievement id", achievementIds);
  reportDuplicates(issues, "theme id", themeIds);
  reportDuplicates(issues, "terminal command id", terminalCommandIds);
  reportDuplicates(issues, "terminal command", terminalCommandNames);
  reportDuplicates(issues, "note id", noteIds);
  reportDuplicates(issues, "note folder id", noteFolderIds);
  reportDuplicates(issues, "FightClub id", fightClubIds);

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
      if (!routePathSet.has(pathname)) {
        issues.push(`App ${app.id} targets an unregistered route: ${pathname}`);
      }
    }
  }

  const placements: readonly [string, readonly AppId[]][] = [
    ["desktop", desktopPlacement],
    ["start menu", startMenuPlacement],
    ["desktop taskbar", desktopTaskbarPinnedPlacement],
    ["Pocket Page One", pocketPageOnePlacement],
    ["Pocket Page Two", pocketPageTwoPlacement],
    ["Pocket dock", pocketDockPlacement],
  ];

  for (const [placementName, ids] of placements) {
    reportDuplicates(issues, `${placementName} placement`, ids);
    for (const id of ids) {
      if (!appIdSet.has(id)) {
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

  for (const project of projectRegistry) {
    for (const relatedSlug of project.relatedProjectSlugs) {
      if (!projectSlugSet.has(relatedSlug)) {
        issues.push(
          `Project ${project.slug} references unknown project: ${relatedSlug}`,
        );
      }
    }
  }

  const themes = themeRegistry as readonly ThemeDefinition[];
  const wallpapers = wallpaperRegistry as readonly WallpaperDefinition[];
  const wallpaperIdSet = new Set<string>(
    wallpapers.map((wallpaper) => wallpaper.id),
  );
  const themeIdSet = new Set<string>(themeIds);

  if (themes.filter((theme) => theme.default).length !== 1) {
    issues.push("Theme registry must contain exactly one default theme");
  }
  for (const theme of themes) {
    if (theme.discoveryId && !discoveryIdSet.has(theme.discoveryId)) {
      issues.push(
        `Theme ${theme.id} references unknown discovery: ${theme.discoveryId}`,
      );
    }
    if (theme.hidden && !theme.discoveryId) {
      issues.push(`Hidden theme ${theme.id} has no unlocking discovery`);
    }
    if (!wallpaperIdSet.has(theme.recommendedWallpaperId)) {
      issues.push(
        `Theme ${theme.id} recommends unknown wallpaper: ${theme.recommendedWallpaperId}`,
      );
    }
    if (!theme.dataTheme) {
      issues.push(`Theme ${theme.id} is missing a dataTheme selector`);
    }
    for (const axis of Object.keys(
      THEME_TREATMENT_VALUES,
    ) as (keyof ThemeTreatments)[]) {
      const allowed: readonly string[] = THEME_TREATMENT_VALUES[axis];
      if (!allowed.includes(theme.treatments[axis])) {
        issues.push(
          `Theme ${theme.id} uses an unknown ${axis} treatment: ${theme.treatments[axis]}`,
        );
      }
    }
    for (const effect of theme.effects) {
      if (!(THEME_EFFECT_VALUES as readonly string[]).includes(effect)) {
        issues.push(`Theme ${theme.id} uses an unknown effect: ${effect}`);
      }
    }
    reportDuplicates(issues, `effect on theme ${theme.id}`, theme.effects);
  }

  reportDuplicates(
    issues,
    "wallpaper id",
    wallpapers.map((wallpaper) => wallpaper.id),
  );
  if (wallpapers.filter((wallpaper) => wallpaper.default).length !== 1) {
    issues.push("Wallpaper registry must contain exactly one default wallpaper");
  }
  for (const wallpaper of wallpapers) {
    if (!wallpaper.name || !wallpaper.description) {
      issues.push(`Wallpaper ${wallpaper.id} is missing a name or description`);
    }
    if (wallpaper.discoveryId && !discoveryIdSet.has(wallpaper.discoveryId)) {
      issues.push(
        `Wallpaper ${wallpaper.id} references unknown discovery: ${wallpaper.discoveryId}`,
      );
    }
    if (wallpaper.hidden && !wallpaper.discoveryId) {
      issues.push(`Hidden wallpaper ${wallpaper.id} has no unlocking discovery`);
    }
    if (
      wallpaper.recommendedThemeId &&
      !themeIdSet.has(wallpaper.recommendedThemeId)
    ) {
      issues.push(
        `Wallpaper ${wallpaper.id} recommends unknown theme: ${wallpaper.recommendedThemeId}`,
      );
    }
    if (!isValidWallpaperSource(wallpaper.desktop)) {
      issues.push(`Wallpaper ${wallpaper.id} has an invalid desktop source`);
    }
    if (!isValidWallpaperSource(wallpaper.pocket)) {
      issues.push(`Wallpaper ${wallpaper.id} has an invalid pocket source`);
    }
    for (const [surface, scrim] of Object.entries(wallpaper.scrim)) {
      if (!scrim.trim()) {
        issues.push(
          `Wallpaper ${wallpaper.id} has an empty ${surface} scrim`,
        );
      }
    }
    if (!wallpaper.preview.image.trim() || !wallpaper.preview.label.trim()) {
      issues.push(`Wallpaper ${wallpaper.id} is missing preview metadata`);
    }
  }

  const defaultTheme = themes.find((theme) => theme.default);
  const defaultWallpaper = wallpapers.find((wallpaper) => wallpaper.default);
  if (defaultTheme?.hidden) {
    issues.push("The default theme must not be hidden");
  }
  if (defaultWallpaper?.hidden) {
    issues.push("The default wallpaper must not be hidden");
  }

  for (const achievement of achievementRegistry as readonly AchievementDefinition[]) {
    if (
      achievement.discoveryId &&
      !discoveryIdSet.has(achievement.discoveryId)
    ) {
      issues.push(
        `Achievement ${achievement.id} references unknown discovery: ${achievement.discoveryId}`,
      );
    }
  }

  for (const command of terminalCommandRegistry as readonly TerminalCommandDefinition[]) {
    if (command.route && !routePathSet.has(command.route)) {
      issues.push(
        `Terminal command ${command.id} references unknown route: ${command.route}`,
      );
    }
    if (command.discoveryId && !discoveryIdSet.has(command.discoveryId)) {
      issues.push(
        `Terminal command ${command.id} references unknown discovery: ${command.discoveryId}`,
      );
    }
  }

  for (const note of noteRegistry as readonly Note[]) {
    if (!noteFolderIdSet.has(note.folderId)) {
      issues.push(`Note ${note.id} references unknown folder: ${note.folderId}`);
    }
    if (note.discoveryId && !discoveryIdSet.has(note.discoveryId)) {
      issues.push(
        `Note ${note.id} references unknown discovery: ${note.discoveryId}`,
      );
    }
  }

  for (const game of fightClubRegistry as readonly FightClubDefinition[]) {
    if (!appIdSet.has(game.id as AppId)) {
      issues.push(`FightClub entry ${game.id} has no registered app`);
    }
    if (!routePathSet.has(game.route)) {
      issues.push(`FightClub entry ${game.id} references unknown route: ${game.route}`);
    }
    for (const discoveryId of game.discoveryIds) {
      if (!discoveryIdSet.has(discoveryId)) {
        issues.push(
          `FightClub entry ${game.id} references unknown discovery: ${discoveryId}`,
        );
      }
    }
    for (const achievementId of game.achievementIds) {
      if (!achievementIdSet.has(achievementId)) {
        issues.push(
          `FightClub entry ${game.id} references unknown achievement: ${achievementId}`,
        );
      }
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
