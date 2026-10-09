import { describe, expect, it } from "vitest";
import { coastIndex, courseRandom, dailyId, flap, nextObstacle, PHYSICS, startFlight, stepFlight, validDailyId, WORLD, type Target } from "@/components/apps/games/shitbird/model";
import { advanceProgress, BIRDS, deathMessage, emptyShitbirdProgress, mergeProgress, parseShitbirdProgress, shareFlight } from "@/components/apps/games/shitbird/progress";
import { readGamesProgress, saveShitbirdRun, saveShitbirdSkin } from "@/components/apps/games/storage";

function target(x: number = WORLD.birdX, y = 320): Target {
  return { x, zoneY: y, kind: "car", state: "waiting", age: 0, dropY: 0, reward: 0 };
}
const run = { score: 12, bonus: 150, bestCombo: 3, hits: 3, carHits: 1, daily: "2026-10-06" };

describe("Shitbird mischief", () => {
  it("awards each target once, grows and caps the multiplier, and never changes flight difficulty", () => {
    const flight = startFlight(); flight.obstacles = [];
    for (let i = 1; i <= 7; i++) {
      flight.y = 320; flight.velocity = 0; flight.targets = [target()];
      const before = flight.bonus;
      stepFlight(flight, PHYSICS.step);
      expect(flight.bonus - before).toBe(25 * Math.min(5, i));
      expect(flight.combo).toBe(i);
      stepFlight(flight, PHYSICS.step);
      expect(flight.hits).toBe(i);
      expect(flight.score).toBe(0);
      expect(flight.speed).toBe(116);
    }
    expect(flight.bestCombo).toBe(7);
    expect(flight.carHits).toBe(7);
  });

  it("a missed zone ends only the streak; hitting afterward starts at x1", () => {
    const flight = startFlight(); flight.obstacles = [];
    flight.combo = 4; flight.bestCombo = 4; flight.bonus = 250;
    flight.targets = [target(WORLD.birdX - 25)];
    stepFlight(flight, PHYSICS.step);
    expect(flight).toMatchObject({ phase: "playing", combo: 0, bestCombo: 4, bonus: 250 });
    flight.targets = [target()]; flight.y = 320; flight.velocity = 0;
    stepFlight(flight, PHYSICS.step);
    expect(flight).toMatchObject({ combo: 1, bonus: 275 });
  });

  it("does not award a target when the bird is above its marked zone or already crashed", () => {
    const flight = startFlight(); flight.targets = [target()];
    stepFlight(flight, PHYSICS.step);
    expect(flight.hits).toBe(0);
    flight.y = WORLD.floor; flight.targets = [target(WORLD.birdX, WORLD.floor)];
    stepFlight(flight, PHYSICS.step);
    expect(flight).toMatchObject({ phase: "dead", deathCause: "boardwalk", hits: 0 });
    expect(deathMessage(flight.deathCause, 1)).toContain("boardwalk");
  });

  it("replays the exact daily course including patterns, even after unrelated randomness", () => {
    const build = (day: string) => {
      const flight = startFlight(day), random = courseRandom(day);
      return Array.from({ length: 60 }, (_, i) => {
        flight.score = i;
        return nextObstacle(flight, 400 + i * WORLD.spacing, random);
      });
    };
    const first = build(run.daily);
    Math.random(); Math.random();
    expect(build(run.daily)).toEqual(first);
    expect(build("2026-10-07")).not.toEqual(first);
    expect(first.every((o) => o.gap >= 140 && o.gap <= 206)).toBe(true);
    expect(coastIndex(10)).toBe(1); expect(coastIndex(20)).toBe(2); expect(coastIndex(30)).toBe(0);
  });

  it("allows swoops and recovery through a long course using the same human-like tap decisions", () => {
    // A real simulation, not direct score injection: steer to zones only after the preceding pole is clear.
    for (const day of ["2026-10-06", "2026-10-07", "2026-10-08"]) {
      const flight = startFlight(day), random = courseRandom(day);
      let lastFlap = -1;
      for (let frame = 0; frame < 30000 && flight.score < 45 && flight.phase === "playing"; frame++) {
        const obstacle = flight.obstacles.find((o) => o.x + WORLD.obstacleWidth >= WORLD.birdX - WORLD.radius);
        const swoop = flight.targets.find((t) => t.state === "waiting" && t.x >= WORLD.birdX - 23 && t.x < WORLD.birdX + 130);
        const clear = !obstacle || obstacle.x > WORLD.birdX + 110;
        const aim = swoop && clear ? swoop.zoneY + 6 : obstacle?.center ?? 260;
        if (frame % 8 === 0 && flight.y > aim + 8 && flight.velocity > -30 && flight.elapsed - lastFlap > .1) {
          flap(flight); lastFlap = flight.elapsed;
        }
        stepFlight(flight, PHYSICS.step, random);
      }
      expect({ score: flight.score, hits: flight.hits, cause: flight.deathCause }).toMatchObject({ score: 45, cause: null });
      expect(flight.hits).toBeGreaterThan(5);
      expect(flight.targets.length).toBeLessThan(5);
    }
  });
});

describe("Shitbird records and unlocks", () => {
  it("migrates legacy scores, validates records and refuses locked cosmetics", () => {
    expect(parseShitbirdProgress({ best: 25, hasFlown: true })).toMatchObject({ best: 25, bestBonus: 0, daily: {}, skin: "gull" });
    expect(parseShitbirdProgress({ best: -1, bestBonus: Infinity, skin: "punk", daily: { nope: {}, "2026-02-30": {} } })).toEqual(emptyShitbirdProgress());
    expect(validDailyId("2026-02-30")).toBe(false);
    expect(dailyId(new Date("2026-10-07T00:01:00Z"))).toBe("2026-10-07");
  });
  it("unlocks birds from feats, saves their selection and keeps independent daily records", () => {
    let raw: string | null = null;
    const storage = { getItem: () => raw, setItem: (_: string, value: string) => { raw = value; }, removeItem: () => { raw = null; } };
    const earned = saveShitbirdRun(storage, run, emptyShitbirdProgress());
    expect(BIRDS.every((bird) => bird.unlocked(earned))).toBe(true);
    const equipped = saveShitbirdSkin(storage, { ...earned, skin: "punk" });
    saveShitbirdRun(storage, { ...run, score: 4, bonus: 25, daily: "2026-10-07" }, equipped);
    expect(readGamesProgress(storage).shitbird).toMatchObject({ best: 12, skin: "punk", daily: {
      "2026-10-06": { score: 12, bonus: 150 }, "2026-10-07": { score: 4, bonus: 25 },
    } });
    expect(saveShitbirdRun(null, { ...run, score: 1, hits: 0 }, earned).best).toBe(12);
  });
  it("merges concurrent records without regression and bounds retained days", () => {
    const stored = advanceProgress(emptyShitbirdProgress(), run);
    const memory = advanceProgress(emptyShitbirdProgress(), { ...run, score: 3, bonus: 200 });
    expect(mergeProgress(stored, memory).daily[run.daily]).toEqual({ score: 12, bonus: 200 });
    let progress = stored;
    for (let i = 1; i <= 28; i++) progress = advanceProgress(progress, { ...run, daily: `2026-10-${String(i).padStart(2, "0")}` });
    expect(Object.keys(progress.daily)).toHaveLength(14);
    expect(progress.daily["2026-10-28"]).toBeDefined();
    expect(progress.best).toBe(12);
  });
  it("shares the completed run and its exact dated course", () => {
    const text = shareFlight(run, "https://example.com");
    expect(text).toContain("12 poles · 150 mischief · 3 hit streak");
    expect(text).toContain("https://example.com/games/shitbird?daily=2026-10-06");
  });
});
