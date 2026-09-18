"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";

const INTERACTIVE_SELECTOR =
  "a[href], button, input, select, textarea, [role='button'], [role='radio'], [role='menuitem'], [tabindex]:not([tabindex='-1'])";

export type LongPressOptions = {
  readonly onLongPress: (event: PointerEvent<HTMLElement>) => void;
  /** Milliseconds held before the gesture fires. */
  readonly delay?: number;
  /** Movement in CSS pixels that cancels the gesture, so swipes still swipe. */
  readonly moveTolerance?: number;
};

/**
 * A long press on empty space, deliberately narrow in scope: it ignores presses
 * that land on a control and cancels as soon as the pointer moves, so page
 * swiping and tapping behave exactly as before.
 *
 * Every action reachable this way must also be reachable another way; the
 * gesture is an accelerator, never the only route.
 */
export function useLongPress({
  onLongPress,
  delay = 500,
  moveTolerance = 12,
}: LongPressOptions) {
  const timerRef = useRef(0);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
    originRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;

      cancel();
      originRef.current = { x: event.clientX, y: event.clientY };
      const captured = event;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = 0;
        if (originRef.current) onLongPress(captured);
        originRef.current = null;
      }, delay);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const origin = originRef.current;
      if (!origin) return;
      const moved =
        Math.abs(event.clientX - origin.x) > moveTolerance ||
        Math.abs(event.clientY - origin.y) > moveTolerance;
      if (moved) cancel();
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
  };
}
