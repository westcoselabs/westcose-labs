import { describe, expect, it } from "vitest";

import {
  createInitialDiscoveryState,
  discoveryReducer,
  hasDiscovery,
} from "../../src/state/discoveries";

describe("discovery state", () => {
  it("records identifiers once without mutating the previous state", () => {
    const initial = createInitialDiscoveryState();
    const discovered = discoveryReducer(initial, {
      type: "discovery/record",
      discoveryId: "notes.passwords-opened",
    });
    const duplicate = discoveryReducer(discovered, {
      type: "discovery/record",
      discoveryId: "notes.passwords-opened",
    });

    expect(initial.discoveredSecretIds).toEqual([]);
    expect(discovered.discoveredSecretIds).toEqual([
      "notes.passwords-opened",
    ]);
    expect(hasDiscovery(discovered, "notes.passwords-opened")).toBe(true);
    expect(duplicate).toBe(discovered);
  });

  it("tracks unlocks, achievements, files, commands, and dismissals separately", () => {
    const actions = [
      { type: "theme/unlock", themeId: "computer-lab-2008" },
      { type: "achievement/record", achievementId: "fightclub.first-launch" },
      { type: "hidden-file/view", fileId: "passwords" },
      { type: "recycle/restoration-record", restorationId: "final-final" },
      { type: "terminal-command/record", commandId: "secret" },
      { type: "discovery/dismiss", discoveryId: "notes.passwords-opened" },
    ] as const;
    const state = actions.reduce(discoveryReducer, createInitialDiscoveryState());

    expect(state).toMatchObject({
      unlockedThemeIds: ["computer-lab-2008"],
      fightClubAchievementIds: ["fightclub.first-launch"],
      viewedHiddenFileIds: ["passwords"],
      recycleRestorationIds: ["final-final"],
      terminalCommandIds: ["secret"],
      dismissedDiscoveryIds: ["notes.passwords-opened"],
    });
  });

  it("increments scalar and per-note counters", () => {
    let state = createInitialDiscoveryState();
    state = discoveryReducer(state, {
      type: "counter/increment",
      counter: "fightClubLaunches",
    });
    state = discoveryReducer(state, {
      type: "counter/increment",
      counter: "noteOpens",
      noteId: "readme",
    });
    state = discoveryReducer(state, {
      type: "counter/increment",
      counter: "noteOpens",
      noteId: "readme",
    });

    expect(state.counters.fightClubLaunches).toBe(1);
    expect(state.counters.noteOpens).toEqual({ readme: 2 });
  });

  it("hydrates defensively and resets to fresh empty collections", () => {
    const hydrated = discoveryReducer(createInitialDiscoveryState(), {
      type: "hydrate",
      state: {
        ...createInitialDiscoveryState(),
        discoveredSecretIds: ["one", "one"],
      },
    });
    const reset = discoveryReducer(hydrated, { type: "reset" });

    expect(hydrated.discoveredSecretIds).toEqual(["one"]);
    expect(reset).toEqual(createInitialDiscoveryState());
    expect(reset.discoveredSecretIds).not.toBe(
      createInitialDiscoveryState().discoveredSecretIds,
    );
  });
});
