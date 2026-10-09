"use client";

import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Check,
  CornersOut,
  DeviceMobile,
  FileText,
  Lock,
  LockOpen,
  Monitor,
} from "@phosphor-icons/react";
import { useId, useState, type CSSProperties } from "react";

import { snapRectToWorkspace, type DesktopRect } from "@/lib/window-geometry";

import styles from "./ExperimentPlayground.module.css";

export interface ExperimentPlaygroundProps {
  slug: string;
  compact?: boolean;
}

type Shell = "desktop" | "pocket" | "document";

const shells = [
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "pocket", label: "Pocket", Icon: DeviceMobile },
  { id: "document", label: "Document", Icon: FileText },
] as const;

function ShellPlayground({ compact }: { compact: boolean }) {
  const [shell, setShell] = useState<Shell>("desktop");
  const id = useId();

  return (
    <>
      <div className={styles.segmented} role="group" aria-label="Route presentation">
        {shells.map(({ id: value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={shell === value}
            aria-controls={id}
            onClick={() => setShell(value)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className={styles.shellStage} data-shell={shell} id={id}>
        <article className={styles.sampleRoute}>
          <header className={styles.sampleHeader}>
            <span>About</span>
            {shell === "desktop" ? (
              <Monitor size={18} aria-hidden="true" />
            ) : shell === "pocket" ? (
              <DeviceMobile size={18} aria-hidden="true" />
            ) : (
              <FileText size={18} aria-hidden="true" />
            )}
          </header>
          <div className={styles.sampleContent}>
            <h3>WestCose Labs</h3>
            <p>A studio for thoughtful digital products.</p>
            <span className={styles.routePath}>/about</span>
          </div>
        </article>
        <span className={styles.shellAnnotation} aria-hidden="true">
          {shell === "desktop" ? "A movable window" : shell === "pocket" ? "A focused app" : "A readable page"}
        </span>
      </div>
      <p className={styles.feedback} aria-live="polite" aria-atomic="true">
        <Check size={16} aria-hidden="true" />
        Same content. {shells.find((item) => item.id === shell)?.label} presentation.
      </p>
      {!compact && (
        <p className={styles.note}>
          Choose a shell to change the presentation. The title, content, and route stay together.
        </p>
      )}
    </>
  );
}

const simulatedWidth = 390;
const browserTop = 52;
const browserBottom = 36;
const safeBottom = 20;
const percentage = (value: number, total: number) => `${(value / total * 100).toFixed(4)}%`;

function ViewportPlayground({ compact }: { compact: boolean }) {
  const [height, setHeight] = useState(740);
  const [chrome, setChrome] = useState(true);
  const id = useId();
  const chromeHeight = chrome ? browserTop + browserBottom : 0;
  const usableHeight = height - chromeHeight - safeBottom;
  const deviceStyle = {
    aspectRatio: `${simulatedWidth} / ${height}`,
    inlineSize: `${((compact ? 216 : 324) * simulatedWidth / height).toFixed(2)}px`,
    gridTemplateRows: `${percentage(chrome ? browserTop : 0, height)} minmax(0, 1fr) ${percentage(chrome ? browserBottom : 0, height)} ${percentage(safeBottom, height)}`,
  } satisfies CSSProperties;

  return (
    <>
      <div className={styles.viewportStage}>
        <div className={styles.viewportDevice} style={deviceStyle} aria-hidden="true">
          <div className={styles.browserTop}>{chrome && "Browser"}</div>
          <div className={styles.usableViewport}>
            <DeviceMobile size={24} weight="light" />
            <strong>{usableHeight}</strong>
            <span>usable px</span>
          </div>
          <div className={styles.browserBottom}>{chrome && <span />}</div>
          <div className={styles.safeArea} />
        </div>
        <dl className={styles.viewportReadout}>
          <div><dt>Screen</dt><dd>{height}<span> px</span></dd></div>
          <div><dt>Browser</dt><dd>{chromeHeight}<span> px</span></dd></div>
          <div><dt>Safe area</dt><dd>{safeBottom}<span> px</span></dd></div>
          <div className={styles.usableReadout}><dt>Usable</dt><dd>{usableHeight}<span> px</span></dd></div>
        </dl>
      </div>
      <div className={styles.rangeControl}>
        <label htmlFor={id}>Simulated screen height</label>
        <output htmlFor={id}>{height} px</output>
        <input
          id={id}
          type="range"
          min={560}
          max={880}
          step={20}
          value={height}
          onChange={(event) => setHeight(Number(event.target.value))}
          aria-valuetext={`${height} pixels, ${usableHeight} pixels usable`}
        />
      </div>
      <label className={styles.checkboxControl}>
        <input type="checkbox" checked={chrome} onChange={(event) => setChrome(event.target.checked)} />
        Show browser chrome
      </label>
      {!compact && (
        <p className={styles.note}>
          This scaled simulation uses a 390 px width, 88 px of browser chrome, and a 20 px bottom safe area.
          Real devices report their own viewport and insets.
        </p>
      )}
    </>
  );
}

function UnlockPlayground({ compact }: { compact: boolean }) {
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const id = useId();

  function unlock() {
    setProgress(100);
    setUnlocked(true);
  }

  function reset() {
    setProgress(0);
    setUnlocked(false);
  }

  return (
    <>
      <div className={styles.unlockStage} data-unlocked={unlocked}>
        <span className={styles.lockSymbol} aria-hidden="true">
          {unlocked ? <LockOpen size={40} weight="light" /> : <Lock size={40} weight="light" />}
        </span>
        <p className={styles.unlockStatus} role="status">
          {unlocked ? "You're in." : "Your way in."}
        </p>
        <p>{unlocked ? "The same result, with any input." : "Slide, tap, or use your keyboard."}</p>
      </div>
      <div className={styles.rangeControl}>
        <label htmlFor={id}>Slide to unlock</label>
        <output htmlFor={id}>{progress}%</output>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          disabled={unlocked}
          aria-valuetext={unlocked ? "Unlocked" : `${progress} percent. Move near the end to unlock.`}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (next >= 90) unlock();
            else setProgress(next);
          }}
        />
      </div>
      <div className={styles.actionPair}>
        <button className={styles.primaryButton} type="button" onClick={unlock} disabled={unlocked}>
          {unlocked ? <Check size={18} aria-hidden="true" /> : <LockOpen size={18} aria-hidden="true" />}
          {unlocked ? "Unlocked" : "Unlock"}
        </button>
        <button className={styles.button} type="button" onClick={reset}>
          <ArrowCounterClockwise size={18} aria-hidden="true" /> Reset
        </button>
      </div>
      {!compact && (
        <p className={styles.note}>
          The slider unlocks near its end. The Unlock button reaches the same state with one tap or Enter.
        </p>
      )}
    </>
  );
}

const workspace: DesktopRect = { x: 0, y: 0, width: 1000, height: 640 };
const initialRect: DesktopRect = { x: 190, y: 115, width: 620, height: 410 };
type GeometryPosition = "initial" | "left" | "right" | "maximize";

const positions = [
  { id: "left", label: "Left", Icon: ArrowLeft },
  { id: "right", label: "Right", Icon: ArrowRight },
  { id: "maximize", label: "Fill", Icon: CornersOut },
] as const;

function GeometryPlayground({ compact }: { compact: boolean }) {
  const [position, setPosition] = useState<GeometryPosition>("initial");
  const id = useId();
  const rect = position === "initial" ? initialRect : snapRectToWorkspace(position, workspace);
  const windowStyle = {
    inlineSize: percentage(rect.width, workspace.width),
    blockSize: percentage(rect.height, workspace.height),
    transform: `translate(${percentage(rect.x, rect.width)}, ${percentage(rect.y, rect.height)})`,
  } satisfies CSSProperties;

  return (
    <>
      <div className={styles.geometryStage} id={id}>
        <div className={styles.workspaceGrid} aria-hidden="true" />
        <article className={styles.geometryWindow} style={windowStyle}>
          <header><Monitor size={16} aria-hidden="true" /><span>Workspace</span></header>
          <div className={styles.geometryContent}>
            <CornersOut size={28} weight="light" aria-hidden="true" />
            <p>A place for your ideas.</p>
          </div>
        </article>
      </div>
      <div className={styles.geometryControls} role="group" aria-label="Window position">
        {positions.map(({ id: value, label, Icon }) => (
          <button
            className={styles.button}
            key={value}
            type="button"
            aria-pressed={position === value}
            aria-controls={id}
            aria-label={value === "maximize" ? "Maximize window" : `Snap window ${value}`}
            onClick={() => setPosition(value)}
          ><Icon size={18} aria-hidden="true" />{label}</button>
        ))}
        <button className={styles.button} type="button" onClick={() => setPosition("initial")} aria-controls={id}>
          <ArrowCounterClockwise size={18} aria-hidden="true" />Reset
        </button>
      </div>
      <output className={styles.geometryReadout} aria-live="polite" aria-atomic="true">
        <span>{position === "initial" ? "Centered" : position === "maximize" ? "Maximized" : `Snapped ${position}`}</span>
        <span>{rect.width} × {rect.height} px</span>
      </output>
      {!compact && (
        <p className={styles.note}>
          These controls use the same snap calculations as the desktop shell, shown inside a 1000 × 640 px workspace.
        </p>
      )}
    </>
  );
}

const playgrounds = {
  "three-shell-router": { Component: ShellPlayground, label: "Route presentation demonstration" },
  "pocket-viewport": { Component: ViewportPlayground, label: "Mobile viewport simulation" },
  "accessible-unlock": { Component: UnlockPlayground, label: "Accessible unlock demonstration" },
  "window-geometry": { Component: GeometryPlayground, label: "Window snapping demonstration" },
} as const;

/** Small working studies, with the same controls in the index and detail view. */
export function ExperimentPlayground({ slug, compact = false }: ExperimentPlaygroundProps) {
  const playground = playgrounds[slug as keyof typeof playgrounds];
  if (!playground) return null;
  const { Component, label } = playground;

  return (
    <section className={styles.playground} data-compact={compact} data-experiment={slug} aria-label={label}>
      <Component compact={compact} />
      <noscript><p className={styles.note}>This is a live demonstration. Enable JavaScript to try the controls.</p></noscript>
    </section>
  );
}
