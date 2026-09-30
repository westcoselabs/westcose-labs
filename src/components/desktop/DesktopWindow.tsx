"use client";

import { DotsThree, Minus, Square, X } from "@phosphor-icons/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { IconButton } from "@/components/ui";
import {
  snapRectToWorkspace,
  resizeRectFromCorner,
  type ResizeCorner,
  type WorkspaceBounds,
} from "@/lib";
import type {
  DesktopAction,
  DesktopWindow as DesktopWindowModel,
} from "@/state";

import styles from "./DesktopWindow.module.css";

type PointerOperation = {
  dx: number;
  dy: number;
  mode: "drag" | "resize";
  corner: ResizeCorner;
  pointerId: number;
  startX: number;
  startY: number;
} | null;

type DesktopWindowProps = {
  active: boolean;
  children: ReactNode;
  dispatch: Dispatch<DesktopAction>;
  onClose: () => void;
  onMinimize: () => void;
  window: DesktopWindowModel;
  workspace: WorkspaceBounds;
};

export function DesktopWindow({
  active,
  children,
  dispatch,
  onClose,
  onMinimize,
  window,
  workspace,
}: DesktopWindowProps) {
  const titleId = useId();
  const frameRef = useRef<HTMLElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);
  const operationRef = useRef<PointerOperation>(null);
  const animationFrameRef = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    "--window-height": `${window.rect.height}px`,
    "--window-left": `${window.rect.x}px`,
    "--window-top": `${window.rect.y}px`,
    "--window-width": `${window.rect.width}px`,
    zIndex: window.zOrder,
  } as CSSProperties;

  const beginPointer = (
    event: ReactPointerEvent<HTMLElement>,
    mode: "drag" | "resize",
    corner: ResizeCorner = "se",
  ) => {
    if (window.status === "maximized" || event.button !== 0) return;
    if (mode === "drag" && (event.target as Element).closest("button")) return;

    operationRef.current = {
      dx: 0,
      dy: 0,
      mode,
      corner,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "window/focus", id: window.id });
  };

  const renderPointerOperation = () => {
    animationFrameRef.current = 0;
    const operation = operationRef.current;
    const frame = frameRef.current;
    if (!operation || !frame) return;

    if (operation.mode === "drag") {
      frame.style.transform = `translate3d(${operation.dx}px, ${operation.dy}px, 0)`;
      return;
    }

    const rect = resizeRectFromCorner(
      window.rect,
      operation.corner,
      operation.dx,
      operation.dy,
      workspace,
    );
    frame.style.transform = `translate3d(${rect.x - window.rect.x}px, ${rect.y - window.rect.y}px, 0)`;
    frame.style.width = `${rect.width}px`;
    frame.style.height = `${rect.height}px`;
  };

  const movePointer = (event: ReactPointerEvent<HTMLElement>) => {
    const operation = operationRef.current;
    if (!operation || operation.pointerId !== event.pointerId) return;
    operation.dx = event.clientX - operation.startX;
    operation.dy = event.clientY - operation.startY;
    if (!animationFrameRef.current) {
      animationFrameRef.current = globalThis.window.requestAnimationFrame(
        renderPointerOperation,
      );
    }
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    beginPointer(
      event,
      "resize",
      event.currentTarget.dataset.corner as ResizeCorner,
    );
  };

  const finishPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const operation = operationRef.current;
    if (!operation || operation.pointerId !== event.pointerId) return;
    if (animationFrameRef.current) {
      globalThis.window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    const nextRect =
      operation.mode === "drag"
        ? {
            ...window.rect,
            x: window.rect.x + operation.dx,
            y: window.rect.y + operation.dy,
          }
        : resizeRectFromCorner(
            window.rect,
            operation.corner,
            operation.dx,
            operation.dy,
            workspace,
          );
    operationRef.current = null;
    frameRef.current?.style.removeProperty("transform");
    frameRef.current?.style.removeProperty("width");
    frameRef.current?.style.removeProperty("height");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dispatch({
      type: "window/commit-geometry",
      id: window.id,
      rect: nextRect,
      workspace,
    });
  };

  const snap = (position: "center" | "left" | "right") => {
    dispatch({
      type: "window/commit-geometry",
      id: window.id,
      rect: snapRectToWorkspace(position, workspace, window.rect),
      workspace,
    });
    setMenuOpen(false);
  };

  const toggleMaximize = () => {
    dispatch(
      window.status === "maximized"
        ? { type: "window/restore", id: window.id }
        : { type: "window/maximize", id: window.id, workspace },
    );
  };

  useEffect(
    () => () => {
      if (animationFrameRef.current) {
        globalThis.window.cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (active) frameRef.current?.focus();
  }, [active]);

  useEffect(() => {
    if (!menuOpen) return;
    menuWrapRef.current
      ?.querySelector<HTMLButtonElement>("[role='menuitem']")
      ?.focus();
  }, [menuOpen]);

  if (window.status === "minimized") return null;

  return (
    <section
      aria-labelledby={titleId}
      className={styles.window}
      data-active={active || undefined}
      data-maximized={window.status === "maximized" || undefined}
      onPointerDown={() => dispatch({ type: "window/focus", id: window.id })}
      ref={frameRef}
      style={style}
      tabIndex={-1}
    >
      <header
        className={styles.titlebar}
        onDoubleClick={toggleMaximize}
        onPointerCancel={finishPointer}
        onPointerDown={(event) => beginPointer(event, "drag")}
        onPointerMove={movePointer}
        onPointerUp={finishPointer}
      >
        <div className={styles.titleGroup}>
          <span aria-hidden="true" className={styles.runningMark} />
          <h2 id={titleId}>{window.title}</h2>
        </div>
        <div className={styles.controls}>
          <div
            className={styles.menuWrap}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              event.stopPropagation();
              setMenuOpen(false);
              menuWrapRef.current
                ?.querySelector<HTMLButtonElement>("button")
                ?.focus();
            }}
            ref={menuWrapRef}
          >
            <IconButton
              aria-expanded={menuOpen}
              label={`Window menu for ${window.title}`}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <DotsThree aria-hidden="true" weight="bold" />
            </IconButton>
            {menuOpen ? (
              <div className={styles.windowMenu} role="menu">
                <button
                  onClick={() => snap("center")}
                  role="menuitem"
                  type="button"
                >
                  Center
                </button>
                <button
                  onClick={() => snap("left")}
                  role="menuitem"
                  type="button"
                >
                  Snap left
                </button>
                <button
                  onClick={() => snap("right")}
                  role="menuitem"
                  type="button"
                >
                  Snap right
                </button>
                <button onClick={toggleMaximize} role="menuitem" type="button">
                  {window.status === "maximized" ? "Restore" : "Maximize"}
                </button>
                <button onClick={onClose} role="menuitem" type="button">
                  Close
                </button>
              </div>
            ) : null}
          </div>
          <IconButton label={`Minimize ${window.title}`} onClick={onMinimize}>
            <Minus aria-hidden="true" />
          </IconButton>
          <IconButton
            label={`${window.status === "maximized" ? "Restore" : "Maximize"} ${window.title}`}
            onClick={toggleMaximize}
          >
            <Square aria-hidden="true" />
          </IconButton>
          <IconButton label={`Close ${window.title}`} onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        </div>
      </header>
      <div className={styles.body}>{children}</div>
      {window.status !== "maximized"
        ? (["nw", "ne", "sw", "se"] as const).map((corner) => (
            <button
              key={corner}
              aria-label={`Resize ${window.title} from ${corner.includes("n") ? "top" : "bottom"} ${corner.includes("w") ? "left" : "right"}`}
              className={styles.resizeHandle}
              data-corner={corner}
              onPointerCancel={finishPointer}
              onPointerDown={handleResizePointerDown}
              onPointerMove={movePointer}
              onPointerUp={finishPointer}
              onKeyDown={(event) => {
                const delta = event.shiftKey ? 40 : 10;
                const directions: Record<string, [number, number]> = {
                  ArrowLeft: [-delta, 0],
                  ArrowRight: [delta, 0],
                  ArrowUp: [0, -delta],
                  ArrowDown: [0, delta],
                };
                const movement = directions[event.key];
                if (!movement) return;
                event.preventDefault();
                event.stopPropagation();
                dispatch({
                  type: "window/commit-geometry",
                  id: window.id,
                  workspace,
                  rect: resizeRectFromCorner(
                    window.rect,
                    corner,
                    ...movement,
                    workspace,
                  ),
                });
              }}
              type="button"
            />
          ))
        : null}
    </section>
  );
}
