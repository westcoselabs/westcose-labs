export interface DesktopRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type WorkspaceBounds = DesktopRect;

export type SnapPosition = "left" | "right" | "center" | "maximize";

export const DESKTOP_TASKBAR_HEIGHT = 72;
export const DESKTOP_GUTTER = 24;
export const DEFAULT_MIN_WINDOW_WIDTH = 320;
export const DEFAULT_MIN_WINDOW_HEIGHT = 220;

const finiteOr = (value: number, fallback: number): number =>
  Number.isFinite(value) ? value : fallback;

const nonNegative = (value: number): number => Math.max(0, value);

export function createWorkspaceBounds(
  viewportWidth: number,
  viewportHeight: number,
  options: {
    readonly gutter?: number;
    readonly taskbarHeight?: number;
  } = {},
): WorkspaceBounds {
  const gutter = nonNegative(
    finiteOr(options.gutter ?? DESKTOP_GUTTER, DESKTOP_GUTTER),
  );
  const taskbarHeight = nonNegative(
    finiteOr(
      options.taskbarHeight ?? DESKTOP_TASKBAR_HEIGHT,
      DESKTOP_TASKBAR_HEIGHT,
    ),
  );
  const safeWidth = nonNegative(finiteOr(viewportWidth, 0));
  const safeHeight = nonNegative(finiteOr(viewportHeight, 0));

  return {
    x: gutter,
    y: gutter,
    width: Math.max(0, safeWidth - gutter * 2),
    height: Math.max(0, safeHeight - taskbarHeight - gutter * 2),
  };
}

export function normalizeRect(rect: DesktopRect): DesktopRect {
  return {
    x: finiteOr(rect.x, 0),
    y: finiteOr(rect.y, 0),
    width: nonNegative(finiteOr(rect.width, 0)),
    height: nonNegative(finiteOr(rect.height, 0)),
  };
}

export function clampRectToWorkspace(
  rect: DesktopRect,
  workspace: WorkspaceBounds,
  options: {
    readonly minWidth?: number;
    readonly minHeight?: number;
  } = {},
): DesktopRect {
  const safeRect = normalizeRect(rect);
  const safeWorkspace = normalizeRect(workspace);
  const requestedMinWidth = nonNegative(
    finiteOr(
      options.minWidth ?? DEFAULT_MIN_WINDOW_WIDTH,
      DEFAULT_MIN_WINDOW_WIDTH,
    ),
  );
  const requestedMinHeight = nonNegative(
    finiteOr(
      options.minHeight ?? DEFAULT_MIN_WINDOW_HEIGHT,
      DEFAULT_MIN_WINDOW_HEIGHT,
    ),
  );

  const minWidth = Math.min(requestedMinWidth, safeWorkspace.width);
  const minHeight = Math.min(requestedMinHeight, safeWorkspace.height);
  const width = Math.min(
    safeWorkspace.width,
    Math.max(minWidth, safeRect.width),
  );
  const height = Math.min(
    safeWorkspace.height,
    Math.max(minHeight, safeRect.height),
  );
  const maxX = safeWorkspace.x + safeWorkspace.width - width;
  const maxY = safeWorkspace.y + safeWorkspace.height - height;

  return {
    x: Math.min(Math.max(safeRect.x, safeWorkspace.x), maxX),
    y: Math.min(Math.max(safeRect.y, safeWorkspace.y), maxY),
    width,
    height,
  };
}

export function centerRectInWorkspace(
  rect: Pick<DesktopRect, "width" | "height">,
  workspace: WorkspaceBounds,
  options: {
    readonly minWidth?: number;
    readonly minHeight?: number;
  } = {},
): DesktopRect {
  const centered = {
    x: workspace.x + (workspace.width - rect.width) / 2,
    y: workspace.y + (workspace.height - rect.height) / 2,
    width: rect.width,
    height: rect.height,
  };

  return roundRect(clampRectToWorkspace(centered, workspace, options));
}

export function snapRectToWorkspace(
  position: SnapPosition,
  workspace: WorkspaceBounds,
  currentRect?: DesktopRect,
): DesktopRect {
  const safeWorkspace = normalizeRect(workspace);

  if (position === "maximize") {
    return roundRect(safeWorkspace);
  }

  if (position === "center") {
    const width = currentRect?.width ?? safeWorkspace.width * 0.72;
    const height = currentRect?.height ?? safeWorkspace.height * 0.78;

    return centerRectInWorkspace({ width, height }, safeWorkspace);
  }

  const leftWidth = Math.floor(safeWorkspace.width / 2);
  const rightWidth = safeWorkspace.width - leftWidth;

  if (position === "left") {
    return {
      x: safeWorkspace.x,
      y: safeWorkspace.y,
      width: leftWidth,
      height: safeWorkspace.height,
    };
  }

  return {
    x: safeWorkspace.x + leftWidth,
    y: safeWorkspace.y,
    width: rightWidth,
    height: safeWorkspace.height,
  };
}

export function isRectInsideWorkspace(
  rect: DesktopRect,
  workspace: WorkspaceBounds,
): boolean {
  const safeRect = normalizeRect(rect);
  const safeWorkspace = normalizeRect(workspace);

  return (
    safeRect.x >= safeWorkspace.x &&
    safeRect.y >= safeWorkspace.y &&
    safeRect.x + safeRect.width <=
      safeWorkspace.x + safeWorkspace.width &&
    safeRect.y + safeRect.height <=
      safeWorkspace.y + safeWorkspace.height
  );
}

export function roundRect(rect: DesktopRect): DesktopRect {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}
