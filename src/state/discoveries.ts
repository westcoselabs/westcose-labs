export type DiscoveryCounters = {
  readonly noteOpens: Readonly<Record<string, number>>;
  readonly fightClubLaunches: number;
  readonly recycleRestorations: number;
  readonly terminalCommandsRun: number;
  readonly settingsToleranceChanges: number;
};

export type DiscoveryState = {
  readonly discoveredSecretIds: readonly string[];
  readonly unlockedThemeIds: readonly string[];
  readonly unlockedWallpaperIds: readonly string[];
  readonly viewedHiddenFileIds: readonly string[];
  readonly fightClubAchievementIds: readonly string[];
  readonly recycleRestorationIds: readonly string[];
  readonly terminalCommandIds: readonly string[];
  readonly dismissedDiscoveryIds: readonly string[];
  readonly counters: DiscoveryCounters;
};

export type ScalarDiscoveryCounter = Exclude<
  keyof DiscoveryCounters,
  "noteOpens"
>;

export type DiscoveryAction =
  | { readonly type: "hydrate"; readonly state: DiscoveryState }
  | { readonly type: "discovery/record"; readonly discoveryId: string }
  | { readonly type: "theme/unlock"; readonly themeId: string }
  | { readonly type: "wallpaper/unlock"; readonly wallpaperId: string }
  | { readonly type: "hidden-file/view"; readonly fileId: string }
  | { readonly type: "achievement/record"; readonly achievementId: string }
  | { readonly type: "recycle/restoration-record"; readonly restorationId: string }
  | { readonly type: "terminal-command/record"; readonly commandId: string }
  | { readonly type: "discovery/dismiss"; readonly discoveryId: string }
  | { readonly type: "counter/increment"; readonly counter: ScalarDiscoveryCounter }
  | {
      readonly type: "counter/increment";
      readonly counter: "noteOpens";
      readonly noteId: string;
    }
  | { readonly type: "reset" };

const EMPTY_IDS = Object.freeze([]) as readonly string[];
const EMPTY_NOTE_OPENS = Object.freeze({}) as Readonly<Record<string, number>>;

export const DEFAULT_DISCOVERY_STATE: DiscoveryState = Object.freeze({
  discoveredSecretIds: EMPTY_IDS,
  unlockedThemeIds: EMPTY_IDS,
  unlockedWallpaperIds: EMPTY_IDS,
  viewedHiddenFileIds: EMPTY_IDS,
  fightClubAchievementIds: EMPTY_IDS,
  recycleRestorationIds: EMPTY_IDS,
  terminalCommandIds: EMPTY_IDS,
  dismissedDiscoveryIds: EMPTY_IDS,
  counters: Object.freeze({
    noteOpens: EMPTY_NOTE_OPENS,
    fightClubLaunches: 0,
    recycleRestorations: 0,
    terminalCommandsRun: 0,
    settingsToleranceChanges: 0,
  }),
});

const uniqueIds = (ids: readonly string[]): string[] =>
  Array.from(new Set(ids.filter((id) => id.length > 0)));

export function createInitialDiscoveryState(
  state: Partial<DiscoveryState> | null = null,
): DiscoveryState {
  const counters = state?.counters;

  return {
    discoveredSecretIds: uniqueIds(state?.discoveredSecretIds ?? []),
    unlockedThemeIds: uniqueIds(state?.unlockedThemeIds ?? []),
    unlockedWallpaperIds: uniqueIds(state?.unlockedWallpaperIds ?? []),
    viewedHiddenFileIds: uniqueIds(state?.viewedHiddenFileIds ?? []),
    fightClubAchievementIds: uniqueIds(state?.fightClubAchievementIds ?? []),
    recycleRestorationIds: uniqueIds(state?.recycleRestorationIds ?? []),
    terminalCommandIds: uniqueIds(state?.terminalCommandIds ?? []),
    dismissedDiscoveryIds: uniqueIds(state?.dismissedDiscoveryIds ?? []),
    counters: {
      noteOpens: { ...(counters?.noteOpens ?? {}) },
      fightClubLaunches: counters?.fightClubLaunches ?? 0,
      recycleRestorations: counters?.recycleRestorations ?? 0,
      terminalCommandsRun: counters?.terminalCommandsRun ?? 0,
      settingsToleranceChanges: counters?.settingsToleranceChanges ?? 0,
    },
  };
}

const appendUnique = (
  ids: readonly string[],
  id: string,
): readonly string[] => {
  const normalizedId = id.trim();
  return normalizedId && !ids.includes(normalizedId)
    ? [...ids, normalizedId]
    : ids;
};

const updateIds = (
  state: DiscoveryState,
  key: Exclude<keyof DiscoveryState, "counters">,
  id: string,
): DiscoveryState => {
  const ids = appendUnique(state[key], id);
  return ids === state[key] ? state : { ...state, [key]: ids };
};

export function discoveryReducer(
  state: DiscoveryState,
  action: DiscoveryAction,
): DiscoveryState {
  switch (action.type) {
    case "hydrate":
      return createInitialDiscoveryState(action.state);
    case "discovery/record":
      return updateIds(state, "discoveredSecretIds", action.discoveryId);
    case "theme/unlock":
      return updateIds(state, "unlockedThemeIds", action.themeId);
    case "wallpaper/unlock":
      return updateIds(state, "unlockedWallpaperIds", action.wallpaperId);
    case "hidden-file/view":
      return updateIds(state, "viewedHiddenFileIds", action.fileId);
    case "achievement/record":
      return updateIds(
        state,
        "fightClubAchievementIds",
        action.achievementId,
      );
    case "recycle/restoration-record":
      return updateIds(
        state,
        "recycleRestorationIds",
        action.restorationId,
      );
    case "terminal-command/record":
      return updateIds(state, "terminalCommandIds", action.commandId);
    case "discovery/dismiss":
      return updateIds(state, "dismissedDiscoveryIds", action.discoveryId);
    case "counter/increment":
      if (action.counter === "noteOpens") {
        const noteId = action.noteId.trim();
        if (!noteId) return state;
        return {
          ...state,
          counters: {
            ...state.counters,
            noteOpens: {
              ...state.counters.noteOpens,
              [noteId]: (state.counters.noteOpens[noteId] ?? 0) + 1,
            },
          },
        };
      }

      return {
        ...state,
        counters: {
          ...state.counters,
          [action.counter]: state.counters[action.counter] + 1,
        },
      };
    case "reset":
      return createInitialDiscoveryState();
  }
}

export const hasDiscovery = (
  state: DiscoveryState,
  discoveryId: string,
): boolean => state.discoveredSecretIds.includes(discoveryId);
