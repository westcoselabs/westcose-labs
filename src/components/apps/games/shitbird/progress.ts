import type { DiscoveryService } from "@/lib/discovery-service";
import { MAX_DIFFICULTY_SCORE, validDailyId, type BirdSkin, type DeathCause, type Flight } from "./model";

export type ShitbirdProgress = {
  best: number; hasFlown: boolean; bestBonus: number; bestCombo: number; bestHits: number;
  bestCars: number; skin: BirdSkin; daily: Record<string, { score: number; bonus: number }>;
};
export const emptyShitbirdProgress = (): ShitbirdProgress => ({ best: 0, hasFlown: false,
  bestBonus: 0, bestCombo: 0, bestHits: 0, bestCars: 0, skin: "gull", daily: {} });
const count = (n: unknown): number => Number.isSafeInteger(n) && Number(n) >= 0 ? Number(n) : 0;
export const BIRDS = [
  { id: "gull", name: "Original delinquent", short: "Original", requirement: "Born this way.", unlocked: () => true },
  { id: "chips", name: "Chip thief", short: "Chip thief", requirement: "Hit your first target.", unlocked: (p: ShitbirdProgress) => p.bestHits >= 1 },
  { id: "business", name: "Middle management", short: "The suit", requirement: "Clear 10 poles in one flight.", unlocked: (p: ShitbirdProgress) => p.best >= 10 },
  { id: "punk", name: "Public nuisance", short: "Punk", requirement: "Chain 3 target hits without a miss.", unlocked: (p: ShitbirdProgress) => p.bestCombo >= 3 },
] as const;

export function parseShitbirdProgress(raw: unknown): ShitbirdProgress {
  if (!raw || typeof raw !== "object") return emptyShitbirdProgress();
  const p = raw as Record<string, unknown>;
  const result: ShitbirdProgress = { best: count(p.best), hasFlown: p.hasFlown === true,
    bestBonus: count(p.bestBonus), bestCombo: count(p.bestCombo), bestHits: count(p.bestHits),
    bestCars: count(p.bestCars), skin: "gull", daily: {} };
  if (p.daily && typeof p.daily === "object") {
    for (const [day, value] of Object.entries(p.daily).filter(([day]) => validDailyId(day)).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14)) {
      if (value && typeof value === "object") result.daily[day] = { score: count(value.score), bonus: count(value.bonus) };
    }
  }
  const bird = BIRDS.find((b) => b.id === p.skin);
  if (bird?.unlocked(result)) result.skin = bird.id;
  return result;
}

export type RunProgress = Pick<Flight, "score" | "bonus" | "bestCombo" | "hits" | "carHits" | "daily">;
export function advanceProgress(previous: ShitbirdProgress, run: RunProgress): ShitbirdProgress {
  const next = { ...previous, hasFlown: true, best: Math.max(previous.best, run.score),
    bestBonus: Math.max(previous.bestBonus, run.bonus), bestCombo: Math.max(previous.bestCombo, run.bestCombo),
    bestHits: Math.max(previous.bestHits, run.hits), bestCars: Math.max(previous.bestCars, run.carHits),
    daily: { ...previous.daily } };
  if (run.daily && validDailyId(run.daily)) {
    const old = next.daily[run.daily];
    next.daily[run.daily] = { score: Math.max(old?.score ?? 0, run.score), bonus: Math.max(old?.bonus ?? 0, run.bonus) };
  }
  return parseShitbirdProgress(next);
}

export function mergeProgress(stored: ShitbirdProgress, memory: ShitbirdProgress): ShitbirdProgress {
  const next = advanceProgress(stored, { score: memory.best, bonus: memory.bestBonus,
    bestCombo: memory.bestCombo, hits: memory.bestHits, carHits: memory.bestCars, daily: null });
  next.hasFlown = stored.hasFlown || memory.hasFlown;
  next.skin = memory.skin;
  for (const [day, record] of Object.entries(memory.daily)) {
    next.daily[day] = { score: Math.max(record.score, next.daily[day]?.score ?? 0), bonus: Math.max(record.bonus, next.daily[day]?.bonus ?? 0) };
  }
  return parseShitbirdProgress(next);
}

export function nextGoal(progress: ShitbirdProgress): string {
  if (progress.bestHits < 1) return "Hit 1 target → unlock Chip thief";
  if (progress.best < 10) return `Best ${progress.best}/10 poles · Reach 10 in one flight → The suit`;
  if (progress.bestCombo < 3) return "Chain 3 target hits → unlock Punk";
  if (progress.best < 25) return `Best ${progress.best}/25 poles · Reach 25 → Coastal management`;
  if (progress.bestCars < 3) return "Hit 3 cars in one flight → Parking violation";
  if (progress.best < 40) return `Best ${progress.best}/40 poles · Reach 40 → Peak bullshit`;
  return `Next flight: beat ${progress.best} poles or ${progress.bestBonus} mischief points`;
}

export function deathMessage(cause: DeathCause, index: number): string {
  const messages = cause === "ceiling" ? ["The sky has a complaints department.", "Promoted straight into the ceiling."] :
    cause === "boardwalk" ? ["Gravity would like a quick sync.", "The boardwalk declined your landing request."] : deathMessages;
  return messages[index % messages.length];
}

export function shareFlight(run: RunProgress, origin: string): string {
  const url = new URL("/games/shitbird", origin);
  if (run.daily) url.searchParams.set("daily", run.daily);
  return `SHITBIRD${run.daily ? ` · Daily coast ${run.daily}` : ""}\n${run.score} poles · ${run.bonus} mischief · ${run.bestCombo} hit streak\nOne bird. No prospects. Can you beat it?\n${url}`;
}

export function recordFlightProgress(service: DiscoveryService | null, flight: Pick<Flight, "phase" | "score" | "elapsed"> & Partial<Pick<Flight, "hits" | "bestCombo" | "carHits">>): string[] {
  if (!service || flight.phase === "ready") return [];
  const ids = ["shitbird.first-flight"];
  if (flight.score >= 10) ids.push("shitbird.ten");
  if (flight.score >= 25) ids.push("shitbird.twenty-five");
  if ((flight.hits ?? 0) >= 1) ids.push("shitbird.direct-hit");
  if ((flight.bestCombo ?? 0) >= 3) ids.push("shitbird.nuisance");
  if ((flight.carHits ?? 0) >= 3) ids.push("shitbird.parking");
  if (flight.score >= MAX_DIFFICULTY_SCORE) {
    ids.push("shitbird.max");
    service.recordDiscovery("games.shitbird-cap");
  }
  if (flight.phase === "dead") {
    ids.push("shitbird.first-death");
    if (flight.score === 0 && flight.elapsed < 3) ids.push("shitbird.zero");
  }
  const fresh = ids.filter((id) => !service.getState().achievementIds.includes(id));
  for (const id of fresh) service.recordAchievement(id);
  return fresh;
}

export const deathMessages = [
  "Direct collision with feedback.", "Scope creep wins again.", "Shit happens. Usually here.",
  "Killed by another tiny revision.", "Bird status: absolutely fucked.", "Stakeholder detected.",
  "Project successfully derailed.", "The coast has filed a complaint.", "Great pitch. Terrible landing.",
  "Your flight has been deprioritized.", "Another promising career in the bin.",
  "Gravity would like a quick sync.", "No thoughts. Briefly airborne.",
  "Deliverable: one dead seagull.", "Have you tried fewer consequences?",
  "The utility pole declined your proposal.",
] as const;
