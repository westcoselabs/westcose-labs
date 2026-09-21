import { describe, expect, it } from "vitest";
import {
  emptyBoosts,
  LOOT,
  MYSTERY_REWARDS,
  UPGRADES,
  type UpgradeId,
} from "@/components/apps/games/low-tide-loot/data";
import {
  bomb,
  createRun,
  fire,
  generateLayout,
  hookPosition,
  levelForDay,
  lootRadius,
  lootWeight,
  lootValue,
  mysteryReward,
  nextDay,
  openShop,
  PHYSICS,
  purchase,
  recover,
  retrievalSpeed,
  segmentHit,
  snapshot,
  stepRun,
  WORLD,
} from "@/components/apps/games/low-tide-loot/model";
import {
  parseGamesProgress,
  readGamesProgress,
  saveSalvageScore,
  saveShitbirdProgress,
} from "@/components/apps/games/storage";
import { getParentPath, getRouteDescriptor } from "@/registry/routes";
import { getRouteParent } from "@/lib/routes";

const advance = (run: ReturnType<typeof createRun>, seconds: number) => {
  for (let i = 0; i < seconds / PHYSICS.step; i++) stepRun(run, PHYSICS.step);
};
describe("LOW TIDE LOOT simulation", () => {
  it("sweeps through the first hit, awards only on retrieval, and resets an empty miss", () => {
    const run = createRun(42);
    run.phase = "playing";
    run.claw.angle = 0;
    run.loot = [
      {
        uid: 1,
        id: "wallet",
        x: WORLD.originX,
        baseX: WORLD.originX,
        y: 300,
        drift: 0,
        size: 1,
        removed: false,
      },
      {
        uid: 2,
        id: "ring",
        x: WORLD.originX,
        baseX: WORLD.originX,
        y: 420,
        drift: 0,
        size: 1,
        removed: false,
      },
    ];
    expect(fire(run)).toBe(true);
    expect(fire(run)).toBe(false);
    advance(run, 0.3);
    expect(run.claw.attached).toBe(1);
    expect(run.earnings).toBe(0);
    advance(run, 1);
    expect(run.earnings).toBe(60);
    expect(run.loot[0].removed).toBe(true);
    expect(run.loot[1].removed).toBe(false);
    run.loot = [];
    run.claw.angle = 0;
    fire(run);
    advance(run, 3);
    expect(run.claw.state).toBe("swinging");
    expect(run.claw.attached).toBeNull();
    expect(segmentHit(0, 0, 1000, 0, 500, 0, 10)).toBeCloseTo(0.49);
    expect(segmentHit(0, 0, 1000, 0, 500, 20, 10)).toBeNull();
  });
  it("makes heavy mistakes costly and bombs return an empty hook without money", () => {
    expect(retrievalSpeed(LOOT.anchor.weight)).toBeLessThan(
      retrievalSpeed(LOOT.ring.weight) / 5,
    );
    expect(retrievalSpeed(2, true) / retrievalSpeed(2)).toBeCloseTo(1.45);
    const run = createRun(9);
    run.phase = "playing";
    const anchor = run.loot.find((o) => o.id === "anchor")!;
    anchor.size = 1;
    run.claw = {
      state: "retracting",
      length: 430,
      angle: 0,
      direction: 1,
      attached: anchor.uid,
      gripX: 0,
      gripY: 0,
    };
    advance(run, 1);
    expect(run.claw.length).toBeGreaterThan(370);
    expect(bomb(run)).toBe(true);
    expect(run.bombs).toBe(0);
    expect(anchor.removed).toBe(true);
    expect(bomb(run)).toBe(false);
    advance(run, 1);
    expect(run.claw.state).toBe("swinging");
    expect(run.score).toBe(0);
  });
  it("freezes the clock, claw and moving loot when paused, then fails precisely at zero", () => {
    const run = createRun(2);
    run.day = 4;
    run.loot = generateLayout(4, 2);
    run.phase = "paused";
    const before = JSON.stringify(snapshot(run)),
      positions = JSON.stringify(run.loot);
    advance(run, 4);
    expect(JSON.stringify(snapshot(run))).toBe(before);
    expect(JSON.stringify(run.loot)).toBe(positions);
    run.phase = "playing";
    advance(run, 1);
    expect(JSON.stringify(run.loot)).not.toBe(positions);
    run.remaining = 0.02;
    advance(run, 0.1);
    expect(run.phase).toBe("over");
    expect(run.remaining).toBe(0);
    expect(fire(run)).toBe(false);
  });
  it("keeps collecting after quota, waits for the deadline, then banks surplus through the shop", () => {
    const run = createRun(3);
    run.phase = "playing";
    recover(run, {
      uid: 90,
      id: "ring",
      x: 0,
      y: 0,
      baseX: 0,
      drift: 0,
      size: 1,
      removed: false,
    });
    recover(run, {
      uid: 91,
      id: "gold",
      x: 0,
      y: 0,
      baseX: 0,
      drift: 0,
      size: 1,
      removed: false,
    });
    expect(run.phase).toBe("playing");
    expect(run.earnings).toBe(1100);
    expect(run.score).toBe(1100);
    expect(run.cash).toBe(1100);
    expect(run.best.value).toBe(600);
    openShop(run);
    expect(run.phase).toBe("playing");
    recover(run, { ...run.loot[0], id: "cash", removed: false });
    expect(run.cash).toBe(1350);
    expect(fire(run)).toBe(true);
    run.loot = [];
    run.remaining = 0.1;
    advance(run, 0.11);
    expect(run.phase).toBe("complete");
    expect(run.remaining).toBe(0);
    openShop(run);
    const id = run.stock[0];
    expect(purchase(run, id)).toBe(true);
    expect(run.cash).toBe(1350 - UPGRADES[id].price);
    expect(run.score).toBe(1350);
    nextDay(run);
    expect(run.earnings).toBe(0);
    expect(run.score).toBe(1350);
    expect(run.day).toBe(2);
    // Target checks bank balance, including yesterday's unspent money.
    run.cash = levelForDay(2).target;
    run.remaining = 0.01;
    advance(run, 0.02);
    expect(run.phase).toBe("complete");
    expect(run.earnings).toBe(0);
  });
  it("keeps the firing bearing locked, resumes its sweep, and only pays fully recovered loot", () => {
    const run = createRun(4);
    run.phase = "playing";
    run.loot = [];
    const angle = run.claw.angle,
      direction = run.claw.direction;
    fire(run);
    advance(run, 0.4);
    expect(run.claw.angle).toBe(angle);
    expect(run.claw.direction).toBe(direction);
    expect(fire(run)).toBe(false);
    while (run.claw.state !== "swinging") stepRun(run, PHYSICS.step);
    expect(run.claw.angle).toBe(angle);
    stepRun(run, PHYSICS.step);
    expect(run.claw.angle).toBeGreaterThan(angle);
    run.loot = [
      {
        uid: 1,
        id: "ring",
        x: WORLD.originX,
        y: 450,
        baseX: WORLD.originX,
        drift: 0,
        size: 1,
        removed: false,
      },
    ];
    run.claw = { ...run.claw, state: "retracting", attached: 1, length: 400 };
    run.remaining = 0.02;
    advance(run, 0.1);
    expect(run.phase).toBe("over");
    expect(run.cash).toBe(0);
    expect(run.loot[0].removed).toBe(false);
  });
  it("scales debris collision and haul time with size, not its tiny resale value", () => {
    const small = {
      uid: 1,
      id: "concrete",
      size: 0.65,
      x: WORLD.originX,
      y: 500,
      baseX: WORLD.originX,
      drift: 0,
      removed: false,
    };
    const large = { ...small, size: 1.45 };
    expect(lootRadius(large) / lootRadius(small)).toBeCloseTo(1.45 / 0.65);
    const haulSeconds = (o: typeof small) =>
      400 / retrievalSpeed(lootWeight(o));
    expect(haulSeconds(large)).toBeGreaterThan(24);
    expect(haulSeconds(large)).toBeGreaterThan(haulSeconds(small) * 4);
    expect(400 / retrievalSpeed(LOOT.ring.weight)).toBeLessThan(1.5);
    expect(LOOT.concrete.value).toBe(3);
  });
  it("applies every upgrade and expires boosts after exactly one day", () => {
    const run = createRun(12);
    run.phase = "complete";
    run.cash = 2000;
    openShop(run);
    run.stock = Object.keys(UPGRADES) as UpgradeId[];
    for (const id of run.stock) {
      expect(purchase(run, id)).toBe(true);
      expect(purchase(run, id)).toBe(false);
    }
    expect(run.cash).toBe(1350);
    expect(run.bombs).toBe(2);
    expect(run.boosts).toEqual(emptyBoosts());
    nextDay(run);
    expect(run.boosts).toEqual({
      energy: true,
      shell: true,
      polish: true,
      guide: true,
    });
    expect(run.pending).toEqual(emptyBoosts());
    expect(lootValue(LOOT.ring, run.boosts)).toBe(810);
    expect(lootValue(LOOT.cash, run.boosts)).toBe(250);
    expect(lootValue(LOOT.anchor, run.boosts)).toBe(96);
    expect(lootValue(LOOT.flipflop, run.boosts)).toBe(40);
    run.phase = "complete";
    openShop(run);
    nextDay(run);
    expect(run.boosts).toEqual(emptyBoosts());
    expect(run.bombs).toBe(2);
    run.phase = "shop";
    run.stock = ["bomb"];
    run.cash = 0;
    run.bought = [];
    expect(purchase(run, "bomb")).toBe(false);
    run.cash = 1000;
    run.bombs = 5;
    expect(purchase(run, "bomb")).toBe(false);
  });
  it("weights cooler rewards safely and Lucky Shell raises expected value", () => {
    const expected = (lucky: boolean) =>
      MYSTERY_REWARDS.reduce(
        (n, r) => n + r.value * (lucky ? r.lucky : r.weight),
        0,
      ) / MYSTERY_REWARDS.reduce((n, r) => n + (lucky ? r.lucky : r.weight), 0);
    expect(expected(true)).toBeGreaterThan(expected(false) * 1.3);
    for (const lucky of [false, true])
      for (let i = 0; i <= 1000; i++)
        expect(MYSTERY_REWARDS).toContain(mysteryReward(i / 1000, lucky));
    expect(MYSTERY_REWARDS.every((r) => r.weight > 0 && r.lucky > 0)).toBe(
      true,
    );
    const run = createRun(5);
    run.phase = "playing";
    run.random = () => 0.67;
    const cooler = run.loot.find((o) => o.id === "cooler")!;
    const before = run.bombs;
    recover(run, cooler);
    expect(run.bombs).toBe(before + 1);
  });
  it("scales authored rounds, unlocks moving targets and caps late difficulty", () => {
    for (let d = 2; d <= 5; d++)
      expect(levelForDay(d).target).toBeGreaterThan(levelForDay(d - 1).target);
    expect(generateLayout(2, 1).some((o) => LOOT[o.id].movable)).toBe(false);
    expect(generateLayout(3, 1).some((o) => o.id === "crab")).toBe(true);
    expect(generateLayout(4, 1).some((o) => o.id === "jewelryCrab")).toBe(true);
    expect(levelForDay(1000).target - levelForDay(999).target).toBe(1900);
    expect(generateLayout(1000, 1)).toHaveLength(24);
    expect(
      new Set(
        Array.from(
          { length: 7 },
          (_, i) => levelForDay(i + 1).environment.name,
        ),
      ).size,
    ).toBe(7);
  });
  it("generates mostly debris of varied sizes with sparse valuables and reachable silhouettes", () => {
    let minimumGap = Infinity;
    for (let day = 1; day <= 12; day++)
      for (let seed = 1; seed <= 40; seed++) {
        const objects = generateLayout(day, seed);
        expect(objects).toEqual(generateLayout(day, seed));
        const scrap = objects.filter((o) => LOOT[o.id].category === "scrap");
        expect(scrap.length / objects.length).toBeGreaterThanOrEqual(0.68);
        expect(
          objects.filter(
            (o) =>
              LOOT[o.id].category !== "scrap" && LOOT[o.id].category !== "crab",
          ).length,
        ).toBeLessThanOrEqual(day === 1 ? 4 : 6);
        expect(new Set(scrap.map((o) => o.size)).size).toBeGreaterThanOrEqual(
          3,
        );
        const newMoneyNeeded =
          levelForDay(day).target - (day > 1 ? levelForDay(day - 1).target : 0);
        expect(
          objects.reduce((n, o) => n + LOOT[o.id].value, 0),
        ).toBeGreaterThan(newMoneyNeeded + 200);
        for (const o of objects) {
          expect(o.y + lootRadius(o)).toBeLessThan(WORLD.playfieldBottom);
          expect(
            Math.abs(Math.atan2(o.x - WORLD.originX, o.y - WORLD.originY)),
          ).toBeLessThan(PHYSICS.maxAngle);
          for (const p of objects)
            if (p.uid > o.uid)
              minimumGap = Math.min(
                minimumGap,
                Math.hypot(p.x - o.x, p.y - o.y) -
                  lootRadius(p) -
                  lootRadius(o),
              );
        }
      }
    expect(minimumGap).toBeGreaterThan(10);
  });
  it("requires more than two good hauls and protects the main prize with heavy debris", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const objects = generateLayout(1, seed);
      expect(objects).toHaveLength(18);
      const values = objects.map((o) => LOOT[o.id].value).sort((a, b) => b - a);
      expect(values[0] + values[1]).toBeLessThan(levelForDay(1).target);
      const gold = objects.find((o) => o.id === "gold")!;
      expect(
        objects.some(
          (o) =>
            o.id === "concrete" &&
            o.size === 1.45 &&
            segmentHit(
              WORLD.originX,
              WORLD.originY,
              gold.x,
              gold.y,
              o.x,
              o.y,
              lootRadius(o),
            ) !== null,
        ),
      ).toBe(true);
    }
  });
  it("makes the first five days winnable across seeded layouts using the actual swinging claw", () => {
    const failures: {
      seed: number;
      day: number;
      cash: number;
      earnings: number;
      left: string[];
    }[] = [];
    for (let seed = 1; seed <= 16; seed++) {
      const run = createRun(seed);
      run.phase = "playing";
      for (let day = 1; day <= 5; day++) {
        let lastShot = 0;
        for (let frame = 0; frame < 7500 && run.phase === "playing"; frame++) {
          // Discrete 67 ms decisions; choose valuable unobstructed rays, never teleport aim.
          if (frame % 8 === 0 && run.claw.state === "swinging") {
            const hook = hookPosition({ ...run.claw, length: 650 });
            const hits = run.loot
              .filter((o) => !o.removed)
              .map((o) => ({
                o,
                t: segmentHit(
                  WORLD.originX,
                  WORLD.originY,
                  hook.x,
                  hook.y,
                  o.x,
                  o.y,
                  lootRadius(o) + 5,
                ),
              }))
              .filter((h) => h.t !== null)
              .sort((a, b) => a.t! - b.t!);
            if (
              hits[0] &&
              (lootValue(LOOT[hits[0].o.id], run.boosts) >= 150 ||
                LOOT[hits[0].o.id].mystery ||
                (run.elapsed - lastShot > 5 &&
                  hits.slice(1).some((h) => LOOT[h.o.id].value >= 150)))
            ) {
              fire(run);
              lastShot = run.elapsed;
            }
          }
          const attached = run.loot.find((o) => o.uid === run.claw.attached);
          if (
            attached &&
            LOOT[attached.id].category === "scrap" &&
            lootWeight(attached) >= 5
          )
            bomb(run);
          stepRun(run, PHYSICS.step);
        }
        if (snapshot(run).phase !== "complete") {
          failures.push({
            seed,
            day,
            cash: run.cash,
            earnings: run.earnings,
            left: run.loot
              .filter((o) => !o.removed && LOOT[o.id].value >= 150)
              .map((o) => o.id),
          });
          break;
        }
        openShop(run);
        if (run.stock.includes("energy")) purchase(run, "energy");
        if (run.stock.includes("polish")) purchase(run, "polish");
        if (run.stock.includes("bomb")) purchase(run, "bomb");
        nextDay(run);
      }
    }
    expect(failures).toEqual([]);
  });
});

describe("LOW TIDE LOOT persistence and routes", () => {
  const record = {
    score: 1200,
    days: 2,
    bestItem: "Diamond ring",
    bestValue: 600,
    timestamp: "2026-09-19T12:00:00.000Z",
  };
  it("shares safe versioned storage without erasing SHITBIRD, bounds and validates scores", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => {
        values.set(k, v);
      },
      removeItem: (k: string) => {
        values.delete(k);
      },
    };
    saveShitbirdProgress(storage, 40);
    saveSalvageScore(storage, record);
    saveShitbirdProgress(storage, 50);
    expect(readGamesProgress(storage).shitbird.best).toBe(50);
    expect(readGamesProgress(storage).lowTideLoot?.scores).toEqual([record]);
    for (let i = 0; i < 14; i++)
      saveSalvageScore(storage, {
        ...record,
        score: 1400 + i,
        timestamp: `2026-09-19T12:01:${String(i).padStart(2, "0")}.000Z`,
      });
    const scores = readGamesProgress(storage).lowTideLoot!.scores;
    expect(scores).toHaveLength(10);
    expect(scores[0].score).toBe(1413);
    expect(saveSalvageScore(storage, { ...record, score: -1 })).toHaveLength(
      10,
    );
    expect(parseGamesProgress("broken").shitbird.best).toBe(0);
    expect(
      parseGamesProgress(
        JSON.stringify({
          version: 1,
          data: {
            lowTideLoot: {
              scores: [null, {}, { ...record, bestItem: 20 }, record],
            },
          },
        }),
      ).lowTideLoot?.scores,
    ).toEqual([record]);
    const denied = {
      getItem: () => {
        throw Error("denied");
      },
      setItem: () => {
        throw Error("denied");
      },
      removeItem: () => {},
    };
    expect(saveSalvageScore(denied, record)).toEqual([record]);
    expect(readGamesProgress(null).shitbird.best).toBe(0);
  });
  it("uses the existing Games app and matching Pocket/Normal parents", () => {
    for (const [route, parent] of [
      ["/games/arcade", "/games"],
      ["/games/arcade/low-tide-loot", "/games"],
    ]) {
      expect(getRouteDescriptor(route)?.appId).toBe("games");
      expect(getParentPath(route)).toBe(parent);
      expect(getRouteParent(route)).toBe(parent);
    }
  });
});
