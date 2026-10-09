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

  const finishes = [
    { light: "#467d68", body: "#214d3c", dark: "#112c25", accent: "#f4d69b", word: "MOTEL" },
    { light: "#a06643", body: "#653d2c", dark: "#35271f", accent: "#ffc383", word: "DETOUR" },
    { light: "#497d84", body: "#254b51", dark: "#132d32", accent: "#a3d3c5", word: "NOPE" },
  ];

  finishes.forEach((finish, variant) => {
    sprite(`pylon-body-${variant}`, WORLD.obstacleWidth, HEIGHT, (c) => {
      const w = WORLD.obstacleWidth;
      c.fillStyle = INK; c.fillRect(0, 0, w, HEIGHT);
      // The outer frame fills exactly the collision rectangle, including the corners.
      c.fillStyle = gradient(c, 0, 0, w, 0, [[0, "#788b78"], [.035, IVORY], [.095, "#87957d"], [.13, "#293c30"], [.85, "#344237"], [.96, "#c4c4a1"], [1, "#4d6558"]]);
      c.fillRect(.5, 0, w - 1, HEIGHT);
      c.fillStyle = gradient(c, 5, 0, w - 5, 0, [[0, finish.dark], [.09, finish.light], [.24, finish.body], [.76, finish.body], [1, finish.dark]]);
      c.fillRect(5, 0, w - 10, HEIGHT);
      line(c, 7, 0, 7, HEIGHT, "#d9e7c433", .7);
      line(c, w - 7, 0, w - 7, HEIGHT, "#00000066", .8);
      // Large, quiet panels give the material scale. No random scratches or visual noise.
      for (let y = 22; y < HEIGHT; y += 64) {
        rounded(c, 10, y, w - 20, 44, 2, "#07161120", "#b4cab320");
        line(c, 12, y + 2, 33, y + 2, "#f3dfb51c", .5);
        for (const x of [3, w - 3]) {
          circle(c, x, y + 14, 1.45, "#182b23");
          circle(c, x - .15, y + 13.8, 1, "#a7b39b");
          line(c, x - .45, y + 13.8, x + .4, y + 13.8, "#344538", .5);
        }
      }
    });

    sprite(`pylon-sign-${variant}`, 36, 104, (c) => {
      rounded(c, .5, .5, 35, 103, 4, gradient(c, 0, 0, 36, 104, [[0, "#fff0cc"], [.32, "#a99c70"], [.7, "#e4d5ad"], [1, "#777754"]]), INK);
      rounded(c, 2, 2, 32, 100, 3, INK);
      rounded(c, 3.5, 3.5, 29, 97, 2, gradient(c, 0, 0, 32, 104, [[0, "#1c3027"], [.5, "#0d1c18"], [1, "#15261f"]]), "#a7b99b55");
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = "#bec8ac"; c.font = "600 4.5px Arial";
      c.fillText("WEST COSE", 18, 10);
      line(c, 9, 16, 27, 16, "#c1a87780", .6);
      const spacing = finish.word.length > 5 ? 11 : 13;
      const start = 52 - (finish.word.length - 1) * spacing / 2;
      c.font = "bold 13px Georgia";
      for (let i = 0; i < finish.word.length; i++) {
        c.fillStyle = "#000000"; c.fillText(finish.word[i], 18.6, start + i * spacing + .8);
        c.fillStyle = finish.accent; c.fillText(finish.word[i], 18, start + i * spacing);
      }
      line(c, 10, 88, 26, 88, "#c1a87780", .6);
      c.fillStyle = finish.accent;
      c.beginPath(); c.moveTo(18, 92); c.lineTo(20, 95); c.lineTo(18, 98); c.lineTo(16, 95); c.closePath(); c.fill();
    });
  });

  for (const top of [false, true]) {
    sprite(`pylon-cap-${top ? "top" : "bottom"}`, WORLD.obstacleWidth, 18, (c) => {
      const w = WORLD.obstacleWidth;
      c.fillStyle = INK; c.fillRect(0, 0, w, 18);
      c.fillStyle = gradient(c, 0, 0, 0, 18, top
        ? [[0, "#4e5e4c"], [.17, "#bec1a0"], [.27, "#fff0c9"], [.6, "#adab88"], [.82, "#526151"], [1, "#f3deb0"]]
        : [[0, "#fff0c9"], [.16, "#d5d2ad"], [.45, "#8c957c"], [.8, "#344c3d"], [1, "#142b21"]]);
      c.fillRect(.5, .5, w - 1, 17);
      rounded(c, 5, 5, w - 10, 8, 1.3, "#10221b", "#f3dfb577");
      c.fillStyle = gradient(c, 0, 6, 0, 12, [[0, "#ffc98c"], [.35, "#ef9556"], [1, "#a74d2c"]]);
      c.fillRect(7, 6.5, w - 14, 5);
      for (let x = 11; x < w - 8; x += 8) line(c, x, 7, x - 2, 11, "#733e29", 1.4);
      circle(c, 2.9, 9, 1, "#f4e7c6"); circle(c, w - 2.9, 9, 1, "#f4e7c6");
      line(c, 1, top ? 17 : 1, w - 1, top ? 17 : 1, "#fff0cb", 1);
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
