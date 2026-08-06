"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Mirrors the browser's visual viewport into CSS variables without putting
 * toolbar or orientation movement through React state on every frame.
 */
export function useVisualViewport(
  targetRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const element = targetRef.current;

    if (!element) {
      return;
    }

    const viewport = window.visualViewport;
    let frame = 0;

    const update = () => {
      frame = 0;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const offsetTop = viewport?.offsetTop ?? 0;
      const offsetLeft = viewport?.offsetLeft ?? 0;

      element.style.setProperty("--pocket-viewport-width", `${width}px`);
      element.style.setProperty("--pocket-viewport-height", `${height}px`);
      element.style.setProperty("--pocket-viewport-top", `${offsetTop}px`);
      element.style.setProperty("--pocket-viewport-left", `${offsetLeft}px`);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetRef]);
}
