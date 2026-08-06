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
] as const satisfies readonly AppId[];

export const pocketPageOnePlacement = [
  "experiments",
  "services",
  "about",
  "github",
  "notes",
  "settings",
] as const satisfies readonly AppId[];

// V1 deliberately has no social shortcuts until their destinations are verified.
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
