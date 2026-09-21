/** Logical units and seconds. Every viewport uses exactly this flight corridor. */
export const WORLD = { width: 360, height: 540, ceiling: 34, floor: 500, birdX: 82, radius: 10, obstacleWidth: 46, spacing: 250 } as const;
export const PHYSICS = { gravity: 920, flap: -300, terminal: 430, step: 1 / 120 } as const;
export const MAX_DIFFICULTY_SCORE = 40;
export type Phase = "ready" | "playing" | "paused" | "dead";
export type Obstacle = { x: number; center: number; gap: number; passed: boolean; variant: number };
export type Flight = {
  phase: Phase; y: number; velocity: number; score: number; elapsed: number;
  distance: number; speed: number; wing: number; obstacles: Obstacle[];
  lastCenter: number; nextVariant: number;
};

export function difficulty(score: number) {
  const t = Math.max(0, Math.min(1, score / MAX_DIFFICULTY_SCORE));
  const ramp = t * t * (3 - 2 * t);
  return { speed: 116 + 80 * ramp, gap: 190 - 50 * ramp, shift: 28 + 36 * ramp, capped: t === 1 };
}

export function createFlight(): Flight {
  return { phase: "ready", y: 260, velocity: 0, score: 0, elapsed: 0,
    distance: 0, speed: difficulty(0).speed, wing: 0,
    obstacles: [], lastCenter: 260, nextVariant: 0 };
}

export function flap(flight: Flight) {
  if (flight.phase !== "playing") return;
  flight.velocity = PHYSICS.flap;
  flight.wing = 0.16;
}

export function startFlight(): Flight {
  const flight = createFlight();
  flight.phase = "playing";
  flight.obstacles.push({ x: 400, center: 260, gap: difficulty(0).gap, passed: false, variant: 0 });
  flight.nextVariant = 1;
  flap(flight);
  return flight;
}

export function nextObstacle(flight: Flight, x: number, random: () => number): Obstacle {
  const level = difficulty(flight.score);
  // Constrain both the step and absolute height; no alternating extreme gaps.
  const center = Math.max(172, Math.min(362, flight.lastCenter + (random() * 2 - 1) * level.shift));
  flight.lastCenter = center;
  return { x, center, gap: level.gap, passed: false, variant: flight.nextVariant++ % 3 };
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
  flight.velocity = Math.min(PHYSICS.terminal, flight.velocity + PHYSICS.gravity * dt);
  flight.y += flight.velocity * dt;
  flight.speed += (difficulty(flight.score).speed - flight.speed) * Math.min(1, dt * 2);
  const travel = flight.speed * dt;
  flight.distance += travel;
  for (const obstacle of flight.obstacles) obstacle.x -= travel;
  if (flight.y - WORLD.radius < WORLD.ceiling || flight.y + WORLD.radius > WORLD.floor ||
      flight.obstacles.some((obstacle) => hitsObstacle(flight.y, obstacle))) {
    flight.phase = "dead";
    return;
  }
  for (const obstacle of flight.obstacles) {
    if (!obstacle.passed && obstacle.x + WORLD.obstacleWidth < WORLD.birdX - WORLD.radius) {
      obstacle.passed = true;
      flight.score += 1;
    }
  }
  flight.obstacles = flight.obstacles.filter((obstacle) => obstacle.x > -WORLD.obstacleWidth);
  const lastX = flight.obstacles.at(-1)?.x ?? 0;
  if (lastX <= WORLD.width + 30) {
    flight.obstacles.push(nextObstacle(flight, lastX + WORLD.spacing, random));
  }
}
