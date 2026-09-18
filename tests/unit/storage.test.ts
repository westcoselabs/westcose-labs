import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_SESSION,
  DISCOVERIES_KEY,
  LOCAL_NOTES_KEY,
  NOTE_OVERRIDES_KEY,
  PREFERENCES_KEY,
  PREFERENCES_STORAGE_KEY,
  parseDiscoveriesStorage,
  parseLocalNotesStorage,
  parseNoteOverridesStorage,
  parsePreferencesStorage,
  parseSessionStorage,
  readDiscoveries,
  readLocalNotesState,
  readPreferences,
  readSession,
  resetDiscoveriesStorage,
  resetLocalNotesStorage,
  resetPreferencesStorage,
  resetSessionStorage,
  safeResolveStorage,
  safeWriteStorage,
  serializeDiscoveries,
  serializeLocalNotes,
  serializeNoteOverrides,
  serializePreferences,
  serializeSession,
  SESSION_KEY,
  SESSION_STORAGE_KEY,
  writeLocalNotesState,
  type StorageLike,
} from "../../src/lib/storage";
import { createInitialDiscoveryState } from "../../src/state/discoveries";
import type { LocalNotesState } from "../../src/state/local-notes";
import { DEFAULT_PREFERENCES } from "../../src/state/preferences";

const createMemoryStorage = (
  initial: Readonly<Record<string, string>> = {},
): StorageLike & { readonly values: Map<string, string> } => {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key);
    },
  };
};

const sampleLocalState: LocalNotesState = {
  localNotes: [
    {
      id: "local-1",
      title: "A local note",
      body: "Still here after refresh.",
      folderId: "ideas",
      createdAt: "2026-08-06T12:00:00.000Z",
      updatedAt: "2026-08-06T12:00:00.000Z",
      pinned: true,
    },
  ],
  noteOverrides: [
    { noteId: "readme", pinned: true, customTitle: "My README" },
  ],
};

describe("versioned storage", () => {
  it("uses the five isolated V3 storage keys", () => {
    expect({
      preferences: PREFERENCES_KEY,
      session: SESSION_KEY,
      discoveries: DISCOVERIES_KEY,
      localNotes: LOCAL_NOTES_KEY,
      noteOverrides: NOTE_OVERRIDES_KEY,
    }).toEqual({
      preferences: "wcl.preferences.v2",
      session: "wcl.session.v2",
      discoveries: "wcl.discoveries.v1",
      localNotes: "wcl.local-notes.v1",
      noteOverrides: "wcl.note-overrides.v1",
    });
    expect(PREFERENCES_STORAGE_KEY).toBe(PREFERENCES_KEY);
    expect(SESSION_STORAGE_KEY).toBe(SESSION_KEY);
  });

  it("round-trips current preference and session envelopes", () => {
    const preferences = {
      ...DEFAULT_PREFERENCES,
      themeId: "computer-lab-2008",
      soundEnabled: true,
      displayPreference: "desktop" as const,
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

  it("migrates only absent v2 preferences and sessions from v1", () => {
    const legacyPreferences = {
      version: 1,
      data: {
        themeId: "dusk",
        soundEnabled: true,
        extraReducedMotion: true,
        highContrast: true,
        displayPreference: "normal",
      },
    };
    const legacySession = {
      version: 1,
      data: {
        ...DEFAULT_SESSION,
        readmeShown: true,
        startupPlayed: true,
        unlocked: true,
        dismissedNotificationIds: ["welcome", "welcome"],
      },
    };
    const storage = createMemoryStorage({
      "wcl.preferences.v1": JSON.stringify(legacyPreferences),
      "wcl.session.v1": JSON.stringify(legacySession),
    });

    expect(readPreferences(storage)).toEqual({
      ...DEFAULT_PREFERENCES,
      themeId: "dusk",
      soundEnabled: true,
      extraReducedMotion: true,
      highContrast: true,
      displayPreference: "auto",
    });
    expect(readSession(storage)).toMatchObject({
      readmeShown: true,
      startupPlayed: true,
      unlocked: true,
      dismissedNotificationIds: ["welcome"],
    });
  });

  it("does not revive legacy values when a current key is malformed", () => {
    const storage = createMemoryStorage({
      [PREFERENCES_KEY]: "{broken",
      [SESSION_KEY]: JSON.stringify({ version: 999, data: {} }),
      "wcl.preferences.v1": JSON.stringify({
        version: 1,
        data: {
          themeId: "dusk",
          soundEnabled: true,
          extraReducedMotion: true,
          highContrast: true,
          displayPreference: "desktop",
        },
      }),
      "wcl.session.v1": JSON.stringify({
        version: 1,
        data: { ...DEFAULT_SESSION, readmeShown: true },
      }),
    });

    expect(readPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
    expect(readSession(storage)).toEqual(DEFAULT_SESSION);
  });

  it.each([null, "", "{broken", '{"version":999,"data":{}}'])(
    "defaults malformed or unknown current preference storage: %s",
    (raw) => {
      expect(parsePreferencesStorage(raw)).toEqual(DEFAULT_PREFERENCES);
    },
  );

  it("defaults a structurally invalid current session", () => {
    expect(
      parseSessionStorage(
        JSON.stringify({
          version: 2,
          data: { ...DEFAULT_SESSION, page: 2 },
        }),
      ),
    ).toEqual(DEFAULT_SESSION);
  });

  it("round-trips discovery state and sanitizes corrupt members", () => {
    const state = {
      ...createInitialDiscoveryState(),
      discoveredSecretIds: ["notes.passwords-opened"],
      counters: {
        ...createInitialDiscoveryState().counters,
        noteOpens: { readme: 5 },
        fightClubLaunches: 2,
      },
    };
    expect(parseDiscoveriesStorage(serializeDiscoveries(state))).toEqual(state);

    const sanitized = parseDiscoveriesStorage(
      JSON.stringify({
        version: 1,
        data: {
          discoveredSecretIds: ["valid", "valid", 42, ""],
          counters: {
            noteOpens: { valid: 2, negative: -1, decimal: 1.5 },
            fightClubLaunches: -4,
            terminalCommandsRun: 3,
          },
        },
      }),
    );
    expect(sanitized.discoveredSecretIds).toEqual(["valid"]);
    expect(sanitized.counters).toMatchObject({
      noteOpens: { valid: 2 },
      fightClubLaunches: 0,
      terminalCommandsRun: 3,
    });
  });

  it("keeps unlocked wallpapers beside unlocked themes in one saved store", () => {
    const state = {
      ...createInitialDiscoveryState(),
      unlockedThemeIds: ["corporate-beige"],
      unlockedWallpaperIds: ["standard-issue"],
    };
    expect(parseDiscoveriesStorage(serializeDiscoveries(state))).toEqual(state);

    // A save written before wallpapers were unlockable still reads back.
    const earlierSave = parseDiscoveriesStorage(
      JSON.stringify({
        version: 1,
        data: {
          discoveredSecretIds: ["settings.bad-ideas-max"],
          unlockedThemeIds: ["corporate-beige"],
        },
      }),
    );
    expect(earlierSave.unlockedThemeIds).toEqual(["corporate-beige"]);
    expect(earlierSave.unlockedWallpaperIds).toEqual([]);
  });

  it("round-trips local notes and curated overrides independently", () => {
    expect(
      parseLocalNotesStorage(serializeLocalNotes(sampleLocalState.localNotes)),
    ).toEqual(sampleLocalState.localNotes);
    expect(
      parseNoteOverridesStorage(
        serializeNoteOverrides(sampleLocalState.noteOverrides),
      ),
    ).toEqual(sampleLocalState.noteOverrides);

    const storage = createMemoryStorage();
    expect(writeLocalNotesState(storage, sampleLocalState)).toBe(true);
    expect(readLocalNotesState(storage)).toEqual(sampleLocalState);
    expect(storage.values.has(PREFERENCES_KEY)).toBe(false);
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(false);
  });

  it("filters invalid local records and keeps the last duplicate id", () => {
    const valid = sampleLocalState.localNotes[0];
    const notes = parseLocalNotesStorage(
      JSON.stringify({
        version: 1,
        data: [valid, { ...valid, title: "Newest" }, { id: "broken" }],
      }),
    );
    const overrides = parseNoteOverridesStorage(
      JSON.stringify({
        version: 1,
        data: [
          { noteId: "readme", pinned: false },
          { noteId: "readme", pinned: true },
          { noteId: "bad", pinned: "yes" },
        ],
      }),
    );

    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe("Newest");
    expect(overrides).toEqual([{ noteId: "readme", pinned: true }]);
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
    expect(readSession(storage)).toEqual(DEFAULT_SESSION);
    expect(readDiscoveries(storage)).toEqual(createInitialDiscoveryState());
    expect(readLocalNotesState(storage)).toEqual({
      localNotes: [],
      noteOverrides: [],
    });
  });

  it("guards browser storage getters before calling storage helpers", () => {
    const browser = Object.defineProperty({}, "localStorage", {
      get: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    }) as { readonly localStorage: StorageLike };

    expect(safeResolveStorage(() => browser.localStorage)).toBeNull();
  });

  it("reports quota failures without throwing", () => {
    const storage: StorageLike = {
      getItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new DOMException("full", "QuotaExceededError");
      }),
      removeItem: vi.fn(),
    };

    expect(safeWriteStorage(storage, PREFERENCES_KEY, "payload")).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith(PREFERENCES_KEY, "payload");
  });

  it("resets each storage responsibility without touching the others", () => {
    const storage = createMemoryStorage({
      [PREFERENCES_KEY]: "current preferences",
      [SESSION_KEY]: "current session",
      [DISCOVERIES_KEY]: "discoveries",
      [LOCAL_NOTES_KEY]: "notes",
      [NOTE_OVERRIDES_KEY]: "overrides",
      "wcl.preferences.v1": "legacy preferences",
      "wcl.session.v1": "legacy session",
      unrelated: "keep me",
    });

    expect(resetPreferencesStorage(storage)).toBe(true);
    expect(storage.values.has(PREFERENCES_KEY)).toBe(false);
    expect(storage.values.has("wcl.preferences.v1")).toBe(false);
    expect(storage.values.has(SESSION_KEY)).toBe(true);

    expect(resetSessionStorage(storage)).toBe(true);
    expect(storage.values.has(SESSION_KEY)).toBe(false);
    expect(storage.values.has("wcl.session.v1")).toBe(false);
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(true);

    expect(resetDiscoveriesStorage(storage)).toBe(true);
    expect(storage.values.has(DISCOVERIES_KEY)).toBe(false);
    expect(storage.values.has(LOCAL_NOTES_KEY)).toBe(true);

    expect(resetLocalNotesStorage(storage)).toBe(true);
    expect(storage.values.has(LOCAL_NOTES_KEY)).toBe(false);
    expect(storage.values.has(NOTE_OVERRIDES_KEY)).toBe(false);
    expect(storage.values.get("unrelated")).toBe("keep me");
  });
});
