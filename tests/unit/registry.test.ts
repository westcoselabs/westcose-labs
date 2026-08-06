import { describe, expect, it } from "vitest";

import {
  desktopTaskbarPinnedPlacement,
  getRegistryIssues,
  pocketPageTwoPlacement,
  routeRegistry,
  startMenuGroups,
} from "@/registry";

describe("V2 registries", () => {
  it("passes the registry contract", () => {
    expect(getRegistryIssues()).toEqual([]);
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
