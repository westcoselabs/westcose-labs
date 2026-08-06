export type PocketPage = 0 | 1;

export interface PocketSessionValues {
  readonly startupPlayed: boolean;
  readonly unlocked: boolean;
  readonly page: PocketPage;
  readonly originPage: PocketPage | null;
  readonly dismissedNotificationIds: readonly string[];
}

export interface PocketMenuTarget {
  readonly id: string;
  readonly kind: "app" | "shortcut";
}

export interface PocketState extends PocketSessionValues {
  readonly menuTarget: PocketMenuTarget | null;
}

export type PocketAction =
  | {
      readonly type: "session/hydrate";
      readonly pathname: string;
      readonly session: Partial<PocketSessionValues> | null;
    }
  | { readonly type: "startup/complete" }
  | { readonly type: "unlock" }
  | { readonly type: "page/set"; readonly page: PocketPage }
  | { readonly type: "launch/record-origin"; readonly page: PocketPage }
  | {
      readonly type: "home/return";
      readonly defaultPage: PocketPage;
    }
  | {
      readonly type: "menu/open";
      readonly target: PocketMenuTarget;
    }
  | { readonly type: "menu/close" }
  | {
      readonly type: "notification/dismiss";
      readonly notificationId: string;
    }
  | {
      readonly type: "session/reset";
      readonly pathname: string;
    };

const isRootPath = (pathname: string): boolean => {
  const cleanPath = pathname.split(/[?#]/u, 1)[0]?.replace(/\/+$/u, "") ?? "";
  return cleanPath === "" || cleanPath === "/";
};

export function createInitialPocketState(options: {
  readonly pathname?: string;
  readonly session?: Partial<PocketSessionValues> | null;
} = {}): PocketState {
  const pathname = options.pathname ?? "/";
  const directRoute = !isRootPath(pathname);
  const session = options.session;

  return {
    startupPlayed: directRoute || session?.startupPlayed === true,
    unlocked: directRoute || session?.unlocked === true,
    page: session?.page === 1 ? 1 : 0,
    originPage:
      session?.originPage === 0 || session?.originPage === 1
        ? session.originPage
        : null,
    dismissedNotificationIds: Array.from(
      new Set(
        (session?.dismissedNotificationIds ?? []).filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        ),
      ),
    ),
    menuTarget: null,
  };
}

export function pocketReducer(
  state: PocketState,
  action: PocketAction,
): PocketState {
  switch (action.type) {
    case "session/hydrate":
      return createInitialPocketState({
        pathname: action.pathname,
        session: action.session,
      });
    case "startup/complete":
      return state.startupPlayed ? state : { ...state, startupPlayed: true };

    case "unlock":
      return state.unlocked
        ? state
        : { ...state, startupPlayed: true, unlocked: true };

    case "page/set":
      return state.page === action.page
        ? state
        : { ...state, page: action.page, menuTarget: null };

    case "launch/record-origin":
      return {
        ...state,
        page: action.page,
        originPage: action.page,
        menuTarget: null,
      };

    case "home/return": {
      const page = state.originPage ?? action.defaultPage;
      return { ...state, page, originPage: null, menuTarget: null };
    }

    case "menu/open":
      return { ...state, menuTarget: action.target };

    case "menu/close":
      return state.menuTarget ? { ...state, menuTarget: null } : state;

    case "notification/dismiss":
      return state.dismissedNotificationIds.includes(action.notificationId)
        ? state
        : {
            ...state,
            dismissedNotificationIds: [
              ...state.dismissedNotificationIds,
              action.notificationId,
            ],
          };

    case "session/reset":
      return createInitialPocketState({ pathname: action.pathname });
  }
}

export function toPocketSessionValues(
  state: PocketState,
): PocketSessionValues {
  return {
    startupPlayed: state.startupPlayed,
    unlocked: state.unlocked,
    page: state.page,
    originPage: state.originPage,
    dismissedNotificationIds: state.dismissedNotificationIds,
  };
}
