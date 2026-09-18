import {
  createInitialDiscoveryState,
  discoveryReducer,
  hasDiscovery as selectHasDiscovery,
  type DiscoveryAction,
  type DiscoveryState,
  type ScalarDiscoveryCounter,
} from "../state/discoveries";

import {
  readDiscoveries,
  resetDiscoveriesStorage,
  writeDiscoveries,
  type StorageLike,
} from "./storage";

export type DiscoveryListener = (state: DiscoveryState) => void;

export type IncrementDiscoveryCounter = {
  (counter: ScalarDiscoveryCounter): void;
  (counter: "noteOpens", noteId: string): void;
};

export interface DiscoveryService {
  getState(): DiscoveryState;
  hydrate(): DiscoveryState;
  subscribe(listener: DiscoveryListener): () => void;
  recordDiscovery(discoveryId: string): void;
  incrementCounter: IncrementDiscoveryCounter;
  unlockTheme(themeId: string): void;
  unlockWallpaper(wallpaperId: string): void;
  recordAchievement(achievementId: string): void;
  recordViewedHiddenFile(fileId: string): void;
  recordRecycleRestoration(restorationId: string): void;
  recordTerminalCommand(commandId: string): void;
  dismissDiscovery(discoveryId: string): void;
  hasDiscovery(discoveryId: string): boolean;
  reset(): void;
}

export function createDiscoveryService(
  storage: StorageLike | null | undefined,
): DiscoveryService {
  let state = readDiscoveries(storage);
  const listeners = new Set<DiscoveryListener>();

  const notify = () => {
    for (const listener of listeners) listener(state);
  };

  const commit = (action: DiscoveryAction) => {
    const nextState = discoveryReducer(state, action);
    if (nextState === state) return;

    state = nextState;
    writeDiscoveries(storage, state);
    notify();
  };

  const incrementCounter: IncrementDiscoveryCounter = (
    counter: ScalarDiscoveryCounter | "noteOpens",
    noteId?: string,
  ) => {
    if (counter === "noteOpens") {
      if (noteId === undefined) return;
      commit({ type: "counter/increment", counter, noteId });
      return;
    }

    commit({ type: "counter/increment", counter });
  };

  return {
    getState: () => state,
    hydrate: () => {
      state = readDiscoveries(storage);
      writeDiscoveries(storage, state);
      notify();
      return state;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    recordDiscovery: (discoveryId) =>
      commit({ type: "discovery/record", discoveryId }),
    incrementCounter,
    unlockTheme: (themeId) => commit({ type: "theme/unlock", themeId }),
    unlockWallpaper: (wallpaperId) =>
      commit({ type: "wallpaper/unlock", wallpaperId }),
    recordAchievement: (achievementId) =>
      commit({ type: "achievement/record", achievementId }),
    recordViewedHiddenFile: (fileId) =>
      commit({ type: "hidden-file/view", fileId }),
    recordRecycleRestoration: (restorationId) =>
      commit({ type: "recycle/restoration-record", restorationId }),
    recordTerminalCommand: (commandId) =>
      commit({ type: "terminal-command/record", commandId }),
    dismissDiscovery: (discoveryId) =>
      commit({ type: "discovery/dismiss", discoveryId }),
    hasDiscovery: (discoveryId) => selectHasDiscovery(state, discoveryId),
    reset: () => {
      resetDiscoveriesStorage(storage);
      state = createInitialDiscoveryState();
      notify();
    },
  };
}
