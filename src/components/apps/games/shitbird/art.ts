import type { KaboomCtx } from "kaboom";
import { WORLD, type Flight } from "./model";

const ink = "#0b100d";
const paper = "#ead4a3";
const orange = "#d65e2c";
const teal = "#467a68";

/** Screenprint illustrations plus lightweight, independently moving ink layers. */
export function createCoastRenderer(k: KaboomCtx) {
  // Bake the sign type once at 3x resolution. Tiny system-font glyphs in Kaboom's
  // shared font atlas lose strokes at these sizes; a local atlas stays legible.
  const signs = document.createElement("canvas");
  signs.width = 288; signs.height = 162;
  const signContext = signs.getContext("2d")!;
  signContext.textAlign = "center"; signContext.textBaseline = "middle";
  signContext.font = "bold 27px Georgia, serif";
  ["MOTEL", "DETOUR", "NOPE"].forEach((word, variant) => {
    signContext.fillStyle = variant === 1 ? paper : orange;
    const spacing = Math.min(31, 145 / word.length);
    for (let i = 0; i < word.length; i++) {
      signContext.fillText(word[i], variant * 96 + 48, (162 - spacing * (word.length - 1)) / 2 + i * spacing);
    }
  });
  k.loadSprite("sign-letters", signs, { sliceX: 3 });
  const plates = document.createElement("canvas");
  plates.width = 324; plates.height = 51;
  const plateContext = plates.getContext("2d")!;
  plateContext.textAlign = "center"; plateContext.textBaseline = "middle";
  plateContext.font = "bold 18px monospace"; plateContext.fillStyle = ink;
  [["NO", "FUTURE"], ["BAD", "IDEA"], ["SCOPE", "+10%"]].forEach((words, variant) => {
    plateContext.fillText(words[0], variant * 108 + 54, 15);
    plateContext.fillText(words[1], variant * 108 + 54, 36);
  });
  k.loadSprite("sign-plates", plates, { sliceX: 3 });
  const rect = (x: number, y: number, w: number, h: number, color: string, opacity = 1) =>
    k.drawRect({ pos: k.vec2(x, y), width: w, height: Math.max(0, h), color: k.rgb(color), opacity });
  const line = (x: number, y: number, x2: number, y2: number, color = paper, width = 1, opacity = 1) =>
    k.drawLine({ p1: k.vec2(x, y), p2: k.vec2(x2, y2), color: k.rgb(color), width, opacity });
  const label = (text: string, x: number, y: number, size = 9, color = paper, font = "monospace") =>
    k.drawText({ text, pos: k.vec2(x, y), size, color: k.rgb(color), font });
  const scratches = Array.from({ length: 28 }, (_, i) => ({
    x: 5 + (i * 17) % 35, y: (i * 31) % 170, length: 1 + (i * 7) % 8,
  }));
  const wire = Array.from({ length: 13 }, (_, i) => k.vec2(i / 12 * 190, Math.sin(i / 12 * Math.PI) * 16));

  function bird(x: number, y: number, wing: number, angle: number, scale = 1, dead = false) {
    k.pushTransform(); k.pushTranslate(x, y); k.pushRotate(angle); k.pushScale(scale);
    // Registered atlas regions keep the torso still across the two inked poses.
    // The forgiving radius-10 collision circle stays inside the cream torso.
    const up = wing > 0 && !dead;
    k.drawSprite({ sprite: "gull", quad: up ? k.quad(0, 0, 0.535, 1) : k.quad(0.535, 0, 0.465, 1),
      pos: k.vec2(up ? -34 : -24, -42), width: up ? 54.6 : 47.5, height: 68.3 });
    if (dead) {
      line(5, -11, 11, -5, ink, 1.8); line(11, -11, 5, -5, ink, 1.8);
      label("!", 19, -25, 12, orange);
    }
    k.popTransform();
  }

  function scenery(distance: number, reduced: boolean, playing: boolean) {
    const drift = reduced ? 0 : distance;
    // Overscan lets the printed coast drift without seams or stretching.
    k.drawSprite({ sprite: "coast", pos: k.vec2(-15 - Math.sin(drift * 0.0009) * 12, -16), width: 390, height: 585 });
    if (playing) rect(0, 34, 360, 466, ink, 0.36);
    for (let i = 0; i < 8; i++) {
      const x = ((i * 81 - drift * 0.07) % 480 + 480) % 480 - 55;
      const y = 98 + (i * 47) % 208;
      line(x, y, x + 23 + i % 3 * 9, y - 1, teal, 0.7, 0.2);
      line(x + 7, y + 3, x + 17, y + 3, paper, 0.6, 0.13);
    }
    // Low-contrast wires are scenery; bright solid-edged signs are hazards.
    for (let i = 0; i < 3; i++) {
      const x = ((i * 190 - drift * 0.24) % 570 + 570) % 570 - 80;
      line(x, 405, x, 500, teal, 2, 0.55);
      line(x - 11, 411, x + 13, 409, teal, 2, 0.5);
      k.drawLines({ pts: wire, pos: k.vec2(x, 410), color: k.rgb(teal), width: 0.7, opacity: 0.45 });
    }
    for (let i = 0; i < 10; i++) {
      const x = ((i * 57 - drift * 0.36) % 440 + 440) % 440 - 35;
      line(x, 458 + (i * 11) % 37, x + 15, 457 + (i * 11) % 37, paper, 0.8, 0.25);
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

  function barrier(x: number, y: number, height: number, variant: number, top: boolean) {
    const w = WORLD.obstacleWidth;
    // Every part stays inside the collision rectangle: no deceptive wires.
    rect(x, y, w, height, ink);
    rect(x + 1, y, w - 2, height, paper);
    rect(x + 3, y, w - 6, height, variant === 1 ? "#6c3725" : "#183c33");
    line(x + 6, y, x + 6, y + height, variant === 1 ? orange : teal, 2);
    line(x + w - 7, y, x + w - 7, y + height, ink, 2);
    for (const mark of scratches) {
      for (let offset = 0; offset < height; offset += 170) {
        if (mark.y + offset + 5 < height) {
          line(x + mark.x, y + mark.y + offset, x + mark.x, y + mark.y + offset + mark.length, paper, 0.7, 0.23);
        }
      }
    }
    const edge = top ? y + height - 12 : y;
    rect(x + 1, edge, w - 2, 12, paper);
    rect(x + 3, edge + 3, w - 6, 6, orange);
    for (let i = 0; i < 5; i++) line(x + 5 + i * 8, edge + 3, x + 8 + i * 8, edge + 9, ink, 2);
    const signY = top ? y + height - 88 : y + 22;
    if (height > 105) {
      rect(x + 5, signY, w - 10, 58, paper);
      rect(x + 7, signY + 2, w - 14, 54, ink);
      k.drawSprite({ sprite: "sign-letters", frame: variant, pos: k.vec2(x + 7, signY + 2), width: w - 14, height: 54 });
      const plate = top ? signY - 24 : signY + 66;
      if (plate > y + 14 && plate + 17 < y + height - 14) {
        rect(x + 5, plate, w - 10, 17, orange);
        k.drawSprite({ sprite: "sign-plates", frame: variant, pos: k.vec2(x + 5, plate), width: w - 10, height: 17 });
      }
    }
    for (const boltY of [y + 17, y + height - 17]) {
      k.drawCircle({ pos: k.vec2(x + 5, boltY), radius: 1.3, color: k.rgb(paper) });
      k.drawCircle({ pos: k.vec2(x + w - 5, boltY), radius: 1.3, color: k.rgb(paper) });
    }
  }

  return (flight: Flight, reduced: boolean) => {
    const title = flight.phase === "ready";
    scenery(flight.distance, reduced, !title);
    for (const obstacle of flight.obstacles) {
      const top = obstacle.center - obstacle.gap / 2;
      const bottom = obstacle.center + obstacle.gap / 2;
      barrier(obstacle.x, WORLD.ceiling, top - WORLD.ceiling, obstacle.variant, true);
      barrier(obstacle.x, bottom, WORLD.floor - bottom, obstacle.variant, false);
    }
    if (title) {
      // Short Desktop windows need room for the same 44px touch/keyboard controls.
      const compact = k.canvas.clientWidth < 330;
      bird(188, (compact ? 285 : 310) + (reduced ? 0 : Math.sin(k.time() * 2) * 3),
        !compact && !reduced && Math.sin(k.time() * 3) > 0 ? 1 : 0, -7, compact ? 2.3 : 2.8);
    } else {
      bird(WORLD.birdX, flight.y, flight.wing, Math.max(-18, Math.min(55, flight.velocity * 0.09)), 1, flight.phase === "dead");
      if (flight.wing > 0 && !reduced && flight.phase === "playing") {
        line(WORLD.birdX - 36, flight.y + 4, WORLD.birdX - 43, flight.y + 5, paper, 1, 0.6);
        line(WORLD.birdX - 33, flight.y + 9, WORLD.birdX - 38, flight.y + 11, paper, 1, 0.35);
      }
    }
  };
}
