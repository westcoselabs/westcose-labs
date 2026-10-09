/** Logical units and seconds. Every viewport uses exactly this flight corridor. */
export const WORLD = { width: 360, height: 540, ceiling: 34, floor: 500, birdX: 82, radius: 10, obstacleWidth: 46, spacing: 250 } as const;
export const PHYSICS = { gravity: 920, flap: -300, terminal: 430, step: 1 / 120 } as const;
export const MAX_DIFFICULTY_SCORE = 40;
export const FIRST_OBSTACLE_X = 400;
export const COAST_LENGTH = 10;
export type Phase = "ready" | "playing" | "paused" | "dead";
export type Obstacle = { x: number; center: number; gap: number; passed: boolean; variant: number };
export type BirdSkin = "gull" | "chips" | "business" | "punk";
export type TargetKind = "car" | "tourist" | "cafe";
export type Target = { x: number; zoneY: number; kind: TargetKind; state: "waiting" | "hit" | "missed"; age: number; dropY: number; reward: number };
export type DeathCause = "ceiling" | "boardwalk" | "pole" | null;
export const COASTS = ["Boardwalk", "Fishing harbor", "Lighthouse point"] as const;
export const coastIndex = (score: number) => Math.floor(score / COAST_LENGTH) % COASTS.length;
export const comboMultiplier = (combo: number) => Math.min(5, Math.max(1, combo));
export const dailyId = (date = new Date()) => date.toISOString().slice(0, 10);
export function validDailyId(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
/** Course RNG is isolated from artwork, sounds and frame rate. Reset on every retry. */
export function courseRandom(day: string): () => number {
  let seed = 2166136261;
  for (const char of `shitbird-course-2:${day}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
export type Flight = {
  phase: Phase; y: number; velocity: number; score: number; elapsed: number;
  distance: number; speed: number; wing: number; obstacles: Obstacle[];
  lastCenter: number; nextVariant: number;
  targets: Target[]; bonus: number; hits: number; combo: number; bestCombo: number;
  carHits: number; deathCause: DeathCause; pattern: number; daily: string | null;
  notice: string; noticeTime: number;
};

export function difficulty(score: number) {
  const t = Math.max(0, Math.min(1, score / MAX_DIFFICULTY_SCORE));
  const ramp = t * t * (3 - 2 * t);
  return { speed: 116 + 80 * ramp, gap: 190 - 50 * ramp, shift: 28 + 36 * ramp, capped: t === 1 };
}

export function createFlight(): Flight {
  return { phase: "ready", y: 260, velocity: 0, score: 0, elapsed: 0,
    distance: 0, speed: difficulty(0).speed, wing: 0,
    obstacles: [], lastCenter: 260, nextVariant: 0,
    targets: [], bonus: 0, hits: 0, combo: 0, bestCombo: 0, carHits: 0,
    deathCause: null, pattern: 0, daily: null, notice: "", noticeTime: 0 };
}

export function flap(flight: Flight) {
  if (flight.phase !== "playing") return;
  flight.velocity = PHYSICS.flap;
  flight.wing = 0.16;
}

export function startFlight(day: string | null = null): Flight {
  const flight = createFlight();
  flight.phase = "playing";
  flight.obstacles.push({ x: FIRST_OBSTACLE_X, center: 260, gap: difficulty(0).gap, passed: false, variant: 0 });
  flight.nextVariant = 1;
  flight.daily = day;
  addTarget(flight, flight.obstacles[0], 0);
  flap(flight);
  return flight;
}

export function nextObstacle(flight: Flight, x: number, random: () => number): Obstacle {
  const level = difficulty(flight.score);
  const index = flight.nextVariant;
  if (index % 6 === 1) flight.pattern = Math.floor(random() * 3);
  const recovery = index % 6 === 0;
  const direction = flight.pattern === 0 ? -0.65 : flight.pattern === 1 ? 0.65 : (index % 2 ? -0.45 : 0.45);
  const shift = recovery ? (260 - flight.lastCenter) * 0.2 : level.shift * (direction + (random() - 0.5) * 0.4);
  // Constrain both the step and absolute height; no alternating extreme gaps.
  const center = Math.max(172, Math.min(362, flight.lastCenter + Math.max(-level.shift, Math.min(level.shift, shift))));
  flight.lastCenter = center;
  return { x, center, gap: level.gap + (recovery ? 16 : 0), passed: false, variant: flight.nextVariant++ % 3 };
}

function addTarget(flight: Flight, obstacle: Obstacle, index: number) {
  if (index % 2 !== 0) return;
  flight.targets.push({ x: obstacle.x + 118, zoneY: Math.min(408, obstacle.center + 62),
    kind: (["car", "tourist", "cafe"] as const)[Math.floor(index / 2) % 3],
    state: "waiting", age: 0, dropY: 0, reward: 0 });
}

function hitsObstacle(y: number, obstacle: Obstacle): boolean {
  const closestX = Math.max(obstacle.x, Math.min(WORLD.birdX, obstacle.x + WORLD.obstacleWidth));
  const dx = WORLD.birdX - closestX;
  const top = obstacle.center - obstacle.gap / 2;
  const bottom = obstacle.center + obstacle.gap / 2;
  const dy = y < top ? 0 : y > bottom ? 0 : Math.min(y - top, bottom - y);
  return dx * dx + dy * dy < WORLD.radius * WORLD.radius;
}

/** Fixed-step update shared by Kaboom and the deterministic fairness tests. */
export function stepFlight(flight: Flight, dt: number, random: () => number = Math.random) {
  if (flight.phase !== "playing") return;
  flight.elapsed += dt;
  flight.wing = Math.max(0, flight.wing - dt);
  flight.noticeTime = Math.max(0, flight.noticeTime - dt);
  flight.velocity = Math.min(PHYSICS.terminal, flight.velocity + PHYSICS.gravity * dt);
  flight.y += flight.velocity * dt;
  flight.speed += (difficulty(flight.score).speed - flight.speed) * Math.min(1, dt * 2);
  const travel = flight.speed * dt;
  flight.distance += travel;
  for (const obstacle of flight.obstacles) obstacle.x -= travel;
  for (const target of flight.targets) { target.x -= travel; if (target.state === "hit") target.age += dt; }
  if (flight.y - WORLD.radius < WORLD.ceiling || flight.y + WORLD.radius > WORLD.floor ||
      flight.obstacles.some((obstacle) => hitsObstacle(flight.y, obstacle))) {
    flight.phase = "dead";
    flight.deathCause = flight.y - WORLD.radius < WORLD.ceiling ? "ceiling" :
      flight.y + WORLD.radius > WORLD.floor ? "boardwalk" : "pole";
    return;
  }
  for (const target of flight.targets) {
    if (target.state !== "waiting") continue;
    if (Math.abs(target.x - WORLD.birdX) <= 23 && Math.abs(flight.y - target.zoneY) <= 23) {
      target.state = "hit"; target.dropY = flight.y; target.age = 0;
      flight.hits++; flight.combo++;
      if (target.kind === "car") flight.carHits++;
      flight.bestCombo = Math.max(flight.bestCombo, flight.combo);
      target.reward = 25 * comboMultiplier(flight.combo);
      flight.bonus += target.reward;
      flight.notice = flight.combo >= 3 ? `PUBLIC NUISANCE! x${comboMultiplier(flight.combo)}` : `DIRECT HIT! +${target.reward}`;
      flight.noticeTime = 1.25;
    } else if (target.x < WORLD.birdX - 23) {
      target.state = "missed";
      if (flight.combo) { flight.notice = "STREAK ENDED. KEEP FLYING."; flight.noticeTime = 1; }
      flight.combo = 0;
    }
  }
  for (const obstacle of flight.obstacles) {
    if (!obstacle.passed && obstacle.x + WORLD.obstacleWidth < WORLD.birdX - WORLD.radius) {
      obstacle.passed = true;
      flight.score += 1;
      if (flight.score % COAST_LENGTH === 0) { flight.notice = `ENTERING ${COASTS[coastIndex(flight.score)].toUpperCase()}`; flight.noticeTime = 2; }
    }
  }
  flight.obstacles = flight.obstacles.filter((obstacle) => obstacle.x > -WORLD.obstacleWidth);
  flight.targets = flight.targets.filter((target) => target.x > -70);
  const lastX = flight.obstacles.at(-1)?.x ?? 0;
  if (lastX <= WORLD.width + 30) {
    const index = flight.nextVariant;
    const obstacle = nextObstacle(flight, lastX + WORLD.spacing, random);
    flight.obstacles.push(obstacle);
    addTarget(flight, obstacle, index);
  }
}
