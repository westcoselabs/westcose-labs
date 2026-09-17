import { describe, expect, it, vi } from "vitest";

import { createDiscoveryService } from "../../src/lib/discovery-service";
import {
  DISCOVERIES_KEY,
  LOCAL_NOTES_KEY,
  type StorageLike,
} from "../../src/lib/storage";

const createMemoryStorage = (): StorageLike & {
  readonly values: Map<string, string>;
} => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key);
    },
  };
};

describe("discovery service", () => {
  it("initializes persistence through the service boundary", () => {
    const storage = createMemoryStorage();
    const service = createDiscoveryService(storage);

    expect(storage.values.has(DISCOVERIES_KEY)).toBe(false);
    service.hydrate();
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(true);
  });

  it("persists required discovery actions and hydrates another consumer", () => {
    const storage = createMemoryStorage();
    const service = createDiscoveryService(storage);

    service.recordDiscovery("notes.passwords-opened");
    service.unlockTheme("computer-lab-2008");
    service.recordAchievement("fightclub.first-launch");
    service.incrementCounter("fightClubLaunches");
    service.incrementCounter("noteOpens", "readme");

    expect(service.hasDiscovery("notes.passwords-opened")).toBe(true);
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(true);

    const reloaded = createDiscoveryService(storage);
    expect(reloaded.getState()).toMatchObject({
      discoveredSecretIds: ["notes.passwords-opened"],
      unlockedThemeIds: ["computer-lab-2008"],
      fightClubAchievementIds: ["fightclub.first-launch"],
      counters: {
        fightClubLaunches: 1,
        noteOpens: { readme: 1 },
      },
    });
  });

  it("notifies subscribers only for state changes", () => {
    const service = createDiscoveryService(createMemoryStorage());
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);

    service.recordDiscovery("one");
    service.recordDiscovery("one");
    unsubscribe();
    service.recordDiscovery("two");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("resets only discovery persistence", () => {
    const storage = createMemoryStorage();
    storage.setItem(LOCAL_NOTES_KEY, "keep local notes");
    const service = createDiscoveryService(storage);
    service.recordDiscovery("one");

    service.reset();

    expect(service.getState().discoveredSecretIds).toEqual([]);
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(false);
    expect(storage.values.get(LOCAL_NOTES_KEY)).toBe("keep local notes");
  });

  it("remains usable when persistence is unavailable", () => {
    const service = createDiscoveryService({
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      removeItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    });

    expect(() => service.recordDiscovery("offline")).not.toThrow();
    expect(service.hasDiscovery("offline")).toBe(true);
    expect(() => service.reset()).not.toThrow();
  });
});
