import { describe, expect, it } from "vitest";

import {
  createInitialDesktopState,
  desktopReducer,
  hasValidDesktopWindowModel,
  ROUTE_WINDOW_ID,
} from "../../src/state/desktop";

const defaultRect = { x: 100, y: 80, width: 720, height: 560 };
const workspace = { x: 24, y: 24, width: 1200, height: 700 };

describe("desktopReducer", () => {
  it("reuses the single route-backed window when navigation changes", () => {
    let state = createInitialDesktopState();
    state = desktopReducer(state, {
      type: "route/open",
      route: "/projects",
      title: "Projects",
      rect: defaultRect,
    });
    state = desktopReducer(state, {
      type: "route/open",
      route: "/about",
      title: "About",
      rect: { x: 0, y: 0, width: 400, height: 300 },
    });

    expect(state.windows).toHaveLength(1);
    expect(state.windows[0]).toMatchObject({
      id: ROUTE_WINDOW_ID,
      kind: "route",
      route: "/about",
      title: "About",
      rect: defaultRect,
    });
    expect(hasValidDesktopWindowModel(state)).toBe(true);
  });

  it("allows only the typed lightweight utility windows to coexist", () => {
    let state = createInitialDesktopState();
    state = desktopReducer(state, {
      type: "route/open",
      route: "/projects",
      title: "Projects",
      rect: defaultRect,
    });
    state = desktopReducer(state, {
      type: "utility/open",
      utility: "readme",
      title: "README",
      rect: { ...defaultRect, width: 480 },
    });
    state = desktopReducer(state, {
      type: "utility/open",
      utility: "settings",
      title: "Settings",
      rect: { ...defaultRect, width: 520 },
    });
    state = desktopReducer(state, {
      type: "utility/open",
      utility: "readme",
      title: "README",
      rect: defaultRect,
    });

    expect(state.windows.map((window) => window.id)).toEqual([
      ROUTE_WINDOW_ID,
      "utility-settings",
      "utility-readme",
    ]);
    expect(hasValidDesktopWindowModel(state)).toBe(true);
  });

  it("preserves maximize state through minimize and restore", () => {
    let state = createInitialDesktopState();
    state = desktopReducer(state, {
      type: "route/open",
      route: "/projects",
      title: "Projects",
      rect: defaultRect,
    });
    state = desktopReducer(state, {
      type: "window/maximize",
      id: ROUTE_WINDOW_ID,
      workspace,
    });
    state = desktopReducer(state, {
      type: "window/minimize",
      id: ROUTE_WINDOW_ID,
    });

    expect(state.windows[0]).toMatchObject({
      status: "minimized",
      minimizedFrom: "maximized",
    });

    state = desktopReducer(state, {
      type: "window/restore",
      id: ROUTE_WINDOW_ID,
    });
    expect(state.windows[0]).toMatchObject({
      status: "maximized",
      rect: workspace,
    });

    state = desktopReducer(state, {
      type: "window/restore",
      id: ROUTE_WINDOW_ID,
    });
    expect(state.windows[0]).toMatchObject({
      status: "open",
      rect: defaultRect,
    });
  });

  it("recovers window bounds after a major viewport change", () => {
    let state = createInitialDesktopState();
    state = desktopReducer(state, {
      type: "utility/open",
      utility: "terminal",
      title: "Terminal",
      rect: { x: 900, y: 700, width: 800, height: 600 },
    });
    state = desktopReducer(state, {
      type: "viewport/recover",
      workspace: { x: 24, y: 24, width: 600, height: 400 },
    });

    expect(state.windows[0]?.rect).toEqual({
      x: 24,
      y: 24,
      width: 600,
      height: 400,
    });
  });
});

