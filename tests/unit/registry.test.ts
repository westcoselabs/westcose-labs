import { describe, expect, it } from "vitest";

import {
  achievementRegistry,
  desktopTaskbarPinnedPlacement,
  discoveryRegistry,
  fightClubRegistry,
  getRegistryIssues,
  humorRegistry,
  noteFolderRegistry,
  noteRegistry,
  personalityRegistry,
  pocketNotifications,
  pocketPageTwoPlacement,
  projectRegistry,
  routeRegistry,
  startMenuGroups,
  systemFacts,
  terminalCommandRegistry,
  themeRegistry,
} from "@/registry";
import { noteRegistry as dedicatedNoteRegistry } from "@/registry/notes";
import type {
  AchievementDefinition,
  FightClubDefinition,
  Note,
  TerminalCommandDefinition,
  ThemeDefinition,
} from "@/registry/types";

const unique = (values: readonly string[]) => new Set(values).size === values.length;

describe("V3 registries", () => {
  it("passes the combined registry contract", () => {
    expect(getRegistryIssues()).toEqual([]);
  });

  it("keeps every V3 registry id unique", () => {
    expect(unique(discoveryRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(achievementRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(themeRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(terminalCommandRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(noteRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(noteFolderRegistry.map((entry) => entry.id))).toBe(true);
    expect(unique(fightClubRegistry.map((entry) => entry.id))).toBe(true);
  });

  it("keeps registry references resolvable", () => {
    const discoveryIds = new Set<string>(
      discoveryRegistry.map((entry) => entry.id),
    );
    const achievementIds = new Set<string>(
      achievementRegistry.map((entry) => entry.id),
    );
    const folderIds = new Set<string>(
      noteFolderRegistry.map((entry) => entry.id),
    );
    const routePaths = new Set<string>(
      routeRegistry.map((entry) => entry.path),
    );

    for (const theme of themeRegistry as readonly ThemeDefinition[]) {
      if (theme.discoveryId) expect(discoveryIds.has(theme.discoveryId)).toBe(true);
    }
    for (const achievement of achievementRegistry as readonly AchievementDefinition[]) {
      if (achievement.discoveryId) {
        expect(discoveryIds.has(achievement.discoveryId)).toBe(true);
      }
    }
    for (const command of terminalCommandRegistry as readonly TerminalCommandDefinition[]) {
      if (command.route) expect(routePaths.has(command.route)).toBe(true);
      if (command.discoveryId) {
        expect(discoveryIds.has(command.discoveryId)).toBe(true);
      }
    }
    for (const note of noteRegistry as readonly Note[]) {
      expect(folderIds.has(note.folderId)).toBe(true);
      if (note.discoveryId) expect(discoveryIds.has(note.discoveryId)).toBe(true);
    }
    for (const game of fightClubRegistry as readonly FightClubDefinition[]) {
      expect(routePaths.has(game.route)).toBe(true);
      game.discoveryIds.forEach((id) => expect(discoveryIds.has(id)).toBe(true));
      game.achievementIds.forEach((id) =>
        expect(achievementIds.has(id)).toBe(true),
      );
    }
  });

  it("has one truthful default theme and only OS-observable achievements", () => {
    expect(themeRegistry.filter((theme) => theme.default)).toHaveLength(1);
    expect(themeRegistry[0]).toMatchObject({ id: "dusk", dataTheme: "dusk" });
    expect(achievementRegistry).toHaveLength(4);
    expect(
      achievementRegistry.every((achievement) =>
        achievement.id.startsWith("fightclub."),
      ),
    ).toBe(true);
  });

  it("exports notes and personality copy from one source each", () => {
    expect(noteRegistry).toBe(dedicatedNoteRegistry);
    expect(personalityRegistry).toBe(humorRegistry);
  });

  it("does not render retired Normal View language from registries", () => {
    expect(
      JSON.stringify({
        humorRegistry,
        noteRegistry,
        pocketNotifications,
        projectRegistry,
        systemFacts,
      }),
    ).not.toMatch(/Normal View/i);
  });

  it("does not leak deferred apps or routes", () => {
    expect(pocketPageTwoPlacement).toEqual(["fightclub", "recycle"]);
    const paths = routeRegistry.map((route) => route.path);
    expect(paths).not.toContain("/tv");
    expect(paths).not.toContain("/world");
    expect(paths).not.toContain("/arcade");
    expect(paths).not.toContain("/archive");
  });

  it("keeps desktop taskbar placement explicit and grouped", () => {
    expect(desktopTaskbarPinnedPlacement).toEqual([
      "projects",
      "games",
      "notes",
      "settings",
    ]);
    expect(startMenuGroups.map((group) => group.id)).toEqual([
      "featured",
      "all-programs",
      "recent",
      "games",
      "system",
      "unfinished",
    ]);
  });

  it("registers the static GitHub directory without inventing API data", () => {
    expect(routeRegistry.some((route) => route.path === "/github")).toBe(true);
  });
});
