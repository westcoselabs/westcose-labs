import type { DiscoveryService } from "./discovery-service";

export const FIGHTCLUB_ACHIEVEMENT_IDS = {
  firstLaunch: "fightclub.first-launch",
  fullscreen: "fightclub.fullscreen",
  returnedToOs: "fightclub.returned-to-os",
  threeLaunches: "fightclub.three-launches",
} as const;

export const FIGHTCLUB_MULTI_LAUNCH_THRESHOLD = 3;

export function recordFightClubLaunch(
  service: DiscoveryService | null,
): number {
  if (!service) return 0;

  const launchCount = service.getState().counters.fightClubLaunches + 1;
  service.incrementCounter("fightClubLaunches");
  service.recordAchievement(FIGHTCLUB_ACHIEVEMENT_IDS.firstLaunch);
  if (launchCount >= FIGHTCLUB_MULTI_LAUNCH_THRESHOLD) {
    service.recordAchievement(FIGHTCLUB_ACHIEVEMENT_IDS.threeLaunches);
  }
  return launchCount;
}

export function recordFightClubFullscreen(
  service: DiscoveryService | null,
): void {
  service?.recordAchievement(FIGHTCLUB_ACHIEVEMENT_IDS.fullscreen);
}

export function recordFightClubReturnToOs(
  service: DiscoveryService | null,
): void {
  service?.recordAchievement(FIGHTCLUB_ACHIEVEMENT_IDS.returnedToOs);
}
