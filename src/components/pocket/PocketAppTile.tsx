"use client";

import { DotsThree } from "@phosphor-icons/react";
import type { PointerEvent } from "react";
import { useEffect, useRef } from "react";

import { IconButton } from "@/components/ui";

import { PocketAppGlyph } from "./PocketAppGlyph";
import styles from "./PocketAppTile.module.css";
import type { PocketAppItem } from "./types";

interface PocketAppTileProps {
  readonly app: PocketAppItem;
  readonly onLaunch: (app: PocketAppItem) => void;
  readonly onOpenMenu: (app: PocketAppItem) => void;
  readonly onRememberMenuTrigger: (trigger: HTMLButtonElement) => void;
}

export function PocketAppTile({
  app,
  onLaunch,
  onOpenMenu,
  onRememberMenuTrigger,
}: PocketAppTileProps) {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const longPressedRef = useRef(false);

  const cancelLongPress = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startLongPress = (event: PointerEvent<HTMLButtonElement>) => {
    const trigger = event.currentTarget;
    cancelLongPress();
    startRef.current = { x: event.clientX, y: event.clientY };
    longPressedRef.current = false;
    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true;
      onRememberMenuTrigger(trigger);
      onOpenMenu(app);
      timerRef.current = null;
    }, 550);
  };

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (
      Math.abs(event.clientX - startRef.current.x) > 10 ||
      Math.abs(event.clientY - startRef.current.y) > 10
    ) {
      cancelLongPress();
    }
  };

  return (
    <div className={styles.cell}>
      <button
        aria-label={app.accessibilityLabel}
        className={styles.launch}
        onClick={(event) => {
          if (longPressedRef.current) {
            event.preventDefault();
            longPressedRef.current = false;
            return;
          }
          onLaunch(app);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          onRememberMenuTrigger(event.currentTarget);
          onOpenMenu(app);
        }}
        onPointerCancel={cancelLongPress}
        onPointerDown={startLongPress}
        onPointerLeave={cancelLongPress}
        onPointerMove={handleMove}
        onPointerUp={cancelLongPress}
        type="button"
      >
        <span aria-hidden="true" className={styles.tile} data-tone={app.tone}>
          <PocketAppGlyph iconKey={app.iconKey} />
        </span>
        <span className={styles.label}>{app.label}</span>
      </button>
      <IconButton
        className={styles.menuButton}
        label={`More actions for ${app.label}`}
        onClick={(event) => {
          onRememberMenuTrigger(event.currentTarget);
          onOpenMenu(app);
        }}
      >
        <DotsThree aria-hidden="true" weight="bold" />
      </IconButton>
    </div>
  );
}
