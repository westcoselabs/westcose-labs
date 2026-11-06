import { WORLD } from "./model";

// Only trim the unused sky and sand reserved for the desktop HUD. The complete
// operator, travel rail, loot, labels and claw remain in the visible world.
export const BEACH_VIEW = { top: 60, bottom: WORLD.playfieldBottom + 32 };

export function lootPresentation(width: number, height: number) {
  const rail = Math.max(72, Math.min(96, width * 0.095));
  const beachHeight = BEACH_VIEW.bottom - BEACH_VIEW.top;
  const classicScale = Math.min(width / WORLD.width, height / WORLD.height);
  const compactScale = Math.min((width - rail * 2) / WORLD.width, height / beachHeight);
  // Use side panels only when they actually enlarge the scene.
  const compact = height <= 540 && compactScale > classicScale * 1.04;
  const scale = Math.max(0.001, compact ? compactScale : classicScale);
  return {
    compact, rail, scale,
    width: compact ? width : WORLD.width * scale,
    height: compact ? height : WORLD.height * scale,
    canvasWidth: WORLD.width * scale,
    canvasHeight: WORLD.height * scale,
    canvasTop: compact ? (height - beachHeight * scale) / 2 - BEACH_VIEW.top * scale : 0,
  };
}
