"use client";

import { LiquidGlass } from "@/components/ui/LiquidGlass";

import { Check, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject, type PointerEvent } from "react";

import { useAppearance } from "@/components/os/AppearanceContext";
import { Button, IconButton, SurfaceFloating } from "@/components/ui";
import { getWallpaper } from "@/registry/wallpapers";

import styles from "./PocketCustomizeSheet.module.css";

type CustomizeTab = "theme" | "wallpaper";

export type PocketCustomizeSheetProps = {
  readonly onClose: () => void;
  readonly onOpenAppearanceSettings: () => void;
  readonly returnFocusRef: RefObject<HTMLElement | null>;
  readonly initialTab?: CustomizeTab;
};

/**
 * Pocket personalisation. Same shared appearance state as the desktop context
 * menu, presented as a touch sheet rather than a copy of the desktop menu.
 *
 * Long press opens it, but nothing here depends on long press: Settings and the
 * home screen's Customize control reach the same sheet.
 */
export function PocketCustomizeSheet({
  onClose,
  onOpenAppearanceSettings,
  returnFocusRef,
  initialTab = "wallpaper",
}: PocketCustomizeSheetProps) {
  const appearance = useAppearance();
  const [tab, setTab] = useState<CustomizeTab>(initialTab);
  const [expanded, setExpanded] = useState(false);
  const drag = useRef<{ y: number; height: number; delta: number; sheet: HTMLElement } | null>(null);
  const dragged = useRef(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const finishDrag = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    current.sheet.style.removeProperty("--sheet-height");
    current.sheet.style.removeProperty("--sheet-drag");
    delete current.sheet.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) return;
    if (current.delta > (expanded ? current.height * 0.55 : 90)) onClose();
    else if (Math.abs(current.delta) > 40) setExpanded(current.delta < 0);
  };

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

  const options =
    tab === "theme"
      ? appearance.availableThemes.map((theme) => ({
          checked: theme.id === appearance.theme.id,
          description: theme.description,
          id: theme.id,
          name: theme.name,
          preview: getWallpaper(theme.recommendedWallpaperId)?.preview.image,
          select: () => appearance.setThemeId(theme.id),
        }))
      : appearance.availableWallpapers.map((wallpaper) => ({
          checked: wallpaper.id === appearance.wallpaper.id,
          description: wallpaper.description,
          id: wallpaper.id,
          name: wallpaper.name,
          preview: wallpaper.preview.image,
          select: () => appearance.setWallpaperId(wallpaper.id),
        }));

  return (
    <div
      className={styles.backdrop}
      onPointerDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      ref={backdropRef}
    >
      <SurfaceFloating
        aria-labelledby="pocket-customize-title"
        aria-modal="true"
        className={styles.sheet}
        data-detent={expanded ? "large" : "medium"}
        role="dialog"
      >
        <LiquidGlass tone="strong" />
        <button
          aria-label={expanded ? "Collapse customization sheet" : "Expand customization sheet"}
          aria-expanded={expanded}
          className={styles.grabber}
          onClick={() => {
            if (!dragged.current) setExpanded((value) => !value);
            dragged.current = false;
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            const sheet = event.currentTarget.closest<HTMLElement>('[role="dialog"]')!;
            drag.current = { y: event.clientY, height: sheet.getBoundingClientRect().height, delta: 0, sheet };
            dragged.current = false;
            sheet.dataset.dragging = "true";
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const current = drag.current;
            if (!current) return;
            current.delta = event.clientY - current.y;
            dragged.current ||= Math.abs(current.delta) > 5;
            const minimum = Math.min(320, window.innerHeight * 0.55);
            const maximum = backdropRef.current!.clientHeight - 24;
            const height = Math.min(maximum, Math.max(minimum, current.height - current.delta));
            current.sheet.style.setProperty("--sheet-height", `${height}px`);
            current.sheet.style.setProperty("--sheet-drag", `${Math.max(0, current.delta - (current.height - minimum))}px`);
          }}
          onPointerUp={(event) => finishDrag(event)}
          onPointerCancel={(event) => finishDrag(event, true)}
          onLostPointerCapture={(event) => finishDrag(event, true)}
          type="button"
        ><span /></button>
        <div className={styles.heading}>
          <div>
          <h2 className="type-headline-sm" id="pocket-customize-title">
            Customize
          </h2>
          <p>Make WestCose yours.</p>
          </div>
          <IconButton label="Close customization" onClick={onClose}><X aria-hidden="true" weight="bold" /></IconButton>
        </div>

        <div aria-label="Customize section" className={styles.tabs} role="tablist">
          {(["theme", "wallpaper"] as const).map((id) => (
            <button
              aria-controls="pocket-customize-options"
              aria-selected={tab === id}
              autoFocus={id === initialTab}
              className={styles.tab}
              id={`pocket-customize-tab-${id}`}
              key={id}
              onClick={() => setTab(id)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? "theme" : event.key === "End" ? "wallpaper" : id === "theme" ? "wallpaper" : "theme";
                setTab(next);
                document.getElementById(`pocket-customize-tab-${next}`)?.focus();
              }}
              tabIndex={tab === id ? 0 : -1}
              role="tab"
              type="button"
            >
              {id === "theme" ? "Theme" : "Wallpaper"}
            </button>
          ))}
        </div>

        <div
          className={styles.panel}
          aria-labelledby={`pocket-customize-tab-${tab}`}
          id="pocket-customize-options"
          role="tabpanel"
        >
          <div
            aria-label={tab === "theme" ? "Theme" : "Wallpaper"}
            className={styles.options}
            role="radiogroup"
          >
          {options.map((option, index) => (
            <button
              aria-checked={option.checked}
              className={styles.option}
              key={option.id}
              onClick={option.select}
              tabIndex={option.checked ? 0 : -1}
              onKeyDown={(event) => {
                if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + options.length) % options.length;
                options[next].select();
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
              }}
              role="radio"
              style={
                option.preview
                  ? ({ "--preview-image": option.preview } as CSSProperties)
                  : undefined
              }
              type="button"
            >
              <span aria-hidden="true" className={styles.preview} />
              <span className={styles.optionCopy}>
                <strong>{option.name}</strong>
                <small>{option.description}</small>
              </span>
              <Check aria-hidden="true" className={styles.check} weight="bold" />
            </button>
          ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            fullWidth
            onClick={() => {
              onClose();
              onOpenAppearanceSettings();
            }}
          >
            Appearance Settings
          </Button>
          <Button fullWidth onClick={onClose} tone="primary">
            Done
          </Button>
        </div>
      </SurfaceFloating>
    </div>
  );
}
