import type { DiscoveryService } from "@/lib/discovery-service";
import { MAX_DIFFICULTY_SCORE, type Flight } from "./model";

export function recordFlightProgress(service: DiscoveryService | null, flight: Pick<Flight, "phase" | "score" | "elapsed">): string[] {
  if (!service || flight.phase === "ready") return [];
  const ids = ["shitbird.first-flight"];
  if (flight.score >= 10) ids.push("shitbird.ten");
  if (flight.score >= 25) ids.push("shitbird.twenty-five");
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
