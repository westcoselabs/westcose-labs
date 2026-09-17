import { describe, expect, it } from "vitest";

import {
  FIGHTCLUB_ACHIEVEMENT_IDS,
  recordFightClubFullscreen,
  recordFightClubLaunch,
  recordFightClubReturnToOs,
} from "@/lib";
import { createDiscoveryService } from "@/lib/discovery-service";
import { achievementRegistry, fightClubRegistry } from "@/registry";

describe("FightClub hosted integration", () => {
  it("centralizes an exact trusted host and verified raw embed URL", () => {
    const game = fightClubRegistry[0];
    const embed = new URL(game.hostedBuild.embedUrl);
    const launch = new URL(game.hostedBuild.launchUrl);

    expect(game.buildStatus).toBe("playable");
    expect(game.hostedBuild.embedStatus).toBe("verified");
    expect(embed.origin).toBe(game.hostedBuild.allowedOrigin);
    expect(launch.origin).toBe(game.hostedBuild.allowedOrigin);
    expect(embed.searchParams.get("__raw")).toBe("1");
    expect(game.hostedBuild.messageContract).toBe("none");
  });

  it("registers only achievements observable by the OS launcher", () => {
    expect(achievementRegistry.map((achievement) => achievement.id)).toEqual(
      fightClubRegistry[0].achievementIds,
    );
    expect(
      achievementRegistry.map((achievement) => achievement.description).join(" "),
    ).not.toMatch(/win|score|round|fighter|match/i);
  });

  it("records launch thresholds, full screen, and return without remote events", () => {
    const service = createDiscoveryService(null);

    expect(recordFightClubLaunch(service)).toBe(1);
    expect(recordFightClubLaunch(service)).toBe(2);
    expect(recordFightClubLaunch(service)).toBe(3);
    recordFightClubFullscreen(service);
    recordFightClubReturnToOs(service);

    expect(service.getState().counters.fightClubLaunches).toBe(3);
    expect(service.getState().fightClubAchievementIds).toEqual([
      FIGHTCLUB_ACHIEVEMENT_IDS.firstLaunch,
      FIGHTCLUB_ACHIEVEMENT_IDS.threeLaunches,
      FIGHTCLUB_ACHIEVEMENT_IDS.fullscreen,
      FIGHTCLUB_ACHIEVEMENT_IDS.returnedToOs,
    ]);
  });
});
