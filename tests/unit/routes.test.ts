import { describe, expect, it } from "vitest";

import {
  getRouteParent,
  isPocketDirectRoute,
  isPocketUnsupportedRoute,
  normalizePathname,
  resolvePocketBackTarget,
} from "../../src/lib/routes";

describe("route hierarchy", () => {
  it("normalizes query strings, fragments, duplicate slashes, and trailing slashes", () => {
    expect(normalizePathname("projects//alpha/?view=normal#top")).toBe(
      "/projects/alpha",
    );
  });

  it.each([
    ["/projects/estate-sales-bakersfield", "/projects"],
    ["/experiments/material-lab", "/experiments"],
    ["/games/fightclub", "/games"],
    ["/about", "/"],
    ["/", null],
  ])("resolves %s to %s", (pathname, expected) => {
    expect(getRouteParent(pathname)).toBe(expected);
  });

  it("takes nested Pocket content back to its app index", () => {
    expect(
      resolvePocketBackTarget({
        pathname: "/projects/estate-sales-bakersfield",
        originPage: 1,
        defaultPage: 0,
      }),
    ).toEqual({ pathname: "/projects", kind: "parent" });
  });

  it("takes an app root to its recorded home page", () => {
    expect(
      resolvePocketBackTarget({
        pathname: "/projects",
        originPage: 1,
        defaultPage: 0,
      }),
    ).toEqual({ pathname: "/", homePage: 1, kind: "home" });
  });

  it("recognizes deep links and Pocket route fallbacks", () => {
    expect(isPocketDirectRoute("/")).toBe(false);
    expect(isPocketDirectRoute("/projects")).toBe(true);
    expect(isPocketUnsupportedRoute("/contact")).toBe(true);
    expect(isPocketUnsupportedRoute("/terminal")).toBe(true);
    expect(isPocketUnsupportedRoute("/about")).toBe(false);
  });
});

