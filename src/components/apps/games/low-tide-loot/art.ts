import type { KAPLAYCtx } from "kaplay";
import { LOOT } from "./data";
import {
  attachedLoot,
  hookPosition,
  levelForDay,
  lootRadius,
  lootWeight,
  lootValue,
  PHYSICS,
  WORLD,
  type Run,
} from "./model";

export const ART = {
  character: "/games/low-tide-loot/scavenger-buggy.webp",
  beach: "/games/low-tide-loot/beach-wide.webp",
  cover: "/games/low-tide-loot/cover.webp",
} as const;
export const lootArt = (id: string) => `/games/low-tide-loot/loot-${id}.webp`;
const ink = "#171d1a",
  cream = "#fff1ce",
  yellow = "#f5c34e",
  teal = "#64d3cd";

export function createRenderer(k: KAPLAYCtx, canvas: HTMLCanvasElement) {
  const color = (c: string) => k.Color.fromHex(c);
  const line = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    c: string,
    width = 2,
    opacity = 1,
  ) =>
    k.drawLine({
      p1: k.vec2(x, y),
      p2: k.vec2(x2, y2),
      color: color(c),
      width,
      opacity,
    });
  const rect = (
    x: number,
    y: number,
    width: number,
    height: number,
    c: string,
    opacity = 1,
    radius = 0,
  ) =>
    k.drawRect({
      pos: k.vec2(x, y),
      width,
      height,
      color: color(c),
      opacity,
      radius,
    });
  const circle = (
    x: number,
    y: number,
    radius: number,
    c: string,
    opacity = 1,
  ) => k.drawCircle({ pos: k.vec2(x, y), radius, color: color(c), opacity });
  const text = (value: string, x: number, y: number, size: number, c = cream) =>
    k.drawText({
      text: value,
      pos: k.vec2(x, y),
      size,
      color: color(c),
      font: "monospace",
      anchor: "center",
    });
  let previousEvent = -1,
    effectTime = -10,
    reward = 0,
    previousCash = 0;
  return (run: Run, reducedMotion: boolean) => {
    const env = levelForDay(run.day).environment,
      time = reducedMotion ? 0 : run.elapsed;
    const x = run.claw.x;
    if (run.event !== previousEvent) {
      previousEvent = run.event;
      effectTime = run.elapsed;
      reward = Math.max(0, run.cash - previousCash);
    }
    previousCash = run.cash;
    // Keep the shoreline on its original baseline; crop unused lower sand.
    k.drawSprite({
      sprite: "beach",
      pos: k.vec2(0, 0),
      width: WORLD.width,
      height: 720,
    });
    rect(
      0,
      WORLD.surface,
      WORLD.width,
      WORLD.height - WORLD.surface,
      env.sand,
      0.12,
    );
    if (run.day > 1) rect(0, 0, WORLD.width, WORLD.surface, env.sky, 0.3);
    if (env.prop === "rain")
      for (let i = 0; i < 40; i++) {
        const px = (i * 71) % WORLD.width,
          py = (i * 29 + time * 80) % WORLD.surface;
        line(px, py, px - 4, py + 12, cream, 1, 0.3);
      }
    line(0, WORLD.surface, WORLD.width, WORLD.surface, ink, 7);
    line(0, WORLD.surface - 3, WORLD.width, WORLD.surface - 3, cream, 2);
    // A subtle travel rail communicates that the operator can move along the beach.
    line(
      PHYSICS.railMin,
      WORLD.surface + 8,
      PHYSICS.railMax,
      WORLD.surface + 8,
      ink,
      2,
      0.26,
    );
    for (const side of [-1, 1]) {
      const marker = x + side * 53;
      line(
        marker,
        WORLD.surface + 14,
        marker + side * 9,
        WORLD.surface + 8,
        cream,
        3,
        0.8,
      );
      line(
        marker + side * 9,
        WORLD.surface + 8,
        marker,
        WORLD.surface + 2,
        cream,
        3,
        0.8,
      );
    }
    // Enlarge the compact silhouette while respecting the independently sized HUD.
    const toolbarBottom = Math.max(
      64,
      (52 * WORLD.width) / Math.max(1, canvas.clientWidth),
    );
    const operatorSize = canvas.dataset.compact === "true" ? 146 : Math.max(
      84,
      Math.min(146, WORLD.surface - toolbarBottom + 5),
    );
    k.drawEllipse({
      pos: k.vec2(x + 70, WORLD.surface - 2),
      radiusX: 77,
      radiusY: 7,
      color: color(ink),
      opacity: 0.3,
    });
    k.drawSprite({
      sprite: "scavenger",
      pos: k.vec2(x + 4, WORLD.surface - operatorSize + 4),
      width: operatorSize,
      height: operatorSize,
    });
    // Reinforced winch arm: the cable's pivot and the simulated origin always agree.
    line(x + 29, WORLD.surface - 15, x - 10, WORLD.originY - 27, ink, 12);
    line(x + 29, WORLD.surface - 15, x - 10, WORLD.originY - 27, yellow, 6);
    line(x - 10, WORLD.originY - 27, x, WORLD.originY, ink, 10);
    line(x - 10, WORLD.originY - 27, x, WORLD.originY, teal, 5);
    circle(x, WORLD.originY, 10, ink);
    circle(x, WORLD.originY, 6, yellow);
    circle(x, WORLD.originY, 2, cream);

    const hooked = attachedLoot(run),
      hook = hookPosition(run.claw);
    // Short dotted trajectory: helpful aim feedback without exposing hidden rewards.
    if (run.claw.state === "swinging" && run.phase === "playing") {
      for (let distance = 55; distance <= 150; distance += 18) {
        const dot = hookPosition({ ...run.claw, length: distance });
        if (dot.y > WORLD.surface + 12) circle(dot.x, dot.y, 2.3, ink, 0.4);
      }
    }
    for (const object of run.loot) {
      if (object.removed || object === hooked) continue;
      const definition = LOOT[object.id],
        radius = lootRadius(object);
      k.drawEllipse({
        pos: k.vec2(object.x, object.y + radius * 0.7),
        radiusX: radius,
        radiusY: 6,
        color: color(ink),
        opacity: 0.17,
      });
      k.drawSprite({
        sprite: object.id,
        pos: k.vec2(object.x, object.y),
        width: radius * 2.35,
        height: radius * 2.35,
        anchor: "center",
        angle:
          definition.movable && !reducedMotion
            ? Math.sin(time * 9) * 4
            : ((object.uid % 5) - 2) * 3,
      });
      const value = lootValue(definition, run.boosts),
        label = definition.mystery ? "???" : `$${value}`;
      const labelY = object.y + radius + 4,
        labelWidth = Math.max(37, label.length * 11 + 14);
      rect(
        object.x - labelWidth / 2,
        labelY - 12,
        labelWidth,
        23,
        ink,
        0.94,
        6,
      );
      text(
        label,
        object.x,
        labelY,
        18,
        definition.category === "scrap" ? cream : yellow,
      );
    }
    const sin = Math.sin(run.claw.angle),
      cos = Math.cos(run.claw.angle);
    const point = (px: number, py: number) => ({
      x: hook.x + px * cos + py * sin,
      y: hook.y - px * sin + py * cos,
    });
    const neck = point(0, -29);
    line(x, WORLD.originY, neck.x, neck.y, ink, 5);
    line(x - 1, WORLD.originY, neck.x - 1, neck.y, cream, 1.5);
    if (hooked) {
      const radius = lootRadius(hooked);
      k.drawSprite({
        sprite: hooked.id,
        pos: k.vec2(hook.x + run.claw.gripX, hook.y + run.claw.gripY),
        width: radius * 2.35,
        height: radius * 2.35,
        anchor: "center",
        angle: reducedMotion
          ? 0
          : Math.sin(time * (lootWeight(hooked) > 5 ? 20 : 8)) * 2,
      });
    }
    // A chunky industrial grabber with contrasting jaws, pin joints and hydraulic hub.
    const spread = hooked ? 13 : 25;
    for (const side of [-1, 1]) {
      const shoulder = point(side * 8, -25),
        elbow = point(side * spread, -12),
        tip = point(side * (hooked ? 3 : 14), 3);
      line(shoulder.x, shoulder.y, elbow.x, elbow.y, ink, 12);
      line(elbow.x, elbow.y, tip.x, tip.y, ink, 10);
      line(shoulder.x, shoulder.y, elbow.x, elbow.y, teal, 7);
      line(elbow.x, elbow.y, tip.x, tip.y, cream, 5);
      circle(elbow.x, elbow.y, 6, ink);
      circle(elbow.x, elbow.y, 3, yellow);
    }
    const hub = point(0, -27);
    circle(hub.x, hub.y, 12, ink);
    circle(hub.x, hub.y, 8, yellow);
    line(hub.x - 3, hub.y - 4, hub.x + 3, hub.y + 4, ink, 3);
    const age = run.elapsed - effectTime;
    if (run.effect === "money" && reward > 0 && age >= 0 && age < 1.2) {
      const py =
        WORLD.surface +
        48 -
        (reducedMotion ? 0 : (1 - (1 - age / 1.2) ** 3) * 28);
      rect(x - 52, py - 18, 104, 36, ink, 0.96, 10);
      text(`+$${reward}`, x, py, 25, yellow);
    }
  };
}
