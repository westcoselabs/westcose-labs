"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

import { useAppearance } from "@/components/os/AppearanceContext";
import { Button, SurfaceFloating } from "@/components/ui";

import styles from "./PocketCustomizeSheet.module.css";

type CustomizeTab = "theme" | "wallpaper";

export type PocketCustomizeSheetProps = {
  readonly onClose: () => void;
  readonly onOpenAppearanceSettings: () => void;
  readonly returnFocusRef: RefObject<HTMLElement | null>;
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
}: PocketCustomizeSheetProps) {
  const appearance = useAppearance();
  const [tab, setTab] = useState<CustomizeTab>("wallpaper");
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

  const options =
    tab === "theme"
      ? appearance.availableThemes.map((theme) => ({
          checked: theme.id === appearance.theme.id,
          description: theme.description,
          id: theme.id,
          name: theme.name,
          preview: undefined as string | undefined,
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
        role="dialog"
      >
        <span aria-hidden="true" className={styles.grabber} />
        <div className={styles.heading}>
          <h2 className="type-headline-sm" id="pocket-customize-title">
            Customize
          </h2>
          <p>Theme and wallpaper are shared with the desktop presentation.</p>
        </div>

        <div aria-label="Customize section" className={styles.tabs} role="tablist">
          {(["theme", "wallpaper"] as const).map((id) => (
            <button
              aria-controls="pocket-customize-options"
              aria-selected={tab === id}
              autoFocus={id === "wallpaper"}
              className={styles.tab}
              id={`pocket-customize-tab-${id}`}
              key={id}
              onClick={() => setTab(id)}
              role="tab"
              type="button"
            >
              {id === "theme" ? "Theme" : "Wallpaper"}
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`pocket-customize-tab-${tab}`}
          id="pocket-customize-options"
          role="tabpanel"
        >
          <div
            aria-label={tab === "theme" ? "Theme" : "Wallpaper"}
            className={styles.options}
            role="radiogroup"
          >
          {options.map((option) => (
            <button
              aria-checked={option.checked}
              className={styles.option}
              key={option.id}
              onClick={option.select}
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
