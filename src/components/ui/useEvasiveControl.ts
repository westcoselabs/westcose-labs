"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from "react";

type Bounds = { left: number; top: number; right: number; bottom: number };

function boundedStep(
  start: number,
  end: number,
  min: number,
  max: number,
  step: number,
) {
  // A control larger than its available space cannot fit on that axis. Leave
  // that axis alone instead of pushing one clipped edge farther out of reach.
  if (end - start > max - min) return 0;
  return Math.max(min - start, Math.min(max - end, step));
}

function availableBounds(container?: HTMLElement | null): Bounds {
  const rect = container?.getBoundingClientRect();
  return {
    left: Math.max(8, rect?.left ?? 8),
    top: Math.max(8, rect?.top ?? 8),
    right: Math.min(window.innerWidth - 8, rect?.right ?? window.innerWidth - 8),
    bottom: Math.min(window.innerHeight - 8, rect?.bottom ?? window.innerHeight - 8),
  };
}

export function boundedEvasion(
  rect: Bounds,
  bounds: Bounds,
  x: number,
  y: number,
  dx: number,
  dy: number,
) {
  return {
    x: x + boundedStep(rect.left, rect.right, bounds.left, bounds.right, dx),
    y: y + boundedStep(rect.top, rect.bottom, bounds.top, bounds.bottom, dy),
  };
}

/** Pick a reachable escape that clears the pointer, including near an edge. */
export function pointerEscape(
  rect: Bounds, bounds: Bounds, x: number, y: number,
  pointer: { x: number; y: number }, distance: number,
) {
  let best = { x, y };
  let clearance = -1;
  for (const dx of [-distance, 0, distance]) {
    for (const dy of [-distance, 0, distance]) {
      if (!dx && !dy) continue;
      const next = boundedEvasion(rect, bounds, x, y, dx, dy);
      const shiftX = next.x - x, shiftY = next.y - y;
      const gap = Math.hypot(
        Math.max(rect.left + shiftX - pointer.x, 0, pointer.x - rect.right - shiftX),
        Math.max(rect.top + shiftY - pointer.y, 0, pointer.y - rect.bottom - shiftY),
      );
      if (gap > clearance) { clearance = gap; best = next; }
    }
  }
  return best;
}

/** Pointer-only mischief. Native keyboard/assistive clicks always bypass it. */
export function useEvasiveControl({
  onActivate,
  reducedMotion = false,
  maxEvasions = 2,
  touchEvasions = 1,
  maxTotalEvasions = Infinity,
  onEvade,
  distance = 60,
  fleePointer = false,
  containerRef,
  disabled = false,
}: {
  onActivate: () => void;
  reducedMotion?: boolean;
  maxEvasions?: number;
  touchEvasions?: number;
  maxTotalEvasions?: number;
  onEvade?: (count: number) => void;
  distance?: number;
  fleePointer?: boolean;
  containerRef?: RefObject<HTMLElement | null>;
  disabled?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const attempts = useRef({ mouse: 0, touch: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const pointerType = useRef("mouse");
  const suppressClick = useRef(false);
  const lastEvasion = useRef(-Infinity);
  const [position, setPosition] = useState({ x: 0, y: 0, reducedMotion });

  // Discard a saved dodge when the preference changes, so turning motion back
  // on cannot suddenly restore an old offset. The guarded render update keeps
  // the transform correct before paint, including OS media-query updates.
  if (position.reducedMotion !== reducedMotion) {
    setPosition({ x: 0, y: 0, reducedMotion });
  }

  useEffect(() => {
    if (reducedMotion) {
      offset.current = { x: 0, y: 0 };
      suppressClick.current = false;
      return;
    }
    const constrain = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const next = boundedEvasion(
        rect,
        availableBounds(containerRef?.current),
        offset.current.x,
        offset.current.y,
        0,
        0,
      );
      if (next.x === offset.current.x && next.y === offset.current.y) return;
      offset.current = next;
      setPosition({ ...next, reducedMotion });
    };
    window.addEventListener("resize", constrain);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(constrain);
    if (buttonRef.current) observer?.observe(buttonRef.current);
    if (containerRef?.current) observer?.observe(containerRef.current);
    return () => {
      window.removeEventListener("resize", constrain);
      observer?.disconnect();
    };
  }, [containerRef, reducedMotion]);

  const evade = useCallback((touch: boolean, pointer?: { x: number; y: number }) => {
    const input = touch ? "touch" : "mouse";
    if (
      disabled ||
      reducedMotion ||
      attempts.current.mouse + attempts.current.touch >= maxTotalEvasions ||
      attempts.current[input] >= (touch ? touchEvasions : maxEvasions)
    )
      return false;
    if (fleePointer && !touch && performance.now() - lastEvasion.current < 160) return false;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const bounds = availableBounds(containerRef?.current);
    const direction = attempts.current[input] % 2 === 0 ? 1 : -1;
    const next = fleePointer && pointer && !touch
      ? pointerEscape(rect, bounds, offset.current.x, offset.current.y, pointer, distance)
      : boundedEvasion(
      rect,
      bounds,
      offset.current.x,
      offset.current.y,
      direction * distance,
      (direction * -distance) / 3,
    );
    if (fleePointer && next.x === offset.current.x && next.y === offset.current.y) return false;
    offset.current = next;
    lastEvasion.current = performance.now();
    attempts.current[input]++;
    onEvade?.(attempts.current.mouse + attempts.current.touch);
    setPosition({ ...offset.current, reducedMotion });
    return true;
  }, [containerRef, disabled, distance, fleePointer, maxEvasions, maxTotalEvasions, onEvade, reducedMotion, touchEvasions]);

  useEffect(() => {
    if (!fleePointer || reducedMotion || disabled) return;
    const approach = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      const bounds = availableBounds(containerRef?.current);
      if (rect.bottom < bounds.top || rect.top > bounds.bottom) return;
      const gap = Math.hypot(
        Math.max(rect.left - event.clientX, 0, event.clientX - rect.right),
        Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom),
      );
      if (gap <= 48) {
        pointerType.current = "mouse";
        suppressClick.current = evade(false, { x: event.clientX, y: event.clientY });
      }
    };
    window.addEventListener("pointermove", approach, { passive: true });
    return () => window.removeEventListener("pointermove", approach);
  }, [containerRef, disabled, evade, fleePointer, reducedMotion]);

  return {
    buttonRef,
    style: {
      transform: reducedMotion
        ? undefined
        : `translate(${position.x}px, ${position.y}px)`,
    },
    onPointerEnter: (event: PointerEvent<HTMLButtonElement>) => {
      pointerType.current = event.pointerType;
      if (event.pointerType === "mouse") suppressClick.current = evade(false, { x: event.clientX, y: event.clientY });
    },
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      pointerType.current = event.pointerType;
      if (event.pointerType !== "mouse") {
        suppressClick.current = evade(true);
        // Keep the ensuing click on the button even after its transform moves.
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }
    },
    onPointerCancel: () => {
      suppressClick.current = false;
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      // Native Enter/Space and assistive activation are not pointer attempts.
      if (event.detail === 0) {
        suppressClick.current = false;
        onActivate();
        return;
      }
      if (!reducedMotion && event.detail > 0 && suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      // A short dodge can leave the pointer over a wide button. The next
      // physical click is still an attempt, even without another pointerenter.
      if (event.detail > 0 && evade(pointerType.current !== "mouse", { x: event.clientX, y: event.clientY })) return;
      onActivate();
    },
  };
}
