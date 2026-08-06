"use client";

import type { ChangeEvent } from "react";

import { Button, SurfaceRecessed } from "@/components/ui";
import type { DisplayPreference, Preferences } from "@/state";

import styles from "./PreferencePanel.module.css";

type PreferencePanelProps = {
  effectiveReducedMotion: boolean;
  onDisplayPreference: (preference: DisplayPreference) => void;
  onHighContrast: (enabled: boolean) => void;
  onLockPocket: () => void;
  onPreviewLock: () => void;
  onReducedMotion: (enabled: boolean) => void;
  onReplayStartup: () => void;
  onResetPreferences: () => void;
  onResetSession: () => void;
  onSound: (enabled: boolean) => void;
  preferences: Preferences;
};

export function PreferencePanel({
  effectiveReducedMotion,
  onDisplayPreference,
  onHighContrast,
  onLockPocket,
  onPreviewLock,
  onReducedMotion,
  onReplayStartup,
  onResetPreferences,
  onResetSession,
  onSound,
  preferences,
}: PreferencePanelProps) {
  const updateDisplay = (event: ChangeEvent<HTMLSelectElement>) => {
    onDisplayPreference(event.currentTarget.value as DisplayPreference);
  };

  return (
    <section aria-labelledby="preference-heading" className={styles.panel}>
      <div>
        <p className={styles.eyebrow}>Local controls</p>
        <h2 id="preference-heading">Live OS preferences</h2>
        <p className={styles.intro}>
          Real controls come first. Fictional system details stay clearly secondary.
        </p>
      </div>

      <SurfaceRecessed className={styles.controls}>
        <label className={styles.row}>
          <span>
            <strong>Sound feedback</strong>
            <small>Off by default and never autoplayed.</small>
          </span>
          <input checked={preferences.soundEnabled} onChange={(event) => onSound(event.currentTarget.checked)} type="checkbox" />
        </label>
        <label className={styles.row}>
          <span>
            <strong>Extra reduced motion</strong>
            <small>{effectiveReducedMotion ? "Reduced motion is currently effective." : "Short tactile transitions remain enabled."}</small>
          </span>
          <input checked={preferences.extraReducedMotion} onChange={(event) => onReducedMotion(event.currentTarget.checked)} type="checkbox" />
        </label>
        <label className={styles.row}>
          <span>
            <strong>High contrast</strong>
            <small>Flattens shadows and reinforces boundaries.</small>
          </span>
          <input checked={preferences.highContrast} onChange={(event) => onHighContrast(event.currentTarget.checked)} type="checkbox" />
        </label>
        <label className={styles.selectRow}>
          <span>Preferred presentation</span>
          <select onChange={updateDisplay} value={preferences.displayPreference}>
            <option value="auto">Automatic</option>
            <option value="desktop">Desktop OS</option>
            <option value="pocket">Pocket OS</option>
            <option value="normal">Normal View</option>
          </select>
        </label>
      </SurfaceRecessed>

      <section className={styles.group} aria-labelledby="pocket-system-heading">
        <div>
          <h3 id="pocket-system-heading">Pocket system</h3>
          <p>These actions are reversible and return to the root route.</p>
        </div>
        <div className={styles.actionGrid}>
          <Button onClick={onLockPocket}>Lock Pocket OS</Button>
          <Button onClick={onPreviewLock}>Preview lock screen</Button>
          <Button onClick={onReplayStartup}>Replay startup</Button>
          <Button onClick={() => onDisplayPreference("normal")}>Open Normal View</Button>
        </div>
      </section>

      <section className={styles.personality} aria-label="System personality settings">
        <div><span>Focus mode</span><strong>Build Mode</strong></div>
        <div><span>Screen time</span><strong>Renaming files: elevated</strong></div>
        <div><span>Build information</span><strong>Dusk system / route-driven</strong></div>
      </section>

      <div className={styles.resetActions}>
        <Button onClick={onResetPreferences}>Reset preferences</Button>
        <Button onClick={onResetSession}>Reset Pocket session</Button>
      </div>
    </section>
  );
}
