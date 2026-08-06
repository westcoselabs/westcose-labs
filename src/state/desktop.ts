import {
  clampRectToWorkspace,
  type DesktopRect,
  type WorkspaceBounds,
} from "../lib/window-geometry";

export const ROUTE_WINDOW_ID = "route-content" as const;
export const DESKTOP_UTILITY_IDS = ["readme", "terminal", "settings"] as const;

export type DesktopUtilityId = (typeof DESKTOP_UTILITY_IDS)[number];
export type DesktopWindowStatus = "open" | "minimized" | "maximized";

interface DesktopWindowBase {
  readonly title: string;
  readonly rect: DesktopRect;
  readonly restoreRect: DesktopRect | null;
  readonly status: DesktopWindowStatus;
  readonly minimizedFrom: Exclude<DesktopWindowStatus, "minimized"> | null;
  readonly zOrder: number;
}

export interface RouteDesktopWindow extends DesktopWindowBase {
  readonly id: typeof ROUTE_WINDOW_ID;
  readonly kind: "route";
  readonly route: string;
}

export interface UtilityDesktopWindow extends DesktopWindowBase {
  readonly id: `utility-${DesktopUtilityId}`;
  readonly kind: "utility";
  readonly utility: DesktopUtilityId;
}

export type DesktopWindow = RouteDesktopWindow | UtilityDesktopWindow;

export type DesktopMenu =
  | {
      readonly kind: "start";
      readonly triggerId: string;
    }
  | {
      readonly kind: "desktop-context";
      readonly triggerId: string;
      readonly x: number;
      readonly y: number;
    }
  | {
      readonly kind: "window";
      readonly triggerId: string;
      readonly windowId: DesktopWindow["id"];
    };

export interface DesktopState {
  readonly windows: readonly DesktopWindow[];
  readonly activeWindowId: DesktopWindow["id"] | null;
  readonly nextZOrder: number;
  readonly menu: DesktopMenu | null;
}

export type DesktopAction =
  | {
      readonly type: "route/open";
      readonly route: string;
      readonly title: string;
      readonly rect: DesktopRect;
    }
  | {
      readonly type: "utility/open";
      readonly utility: DesktopUtilityId;
      readonly title: string;
      readonly rect: DesktopRect;
    }
  | {
      readonly type: "window/focus";
      readonly id: DesktopWindow["id"];
    }
  | {
      readonly type: "window/commit-geometry";
      readonly id: DesktopWindow["id"];
      readonly rect: DesktopRect;
      readonly workspace: WorkspaceBounds;
    }
  | {
      readonly type: "window/minimize";
      readonly id: DesktopWindow["id"];
    }
  | {
      readonly type: "window/maximize";
      readonly id: DesktopWindow["id"];
      readonly workspace: WorkspaceBounds;
    }
  | {
      readonly type: "window/restore";
      readonly id: DesktopWindow["id"];
    }
  | {
      readonly type: "window/close";
      readonly id: DesktopWindow["id"];
    }
  | {
      readonly type: "viewport/recover";
      readonly workspace: WorkspaceBounds;
    }
  | {
      readonly type: "menu/open";
      readonly menu: DesktopMenu;
    }
  | { readonly type: "menu/close" }
  | { readonly type: "reset" };

export const createInitialDesktopState = (): DesktopState => ({
  windows: [],
  activeWindowId: null,
  nextZOrder: 1,
  menu: null,
});

const utilityWindowId = (
  utility: DesktopUtilityId,
): UtilityDesktopWindow["id"] => `utility-${utility}`;

const nextVisibleWindowId = (
  windows: readonly DesktopWindow[],
): DesktopWindow["id"] | null =>
  windows
    .filter((window) => window.status !== "minimized")
    .toSorted((left, right) => right.zOrder - left.zOrder)[0]?.id ?? null;

const focusWindow = (
  state: DesktopState,
  id: DesktopWindow["id"],
): DesktopState => {
  const target = state.windows.find((window) => window.id === id);

  if (!target || target.status === "minimized") {
    return state;
  }

  const zOrder = state.nextZOrder;

  return {
    ...state,
    windows: state.windows.map((window) =>
      window.id === id ? { ...window, zOrder } : window,
    ),
    activeWindowId: id,
    nextZOrder: zOrder + 1,
    menu: null,
  };
};

const openExistingWindow = (
  window: DesktopWindow,
  zOrder: number,
): DesktopWindow => {
  if (window.status !== "minimized") {
    return { ...window, zOrder };
  }

  return {
    ...window,
    status: window.minimizedFrom ?? "open",
    minimizedFrom: null,
    zOrder,
  };
};

export function desktopReducer(
  state: DesktopState,
  action: DesktopAction,
): DesktopState {
  switch (action.type) {
    case "route/open": {
      const existing = state.windows.find(
        (window): window is RouteDesktopWindow => window.kind === "route",
      );
      const zOrder = state.nextZOrder;
      const routeWindow: RouteDesktopWindow = existing
        ? {
            ...openExistingWindow(existing, zOrder),
            id: ROUTE_WINDOW_ID,
            kind: "route",
            route: action.route,
            title: action.title,
          }
        : {
            id: ROUTE_WINDOW_ID,
            kind: "route",
            route: action.route,
            title: action.title,
            rect: action.rect,
            restoreRect: null,
            status: "open",
            minimizedFrom: null,
            zOrder,
          };

      return {
        ...state,
        windows: [
          ...state.windows.filter((window) => window.kind !== "route"),
          routeWindow,
        ],
        activeWindowId: ROUTE_WINDOW_ID,
        nextZOrder: zOrder + 1,
        menu: null,
      };
    }

    case "utility/open": {
      const id = utilityWindowId(action.utility);
      const existing = state.windows.find(
        (window): window is UtilityDesktopWindow => window.id === id,
      );
      const zOrder = state.nextZOrder;
      const utilityWindow: UtilityDesktopWindow = existing
        ? {
            ...openExistingWindow(existing, zOrder),
            id,
            kind: "utility",
            utility: action.utility,
            title: action.title,
          }
        : {
            id,
            kind: "utility",
            utility: action.utility,
            title: action.title,
            rect: action.rect,
            restoreRect: null,
            status: "open",
            minimizedFrom: null,
            zOrder,
          };

      return {
        ...state,
        windows: [
          ...state.windows.filter((window) => window.id !== id),
          utilityWindow,
        ],
        activeWindowId: id,
        nextZOrder: zOrder + 1,
        menu: null,
      };
    }

    case "window/focus":
      return focusWindow(state, action.id);

    case "window/commit-geometry": {
      const rect = clampRectToWorkspace(action.rect, action.workspace);
      const windows = state.windows.map((window) =>
        window.id === action.id
          ? {
              ...window,
              rect,
              restoreRect: null,
              status: "open" as const,
              minimizedFrom: null,
            }
          : window,
      );

      return focusWindow({ ...state, windows }, action.id);
    }

    case "window/minimize": {
      const windows = state.windows.map((window) =>
        window.id === action.id && window.status !== "minimized"
          ? {
              ...window,
              status: "minimized" as const,
              minimizedFrom: window.status,
            }
          : window,
      );
      const activeWindowId =
        state.activeWindowId === action.id
          ? nextVisibleWindowId(windows)
          : state.activeWindowId;

      return { ...state, windows, activeWindowId, menu: null };
    }

    case "window/maximize": {
      const windows = state.windows.map((window) => {
        if (window.id !== action.id) {
          return window;
        }

        const restoreRect =
          window.status === "open"
            ? window.rect
            : (window.restoreRect ?? window.rect);

        return {
          ...window,
          rect: action.workspace,
          restoreRect,
          status: "maximized" as const,
          minimizedFrom: null,
        };
      });

      return focusWindow({ ...state, windows }, action.id);
    }

    case "window/restore": {
      const windows = state.windows.map((window) => {
        if (window.id !== action.id) {
          return window;
        }

        if (window.status === "minimized") {
          return {
            ...window,
            status: window.minimizedFrom ?? ("open" as const),
            minimizedFrom: null,
          };
        }

        if (window.status === "maximized") {
          return {
            ...window,
            rect: window.restoreRect ?? window.rect,
            restoreRect: null,
            status: "open" as const,
          };
        }

        return window;
      });

      return focusWindow({ ...state, windows }, action.id);
    }

    case "window/close": {
      const windows = state.windows.filter((window) => window.id !== action.id);
      const activeWindowId =
        state.activeWindowId === action.id
          ? nextVisibleWindowId(windows)
          : state.activeWindowId;

      return { ...state, windows, activeWindowId, menu: null };
    }

    case "viewport/recover": {
      const windows = state.windows.map((window) => ({
        ...window,
        rect:
          window.status === "maximized"
            ? action.workspace
            : clampRectToWorkspace(window.rect, action.workspace),
        restoreRect: window.restoreRect
          ? clampRectToWorkspace(window.restoreRect, action.workspace)
          : null,
      }));

      return { ...state, windows };
    }

    case "menu/open":
      return { ...state, menu: action.menu };

    case "menu/close":
      return state.menu ? { ...state, menu: null } : state;

    case "reset":
      return createInitialDesktopState();
  }
}

export function hasValidDesktopWindowModel(state: DesktopState): boolean {
  const routeWindows = state.windows.filter((window) => window.kind === "route");
  const windowIds = state.windows.map((window) => window.id);
  const allUtilitiesAreAllowed = state.windows.every(
    (window) =>
      window.kind === "route" || DESKTOP_UTILITY_IDS.includes(window.utility),
  );

  return (
    routeWindows.length <= 1 &&
    new Set(windowIds).size === windowIds.length &&
    allUtilitiesAreAllowed
  );
}
