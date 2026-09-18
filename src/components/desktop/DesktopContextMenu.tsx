"use client";

import {
  ArrowClockwise,
  CaretRight,
  Image as ImageIcon,
  PaintBrush,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { useAppearance } from "@/components/os/AppearanceContext";

import styles from "./DesktopContextMenu.module.css";

type SubmenuId = "theme" | "wallpaper";

const SUBMENU_LABELS: Record<SubmenuId, string> = {
  theme: "Theme",
  wallpaper: "Wallpaper",
};

const MENU_WIDTH = 240;
const MENU_HEIGHT = 220;

export type DesktopContextMenuProps = {
  readonly onClose: () => void;
  readonly onOpenAppearanceSettings: () => void;
  readonly onRefresh: () => void;
  readonly x: number;
  readonly y: number;
};

/**
 * Personalisation for empty desktop space. Application windows keep their own
 * window menu, so appearance actions stay on the desktop surface itself.
 *
 * The submenu is a sibling menu rather than a nested one, which keeps each
 * `role="menu"` owning only menu items and lets both be driven by the keyboard.
 */
export function DesktopContextMenu({
  onClose,
  onOpenAppearanceSettings,
  onRefresh,
  x,
  y,
}: DesktopContextMenuProps) {
  const appearance = useAppearance();
  const [openSubmenu, setOpenSubmenu] = useState<SubmenuId | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<SubmenuId, HTMLButtonElement>());

  const viewportWidth =
    typeof window === "undefined" ? MENU_WIDTH * 2 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? MENU_HEIGHT * 2 : window.innerHeight;
  const left = Math.max(0, Math.min(x, viewportWidth - MENU_WIDTH));
  const top = Math.max(0, Math.min(y, viewportHeight - MENU_HEIGHT));
  const flip = left + MENU_WIDTH * 2 > viewportWidth;

  const closeSubmenu = useCallback(
    (returnFocus: boolean) => {
      setOpenSubmenu((current) => {
        if (current && returnFocus) {
          triggerRefs.current.get(current)?.focus();
        }
        return null;
      });
    },
    [],
  );

  useEffect(() => {
    if (!openSubmenu) return;
    const frame = window.requestAnimationFrame(() => {
      submenuRef.current
        ?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]')
        ?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openSubmenu]);

  const moveFocus = (
    container: HTMLElement | null,
    from: HTMLElement,
    delta: number,
  ) => {
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
    );
    if (items.length === 0) return;
    const index = items.indexOf(from);
    const next = (index + delta + items.length) % items.length;
    items[next]?.focus();
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(menuRef.current, target, event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "ArrowRight") {
      const submenu = target.dataset.submenu as SubmenuId | undefined;
      if (submenu) {
        event.preventDefault();
        setOpenSubmenu(submenu);
      }
    }
  };

  const handleSubmenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(submenuRef.current, target, event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      closeSubmenu(true);
    }
  };

  const submenuItems =
    openSubmenu === "theme"
      ? appearance.availableThemes.map((theme) => ({
          checked: theme.id === appearance.theme.id,
          description: theme.description,
          id: theme.id,
          name: theme.name,
          swatch: undefined as string | undefined,
          select: () => appearance.setThemeId(theme.id),
        }))
      : appearance.availableWallpapers.map((wallpaper) => ({
          checked: wallpaper.id === appearance.wallpaper.id,
          description: wallpaper.preview.label,
          id: wallpaper.id,
          name: wallpaper.name,
          swatch: wallpaper.preview.image,
          select: () => appearance.setWallpaperId(wallpaper.id),
        }));

  return (
    <div
      className={styles.layer}
      data-desktop-context-menu
      data-flip={flip || undefined}
      style={
        {
          "--context-x": `${left}px`,
          "--context-y": `${top}px`,
        } as CSSProperties
      }
    >
      <div
        aria-label="Desktop personalization"
        className={styles.menu}
        onKeyDown={handleMenuKeyDown}
        ref={menuRef}
        role="menu"
      >
        {(["theme", "wallpaper"] as const).map((submenu, index) => (
          <button
            aria-controls={
              openSubmenu === submenu ? `desktop-${submenu}-submenu` : undefined
            }
            aria-expanded={openSubmenu === submenu}
            aria-haspopup="menu"
            autoFocus={index === 0}
            className={styles.item}
            data-submenu={submenu}
            key={submenu}
            onClick={() =>
              setOpenSubmenu((current) =>
                current === submenu ? null : submenu,
              )
            }
            ref={(element) => {
              if (element) triggerRefs.current.set(submenu, element);
              else triggerRefs.current.delete(submenu);
            }}
            role="menuitem"
            type="button"
          >
            {submenu === "theme" ? (
              <PaintBrush aria-hidden="true" />
            ) : (
              <ImageIcon aria-hidden="true" />
            )}
            <span className={styles.itemLabel}>{SUBMENU_LABELS[submenu]}</span>
            <CaretRight aria-hidden="true" />
          </button>
        ))}
        <hr className={styles.separator} />
        <button
          className={styles.item}
          onClick={() => {
            onRefresh();
            onClose();
          }}
          role="menuitem"
          type="button"
        >
          <ArrowClockwise aria-hidden="true" />
          <span className={styles.itemLabel}>Refresh</span>
        </button>
        <button
          className={styles.item}
          onClick={() => {
            onOpenAppearanceSettings();
            onClose();
          }}
          role="menuitem"
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" />
          <span className={styles.itemLabel}>
            Display / Appearance Settings
          </span>
        </button>
      </div>

      {openSubmenu ? (
        <div
          aria-label={SUBMENU_LABELS[openSubmenu]}
          className={styles.submenu}
          id={`desktop-${openSubmenu}-submenu`}
          onKeyDown={handleSubmenuKeyDown}
          ref={submenuRef}
          role="menu"
        >
          {submenuItems.map((item) => (
            <button
              aria-checked={item.checked}
              className={styles.option}
              key={item.id}
              onClick={() => {
                item.select();
                closeSubmenu(true);
              }}
              role="menuitemradio"
              style={
                item.swatch
                  ? ({ "--swatch-image": item.swatch } as CSSProperties)
                  : undefined
              }
              type="button"
            >
              {item.swatch ? (
                <span aria-hidden="true" className={styles.swatch} />
              ) : (
                <span aria-hidden="true" />
              )}
              <span className={styles.optionCopy}>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
