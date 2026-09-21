import {
  emptyBoosts,
  ENVIRONMENTS,
  LOOT,
  MYSTERY_REWARDS,
  UPGRADES,
  type Boosts,
  type LootDefinition,
  type UpgradeId,
} from "./data";

export const WORLD = {
  width: 1280,
  height: 720,
  originX: 640,
  originY: 172,
  surface: 205,
  // Leave space for independently sized touch controls and loot value labels.
  playfieldBottom: 576,
} as const;
export const PHYSICS = {
  step: 1 / 120,
  maxAngle: 1.13,
  swingSpeed: 0.86,
  fireSpeed: 550,
  emptySpeed: 670,
  restLength: 40,
} as const;
export type LootObject = {
  uid: number;
  id: string;
  x: number;
  y: number;
  baseX: number;
  drift: number;
  size: number;
  removed: boolean;
};
export type Claw = {
  state: "swinging" | "firing" | "retracting";
  angle: number;
  direction: number;
  length: number;
  attached: number | null;
  gripX: number;
  gripY: number;
};
export type Find = { name: string; value: number; quip?: string };
export type Run = {
  phase: "ready" | "playing" | "paused" | "complete" | "shop" | "over";
  seed: number;
  random: () => number;
  day: number;
  elapsed: number;
  remaining: number;
  earnings: number;
  score: number;
  cash: number;
  bombs: number;
  best: Find;
  dayBest: Find;
  claw: Claw;
  loot: LootObject[];
  boosts: Boosts;
  pending: Boosts;
  stock: UpgradeId[];
  bought: UpgradeId[];
  event: number;
  message: string;
  effect:
    "fire" | "hit" | "money" | "bomb" | "success" | "failure" | "buy" | "";
};
export type Snapshot = Pick<
  Run,
  | "phase"
  | "day"
  | "remaining"
  | "earnings"
  | "score"
  | "cash"
  | "bombs"
  | "best"
  | "dayBest"
  | "boosts"
  | "pending"
  | "stock"
  | "bought"
  | "message"
> & {
  target: number;
  attached: string | null;
  attachedWeight: number;
  clawState: Claw["state"];
  event: number;
};
export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function levelForDay(day: number) {
  const d = Math.max(1, Math.floor(day));
  return {
    day: d,
    // Classic bank balance goals: spending makes the next target harder.
    // Later goals keep rising while the required daily increment caps at $1,900.
    target: [1000, 2150, 3450, 4900, 6600][d - 1] ?? 6600 + (d - 5) * 1900,
    duration: 60,
    environment: ENVIRONMENTS[(d - 1) % ENVIRONMENTS.length],
    density: Math.min(24, 17 + d),
    crabs: d >= 3,
    jewelryCrabs: d >= 4,
  };
}
export const retrievalSpeed = (weight: number, energy = false) =>
  (400 / (1 + Math.max(0, weight) * 1.05)) * (energy ? 1.45 : 1);
export const lootRadius = (object: LootObject) =>
  LOOT[object.id].radius * object.size;
export const lootWeight = (object: LootObject) =>
  LOOT[object.id].weight * object.size ** 2;
export function lootValue(item: LootDefinition, boosts: Boosts): number {
  if (item.category === "scrap" && boosts.guide)
    return Math.max(40, item.value * 12);
  return Math.round(
    item.value * (item.category === "jewelry" && boosts.polish ? 1.35 : 1),
  );
}
export function mysteryReward(random: number, lucky: boolean) {
  const total = MYSTERY_REWARDS.reduce(
    (sum, r) => sum + (lucky ? r.lucky : r.weight),
    0,
  );
  let roll = Math.max(0, Math.min(0.999999, random)) * total;
  for (const reward of MYSTERY_REWARDS) {
    roll -= lucky ? reward.lucky : reward.weight;
    if (roll < 0) return reward;
  }
  return MYSTERY_REWARDS[0];
}
export function generateLayout(day: number, seed: number): LootObject[] {
  const rng = seededRandom(seed ^ Math.imul(day, 7919));
  const level = levelForDay(day);
  // Sparse valuables in authored pockets, mostly heavy debris between them.
  // Only the first cash roll is shallow; the rest requires deeper, narrower shots.
  const goods =
    day === 1
      ? ["cash", "gold", "watch", "cooler"]
      : ["cash", "gold", "ring", "watch", "cooler"];
  if (level.jewelryCrabs) goods[3] = "jewelryCrab";
  if (day >= 5) goods.push(day % 3 === 0 ? "drive" : "ring");
  if (day > 1)
    goods[0] = [
      "phone",
      "camera",
      "cash",
      "silver",
      "earbuds",
      "keys",
      "wallet",
      "shades",
    ][(day - 2) % 8];
  // Fewer fallback targets: opening day requires all three guaranteed valuables.
  const junk = [
    "tire",
    "anchor",
    "concrete",
    "concrete",
    "tire",
    "towel",
    "board",
    "anchor",
    "flipflop",
    "motel",
  ];
  const blockerIndex = goods.length;
  const ids = [...goods, "concrete"];
  if (level.crabs) ids.push("crab");
  while (ids.length < level.density)
    ids.push(junk[(ids.length + day) % junk.length]);
  const pockets = [
    { x: 640, y: 294 },
    { x: 400, y: 447 },
    { x: 920, y: 514 },
    { x: 190, y: 530 },
    { x: 716, y: 532 },
    { x: 1060, y: 490 },
    { x: 640, y: 461 },
    { x: 1080, y: 535 },
    { x: 480, y: 530 },
  ];
  const objects: LootObject[] = [];
  for (const [uid, id] of ids.entries()) {
    const def = LOOT[id];
    const bigDebris = ["anchor", "concrete", "tire"].includes(id);
    const sizes = bigDebris ? [0.65, 1, 1.45] : [0.8, 1, 1.15];
    let size =
      uid === blockerIndex
        ? 1.45
        : def.category === "scrap"
          ? sizes[Math.floor(rng() * sizes.length)]
          : 1;
    let position = pockets[uid % pockets.length];
    for (let attempt = 0; attempt < 600; attempt++) {
      const r = def.radius * size;
      if (uid < goods.length) {
        const pocket = pockets[uid];
        position = {
          x:
            (day % 2 === 0 ? WORLD.width - pocket.x : pocket.x) +
            (rng() - 0.5) * 16,
          y: pocket.y + (rng() - 0.5) * 10,
        };
      } else if (uid === blockerIndex) {
        // The main heavy prize has a deliberate obstruction. Spend the bomb,
        // clear the concrete, or find an edge shot; there is no free opening haul.
        const prize = objects.find((o) => o.id === "gold")!;
        const distance = 0.55 + rng() * 0.1;
        position = {
          x: WORLD.originX + (prize.x - WORLD.originX) * distance,
          y: WORLD.originY + (prize.y - WORLD.originY) * distance,
        };
      } else {
        position = { x: 48 + rng() * (WORLD.width - 96), y: 270 + rng() * 275 };
      }
      const angle = Math.abs(
        Math.atan2(position.x - WORLD.originX, position.y - WORLD.originY),
      );
      const clear = objects.every(
        (other) =>
          Math.hypot(position.x - other.x, position.y - other.y) >
          r +
            lootRadius(other) +
            17 +
            (def.movable || LOOT[other.id].movable ? 10 : 0),
      );
      if (
        clear &&
        angle < PHYSICS.maxAngle - 0.06 &&
        position.y + r < WORLD.playfieldBottom &&
        position.x - r > 16 &&
        position.x + r < WORLD.width - 24
      )
        break;
      // Packed later boards still get a legal small scrap piece, never an overlap.
      if (attempt === 350 && def.category === "scrap" && uid !== blockerIndex)
        size = 0.65;
      if (attempt === 599) position = { x: -1000, y: -1000 };
    }
    if (position.x < 0) continue;
    objects.push({
      uid,
      id,
      ...position,
      size,
      baseX: position.x,
      drift: rng() * Math.PI * 2,
      removed: false,
    });
  }
  return objects;
}
const newClaw = (): Claw => ({
  state: "swinging",
  angle: -0.75,
  direction: 1,
  length: PHYSICS.restLength,
  attached: null,
  gripX: 0,
  gripY: 0,
});
const noFind = (): Find => ({ name: "Nothing yet", value: 0 });
export function createRun(seed = Math.floor(Math.random() * 4294967296)): Run {
  return {
    phase: "ready",
    seed,
    random: seededRandom(seed),
    day: 1,
    elapsed: 0,
    remaining: 60,
    earnings: 0,
    score: 0,
    cash: 0,
    bombs: 1,
    best: noFind(),
    dayBest: noFind(),
    claw: newClaw(),
    loot: generateLayout(1, seed),
    boosts: emptyBoosts(),
    pending: emptyBoosts(),
    stock: [],
    bought: [],
    event: 0,
    message: "Aim for the good stuff. Rent won't pay itself.",
    effect: "",
  };
}
export function snapshot(run: Run): Snapshot {
  return {
    phase: run.phase,
    day: run.day,
    remaining: run.remaining,
    earnings: run.earnings,
    score: run.score,
    cash: run.cash,
    bombs: run.bombs,
    best: { ...run.best },
    dayBest: { ...run.dayBest },
    boosts: { ...run.boosts },
    pending: { ...run.pending },
    stock: [...run.stock],
    bought: [...run.bought],
    target: levelForDay(run.day).target,
    message: run.message,
    attached: attachedLoot(run)?.id ?? null,
    attachedWeight: attachedLoot(run) ? lootWeight(attachedLoot(run)!) : 0,
    clawState: run.claw.state,
    event: run.event,
  };
}
export const attachedLoot = (run: Run) =>
  run.loot.find((o) => o.uid === run.claw.attached && !o.removed);
export function hookPosition(claw: Claw) {
  return {
    x: WORLD.originX + Math.sin(claw.angle) * claw.length,
    y: WORLD.originY + Math.cos(claw.angle) * claw.length,
  };
}
function emit(run: Run, message: string, effect: Run["effect"]) {
  run.message = message;
  run.effect = effect;
  run.event++;
}
export function fire(run: Run) {
  if (run.phase !== "playing" || run.claw.state !== "swinging") return false;
  run.claw.state = "firing";
  emit(run, "Finders keepers. Landlord takes cash.", "fire");
  return true;
}
export function bomb(run: Run) {
  const object = attachedLoot(run);
  if (
    run.phase !== "playing" ||
    !object ||
    !LOOT[object.id].destructible ||
    run.bombs <= 0
  )
    return false;
  object.removed = true;
  run.bombs--;
  run.claw.attached = null;
  run.claw.state = "retracting";
  emit(run, "Problem solved. Evidence gone.", "bomb");
  return true;
}
export function recover(run: Run, object: LootObject) {
  if (run.phase !== "playing" || object.removed) return;
  const definition = LOOT[object.id];
  let find: Find = {
    name: definition.name,
    value: lootValue(definition, run.boosts),
    quip: definition.quip,
  };
  if (definition.mystery) {
    const reward = mysteryReward(run.random(), run.boosts.shell);
    find = { name: reward.name, value: reward.value, quip: reward.quip };
    if (reward.id === "jewelry" && run.boosts.polish)
      find.value = Math.round(find.value * 1.35);
    if (reward.gift === "bomb") {
      if (run.bombs < 5) run.bombs++;
      else {
        find.value = 75;
        find.quip = "Bomb bag full. Cash instead.";
      }
    } else if (reward.gift) run.boosts[reward.gift] = true;
  }
  object.removed = true;
  run.earnings += find.value;
  run.cash += find.value;
  run.score += find.value;
  if (find.value > run.best.value) run.best = find;
  if (find.value > run.dayBest.value) run.dayBest = find;
  emit(
    run,
    `${find.name}${find.value ? ` +$${find.value}` : ""}${find.quip ? ` — ${find.quip}` : ""}`,
    "money",
  );
  // Reaching the goal never cuts a haul or the round short. Bank the surplus.
}
// Return the first contact distance along a swept segment (no fast-hook tunneling).
export function segmentHit(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  radius: number,
) {
  const dx = bx - ax,
    dy = by - ay,
    fx = ax - cx,
    fy = ay - cy,
    a = dx * dx + dy * dy;
  const c = fx * fx + fy * fy - radius * radius;
  if (c <= 0) return 0;
  if (!a) return null;
  const b = 2 * (fx * dx + fy * dy),
    disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : null;
}
export function stepRun(run: Run, dt: number) {
  if (run.phase !== "playing" || !Number.isFinite(dt) || dt <= 0) return;
  const step = Math.min(dt, run.remaining);
  run.elapsed += step;
  run.remaining = Math.max(0, run.remaining - step);
  for (const o of run.loot)
    if (LOOT[o.id].movable && !o.removed && o.uid !== run.claw.attached) {
      // Short, dedicated lanes inside each grid slot: crabs never cover a neighbor.
      o.x =
        o.baseX +
        Math.sin(run.elapsed * (o.id === "jewelryCrab" ? 1.8 : 1.1) + o.drift) *
          9;
    }
  const claw = run.claw;
  if (claw.state === "swinging") {
    claw.angle += PHYSICS.swingSpeed * claw.direction * step;
    if (Math.abs(claw.angle) >= PHYSICS.maxAngle) {
      claw.angle = Math.sign(claw.angle) * PHYSICS.maxAngle;
      claw.direction *= -1;
    }
  } else if (claw.state === "firing") {
    const before = hookPosition(claw),
      oldLength = claw.length;
    const dx = Math.sin(claw.angle),
      dy = Math.cos(claw.angle);
    const maxLength = Math.min(
      (WORLD.playfieldBottom - WORLD.originY) / dy,
      Math.abs(dx) < 0.001 ? Infinity : (WORLD.width / 2 - 24) / Math.abs(dx),
    );
    claw.length = Math.min(maxLength, claw.length + PHYSICS.fireSpeed * step);
    const after = hookPosition(claw);
    let nearest: { object: LootObject; t: number } | null = null;
    for (const object of run.loot) {
      if (object.removed) continue;
      const t = segmentHit(
        before.x,
        before.y,
        after.x,
        after.y,
        object.x,
        object.y,
        lootRadius(object) + 5,
      );
      if (t !== null && (!nearest || t < nearest.t)) nearest = { object, t };
    }
    if (nearest) {
      claw.length = oldLength + (claw.length - oldLength) * nearest.t;
      claw.attached = nearest.object.uid;
      const contact = hookPosition(claw);
      claw.gripX = nearest.object.x - contact.x;
      claw.gripY = nearest.object.y - contact.y;
      claw.state = "retracting";
      emit(run, `${LOOT[nearest.object.id].name} on the line.`, "hit");
    } else if (claw.length >= maxLength) claw.state = "retracting";
  } else {
    const object = attachedLoot(run);
    claw.length = Math.max(
      PHYSICS.restLength,
      claw.length -
        (object
          ? retrievalSpeed(lootWeight(object), run.boosts.energy)
          : PHYSICS.emptySpeed) *
          step,
    );
    if (claw.length <= PHYSICS.restLength) {
      if (object) recover(run, object);
      claw.attached = null;
      claw.state = "swinging";
    }
  }
  if (run.remaining === 0 && run.phase === "playing") {
    const passed = run.cash >= levelForDay(run.day).target;
    run.phase = passed ? "complete" : "over";
    emit(
      run,
      passed
        ? "Tide's in. Take your haul to Salty's."
        : "Tide came in. So did the landlord.",
      passed ? "success" : "failure",
    );
  }
}
export function openShop(run: Run) {
  if (run.phase !== "complete") return;
  run.phase = "shop";
  run.boosts = emptyBoosts();
  run.bought = [];
  const ids = Object.keys(UPGRADES) as UpgradeId[];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(run.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  run.stock = ids.slice(0, 4);
}
export function purchase(run: Run, id: UpgradeId) {
  if (
    run.phase !== "shop" ||
    !run.stock.includes(id) ||
    run.bought.includes(id) ||
    run.cash < UPGRADES[id].price ||
    (id === "bomb" && run.bombs >= 5)
  )
    return false;
  run.cash -= UPGRADES[id].price;
  run.bought.push(id);
  if (id === "bomb") run.bombs++;
  else run.pending[id] = true;
  emit(run, `${UPGRADES[id].name} purchased. Absolutely no refunds.`, "buy");
  return true;
}
export function nextDay(run: Run) {
  if (run.phase !== "shop") return;
  run.day++;
  run.phase = "playing";
  run.earnings = 0;
  run.elapsed = 0;
  run.remaining = 60;
  run.dayBest = noFind();
  run.boosts = { ...run.pending };
  run.pending = emptyBoosts();
  run.claw = newClaw();
  run.loot = generateLayout(run.day, run.seed);
  emit(run, `Day ${run.day}. New beach. Same rent problem.`, "");
}
