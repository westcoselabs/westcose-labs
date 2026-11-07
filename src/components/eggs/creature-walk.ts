type Point = readonly [number, number];
type Limb = { hip: Point; foot: Point; mask: readonly Point[] };
type Rig = { far: Limb; near: Limb };

export const WALK_FRAME_COUNT = 12;

// The inked art is split at the hips. Each leg gets its own transform and
// opposite phase; changing a whole-character pose cannot substitute for this.
const rigs: readonly Rig[] = [
  { far: { hip: [173, 264], foot: [112, 350], mask: [[125, 259], [185, 258], [190, 281], [177, 306], [174, 384], [20, 384], [20, 302], [112, 302]] }, near: { hip: [191, 264], foot: [248, 350], mask: [[185, 259], [211, 259], [220, 280], [384, 280], [384, 384], [174, 384], [177, 306], [190, 281]] } },
  { far: { hip: [176, 278], foot: [123, 350], mask: [[137, 280], [185, 270], [198, 298], [181, 327], [180, 384], [28, 384], [28, 312], [121, 312]] }, near: { hip: [215, 278], foot: [271, 345], mask: [[204, 271], [241, 274], [248, 286], [384, 286], [365, 384], [182, 384], [181, 327], [198, 298]] } },
  { far: { hip: [119, 282], foot: [76, 350], mask: [[47, 280], [164, 284], [181, 310], [177, 384], [0, 384]] }, near: { hip: [246, 284], foot: [306, 350], mask: [[200, 286], [287, 285], [384, 312], [384, 384], [178, 384], [181, 310]] } },
  { far: { hip: [137, 307], foot: [104, 350], mask: [[68, 309], [165, 299], [185, 330], [178, 384], [0, 384]] }, near: { hip: [252, 309], foot: [282, 348], mask: [[239, 304], [300, 299], [384, 300], [384, 384], [230, 384], [232, 332]] } },
  { far: { hip: [168, 282], foot: [121, 350], mask: [[134, 281], [184, 280], [198, 310], [180, 334], [180, 384], [10, 384], [10, 310], [119, 310]] }, near: { hip: [211, 282], foot: [266, 350], mask: [[196, 280], [235, 281], [244, 286], [384, 286], [370, 384], [181, 384], [180, 334], [198, 310]] } },
  { far: { hip: [167, 280], foot: [118, 350], mask: [[137, 280], [183, 276], [202, 308], [184, 330], [180, 384], [20, 384], [20, 309], [112, 309]] }, near: { hip: [226, 280], foot: [287, 347], mask: [[215, 276], [247, 277], [260, 292], [384, 292], [384, 384], [182, 384], [184, 330], [202, 308]] } },
  { far: { hip: [171, 291], foot: [122, 350], mask: [[134, 289], [186, 288], [200, 315], [181, 337], [181, 384], [20, 384], [20, 310], [120, 310]] }, near: { hip: [216, 291], foot: [268, 350], mask: [[202, 288], [243, 289], [250, 294], [384, 294], [370, 384], [182, 384], [181, 337], [200, 315]] } },
];

export function legPose(phase: number, side: "far" | "near") {
  const angle = phase + (side === "far" ? Math.PI : 0);
  return { stride: Math.sin(angle) * 0.55, lift: Math.max(0, Math.cos(angle)) * 0.2 };
}

function surface(size = 384) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return canvas;
}

// Masks can isolate a few antialiased pixels from a neighbouring shoe. Keep
// the connected inked part rather than letting those scraps float in the gait.
function keepConnectedPart(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const image = ctx.getImageData(0, 0, 384, 384);
  const seen = new Uint8Array(384 * 384);
  let largest: number[] = [];
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || image.data[start * 4 + 3] < 8) continue;
    const component = [start];
    seen[start] = 1;
    for (let i = 0; i < component.length; i++) {
      const pixel = component[i];
      for (const next of [pixel - 384, pixel + 384, ...(pixel % 384 ? [pixel - 1] : []), ...(pixel % 384 < 383 ? [pixel + 1] : [])]) {
        if (next >= 0 && next < seen.length && !seen[next] && image.data[next * 4 + 3] >= 8) {
          seen[next] = 1;
          component.push(next);
        }
      }
    }
    if (component.length > largest.length) largest = component;
  }
  const keep = new Uint8Array(seen.length);
  largest.forEach(pixel => { keep[pixel] = 1; });
  for (let pixel = 0; pixel < keep.length; pixel++) if (!keep[pixel]) image.data[pixel * 4 + 3] = 0;
  ctx.putImageData(image, 0, 0);
}

function cutLimb(source: HTMLCanvasElement, limb: Limb) {
  const canvas = surface();
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  limb.mask.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(source, 0, 0);
  keepConnectedPart(canvas);
  return canvas;
}

/** Bake once at load time, so a full outbreak does not do per-limb work per tick. */
export function createWalkFrames(source: HTMLCanvasElement, kind: number): HTMLCanvasElement[] {
  const rig = rigs[kind];
  if (!rig) return [source]; // The phantom floats; it has no legs to articulate.
  const far = cutLimb(source, rig.far);
  const near = cutLimb(source, rig.near);
  const body = surface();
  const bodyCtx = body.getContext("2d")!;
  bodyCtx.drawImage(source, 0, 0);
  bodyCtx.globalCompositeOperation = "destination-out";
  for (const limb of [rig.far, rig.near]) {
    bodyCtx.beginPath();
    limb.mask.forEach(([x, y], i) => i ? bodyCtx.lineTo(x, y) : bodyCtx.moveTo(x, y));
    bodyCtx.closePath();
    bodyCtx.fill();
  }
  keepConnectedPart(body);

  return Array.from({ length: WALK_FRAME_COUNT }, (_, frame) => {
    const phase = frame / WALK_FRAME_COUNT * Math.PI * 2;
    const canvas = surface(192);
    const ctx = canvas.getContext("2d")!;
    ctx.scale(0.5, 0.5);
    const transforms = (["far", "near"] as const).map(side => {
      const limb = rig[side];
      const pose = legPose(phase, side);
      const dx = limb.foot[0] - limb.hip[0];
      const dy = limb.foot[1] - limb.hip[1];
      const rotation = Math.atan2(dx, dy) - pose.stride;
      const scale = 1 - pose.lift;
      const footY = limb.hip[1] + (dx * Math.sin(rotation) + dy * Math.cos(rotation)) * scale;
      return { limb, rotation, scale, footY, image: side === "far" ? far : near };
    });
    // A planted foot anchors the gait; the other leg lifts during its passing pose.
    const ground = Math.max(...transforms.map(pose => pose.footY));
    ctx.translate(0, 350 - ground);
    for (const pose of transforms) {
      ctx.save();
      ctx.translate(...pose.limb.hip);
      ctx.rotate(pose.rotation);
      ctx.scale(1, pose.scale);
      ctx.drawImage(pose.image, -pose.limb.hip[0], -pose.limb.hip[1]);
      ctx.restore();
    }
    ctx.drawImage(body, 0, 0);
    return canvas;
  });
}
