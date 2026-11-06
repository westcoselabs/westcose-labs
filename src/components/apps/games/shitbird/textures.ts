import type { KaboomCtx } from "kaboom";
import { WORLD } from "./model";

const SCALE = 4;
const HEIGHT = WORLD.floor - WORLD.ceiling;
const IVORY = "#f2dfb6";
const INK = "#081713";

/** Bake the illustration once at 4×. Moving objects then cost only a few sprite draws. */
export function loadCoastTextures(k: KaboomCtx) {
  function sprite(name: string, width: number, height: number, paint: (c: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement("canvas");
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;
    const c = canvas.getContext("2d")!;
    c.scale(SCALE, SCALE);
    paint(c);
    k.loadSprite(name, canvas);
  }

  function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number, fill: string | CanvasGradient, stroke?: string) {
    c.beginPath(); c.roundRect(x, y, w, h, radius); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 0.7; c.stroke(); }
  }

  function gradient(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, stops: [number, string][]) {
    const g = c.createLinearGradient(x1, y1, x2, y2);
    for (const [position, color] of stops) g.addColorStop(position, color);
    return g;
  }

  function line(c: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, color: string, width = 1) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }

  function circle(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = color; c.fill();
  }

  // Original code-native timber illustrations. No signs, lettering or randomness:
  // material variation must never consume the seeded course RNG.
  const finishes = [
    { light: "#c69b63", body: "#876343", dark: "#3e3025", grain: "#503b29" },
    { light: "#b4a083", body: "#796e59", dark: "#37392e", grain: "#494638" },
    { light: "#b78555", body: "#795137", dark: "#38291f", grain: "#492e22" },
  ];

  finishes.forEach((finish, variant) => {
    sprite(`pier-body-${variant}`, WORLD.obstacleWidth, HEIGHT, (c) => {
      const w = WORLD.obstacleWidth;
      // A square-cut silhouette coincides with the existing collision rectangle.
      c.fillStyle = INK; c.fillRect(0, 0, w, HEIGHT);
      c.fillStyle = gradient(c, 0, 0, w, 0, [
        [0, finish.dark], [.05, finish.body], [.15, finish.light],
        [.38, finish.body], [.72, finish.body], [1, finish.dark],
      ]);
      c.fillRect(.7, 0, w - 1.4, HEIGHT);
      line(c, 2, 0, 2, HEIGHT, "#ebd3a37a", .8);
      line(c, w - 2, 0, w - 2, HEIGHT, "#08171399", 1.4);

      // Long, slightly wandering fibres read as wood at a 46px gameplay width.
      for (let i = 0; i < 13; i++) {
        const x = 4 + i * 3.05;
        c.beginPath();
        for (let y = -4; y <= HEIGHT + 4; y += 4) {
          const bend = Math.sin(y * .035 + i * 1.7 + variant) * .75 +
            Math.sin(y * .081 + i) * .3;
          if (y === -4) c.moveTo(x + bend, y); else c.lineTo(x + bend, y);
        }
        c.strokeStyle = i % 3 === 0 ? "#efd2a04f" : finish.grain;
        c.lineWidth = i % 3 === 0 ? .65 : .8;
        c.stroke();
      }
      for (let y = 38 + variant * 19; y < HEIGHT; y += 113) {
        const x = 13 + ((y + variant * 7) % 19);
        // Concentric knots, tapering splits and salt-lightened worn edges.
        for (let ring = 3; ring >= 1; ring--) {
          c.beginPath(); c.ellipse(x, y, ring * 1.15, ring * 3.2, -.15, 0, Math.PI * 2);
          c.strokeStyle = ring === 2 ? finish.light : finish.grain; c.lineWidth = .75; c.stroke();
        }
        c.beginPath(); c.moveTo(x, y + 3); c.lineTo(x - 1, y + 16); c.lineTo(x + .5, y + 26);
        c.strokeStyle = finish.dark; c.lineWidth = .75; c.stroke();
      }
      // Occasional iron straps are structural details, not sign panels.
      for (let y = 85 + variant * 23; y < HEIGHT; y += 190) {
        c.fillStyle = gradient(c, 0, y, 0, y + 9, [[0, "#101b18"], [.2, "#737468"], [.4, "#444c43"], [.85, "#272f29"], [1, INK]]);
        c.fillRect(1, y, w - 2, 9);
        for (const x of [8, w - 8]) {
          circle(c, x, y + 4.5, 1.5, "#1a251f");
          circle(c, x - .2, y + 4.2, .8, "#999681");
        }
      }
    });
  });

  for (const top of [false, true]) {
    sprite(`pier-cap-${top ? "top" : "bottom"}`, WORLD.obstacleWidth, 18, (c) => {
      const w = WORLD.obstacleWidth;
      if (top) { c.translate(0, 18); c.scale(1, -1); }
      c.fillStyle = gradient(c, 0, 0, w, 0, [[0, "#493623"], [.15, "#c49b67"], [.55, "#97704a"], [1, "#493623"]]);
      c.fillRect(0, 0, w, 18);
      // Saw-cut end grain, contained within the solid top of the piling.
      c.fillStyle = "#b79b72"; c.fillRect(.7, .7, w - 1.4, 5);
      for (let ring = 1; ring <= 4; ring++) {
        c.beginPath(); c.ellipse(w * .48, 3.1, ring * 5, ring * .56, 0, 0, Math.PI * 2);
        c.strokeStyle = ring % 2 ? "#765d40" : "#ddbd8a"; c.lineWidth = .65; c.stroke();
      }
      line(c, 0, 0, w, 0, "#edcf97", 1);
      line(c, 1, 5.8, w - 1, 5.8, "#4c3728", 1);
      // Two tightly wound rope courses give the silhouette a recognisable pier detail.
      for (const y of [9, 13]) {
        c.fillStyle = "#493d2b"; c.fillRect(0, y - 1, w, 4.5);
        c.fillStyle = gradient(c, 0, y, w, y, [[0, "#82704b"], [.25, "#e0c18a"], [.65, "#b69a67"], [1, "#645537"]]);
        c.fillRect(.5, y, w - 1, 2.8);
        for (let x = 1; x < w; x += 3.4) line(c, x, y, x + 1.6, y + 2.8, "#5d4b328c", .7);
      }
    });
  }

  sprite("shit-badge", 62, 28, (c) => {
    rounded(c, .5, .5, 61, 27, 3, INK, IVORY);
    rounded(c, 2.5, 2.5, 57, 23, 2, gradient(c, 0, 0, 0, 28, [[0, "#efac69"], [1, "#cd642f"]]), "#f8dcad");
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = INK; c.font = "bold 4.5px Arial"; c.fillText("WEST COSE AIR MAIL", 31, 7);
    c.font = "bold 15px Georgia"; c.fillText("SHIT", 31, 17.5);
    for (const x of [7, 55]) { circle(c, x, 17, 1.5, IVORY); circle(c, x, 17, .6, INK); }
  });

  sprite("shit-reticle", 64, 64, (c) => {
    // Corners sit exactly on the existing 46 by 46 trigger boundary.
    c.strokeStyle = "#a8c7a57a"; c.lineWidth = .65;
    c.beginPath(); c.arc(32, 32, 28, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8, inner = i % 4 === 0 ? 27 : 29;
      line(c, 32 + Math.cos(a) * inner, 32 + Math.sin(a) * inner,
        32 + Math.cos(a) * 31, 32 + Math.sin(a) * 31, "#e4c899", .7);
    }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const x = 32 + sx * 23, y = 32 + sy * 23;
      line(c, x - sx * 10, y, x, y, INK, 3.6);
      line(c, x, y, x, y - sy * 10, INK, 3.6);
      line(c, x - sx * 10, y, x, y, IVORY, 1.6);
      line(c, x, y, x, y - sy * 10, IVORY, 1.6);
      circle(c, x, y, 1.2, "#e79854");
    }
    c.beginPath(); c.moveTo(32, 27); c.lineTo(36, 32); c.lineTo(32, 37); c.lineTo(28, 32); c.closePath();
    c.fillStyle = "#efaa65"; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
    line(c, 20, 32, 25, 32, IVORY, .7); line(c, 39, 32, 44, 32, IVORY, .7);
  });
}

export const OBSTACLE_TEXTURE_HEIGHT = HEIGHT;
