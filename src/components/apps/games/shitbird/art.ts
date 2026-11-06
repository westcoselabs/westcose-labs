import type { KaboomCtx } from "kaboom";
import { WORLD, type BirdSkin, type Flight, type Target } from "./model";
import { loadCoastTextures, OBSTACLE_TEXTURE_HEIGHT } from "./textures";
import { createDistrictRenderer } from "./scenery";

const ink = "#0b100d";
const paper = "#ead4a3";
const orange = "#d65e2c";
const teal = "#467a68";

/** Complete illustrated districts behind the foreground gameplay sprites. */
export function createCoastRenderer(k: KaboomCtx) {
  loadCoastTextures(k);
  const district = createDistrictRenderer(k);
  const rect = (x: number, y: number, w: number, h: number, color: string, opacity = 1) =>
    k.drawRect({ pos: k.vec2(x, y), width: w, height: Math.max(0, h), color: k.rgb(color), opacity });
  const line = (x: number, y: number, x2: number, y2: number, color = paper, width = 1, opacity = 1) =>
    k.drawLine({ p1: k.vec2(x, y), p2: k.vec2(x2, y2), color: k.rgb(color), width, opacity });
  const label = (text: string, x: number, y: number, size = 9, color = paper, font = "monospace") =>
    k.drawText({ text, pos: k.vec2(x, y), size, color: k.rgb(color), font });

  function bird(x: number, y: number, wing: number, angle: number, scale = 1, dead = false, skin: BirdSkin = "gull") {
    k.pushTransform(); k.pushTranslate(x, y); k.pushRotate(angle); k.pushScale(scale);
    // Registered atlas regions keep the torso still across the two inked poses.
    // The forgiving radius-10 collision circle stays inside the cream torso.
    const up = wing > 0 && !dead;
    k.drawSprite({ sprite: "gull", quad: up ? k.quad(0, 0, 0.535, 1) : k.quad(0.535, 0, 0.465, 1),
      pos: k.vec2(up ? -34 : -24, -42), width: up ? 54.6 : 47.5, height: 68.3 });
    if (skin === "chips") {
      line(17, -4, 29, 5, "#f3bb51", 4); line(23, 0, 32, -5, "#f3bb51", 3);
    } else if (skin === "business") {
      line(0, 0, 7, 4, paper, 3); line(7, 4, 11, 17, orange, 5); line(11, 17, 8, 21, orange, 3);
    } else if (skin === "punk") {
      for (let i = 0; i < 4; i++) line(i * 4 - 2, -19, i * 4 - 5, -30 + i * 2, orange, 4);
      line(3, -9, 14, -8, ink, 4);
    }
    if (dead) {
      line(5, -11, 11, -5, ink, 1.8); line(11, -11, 5, -5, ink, 1.8);
      label("!", 19, -25, 12, orange);
    }
    k.popTransform();
  }

  function scenery(distance: number, reduced: boolean, playing: boolean, score: number) {
    const drift = reduced ? 0 : distance;
    if (playing) {
      district(score, distance, reduced);
    } else {
      k.drawSprite({ sprite: "coast", pos: k.vec2(-15, -16), width: 390, height: 585 });
    }
    // A rope-and-tar boardwalk defines the actual lower collision boundary.
    rect(0, 500, 360, 40, ink);
    line(0, 500, 360, 500, paper, 2);
    line(0, 504, 360, 504, teal, 1);
    for (let i = 0; i < 17; i++) {
      const x = ((i * 24 - drift * 0.8) % 408 + 408) % 408 - 24;
      line(x, 500, x + 7, 503, ink, 1.5);
      line(x, 508, x - 12, 540, teal, 0.7, 0.55);
    }
    rect(0, 0, 360, 34, ink);
    line(0, 33, 360, 33, teal, 1);
    rect(37, 515, 286, 15, ink, 0.9);
  }

  function target(t: Target, reduced: boolean, elapsed: number) {
    const x = t.x, ground = 496;
    const reacting = t.state === "hit" && (reduced || t.age >= .28);
    // Measured atlas regions keep each full illustration isolated and preserve its aspect ratio.
    const regions = { car: [0, 646, 96], tourist: [646, 374, 61], cafe: [1020, 516, 89] } as const;
    const [left, cropWidth, width] = regions[t.kind];
    const height = width * 512 / cropWidth;
    const top = ground - height * .94;
    const bounce = reduced ? 0 : reacting ? -Math.sin(Math.min(1, (t.age - .28) / .32) * Math.PI) * 4
      : Math.sin(elapsed * (t.kind === "car" ? 8 : 2.5)) * .55;
    const impactY = t.kind === "car" ? ground - 40 : top + 7;
    const proximity = Math.max(0, 1 - Math.abs(x - WORLD.birdX) / 130);

    k.drawEllipse({ pos: k.vec2(x, ground - 1), radiusX: width * .44, radiusY: 4,
      color: k.rgb(ink), opacity: .8 });
    k.drawSprite({ sprite: "targets-west-cose", quad: k.quad(left / 1536, reacting ? .5 : 0, cropWidth / 1536, .5),
      pos: k.vec2(x - width / 2, top + bounce), width, height });

    if (t.state === "waiting") {
      const pulse = reduced ? 0 : (1 + Math.sin(elapsed * 3)) * .025;
      k.drawRect({ pos: k.vec2(x - 23, t.zoneY - 23), width: 46, height: 46, radius: 7,
        color: k.rgb("#e8a56c"), opacity: .04 + proximity * .07 + pulse });
      k.drawSprite({ sprite: "shit-reticle", pos: k.vec2(x - 32, t.zoneY - 32), width: 64, height: 64 });
      k.drawSprite({ sprite: "shit-badge", pos: k.vec2(x - 31, t.zoneY - 63), width: 62, height: 28 });
      // A descending air-mail trail connects the exact flight trigger to the person below.
      const trailStart = t.zoneY + 35, trailEnd = impactY - 12;
      for (let y = trailStart; y < trailEnd; y += 11) line(x, y, x, Math.min(y + 3, trailEnd), paper, .8, .3 + proximity * .25);
      if (trailEnd - trailStart > 10) {
        const y = trailStart + (reduced ? .45 : (elapsed * .65) % 1) * (trailEnd - trailStart);
        line(x - 3, y - 2, x, y + 1, "#efaa65", 1.2, .8);
        line(x, y + 1, x + 3, y - 2, "#efaa65", 1.2, .8);
      }
    } else if (t.state === "hit") {
      if (!reacting) {
        const y = t.dropY + (impactY - t.dropY) * (t.age / .28) ** 2;
        k.drawCircle({ pos: k.vec2(x, y), radius: 3.5, color: k.rgb(paper) });
        line(x, y - 10, x, y - 5, paper, 2);
      } else if (t.age < 1.4) {
        if (!reduced && t.age < .65) {
          const spread = (t.age - .28) * 45;
          for (let i = 0; i < 7; i++) {
            const angle = Math.PI + i * Math.PI / 6;
            k.drawCircle({ pos: k.vec2(x + Math.cos(angle) * spread, impactY + Math.sin(angle) * spread),
              radius: 1.8, color: k.rgb(paper), opacity: Math.max(0, 1 - (t.age - .28) * 2.5) });
          }
        }
        const y = t.zoneY - (reduced ? 0 : Math.min(10, t.age * 12));
        k.drawRect({ pos: k.vec2(x - 35, y - 15), width: 70, height: 30, radius: 3,
          color: k.rgb(ink), outline: { color: k.rgb("#e3a364"), width: 1 } });
        k.drawText({ text: `+${t.reward}`, pos: k.vec2(x, y - 5), size: 16, font: "Georgia", anchor: "center", color: k.rgb(paper) });
        k.drawText({ text: "AIR MAIL. DELIVERED.", pos: k.vec2(x, y + 8), size: 4.8, font: "monospace", anchor: "center", color: k.rgb("#e3a364") });
        const reaction = t.kind === "car" ? "MY PAINT!" : t.kind === "tourist" ? "OI, YOU!" : "ONE STAR.";
        k.drawText({ text: reaction, pos: k.vec2(x, top - 5), size: 8, anchor: "center", color: k.rgb(paper), font: "monospace" });
      }
    }
  }

  function barrier(x: number, y: number, height: number, variant: number, top: boolean) {
    const w = WORLD.obstacleWidth;
    // Crop full-height timber instead of stretching its grain, knots and straps.
    // All solid artwork remains inside the exact gameplay collision rectangle.
    k.drawSprite({ sprite: `pier-body-${variant}`, pos: k.vec2(x, y), width: w, height,
      quad: k.quad(0, top ? 1 - height / OBSTACLE_TEXTURE_HEIGHT : 0, 1, height / OBSTACLE_TEXTURE_HEIGHT) });
    const capY = top ? y + height - 18 : y;
    k.drawSprite({ sprite: `pier-cap-${top ? "top" : "bottom"}`, pos: k.vec2(x, capY), width: w, height: 18 });
  }

  return (flight: Flight, reduced: boolean, skin: BirdSkin = "gull", deathAge = 0) => {
    const title = flight.phase === "ready";
    scenery(flight.distance, reduced, !title, flight.score);
    for (const t of flight.targets) target(t, reduced, flight.elapsed);
    for (const obstacle of flight.obstacles) {
      const top = obstacle.center - obstacle.gap / 2;
      const bottom = obstacle.center + obstacle.gap / 2;
      barrier(obstacle.x, WORLD.ceiling, top - WORLD.ceiling, obstacle.variant, true);
      barrier(obstacle.x, bottom, WORLD.floor - bottom, obstacle.variant, false);
    }
    if (title) {
      // Short Desktop windows need room for the same 44px touch/keyboard controls.
      const compact = k.canvas.clientWidth < 330;
      bird(188, 242 + (reduced ? 0 : Math.sin(k.time() * 2) * 3),
        !compact && !reduced && Math.sin(k.time() * 3) > 0 ? 1 : 0, -7, compact ? 1.8 : 2.1, false, skin);
    } else {
      const dead = flight.phase === "dead";
      const fall = dead && !reduced ? Math.min(25, deathAge * 45) : 0;
      bird(WORLD.birdX, Math.min(480, flight.y + fall), flight.wing, dead ? 105 : Math.max(-18, Math.min(55, flight.velocity * 0.09)), 1, dead, skin);
      if (dead && !reduced && deathAge < 0.7) {
        for (let i = 0; i < 9; i++) {
          const a = i * Math.PI * 2 / 9, r = 12 + deathAge * 85;
          const x = WORLD.birdX + Math.cos(a) * r, y = flight.y + Math.sin(a) * r + deathAge * 20;
          line(x, y, x + Math.cos(a) * 7, y + Math.sin(a) * 5, paper, 2, 1 - deathAge / 0.7);
        }
      }
      if (flight.wing > 0 && !reduced && flight.phase === "playing") {
        line(WORLD.birdX - 36, flight.y + 4, WORLD.birdX - 43, flight.y + 5, paper, 1, 0.6);
        line(WORLD.birdX - 33, flight.y + 9, WORLD.birdX - 38, flight.y + 11, paper, 1, 0.35);
      }
      if (flight.noticeTime > 0 && !dead) {
        rect(33, 58, 294, 27, ink, 0.92);
        k.drawText({ text: flight.notice, pos: k.vec2(180, 71), anchor: "center", size: 11, color: k.rgb(paper), font: "monospace" });
      }
    }
  };
}
