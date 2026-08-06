import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SESSION,
  parsePreferencesStorage,
  parseSessionStorage,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  safeWriteStorage,
  serializePreferences,
  serializeSession,
  SESSION_STORAGE_KEY,
  type StorageLike,
} from "../../src/lib/storage";
import { DEFAULT_PREFERENCES } from "../../src/state/preferences";

describe("versioned storage", () => {
  it("round-trips current preference and session envelopes", () => {
    const preferences = {
      ...DEFAULT_PREFERENCES,
      soundEnabled: true,
      displayPreference: "normal" as const,
    };
    const session = {
      ...DEFAULT_SESSION,
      startupPlayed: true,
      unlocked: true,
      page: 1 as const,
    };

    expect(parsePreferencesStorage(serializePreferences(preferences))).toEqual(
      preferences,
    );
    expect(parseSessionStorage(serializeSession(session))).toEqual(session);
  });

  it.each([null, "", "{broken", '{"version":2,"data":{}}']) (
    "resets malformed or unknown preference storage: %s",
    (raw) => {
      expect(parsePreferencesStorage(raw)).toEqual(DEFAULT_PREFERENCES);
    },
  );

  it("resets a structurally invalid current-version session", () => {
    expect(
      parseSessionStorage(
        JSON.stringify({
          version: 1,
          data: { ...DEFAULT_SESSION, page: 2 },
        }),
      ),
    ).toEqual(DEFAULT_SESSION);
  });

  it("falls back when browser storage access throws", () => {
    const storage: StorageLike = {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    expect(readPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it("reports quota failures without throwing", () => {
    const storage: StorageLike = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new DOMException("full", "QuotaExceededError");
      }),
      removeItem: vi.fn(),
    };

    expect(
      safeWriteStorage(storage, PREFERENCES_STORAGE_KEY, "payload"),
    ).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      "payload",
    );
    expect(SESSION_STORAGE_KEY).toBe("wcl.session.v1");
  });
});

