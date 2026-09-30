// Original 48px sprites. Every mark is an integer pixel: no smoothing, paths,
// gradients, or imported art. The shared foot line lets them perch on OS chrome.
export const CREATURE_SPRITE_SIZE = 48;
export const CREATURE_BASELINE = 46;
export const CREATURE_KINDS = [
  "Office Gremlin", "Underpants Cyclops", "Runaway Dentures", "Slime Royalty",
  "Haunted Toaster", "Panic Chicken", "Bin Goblin", "Decaf Phantom",
] as const;

type Point = readonly [number, number];
const INK = "#202032";
const BONE = "#fff0c9";

export function createCreatureSprite(kind: number, frame: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = CREATURE_SPRITE_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const step = frame % 2 ? 2 : 0;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  // Rasterize polygon rows ourselves so even diagonal ears have solid pixels.
  const polygon = (points: readonly Point[], color: string, outline = true) => {
    const rows: [number, number, number][] = [];
    const top = Math.min(...points.map(p => p[1]));
    const bottom = Math.max(...points.map(p => p[1]));
    for (let y = top; y < bottom; y++) {
      const intersections: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        if ((a[1] <= y + .5 && b[1] > y + .5) || (b[1] <= y + .5 && a[1] > y + .5))
          intersections.push(a[0] + (y + .5 - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      intersections.sort((a, b) => a - b);
      for (let i = 0; i + 1 < intersections.length; i += 2) {
        const x = Math.ceil(intersections[i] - .5);
        rows.push([x, y, Math.ceil(intersections[i + 1] - .5) - x]);
      }
    }
    if (outline) rows.forEach(([x, y, w]) => rect(x - 1, y - 1, w + 2, 3, INK));
    rows.forEach(([x, y, w]) => rect(x, y, w, 1, color));
  };
  const oval = (x: number, y: number, w: number, h: number, color: string) => {
    polygon([[x + 3, y], [x + w - 3, y], [x + w, y + 3], [x + w, y + h - 3],
      [x + w - 3, y + h], [x + 3, y + h], [x, y + h - 3], [x, y + 3]], color);
  };
  const box = (x: number, y: number, w: number, h: number, color: string) => {
    rect(x - 1, y - 1, w + 2, h + 2, INK);
    rect(x, y, w, h, color);
  };
  const eye = (x: number, y: number, w = 8, h = 8, pupil = 0) => {
    oval(x, y, w, h, BONE);
    rect(x + Math.floor(w / 2) - 1 + pupil, y + 3, 2, Math.max(2, h - 5), INK);
  };
  const shoes = (left: number, right: number, y: number, color = "#b97065") => {
    box(left + step, y, 3, 44 - y, color);
    box(right - step, y, 3, 44 - y, color);
    box(left - 2 + step, 43, 7, 2, INK);
    box(right - step, 43, 7, 2, INK);
  };

  switch (kind % CREATURE_KINDS.length) {
    case 0: { // Office gremlin: giant ears, one fang, and the world's worst tie.
      shoes(17, 29, 35, "#718753");
      polygon([[15, 26], [9, 29 + step], [6, 37], [10, 38], [13, 32], [18, 30]], "#79914b");
      polygon([[32, 27], [38, 29 - step], [41, 35 - step], [37, 36 - step], [34, 31]], "#79914b");
      oval(15, 26, 19, 14, "#718753");
      rect(20, 29, 9, 7, "#c0c57b");
      polygon([[15, 15], [2, 6], [5, 20], [15, 24]], "#98b862");
      polygon([[33, 15], [45, 4], [42, 21], [32, 24]], "#98b862");
      polygon([[5, 10], [12, 17], [7, 18]], "#c28d8e", false);
      polygon([[41, 9], [35, 17], [40, 18]], "#c28d8e", false);
      oval(12, 12, 25, 18, "#98b862");
      polygon([[19, 12], [18, 6], [23, 10], [28, 7], [29, 13]], "#5c753c");
      eye(15, 16, 9, 8, -1); eye(27, 15, 7, 9, 1);
      rect(25, 23, 4, 2, "#597340");
      rect(18, 26, 14, 2, INK); rect(21, 26, 3, 4, BONE);
      box(24, 31, 3, 3, "#e66c69");
      polygon([[24, 35], [27, 35], [29, 40], [25, 42], [23, 40]], "#c64964");
      rect(30, 25, 2, 1, "#e6da98");
      break;
    }
    case 1: { // Underpants cyclops, visibly unqualified to be this confident.
      shoes(17, 29, 37, "#b18acc");
      polygon([[14, 25], [8, 28], [5, 26 - step], [4, 31], [11, 33], [16, 30]], "#9872b6");
      polygon([[33, 24], [39, 26], [42, 22 + step], [44, 27], [40, 31], [33, 30]], "#9872b6");
      oval(12, 12, 25, 26, "#a47ac0");
      polygon([[15, 14], [13, 7], [19, 10], [19, 14]], "#f0d19b");
      polygon([[29, 13], [34, 6], [34, 15]], "#f0d19b");
      rect(15, 17, 3, 8, "#c39ad6");
      eye(18, 14, 14, 13, frame ? 2 : 1);
      rect(24, 18, 5, 6, "#dc8b56"); rect(26, 18, 2, 6, INK); rect(24, 18, 1, 2, BONE);
      rect(20, 29, 12, 4, INK); rect(22, 29, 3, 2, BONE); rect(27, 31, 4, 3, "#e691a0");
      polygon([[13, 34], [37, 34], [34, 40], [27, 40], [25, 37], [21, 40], [15, 39]], "#cfe1c8");
      rect(14, 34, 22, 2, BONE); rect(17, 37, 2, 2, "#e78585"); rect(30, 36, 2, 2, "#e78585");
      break;
    }
    case 2: { // Runaway dentures. The tongue is absolutely steering.
      for (const x of [9, 18, 28, 37]) {
        polygon([[x, 30], [x + 2, 32], [x + (x < 24 ? -3 : 3), 41 - step],
          [x + (x < 24 ? -6 : 6), 44], [x + (x < 24 ? -2 : 2), 45], [x + 4, 39]], "#cf748a");
      }
      oval(5, 16, 37, 19, "#c65e79");
      oval(8, 20, 31, 11, INK);
      rect(9, 15, 29, 5, "#f294a0");
      for (let i = 0; i < 6; i++) {
        box(10 + i * 5, 20, 3, i % 2 ? 5 : 7, BONE);
        rect(11 + i * 5, 29, 3, 3, "#e1d3ad");
      }
      polygon([[24, 29], [30, 28], [32 + step, 35], [38 + step, 36], [37 + step, 40], [30, 40], [25, 36]], "#ed8194");
      rect(30, 33, 1, 5, "#a63e61");
      box(13, 12, 3, 5, "#d7778f"); box(32, 10, 3, 7, "#d7778f");
      eye(9, 8, 9, 8, -1); eye(29, 6, 9, 8, 1);
      break;
    }
    case 3: { // Slime royalty: three eyes, one brain cell, a stolen crown.
      polygon([[7, 43], [9, 34], [12, 32], [13, 21], [19, 17], [30, 16],
        [37, 23], [36, 33], [41, 38 + step], [44, 43], [40, 45], [29, 44],
        [24, 46], [17, 44], [7, 45], [4, 44]], "#63b6a0");
      polygon([[9, 39], [15, 32], [16, 24], [20, 21], [18, 34], [15, 41]], "#a9dbb5", false);
      polygon([[24, 39], [34, 34], [37, 42], [28, 44], [20, 42]], "#368887", false);
      polygon([[18, 18], [16, 8], [22, 12], [25, 5], [28, 12], [35, 8], [32, 18]], "#efb955");
      rect(19, 15, 13, 3, "#ffde83"); rect(24, 14, 3, 3, "#d16176");
      eye(13, 25, 8, 8, -1); eye(24, 22, 8, 8, 1); eye(31, 29, 7, 7, 1);
      rect(22, 34, 7, 5, INK); rect(24, 34, 2, 3, BONE);
      rect(11 + step, 41, 4, 2, "#a9dbb5"); rect(34, 38, 2, 2, "#a9dbb5");
      break;
    }
    case 4: { // Haunted toaster: the breakfast has escaped too.
      shoes(14, 30, 38, "#d4a076");
      polygon([[37, 26], [42, 26], [42, 32], [45, 32], [45, 37 - step], [41, 37 - step]], "#697d85");
      oval(12, 6 - step, 22, 19, "#bb784d");
      polygon([[15, 10 - step], [19, 8 - step], [28, 8 - step], [31, 11 - step], [30, 22], [16, 22]], "#f2cb85");
      rect(18, 13 - step, 2, 3, INK); rect(26, 12 - step, 2, 3, INK);
      rect(21, 17 - step, 4, 3, "#8e5347");
      oval(7, 22, 33, 17, "#90adb3");
      rect(11, 22, 24, 2, INK); rect(11, 26, 3, 10, "#c1d6ca");
      rect(17, 28, 4, 2, INK); rect(28, 27, 4, 2, INK);
      rect(21, 32, 8, 3, INK); rect(23, 32, 2, 2, BONE);
      box(38, 27, 3, 4, "#dc735b"); rect(33, 34, 2, 2, "#f4b46c");
      break;
    }
    case 5: { // Panic chicken. All scream, no useful qualifications.
      shoes(20, 30, 36, "#dfb45e");
      polygon([[17, 29], [6, 22 + step], [7, 31], [14, 37], [23, 37]], "#b4b9af");
      oval(16, 25, 23, 15, "#e2dfbd");
      polygon([[25, 28], [22, 37], [32, 34], [32, 29]], "#b6bcac");
      polygon([[29, 14], [28, 5], [32, 8], [35, 3], [37, 10], [41, 7], [41, 15]], "#dc6971");
      oval(26, 12, 17, 19, "#e2dfbd");
      eye(27, 14, 13, 12, -1);
      polygon([[39, 23], [47, 26], [40, 29]], "#edb85f");
      rect(40, 26, 5, 1, INK);
      oval(34, 28, 5, 6, "#dc6971");
      rect(29, 18, 2, 2, BONE);
      break;
    }
    case 6: { // Bin goblin: a banana-peel toupee and disproportionately tiny legs.
      shoes(15, 30, 39, "#7aa68b");
      polygon([[11, 27], [5, 24 - step], [3, 28 - step], [8, 33], [13, 31]], "#a0c09a");
      polygon([[35, 29], [41, 26 + step], [45, 28 + step], [40, 34], [34, 33]], "#a0c09a");
      polygon([[10, 22], [38, 22], [35, 40], [14, 40]], "#698e82");
      rect(16, 26, 2, 11, "#9eb9a0"); rect(32, 25, 2, 12, "#426966");
      oval(9, 15, 29, 14, "#b4c181");
      eye(13, 19, 8, 7, -1); eye(27, 18, 8, 7, 1);
      rect(22, 27, 8, 4, INK); rect(23, 27, 2, 2, BONE);
      polygon([[7, 17], [9, 13], [36, 12], [41, 16], [40, 19], [8, 20]], "#779b92");
      rect(16, 12, 13, 2, "#b5c8a4");
      polygon([[22, 13], [22, 6], [26, 3], [27, 8], [35, 11], [35, 15], [26, 11],
        [21, 16], [17, 15], [21, 10]], "#e8c665");
      rect(25, 3, 2, 2, "#8d7550"); rect(25, 34, 4, 3, "#b5c8a4");
      break;
    }
    default: { // Decaf phantom: haunted, but mostly under-caffeinated.
      polygon([[9, 44], [12, 20], [17, 11], [24, 8], [31, 11], [35, 21], [38, 40],
        [41, 44], [35, 43 - step], [31, 46], [26, 42], [20, 45], [16, 42], [11, 46]], "#9faed6");
      polygon([[13, 36], [16, 21], [21, 14], [20, 28], [18, 39]], "#d1d6e4", false);
      polygon([[28, 33], [33, 24], [36, 40], [31, 44], [25, 40]], "#747bb5", false);
      eye(16, 21, 8, 8, -1); eye(27, 21, 8, 8, -1);
      rect(15, 20, 10, 4, "#9faed6"); rect(26, 20, 10, 4, "#9faed6");
      rect(24, 31, 4, 5, INK); rect(25, 35, 2, 1, "#e391a3");
      box(33, 34 - step, 10, 9, "#e6be91");
      box(42, 36 - step, 3, 4, "#e6be91"); rect(43, 37 - step, 1, 2, INK);
      rect(34, 34 - step, 8, 2, "#815b52"); rect(36, 38 - step, 4, 2, "#b06a63");
      rect(37 + step, 29 - step, 1, 3, "#d1d6e4"); rect(38 + step, 27 - step, 1, 2, "#d1d6e4");
      break;
    }
  }
  return canvas;
}
