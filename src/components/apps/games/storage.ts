import { safeReadStorage, safeWriteStorage, safeRemoveStorage, type StorageLike } from "@/lib/storage";
import { advanceProgress, emptyShitbirdProgress, mergeProgress, parseShitbirdProgress, type RunProgress, type ShitbirdProgress } from "./shitbird/progress";

export const GAMES_STORAGE_KEY = "wcl.games.v1";
export type SalvageScore = { score: number; days: number; bestItem: string; bestValue: number; timestamp: string };
export type GamesProgress = { shitbird: ShitbirdProgress; lowTideLoot?: { scores: SalvageScore[] } };
const empty = (): GamesProgress => ({ shitbird: emptyShitbirdProgress() });

export function parseGamesProgress(raw: string | null): GamesProgress {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version !== 1) return empty();
    const game = value.data?.shitbird;
    const result: GamesProgress = { shitbird: parseShitbirdProgress(game) };
    if (value.data?.lowTideLoot) {
      const scores = value.data.lowTideLoot.scores;
      result.lowTideLoot = { scores: Array.isArray(scores) ? scores.filter(validSalvageScore).sort((a, b) => b.score - a.score || b.days - a.days).slice(0, 10) : [] };
    }
    return result;
  } catch { return empty(); }
}

export const readGamesProgress = (storage: StorageLike | null) =>
  safeReadStorage(storage, GAMES_STORAGE_KEY, parseGamesProgress, empty);

export function saveShitbirdProgress(storage: StorageLike | null, best: number): GamesProgress {
  const previous = readGamesProgress(storage);
  const next = { ...previous, shitbird: { ...previous.shitbird, best: Math.max(previous.shitbird.best, best), hasFlown: true } };
  safeWriteStorage(storage, GAMES_STORAGE_KEY, JSON.stringify({ version: 1, data: next }));
  return next;
}

/** Re-read the envelope to preserve the other game's scores. Memory is the fallback when storage is unavailable. */
export function saveShitbirdRun(storage: StorageLike | null, run: RunProgress, memory: ShitbirdProgress): ShitbirdProgress {
  const previous = readGamesProgress(storage);
  const merged = mergeProgress(previous.shitbird, memory);
  const next = advanceProgress(merged, run);
  safeWriteStorage(storage, GAMES_STORAGE_KEY, JSON.stringify({ version: 1, data: { ...previous, shitbird: next } }));
  return next;
}

export function saveShitbirdSkin(storage: StorageLike | null, progress: ShitbirdProgress): ShitbirdProgress {
  const previous = readGamesProgress(storage);
  const next = mergeProgress(previous.shitbird, progress);
  safeWriteStorage(storage, GAMES_STORAGE_KEY, JSON.stringify({ version: 1, data: { ...previous, shitbird: next } }));
  return next;
}

export const resetGamesProgress = (storage: StorageLike | null) =>
  safeRemoveStorage(storage, GAMES_STORAGE_KEY);

function validSalvageScore(value: unknown): value is SalvageScore {
  if (!value || typeof value !== "object") return false;
  const s = value as SalvageScore;
  return [s.score, s.days, s.bestValue].every((n) => Number.isSafeInteger(n) && n >= 0) &&
    s.bestValue <= s.score && typeof s.bestItem === "string" && s.bestItem.length <= 100 &&
    typeof s.timestamp === "string" && Number.isFinite(Date.parse(s.timestamp));
}

export function saveSalvageScore(storage: StorageLike | null, score: SalvageScore): SalvageScore[] {
  const previous = readGamesProgress(storage);
  const scores = [...(previous.lowTideLoot?.scores ?? [])];
  if (validSalvageScore(score) && !scores.some((s) => s.timestamp === score.timestamp)) scores.push(score);
  scores.sort((a, b) => b.score - a.score || b.days - a.days);
  const next = scores.slice(0, 10);
  safeWriteStorage(storage, GAMES_STORAGE_KEY, JSON.stringify({ version: 1, data: { ...previous, lowTideLoot: { scores: next } } }));
  return next;
}
