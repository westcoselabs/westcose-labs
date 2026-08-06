import type { AppId } from "./types";

export const desktopPlacement = [
  "projects",
  "games",
  "experiments",
  "about",
  "contact",
  "fightclub",
  "terminal",
  "github",
  "recycle",
  "notes",
] as const satisfies readonly AppId[];

export const startMenuPlacement = [
  "projects",
  "games",
  "experiments",
  "services",
  "about",
  "contact",
  "settings",
  "github",
  "notes",
  "recycle",
  "fightclub",
  "terminal",
] as const satisfies readonly AppId[];

export const desktopTaskbarPinnedPlacement = [
  "projects",
  "games",
  "notes",
  "settings",
] as const satisfies readonly AppId[];

export const startMenuGroups = [
  {
    id: "featured",
    label: "Featured apps",
    apps: ["projects", "games", "experiments", "services"],
  },
  {
    id: "all-programs",
    label: "All programs",
    apps: startMenuPlacement,
  },
  {
    id: "recent",
    label: "Recent builds",
    apps: ["projects", "experiments"],
  },
  {
    id: "games",
    label: "Installed games",
    apps: ["games", "fightclub"],
  },
  {
    id: "system",
    label: "System utilities",
    apps: ["terminal", "about", "settings", "notes", "recycle"],
  },
  {
    id: "unfinished",
    label: "Unfinished business",
    apps: ["github", "contact"],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  apps: readonly AppId[];
}[];

export const pocketPageOnePlacement = [
  "experiments",
  "services",
  "about",
  "github",
  "notes",
  "settings",
] as const satisfies readonly AppId[];

// Social shortcuts stay hidden until their destinations are verified.
export const pocketPageTwoPlacement = [
  "fightclub",
  "recycle",
] as const satisfies readonly AppId[];

export const pocketDockPlacement = [
  "projects",
  "games",
  "messages",
  "phone",
] as const satisfies readonly AppId[];
