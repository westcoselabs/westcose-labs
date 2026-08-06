import { describe, expect, it } from "vitest";

import {
  createInitialPocketState,
  pocketReducer,
  toPocketSessionValues,
} from "../../src/state/pocket";

describe("Pocket session state", () => {
  it("shows startup and lock only on a fresh root session", () => {
    expect(createInitialPocketState({ pathname: "/" })).toMatchObject({
      startupPlayed: false,
      unlocked: false,
      page: 0,
    });
  });

  it("bypasses startup and lock on every non-root deep link", () => {
    expect(
      createInitialPocketState({
        pathname: "/projects/estate-sales-bakersfield?view=os",
      }),
    ).toMatchObject({ startupPlayed: true, unlocked: true });
  });

  it("records the launch page and restores it on Home", () => {
    let state = createInitialPocketState({
      pathname: "/",
      session: { startupPlayed: true, unlocked: true, page: 1 },
    });
    state = pocketReducer(state, {
      type: "launch/record-origin",
      page: 1,
    });
    state = pocketReducer(state, { type: "page/set", page: 0 });
    state = pocketReducer(state, { type: "home/return", defaultPage: 0 });

    expect(state.page).toBe(1);
    expect(state.originPage).toBeNull();
  });

  it("deduplicates dismissed notifications for session persistence", () => {
    let state = createInitialPocketState();
    state = pocketReducer(state, {
      type: "notification/dismiss",
      notificationId: "welcome",
    });
    state = pocketReducer(state, {
      type: "notification/dismiss",
      notificationId: "welcome",
    });

    expect(toPocketSessionValues(state).dismissedNotificationIds).toEqual([
      "welcome",
    ]);
  });
});

