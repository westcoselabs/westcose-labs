import type { PocketPage, PocketSessionValues } from "../state/pocket";
import {
  createInitialDiscoveryState,
  type DiscoveryState,
} from "../state/discoveries";
import type {
  CuratedNoteOverride,
  LocalNotesState,
  LocalPocketNote,
} from "../state/local-notes";
import {
  DEFAULT_PREFERENCES,
  type DisplayPreference,
  type FocusMode,
  type Preferences,
  type SystemPersonality,
} from "../state/preferences";

export const PREFERENCES_KEY = "wcl.preferences.v2";
export const SESSION_KEY = "wcl.session.v2";
export const DISCOVERIES_KEY = "wcl.discoveries.v1";
export const LOCAL_NOTES_KEY = "wcl.local-notes.v1";
export const NOTE_OVERRIDES_KEY = "wcl.note-overrides.v1";

// Compatibility aliases for existing shell consumers. These point at V3 keys.
export const PREFERENCES_STORAGE_KEY = PREFERENCES_KEY;
export const SESSION_STORAGE_KEY = SESSION_KEY;

export const PREFERENCES_STORAGE_VERSION = 2;
export const SESSION_STORAGE_VERSION = 2;
export const DISCOVERIES_STORAGE_VERSION = 1;
export const LOCAL_NOTES_STORAGE_VERSION = 1;
export const NOTE_OVERRIDES_STORAGE_VERSION = 1;
export const STORAGE_VERSION = PREFERENCES_STORAGE_VERSION;

const LEGACY_PREFERENCES_KEY = "wcl.preferences.v1";
const LEGACY_SESSION_KEY = "wcl.session.v1";
const LEGACY_STORAGE_VERSION = 1;

export interface SessionValues extends PocketSessionValues {
  readonly readmeShown: boolean;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function safeResolveStorage(
  resolve: () => StorageLike,
): StorageLike | null {
  try {
    return resolve();
  } catch {
    return null;
  }
}

interface VersionedEnvelope<T> {
  readonly version: number;
  readonly data: T;
}

export const DEFAULT_SESSION: SessionValues = Object.freeze({
  readmeShown: false,
  startupPlayed: false,
  unlocked: false,
  page: 0,
  originPage: null,
  dismissedNotificationIds: Object.freeze([]) as readonly string[],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCurrentDisplayPreference = (
  value: unknown,
): value is DisplayPreference =>
  value === "auto" || value === "desktop" || value === "pocket";

const isLegacyDisplayPreference = (
  value: unknown,
): value is DisplayPreference | "normal" =>
  isCurrentDisplayPreference(value) || value === "normal";

const isPocketPage = (value: unknown): value is PocketPage =>
  value === 0 || value === 1;

const isFocusMode = (value: unknown): value is FocusMode =>
  value === "build" ||
  value === "design" ||
  value === "arcade" ||
  value === "client-feedback" ||
  value === "pretending-to-work";

const isSystemPersonality = (value: unknown): value is SystemPersonality =>
  value === "balanced" || value === "quiet" || value === "playful";

const parseEnvelopeData = (raw: string | null, version: number): unknown => {
  if (raw === null) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== version) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const parsePreferencesData = (
  data: unknown,
  legacy: boolean,
): Preferences | null => {
  const validDisplayPreference = legacy
    ? isLegacyDisplayPreference
    : isCurrentDisplayPreference;

  if (
    !isRecord(data) ||
    typeof data.themeId !== "string" ||
    data.themeId.length === 0 ||
    typeof data.soundEnabled !== "boolean" ||
    typeof data.extraReducedMotion !== "boolean" ||
    typeof data.highContrast !== "boolean" ||
    !validDisplayPreference(data.displayPreference)
  ) {
    return null;
  }

  return {
    ...DEFAULT_PREFERENCES,
    themeId: data.themeId,
    wallpaperId:
      typeof data.wallpaperId === "string" && data.wallpaperId
        ? data.wallpaperId
        : DEFAULT_PREFERENCES.wallpaperId,
    soundEnabled: data.soundEnabled,
    extraReducedMotion: data.extraReducedMotion,
    highContrast: data.highContrast,
    displayPreference:
      data.displayPreference === "normal" ? "auto" : data.displayPreference,
    iconLighting:
      typeof data.iconLighting === "boolean"
        ? data.iconLighting
        : DEFAULT_PREFERENCES.iconLighting,
    screensaverEnabled:
      typeof data.screensaverEnabled === "boolean"
        ? data.screensaverEnabled
        : DEFAULT_PREFERENCES.screensaverEnabled,
    notificationEffects:
      typeof data.notificationEffects === "boolean"
        ? data.notificationEffects
        : DEFAULT_PREFERENCES.notificationEffects,
    systemPersonality: isSystemPersonality(data.systemPersonality)
      ? data.systemPersonality
      : DEFAULT_PREFERENCES.systemPersonality,
    discoveryNotifications:
      typeof data.discoveryNotifications === "boolean"
        ? data.discoveryNotifications
        : DEFAULT_PREFERENCES.discoveryNotifications,
    appBadges:
      typeof data.appBadges === "boolean"
        ? data.appBadges
        : DEFAULT_PREFERENCES.appBadges,
    badIdeaTolerance:
      typeof data.badIdeaTolerance === "number" &&
      Number.isFinite(data.badIdeaTolerance)
        ? Math.min(100, Math.max(0, Math.round(data.badIdeaTolerance)))
        : DEFAULT_PREFERENCES.badIdeaTolerance,
    focusMode: isFocusMode(data.focusMode)
      ? data.focusMode
      : DEFAULT_PREFERENCES.focusMode,
    showDiscardedExperiments:
      typeof data.showDiscardedExperiments === "boolean"
        ? data.showDiscardedExperiments
        : DEFAULT_PREFERENCES.showDiscardedExperiments,
    autoDeleteGenericConcepts:
      typeof data.autoDeleteGenericConcepts === "boolean"
        ? data.autoDeleteGenericConcepts
        : DEFAULT_PREFERENCES.autoDeleteGenericConcepts,
    recycleSound:
      typeof data.recycleSound === "boolean"
        ? data.recycleSound
        : DEFAULT_PREFERENCES.recycleSound,
    automaticUpdates:
      typeof data.automaticUpdates === "boolean"
        ? data.automaticUpdates
        : DEFAULT_PREFERENCES.automaticUpdates,
  };
};

export function parsePreferencesStorage(raw: string | null): Preferences {
  return (
    parsePreferencesData(
      parseEnvelopeData(raw, PREFERENCES_STORAGE_VERSION),
      false,
    ) ?? { ...DEFAULT_PREFERENCES }
  );
}

const parseLegacyPreferencesStorage = (raw: string | null): Preferences =>
  parsePreferencesData(
    parseEnvelopeData(raw, LEGACY_STORAGE_VERSION),
    true,
  ) ?? { ...DEFAULT_PREFERENCES };

const parseSessionData = (data: unknown): SessionValues | null => {
  if (
    !isRecord(data) ||
    typeof data.readmeShown !== "boolean" ||
    typeof data.startupPlayed !== "boolean" ||
    typeof data.unlocked !== "boolean" ||
    !isPocketPage(data.page) ||
    !(data.originPage === null || isPocketPage(data.originPage)) ||
    !Array.isArray(data.dismissedNotificationIds) ||
    !data.dismissedNotificationIds.every(
      (id): id is string => typeof id === "string" && id.length > 0,
    )
  ) {
    return null;
  }

  return {
    readmeShown: data.readmeShown,
    startupPlayed: data.startupPlayed,
    unlocked: data.unlocked,
    page: data.page,
    originPage: data.originPage,
    dismissedNotificationIds: Array.from(
      new Set(data.dismissedNotificationIds),
    ),
  };
};

export function parseSessionStorage(raw: string | null): SessionValues {
  return (
    parseSessionData(parseEnvelopeData(raw, SESSION_STORAGE_VERSION)) ?? {
      ...DEFAULT_SESSION,
      dismissedNotificationIds: [],
    }
  );
}

const parseLegacySessionStorage = (raw: string | null): SessionValues =>
  parseSessionData(parseEnvelopeData(raw, LEGACY_STORAGE_VERSION)) ?? {
    ...DEFAULT_SESSION,
    dismissedNotificationIds: [],
  };

const parseStringIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
};

const parseCounter = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;

const parseCounterRecord = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};

  const counters: Record<string, number> = {};
  for (const [id, count] of Object.entries(value)) {
    if (
      id.length > 0 &&
      typeof count === "number" &&
      parseCounter(count) === count
    ) {
      counters[id] = count;
    }
  }
  return counters;
};

export function parseDiscoveriesStorage(raw: string | null): DiscoveryState {
  const data = parseEnvelopeData(raw, DISCOVERIES_STORAGE_VERSION);
  if (!isRecord(data)) return createInitialDiscoveryState();

  const counters = isRecord(data.counters) ? data.counters : {};
  return createInitialDiscoveryState({
    discoveredSecretIds: parseStringIds(data.discoveredSecretIds),
    unlockedThemeIds: parseStringIds(data.unlockedThemeIds),
    unlockedWallpaperIds: parseStringIds(data.unlockedWallpaperIds),
    viewedHiddenFileIds: parseStringIds(data.viewedHiddenFileIds),
    fightClubAchievementIds: parseStringIds(data.fightClubAchievementIds),
    recycleRestorationIds: parseStringIds(data.recycleRestorationIds),
    terminalCommandIds: parseStringIds(data.terminalCommandIds),
    dismissedDiscoveryIds: parseStringIds(data.dismissedDiscoveryIds),
    counters: {
      noteOpens: parseCounterRecord(counters.noteOpens),
      fightClubLaunches: parseCounter(counters.fightClubLaunches),
      recycleRestorations: parseCounter(counters.recycleRestorations),
      terminalCommandsRun: parseCounter(counters.terminalCommandsRun),
      settingsToleranceChanges: parseCounter(
        counters.settingsToleranceChanges,
      ),
    },
  });
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const parseLocalNote = (value: unknown): LocalPocketNote | null => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    typeof value.title !== "string" ||
    typeof value.body !== "string" ||
    !isNonEmptyString(value.folderId) ||
    !isNonEmptyString(value.createdAt) ||
    !isNonEmptyString(value.updatedAt) ||
    typeof value.pinned !== "boolean" ||
    !(
      value.deletedAt === undefined || isNonEmptyString(value.deletedAt)
    )
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    body: value.body,
    folderId: value.folderId,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    pinned: value.pinned,
    ...(value.deletedAt === undefined ? {} : { deletedAt: value.deletedAt }),
  };
};

const parseNoteOverride = (value: unknown): CuratedNoteOverride | null => {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.noteId) ||
    !(value.pinned === undefined || typeof value.pinned === "boolean") ||
    !(value.deletedAt === undefined || isNonEmptyString(value.deletedAt)) ||
    !(value.customTitle === undefined || typeof value.customTitle === "string") ||
    !(value.folderId === undefined || isNonEmptyString(value.folderId))
  ) {
    return null;
  }

  return {
    noteId: value.noteId,
    ...(value.pinned === undefined ? {} : { pinned: value.pinned }),
    ...(value.deletedAt === undefined ? {} : { deletedAt: value.deletedAt }),
    ...(value.customTitle === undefined
      ? {}
      : { customTitle: value.customTitle }),
    ...(value.folderId === undefined ? {} : { folderId: value.folderId }),
  };
};

const dedupeById = <T>(
  values: readonly T[],
  getId: (value: T) => string,
): T[] => Array.from(new Map(values.map((value) => [getId(value), value])).values());

export function parseLocalNotesStorage(
  raw: string | null,
): readonly LocalPocketNote[] {
  const data = parseEnvelopeData(raw, LOCAL_NOTES_STORAGE_VERSION);
  if (!Array.isArray(data)) return [];

  return dedupeById(
    data.map(parseLocalNote).filter((note): note is LocalPocketNote => note !== null),
    (note) => note.id,
  );
}

export function parseNoteOverridesStorage(
  raw: string | null,
): readonly CuratedNoteOverride[] {
  const data = parseEnvelopeData(raw, NOTE_OVERRIDES_STORAGE_VERSION);
  if (!Array.isArray(data)) return [];

  return dedupeById(
    data
      .map(parseNoteOverride)
      .filter((override): override is CuratedNoteOverride => override !== null),
    (override) => override.noteId,
  );
}

const serializeEnvelope = <T>(data: T, version: number): string =>
  JSON.stringify({ version, data } satisfies VersionedEnvelope<T>);

export const serializePreferences = (preferences: Preferences): string =>
  serializeEnvelope(preferences, PREFERENCES_STORAGE_VERSION);

export const serializeSession = (session: SessionValues): string =>
  serializeEnvelope(session, SESSION_STORAGE_VERSION);

export const serializeDiscoveries = (state: DiscoveryState): string =>
  serializeEnvelope(state, DISCOVERIES_STORAGE_VERSION);

export const serializeLocalNotes = (
  notes: readonly LocalPocketNote[],
): string => serializeEnvelope(notes, LOCAL_NOTES_STORAGE_VERSION);

export const serializeNoteOverrides = (
  overrides: readonly CuratedNoteOverride[],
): string => serializeEnvelope(overrides, NOTE_OVERRIDES_STORAGE_VERSION);

export function safeReadStorage<T>(
  storage: StorageLike | null | undefined,
  key: string,
  parse: (raw: string | null) => T,
  fallback: () => T,
): T {
  if (!storage) return fallback();

  try {
    return parse(storage.getItem(key));
  } catch {
    return fallback();
  }
}

const safeGetStorage = (
  storage: StorageLike | null | undefined,
  key: string,
): { readonly readable: boolean; readonly raw: string | null } => {
  if (!storage) return { readable: false, raw: null };

  try {
    return { readable: true, raw: storage.getItem(key) };
  } catch {
    return { readable: false, raw: null };
  }
};

export function safeWriteStorage(
  storage: StorageLike | null | undefined,
  key: string,
  serializedValue: string,
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(key, serializedValue);
    return true;
  } catch {
    return false;
  }
}

export function safeRemoveStorage(
  storage: StorageLike | null | undefined,
  key: string,
): boolean {
  if (!storage) return false;

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const readPreferences = (
  storage: StorageLike | null | undefined,
): Preferences => {
  const current = safeGetStorage(storage, PREFERENCES_KEY);
  if (!current.readable) return { ...DEFAULT_PREFERENCES };
  if (current.raw !== null) return parsePreferencesStorage(current.raw);

  const legacy = safeGetStorage(storage, LEGACY_PREFERENCES_KEY);
  return legacy.readable
    ? parseLegacyPreferencesStorage(legacy.raw)
    : { ...DEFAULT_PREFERENCES };
};

export const readSession = (
  storage: StorageLike | null | undefined,
): SessionValues => {
  const current = safeGetStorage(storage, SESSION_KEY);
  if (!current.readable) {
    return { ...DEFAULT_SESSION, dismissedNotificationIds: [] };
  }
  if (current.raw !== null) return parseSessionStorage(current.raw);

  const legacy = safeGetStorage(storage, LEGACY_SESSION_KEY);
  return legacy.readable
    ? parseLegacySessionStorage(legacy.raw)
    : { ...DEFAULT_SESSION, dismissedNotificationIds: [] };
};

export const readDiscoveries = (
  storage: StorageLike | null | undefined,
): DiscoveryState =>
  safeReadStorage(
    storage,
    DISCOVERIES_KEY,
    parseDiscoveriesStorage,
    createInitialDiscoveryState,
  );

export const readLocalNotes = (
  storage: StorageLike | null | undefined,
): readonly LocalPocketNote[] =>
  safeReadStorage(storage, LOCAL_NOTES_KEY, parseLocalNotesStorage, () => []);

export const readNoteOverrides = (
  storage: StorageLike | null | undefined,
): readonly CuratedNoteOverride[] =>
  safeReadStorage(
    storage,
    NOTE_OVERRIDES_KEY,
    parseNoteOverridesStorage,
    () => [],
  );

export const readLocalNotesState = (
  storage: StorageLike | null | undefined,
): LocalNotesState => ({
  localNotes: readLocalNotes(storage),
  noteOverrides: readNoteOverrides(storage),
});

export const writePreferences = (
  storage: StorageLike | null | undefined,
  preferences: Preferences,
): boolean =>
  safeWriteStorage(
    storage,
    PREFERENCES_KEY,
    serializePreferences(preferences),
  );

export const writeSession = (
  storage: StorageLike | null | undefined,
  session: SessionValues,
): boolean =>
  safeWriteStorage(storage, SESSION_KEY, serializeSession(session));

export const writeDiscoveries = (
  storage: StorageLike | null | undefined,
  state: DiscoveryState,
): boolean =>
  safeWriteStorage(storage, DISCOVERIES_KEY, serializeDiscoveries(state));

export const writeLocalNotes = (
  storage: StorageLike | null | undefined,
  notes: readonly LocalPocketNote[],
): boolean =>
  safeWriteStorage(storage, LOCAL_NOTES_KEY, serializeLocalNotes(notes));

export const writeNoteOverrides = (
  storage: StorageLike | null | undefined,
  overrides: readonly CuratedNoteOverride[],
): boolean =>
  safeWriteStorage(
    storage,
    NOTE_OVERRIDES_KEY,
    serializeNoteOverrides(overrides),
  );

export const writeLocalNotesState = (
  storage: StorageLike | null | undefined,
  state: LocalNotesState,
): boolean => {
  const notesWritten = writeLocalNotes(storage, state.localNotes);
  const overridesWritten = writeNoteOverrides(storage, state.noteOverrides);
  return notesWritten && overridesWritten;
};

export const resetPreferencesStorage = (
  storage: StorageLike | null | undefined,
): boolean => {
  const currentRemoved = safeRemoveStorage(storage, PREFERENCES_KEY);
  const legacyRemoved = safeRemoveStorage(storage, LEGACY_PREFERENCES_KEY);
  return currentRemoved && legacyRemoved;
};

export const resetSessionStorage = (
  storage: StorageLike | null | undefined,
): boolean => {
  const currentRemoved = safeRemoveStorage(storage, SESSION_KEY);
  const legacyRemoved = safeRemoveStorage(storage, LEGACY_SESSION_KEY);
  return currentRemoved && legacyRemoved;
};

export const resetDiscoveriesStorage = (
  storage: StorageLike | null | undefined,
): boolean => safeRemoveStorage(storage, DISCOVERIES_KEY);

export const resetLocalNotesStorage = (
  storage: StorageLike | null | undefined,
): boolean => {
  const notesRemoved = safeRemoveStorage(storage, LOCAL_NOTES_KEY);
  const overridesRemoved = safeRemoveStorage(storage, NOTE_OVERRIDES_KEY);
  return notesRemoved && overridesRemoved;
};
