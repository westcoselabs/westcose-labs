import type { KaboomCtx } from "kaboom";
import { COAST_LENGTH, COASTS, coastIndex, FIRST_OBSTACLE_X, WORLD } from "./model";

export const COAST_ART = {
  Boardwalk: "coast-panorama",
  "Fishing harbor": "coast-harbor",
  "Lighthouse point": "coast-lighthouse",
} as const satisfies Record<(typeof COASTS)[number], string>;

const PANORAMA_WIDTH = 810;
const PAN_DISTANCE = PANORAMA_WIDTH - WORLD.width;
const DISTRICT_TRAVEL = COAST_LENGTH * WORLD.spacing;
const FIRST_PASS = FIRST_OBSTACLE_X + WORLD.obstacleWidth - (WORLD.birdX - WORLD.radius);
const FIRST_DISTRICT_TRAVEL = FIRST_PASS + (COAST_LENGTH - 1) * WORLD.spacing;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Pan across each whole painting once per district, with no mirrored/repeated tiles. */
export function coastFrame(score: number, distance: number, reduced: boolean) {
  const visit = Math.floor(score / COAST_LENGTH);
  const current = coastIndex(score);
  const start = visit === 0 ? 0 : FIRST_DISTRICT_TRAVEL + (visit - 1) * DISTRICT_TRAVEL;
  const length = visit === 0 ? FIRST_DISTRICT_TRAVEL : DISTRICT_TRAVEL;
  const travel = Math.max(0, distance - start);
  const fade = reduced || visit === 0 ? 1 : clamp(travel / 160);
  return {
    sprite: COAST_ART[COASTS[current]],
    previous: COAST_ART[COASTS[(current + COASTS.length - 1) % COASTS.length]],
    x: reduced ? 0 : -PAN_DISTANCE * clamp(travel / length),
    opacity: fade * fade * (3 - 2 * fade),
  };
}

export function createDistrictRenderer(k: KaboomCtx) {
  return (score: number, distance: number, reduced: boolean) => {
    const frame = coastFrame(score, distance, reduced);
    // Progress uses world distance, so pause freezes the pan and the brief crossfade.
    if (frame.opacity < 1) {
      k.drawSprite({ sprite: frame.previous, pos: k.vec2(-PAN_DISTANCE, -40), width: PANORAMA_WIDTH, height: 540 });
    }
    k.drawSprite({ sprite: frame.sprite, pos: k.vec2(frame.x, -40), width: PANORAMA_WIDTH, height: 540, opacity: frame.opacity });
  };
}
