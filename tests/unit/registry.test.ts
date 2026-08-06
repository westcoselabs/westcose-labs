import { describe, expect, it } from "vitest";

import {
  getRegistryIssues,
  pocketPageTwoPlacement,
  routeRegistry,
} from "@/registry";

describe("V1 registries", () => {
  it("pass the registry contract", () => {
    expect(getRegistryIssues()).toEqual([]);
  });

  it("do not leak deferred apps or routes", () => {
    expect(pocketPageTwoPlacement).toEqual(["fightclub", "recycle"]);
    const paths = routeRegistry.map((route) => route.path);
    expect(paths).not.toContain("/tv");
    expect(paths).not.toContain("/world");
    expect(paths).not.toContain("/arcade");
    expect(paths).not.toContain("/archive");
  });
});
