import type { KAPLAYCtx } from "kaplay";
import { LOOT } from "./data";
import {
  attachedLoot,
  hookPosition,
  levelForDay,
  lootRadius,
  lootWeight,
  lootValue,
  WORLD,
  type Run,
} from "./model";

export const ART = {
  character: "/games/low-tide-loot/scavenger.webp",
  beach: "/games/low-tide-loot/beach-wide.webp",
  cover: "/games/low-tide-loot/cover.webp",
} as const;
const ink = "#171d1a",
  cream = "#fff1ce",
  yellow = "#f5c34e";
const ring =
  '<ellipse cx="32" cy="39" rx="12" ry="14" fill="none" stroke="#f5c34e" stroke-width="7"/><path d="M18 20L24 11H40L47 20L32 34Z" fill="#72d6d7"/><path d="M18 20H47M24 11L28 20L32 34L37 20L40 11" fill="none" stroke-width="1.5"/>';
const chain = (color: string) =>
  `<path d="M15 12C0 51 54 68 52 22" fill="none" stroke="${color}" stroke-width="9"/><path d="M15 12C0 51 54 68 52 22" fill="none" stroke="${ink}" stroke-width="2.5" stroke-dasharray="2 5"/>`;
const crab =
  '<path d="M14 35L5 26M15 42L3 43M18 48L7 55M50 35L59 26M49 42L61 43M46 48L57 55" fill="none" stroke-width="4"/><ellipse cx="32" cy="39" rx="19" ry="13" fill="#df845d"/><path d="M17 33L12 20L5 16L4 7L12 13L19 7L21 17ZM47 33L52 20L59 16L60 7L52 13L45 7L43 17Z" fill="#df845d"/><path d="M25 29V22M39 29V22"/><circle cx="25" cy="21" r="3" fill="#fff1ce"/><circle cx="39" cy="21" r="3" fill="#fff1ce"/>';
const shapes: Record<string, string> = {
  ring,
  watch:
    '<path d="M24 5H40V59H24Z" fill="#dfad51"/><rect x="17" y="16" width="30" height="33" rx="10" fill="#f4d78e"/><circle cx="32" cy="32" r="10" fill="#fff1ce"/><path d="M32 24V32L38 36M25 9H39M25 54H39" fill="none"/>',
  gold: chain(yellow),
  silver: chain("#b9ceca"),
  cash: '<path d="M8 18L48 13L57 44L16 51Z" fill="#81a678"/><path d="M13 23L43 19L50 39L20 45Z" fill="none"/><ellipse cx="31" cy="32" rx="7" ry="9" fill="#c7d5a1"/><path d="M25 16L36 15L44 47L32 49Z" fill="#fff1ce"/>',
  phone:
    '<rect x="17" y="5" width="31" height="54" rx="5" fill="#263c40"/><path d="M21 13H44V47H21Z" fill="#65bfc3"/><path d="M22 43L43 16M26 8H38" stroke="#fff1ce"/><circle cx="32" cy="53" r="2" fill="#fff1ce"/>',
  camera:
    '<path d="M19 18L24 10H38L43 18" fill="#aa8060"/><rect x="5" y="18" width="54" height="36" rx="5" fill="#b59a76"/><circle cx="33" cy="36" r="14" fill="#253838"/><circle cx="33" cy="36" r="8" fill="#5badb3"/><path d="M9 24H17M45 25H54" stroke="#fff1ce"/>',
  shades:
    '<path d="M4 20L8 44L25 45L30 24H35L40 45L55 42L60 18Z" fill="#111c1d"/><path d="M9 24L13 37L24 25ZM40 24L44 37L54 22Z" fill="#71dbdc"/><path d="M2 17L59 14" stroke="#fff1ce"/>',
  wallet:
    '<path d="M7 17L51 12L57 49L11 54Z" fill="#916143"/><path d="M13 20L46 17L51 45L16 48Z" fill="none" stroke="#e1b475" stroke-dasharray="2 3"/><path d="M38 29H60V40H38Z" fill="#785035"/><circle cx="48" cy="34" r="2" fill="#f5c34e"/>',
  earbuds:
    '<rect x="8" y="26" width="48" height="29" rx="10" fill="#fff1ce"/><path d="M9 35H55M21 25V10Q9 4 10 15Q10 24 20 19M43 25V10Q55 4 54 15Q54 24 44 19" fill="#fff1ce"/><circle cx="32" cy="43" r="2" fill="#58b8b8"/>',
  keys: '<circle cx="26" cy="19" r="12" fill="none" stroke="#ddd2b6" stroke-width="6"/><path d="M29 30V57H40V51H35V45H42V40H35V30Z" fill="#ddd2b6"/><path d="M16 29L7 48L17 51L25 34" fill="#e5b455"/>',
  anchor:
    '<circle cx="32" cy="10" r="6" fill="none" stroke="#273c40" stroke-width="6"/><path d="M32 18V53M17 25H47M8 39Q9 58 32 55Q55 58 56 39M6 44L8 35L17 40M47 40L56 35L58 44" fill="none" stroke="#273c40" stroke-width="7"/><path d="M30 19V47" stroke="#9dafaa" stroke-width="2"/>',
  concrete:
    '<path d="M9 16L41 8L59 30L48 55L11 54L4 35Z" fill="#8d9182"/><path d="M9 16L23 29L59 30M23 29L11 54M41 8L39 22" fill="none"/><path d="M29 38L35 40M43 45L47 42M17 21L20 24" stroke="#cac5aa"/>',
  tire: '<ellipse cx="32" cy="33" rx="26" ry="27" fill="#28302d"/><ellipse cx="32" cy="33" rx="13" ry="15" fill="#ae956f"/><ellipse cx="32" cy="33" rx="21" ry="22" fill="none" stroke="#858976" stroke-dasharray="4 4" stroke-width="3"/>',
  flipflop:
    '<path d="M25 5C9 8 12 31 16 46C20 66 42 61 44 40C47 17 44 3 25 5Z" fill="#e6578c"/><path d="M19 31L30 17L40 32M30 17L31 10" fill="none" stroke="#fff1ce" stroke-width="5"/>',
  towel:
    '<path d="M9 10L47 6L55 57L16 53Z" fill="#58b8b8"/><path d="M11 17L48 15M13 25L49 23M15 41L53 42M16 47L54 49" stroke="#fff1ce" stroke-width="4"/>',
  board:
    '<path d="M13 6Q33 0 51 10L48 35L39 29L34 43L23 36L11 51Z" fill="#f5c34e"/><path d="M22 9L19 34M33 8L32 31M46 10L42 28" stroke="#e6578c" stroke-width="4"/>',
  motel:
    '<circle cx="29" cy="9" r="6" fill="none" stroke="#fff1ce"/><path d="M28 15L44 30L33 60L13 42Z" fill="#e6578c"/><text x="28" y="42" font-size="16" text-anchor="middle" stroke="none" fill="#fff1ce" font-family="serif">13</text>',
  crab,
  jewelryCrab:
    crab + '<g transform="translate(21 -2) scale(.45)">' + ring + "</g>",
  cooler:
    '<path d="M8 23H56L53 56H11Z" fill="#e6578c"/><rect x="5" y="16" width="54" height="12" rx="3" fill="#fff1ce"/><path d="M19 16V8H44V16" fill="none" stroke-width="5"/><path d="M29 28H36V35H29Z" fill="#fff1ce"/><text x="32" y="50" font-size="20" text-anchor="middle" stroke="none" fill="#fff1ce" font-family="serif">?</text>',
  drive:
    '<rect x="11" y="6" width="42" height="52" rx="3" fill="#76959a"/><circle cx="32" cy="29" r="14" fill="#cad4c3"/><circle cx="32" cy="29" r="4" fill="#263a3c"/><path d="M45 49L27 30M17 51H26" fill="none"/>',
};
export function lootSVG(id: string) {
  // Native, replaceable icon art; texture remains local and deterministic.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="-4 -4 72 72"><defs><filter id="rim" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.4" result="expanded"/><feFlood flood-color="${cream}"/><feComposite in2="expanded" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g stroke="${ink}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" filter="url(#rim)">${shapes[id]}</g><g fill="${ink}" opacity=".22">${Array.from({ length: 22 }, (_, i) => `<circle cx="${12 + ((i * 17) % 40)}" cy="${16 + ((i * 11) % 35)}" r=".6"/>`).join("")}</g></svg>`;
}

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
  ) =>
    k.drawRect({ pos: k.vec2(x, y), width, height, color: color(c), opacity });
  const circle = (
    x: number,
    y: number,
    radius: number,
    c: string,
    opacity = 1,
  ) => k.drawCircle({ pos: k.vec2(x, y), radius, color: color(c), opacity });
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    c = ink,
    align: "left" | "center" = "center",
  ) =>
    k.drawText({
      text: value,
      pos: k.vec2(x, y),
      size,
      color: color(c),
      font: "monospace",
      anchor: align === "center" ? "center" : "topleft",
    });
  return (run: Run, reducedMotion: boolean) => {
    const env = levelForDay(run.day).environment,
      time = reducedMotion ? 0 : run.elapsed;
    // Landscape touch controls keep a 56px toolbar even when the world shrinks.
    // In portrait, that toolbar sits outside the stage.
    const toolbarTop =
      window.innerWidth > window.innerHeight
        ? Math.max(72, (56 * WORLD.width) / Math.max(1, canvas.clientWidth))
        : 72;
    const operatorHeight = Math.min(
      127,
      Math.max(64, (WORLD.surface - 3 - toolbarTop - 8) / (496 / 600)),
    );
    k.drawSprite({
      sprite: "beach",
      pos: k.vec2(0, 0),
      width: WORLD.width,
      height: WORLD.height,
    });
    rect(
      0,
      WORLD.surface,
      WORLD.width,
      WORLD.height - WORLD.surface,
      env.sand,
      0.14,
    );
    if (run.day > 1) rect(0, 0, WORLD.width, WORLD.surface, env.sky, 0.3);
    if (env.prop === "rain")
      for (let i = 0; i < 40; i++) {
        const x = (i * 71) % WORLD.width,
          y = (i * 29 + time * 80) % WORLD.surface;
        line(x, y, x - 4, y + 12, cream, 1, 0.3);
      }
    // A shoreline deck grounds both the winch and chair. The sprite has transparent
    // padding: its visible feet end at source y=553/600, aligned to the deck top.
    // The deck has depth: chair feet sit at its back, shoes at its front edge.
    rect(WORLD.originX + 12, WORLD.surface - 20, 224, 27, ink);
    rect(WORLD.originX + 14, WORLD.surface - 18, 220, 19, "#a88658");
    for (let plank = 0; plank < 3; plank++) {
      line(
        WORLD.originX + 14,
        WORLD.surface - 15 + plank * 7,
        WORLD.originX + 234,
        WORLD.surface - 15 + plank * 7,
        ink,
        1.5,
        0.6,
      );
    }
    rect(WORLD.originX + 22, WORLD.surface + 5, 9, 12, ink);
    rect(WORLD.originX + 214, WORLD.surface + 5, 9, 12, ink);
    line(
      WORLD.originX + 16,
      WORLD.surface - 3,
      WORLD.originX + 230,
      WORLD.surface - 3,
      cream,
      3,
    );
    k.drawEllipse({
      pos: k.vec2(WORLD.originX + 122, WORLD.surface - 4),
      radiusX: 91,
      radiusY: 5,
      color: color(ink),
      opacity: 0.38,
    });
    k.drawSprite({
      sprite: "scavenger",
      pos: k.vec2(
        WORLD.originX + 20,
        WORLD.surface - 3 - (553 / 600) * operatorHeight,
      ),
      width: operatorHeight * 1.5,
      height: operatorHeight,
    });
    line(
      WORLD.originX + 32,
      WORLD.surface - 3,
      WORLD.originX + 2,
      Math.max(120, toolbarTop + 5),
      ink,
      9,
    );
    line(
      WORLD.originX + 2,
      Math.max(120, toolbarTop + 5),
      WORLD.originX,
      WORLD.originY,
      cream,
      5,
    );
    circle(WORLD.originX, WORLD.originY, 9, ink);
    circle(WORLD.originX, WORLD.originY, 4, env.accent);
    line(0, WORLD.surface, WORLD.width, WORLD.surface, ink, 7);
    line(0, WORLD.surface - 3, WORLD.width, WORLD.surface - 3, cream, 2);
    const hooked = attachedLoot(run),
      hook = hookPosition(run.claw);
    for (const obj of run.loot) {
      if (obj.removed || obj === hooked) continue;
      const def = LOOT[obj.id],
        radius = lootRadius(obj);
      k.drawEllipse({
        pos: k.vec2(obj.x, obj.y + radius * 0.65),
        radiusX: radius,
        radiusY: 6,
        color: color(ink),
        opacity: 0.13,
      });
      k.drawSprite({
        sprite: obj.id,
        pos: k.vec2(obj.x, obj.y),
        width: radius * 2.3,
        height: radius * 2.3,
        anchor: "center",
        angle:
          def.movable && !reducedMotion
            ? Math.sin(time * 9) * 4
            : ((obj.uid % 5) - 2) * 4,
      });
      const value = lootValue(def, run.boosts);
      text(def.mystery ? "???" : `$${value}`, obj.x, obj.y + radius + 12, 14);
    }
    // The open jaws point along the cable, so their visible aim matches collision.
    const sin = Math.sin(run.claw.angle),
      cos = Math.cos(run.claw.angle);
    const point = (x: number, y: number) => ({
      x: hook.x + x * cos + y * sin,
      y: hook.y - x * sin + y * cos,
    });
    const neck = point(0, -25);
    line(WORLD.originX, WORLD.originY, neck.x, neck.y, ink, 5);
    line(WORLD.originX - 1, WORLD.originY, neck.x - 1, neck.y, cream, 1.4);
    if (hooked) {
      const r = lootRadius(hooked);
      k.drawSprite({
        sprite: hooked.id,
        pos: k.vec2(hook.x + run.claw.gripX, hook.y + run.claw.gripY),
        width: r * 2.3,
        height: r * 2.3,
        anchor: "center",
        angle: reducedMotion
          ? 0
          : Math.sin(time * (lootWeight(hooked) > 5 ? 28 : 8)) * 3,
      });
    }
    const spread = hooked ? 10 : 18;
    for (const side of [-1, 1]) {
      const elbow = point(side * spread, -12),
        tip = point(side * (hooked ? 3 : 10), 0);
      line(neck.x, neck.y, elbow.x, elbow.y, ink, 7);
      line(elbow.x, elbow.y, tip.x, tip.y, ink, 6);
      line(neck.x, neck.y, elbow.x, elbow.y, cream, 3);
      line(elbow.x, elbow.y, tip.x, tip.y, cream, 2);
    }
  };
}
