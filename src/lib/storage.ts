import type { PocketPage, PocketSessionValues } from "../state/pocket";
import {
  DEFAULT_PREFERENCES,
  type DisplayPreference,
  type Preferences,
} from "../state/preferences";

export const PREFERENCES_STORAGE_KEY = "wcl.preferences.v1";
export const SESSION_STORAGE_KEY = "wcl.session.v1";
export const STORAGE_VERSION = 1;

export interface SessionValues extends PocketSessionValues {
  readonly readmeShown: boolean;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface VersionedEnvelope<T> {
  readonly version: typeof STORAGE_VERSION;
  readonly data: T;
}

export const DEFAULT_SESSION: SessionValues = Object.freeze({
  readmeShown: false,
  startupPlayed: false,
  unlocked: false,
  page: 0,
  originPage: null,
  dismissedNotificationIds: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDisplayPreference = (value: unknown): value is DisplayPreference =>
  value === "auto" ||
  value === "desktop" ||
  value === "pocket" ||
  value === "normal";

const isPocketPage = (value: unknown): value is PocketPage =>
  value === 0 || value === 1;

const readEnvelopeData = (raw: string | null): unknown => {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

export function parsePreferencesStorage(raw: string | null): Preferences {
  const data = readEnvelopeData(raw);

  if (
    !isRecord(data) ||
    data.themeId !== "dusk" ||
    typeof data.soundEnabled !== "boolean" ||
    typeof data.extraReducedMotion !== "boolean" ||
    typeof data.highContrast !== "boolean" ||
    !isDisplayPreference(data.displayPreference)
  ) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    themeId: "dusk",
    soundEnabled: data.soundEnabled,
    extraReducedMotion: data.extraReducedMotion,
    highContrast: data.highContrast,
    displayPreference: data.displayPreference,
  };
}

export function parseSessionStorage(raw: string | null): SessionValues {
  const data = readEnvelopeData(raw);

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
    return {
      ...DEFAULT_SESSION,
      dismissedNotificationIds: [],
    };
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
}

const serializeEnvelope = <T>(data: T): string =>
  JSON.stringify({ version: STORAGE_VERSION, data } satisfies VersionedEnvelope<T>);

export const serializePreferences = (preferences: Preferences): string =>
  serializeEnvelope(preferences);

export const serializeSession = (session: SessionValues): string =>
  serializeEnvelope(session);

export function safeReadStorage<T>(
  storage: StorageLike | null | undefined,
  key: string,
  parse: (raw: string | null) => T,
  fallback: () => T,
): T {
  if (!storage) {
    return fallback();
  }

  try {
    return parse(storage.getItem(key));
  } catch {
    return fallback();
  }
}

export function safeWriteStorage(
  storage: StorageLike | null | undefined,
  key: string,
  serializedValue: string,
): boolean {
  if (!storage) {
    return false;
  }

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
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const readPreferences = (
  storage: StorageLike | null | undefined,
): Preferences =>
  safeReadStorage(
    storage,
    PREFERENCES_STORAGE_KEY,
    parsePreferencesStorage,
    () => ({ ...DEFAULT_PREFERENCES }),
  );

export const readSession = (
  storage: StorageLike | null | undefined,
): SessionValues =>
  safeReadStorage(storage, SESSION_STORAGE_KEY, parseSessionStorage, () => ({
    ...DEFAULT_SESSION,
    dismissedNotificationIds: [],
  }));

export const writePreferences = (
  storage: StorageLike | null | undefined,
  preferences: Preferences,
): boolean =>
  safeWriteStorage(
    storage,
    PREFERENCES_STORAGE_KEY,
    serializePreferences(preferences),
  );

export const writeSession = (
  storage: StorageLike | null | undefined,
  session: SessionValues,
): boolean =>
  safeWriteStorage(storage, SESSION_STORAGE_KEY, serializeSession(session));
