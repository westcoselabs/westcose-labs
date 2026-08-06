"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { Button, SurfaceFloating } from "@/components/ui";

import styles from "./PocketAppMenu.module.css";
import type { PocketAppItem } from "./types";

interface PocketAppMenuProps {
  readonly app: PocketAppItem;
  readonly onClose: () => void;
  readonly onLaunch: (app: PocketAppItem) => void;
  readonly returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export function PocketAppMenu({
  app,
  onClose,
  onLaunch,
  returnFocusRef,
}: PocketAppMenuProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const returnTarget = returnFocusRef.current;
    return () => returnTarget?.focus();
  }, [returnFocusRef]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        backdropRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (!backdropRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      ref={backdropRef}
    >
      <SurfaceFloating
        aria-labelledby="pocket-app-menu-title"
        aria-modal="true"
        className={styles.menu}
        role="dialog"
      >
        <div className={styles.heading}>
          <h2 className="type-headline-sm" id="pocket-app-menu-title">
            {app.label}
          </h2>
          {app.description ? (
            <p className={styles.description}>{app.description}</p>
          ) : null}
          {app.statusLabel ? (
            <p className={styles.status}>{app.statusLabel}</p>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Button
            autoFocus
            fullWidth
            onClick={() => {
              onClose();
              onLaunch(app);
            }}
            tone="primary"
          >
            Open {app.label}
          </Button>
          <Button fullWidth onClick={onClose}>
            Close menu
          </Button>
        </div>
      </SurfaceFloating>
    </div>
  );
}
