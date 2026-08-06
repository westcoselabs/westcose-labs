import { describe, expect, it } from "vitest";

import {
  clampRectToWorkspace,
  createWorkspaceBounds,
  isRectInsideWorkspace,
  snapRectToWorkspace,
} from "../../src/lib/window-geometry";

describe("desktop window geometry", () => {
  it("derives a taskbar-safe workspace from the viewport", () => {
    expect(createWorkspaceBounds(1440, 900)).toEqual({
      x: 24,
      y: 24,
      width: 1392,
      height: 780,
    });
  });

  it("recovers an oversized off-screen rectangle", () => {
    const workspace = { x: 24, y: 24, width: 900, height: 600 };
    const recovered = clampRectToWorkspace(
      { x: -400, y: 900, width: 1200, height: 40 },
      workspace,
    );

    expect(recovered).toEqual({
      x: 24,
      y: 404,
      width: 900,
      height: 220,
    });
    expect(isRectInsideWorkspace(recovered, workspace)).toBe(true);
  });

  it("creates exact left and right snap regions without a gap", () => {
    const workspace = { x: 24, y: 24, width: 901, height: 600 };

    expect(snapRectToWorkspace("left", workspace)).toEqual({
      x: 24,
      y: 24,
      width: 450,
      height: 600,
    });
    expect(snapRectToWorkspace("right", workspace)).toEqual({
      x: 474,
      y: 24,
      width: 451,
      height: 600,
    });
  });

  it("centers the current size and clamps it to the workspace", () => {
    expect(
      snapRectToWorkspace(
        "center",
        { x: 0, y: 0, width: 1000, height: 800 },
        { x: 20, y: 40, width: 600, height: 500 },
      ),
    ).toEqual({ x: 200, y: 150, width: 600, height: 500 });
  });
});

