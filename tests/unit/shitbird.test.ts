import { describe, expect, it } from "vitest";
import { createDiscoveryService } from "@/lib/discovery-service";
import { createInitialDiscoveryState } from "@/state/discoveries";
import { parseDiscoveriesStorage } from "@/lib/storage";
import { parseGamesProgress, readGamesProgress, saveShitbirdProgress } from "@/components/apps/games/storage";
import { difficulty, flap, MAX_DIFFICULTY_SCORE, nextObstacle, PHYSICS, startFlight, stepFlight, WORLD } from "@/components/apps/games/shitbird/model";
import { recordFlightProgress } from "@/components/apps/games/shitbird/progress";

const seeded = (seed: number) => () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };

describe("SHITBIRD flight model", () => {
  it("ramps smoothly and caps every difficulty value at 40, without capping score", () => {
    for (let score = 1; score <= MAX_DIFFICULTY_SCORE; score++) {
      const previous = difficulty(score - 1), current = difficulty(score);
      expect(current.speed).toBeGreaterThan(previous.speed);
      expect(current.speed - previous.speed).toBeLessThan(3.1);
      expect(current.gap).toBeLessThan(previous.gap);
      expect(previous.gap - current.gap).toBeLessThan(1.9);
    }
    expect(difficulty(40)).toEqual({ speed: 196, gap: 140, shift: 64, capped: true });
    expect(difficulty(1000000)).toEqual(difficulty(40));
  });

  it("bounds generated gaps and preserves a navigable corridor through worst-case changes", () => {
    const flight = startFlight(); flight.score = 40;
    for (const value of [0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]) {
      const previous = flight.lastCenter;
      const obstacle = nextObstacle(flight, 400, () => value);
      expect(Math.abs(obstacle.center - previous)).toBeLessThanOrEqual(64);
      expect(obstacle.center - obstacle.gap / 2).toBeGreaterThan(WORLD.ceiling + WORLD.radius);
      expect(obstacle.center + obstacle.gap / 2).toBeLessThan(WORLD.floor - WORLD.radius);
    }
  });

  for (const initialScore of [0, 20, 40]) {
    it(`flies 250 more gates from score ${initialScore} across 16 seeded and adversarial courses`, () => {
      const trials = [...Array.from({ length: 16 }, (_, seed) => seeded(seed)), () => 0, () => 1];
      let alternating = 0; trials.push(() => (alternating++ % 2));
      for (const random of trials) {
        const flight = startFlight(); flight.score = initialScore;
        flight.speed = difficulty(initialScore).speed;
        flight.obstacles[0].gap = difficulty(initialScore).gap;
        let lastFlap = 0;
        for (let frame = 0; frame < 100000 && flight.score < initialScore + 250 && flight.phase === "playing"; frame++) {
          const next = flight.obstacles.find((o) => o.x + WORLD.obstacleWidth >= WORLD.birdX - WORLD.radius);
          const target = next?.center ?? 260;
          // Human-like discrete decisions (60 ms sampling; >= 100 ms between taps).
          if (frame % 8 === 0 && flight.y > target + 12 && flight.velocity > -30 && flight.elapsed - lastFlap > .1) {
            flap(flight); lastFlap = flight.elapsed;
          }
          stepFlight(flight, PHYSICS.step, random);
        }
        expect({ phase: flight.phase, score: flight.score, y: flight.y }).toMatchObject({ phase: "playing", score: initialScore + 250 });
        expect(flight.obstacles.length).toBeLessThanOrEqual(4);
      }
    });
  }

  it("uses forgiving circular hit detection, ends on contact, and scores a gate once", () => {
    const flight = startFlight();
    flight.obstacles = [{ x: 34, center: 260, gap: 190, passed: false, variant: 0 }];
    for (let i = 0; i < 30; i++) stepFlight(flight, PHYSICS.step, () => .5);
    expect(flight.score).toBe(1);
    flight.y = WORLD.floor; stepFlight(flight, PHYSICS.step);
    expect(flight.phase).toBe("dead");
    const dead = structuredClone(flight); stepFlight(flight, 10);
    expect(flight).toEqual(dead);
  });

  it("freezes paused flights and begins retries with a completely fresh run", () => {
    const flight = startFlight(); flight.phase = "paused";
    const before = structuredClone(flight);
    stepFlight(flight, 60); flap(flight);
    expect(flight).toEqual(before);
    expect(startFlight()).toMatchObject({ score: 0, elapsed: 0, velocity: PHYSICS.flap, phase: "playing" });
  });
});

describe("SHITBIRD OS progress", () => {
  it("survives malformed or unavailable storage and preserves the best score", () => {
    let raw: string | null = null;
    const storage = { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; }, removeItem: () => { raw = null; } };
    saveShitbirdProgress(storage, 25); saveShitbirdProgress(storage, 10);
    expect(readGamesProgress(storage).shitbird).toEqual({ best: 25, hasFlown: true });
    for (const value of ["oops", "null", '{"version":99}', '{"version":1,"data":{"shitbird":{"best":-10}}}']) {
      expect(parseGamesProgress(value).shitbird.best).toBe(0);
    }
    expect(saveShitbirdProgress(null, 12).shitbird.best).toBe(12);
  });

  it("records milestones only once through the shared service and keeps FightClub separate", () => {
    const service = createDiscoveryService(null);
    const first = { phase: "playing", score: 0, elapsed: 0 } as const;
    expect(recordFlightProgress(service, first)).toEqual(["shitbird.first-flight"]);
    expect(recordFlightProgress(service, first)).toEqual([]);
    recordFlightProgress(service, { phase: "dead", score: 0, elapsed: 1.4 });
    recordFlightProgress(service, { phase: "playing", score: 40, elapsed: 60 });
    expect(service.getState().achievementIds).toHaveLength(6);
    expect(service.getState().fightClubAchievementIds).toEqual([]);
    expect(service.hasDiscovery("games.shitbird-cap")).toBe(true);
    service.reset(); expect(service.getState().achievementIds).toEqual([]);
  });

  it("migrates old achievement envelopes without losing launcher achievements", () => {
    const state = createInitialDiscoveryState();
    const migrated = parseDiscoveriesStorage(JSON.stringify({ version: 1, data: { ...state, achievementIds: undefined, fightClubAchievementIds: ["fightclub.first-launch"] } }));
    expect(migrated.achievementIds).toEqual(["fightclub.first-launch"]);
    expect(migrated.fightClubAchievementIds).toEqual(["fightclub.first-launch"]);
  });
});
