"use client";

import type { ChangeEvent } from "react";

import { Button, SurfaceRecessed } from "@/components/ui";
import type { DisplayPreference, Preferences } from "@/state";

import styles from "./PreferencePanel.module.css";

type PreferencePanelProps = {
  effectiveReducedMotion: boolean;
  onDisplayPreference: (preference: DisplayPreference) => void;
  onHighContrast: (enabled: boolean) => void;
  onReducedMotion: (enabled: boolean) => void;
  onResetPreferences: () => void;
  onResetSession: () => void;
  onSound: (enabled: boolean) => void;
  preferences: Preferences;
};

export function PreferencePanel({
  effectiveReducedMotion,
  onDisplayPreference,
  onHighContrast,
  onReducedMotion,
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
          These settings stay on this device. Dusk is the sole decorative V1
          theme.
        </p>
      </div>

      <SurfaceRecessed className={styles.controls}>
        <label className={styles.row}>
          <span>
            <strong>Sound feedback</strong>
            <small>Off by default; never autoplays.</small>
          </span>
          <input
            checked={preferences.soundEnabled}
            onChange={(event) => onSound(event.currentTarget.checked)}
            type="checkbox"
          />
        </label>
        <label className={styles.row}>
          <span>
            <strong>Extra reduced motion</strong>
            <small>
              {effectiveReducedMotion
                ? "Reduced motion is currently effective."
                : "Short tactile transitions remain enabled."}
            </small>
          </span>
          <input
            checked={preferences.extraReducedMotion}
            onChange={(event) => onReducedMotion(event.currentTarget.checked)}
            type="checkbox"
          />
        </label>
        <label className={styles.row}>
          <span>
            <strong>High contrast</strong>
            <small>Flattens shadows and reinforces boundaries.</small>
          </span>
          <input
            checked={preferences.highContrast}
            onChange={(event) => onHighContrast(event.currentTarget.checked)}
            type="checkbox"
          />
        </label>
        <label className={styles.selectRow}>
          <span>Preferred presentation</span>
          <select
            onChange={updateDisplay}
            value={preferences.displayPreference}
          >
            <option value="auto">Automatic</option>
            <option value="desktop">Desktop OS</option>
            <option value="pocket">Pocket OS</option>
            <option value="normal">Normal View</option>
          </select>
        </label>
      </SurfaceRecessed>

      <div className={styles.resetActions}>
        <Button onClick={onResetPreferences}>Reset preferences</Button>
        <Button onClick={onResetSession}>Reset session</Button>
      </div>
    </section>
  );
}
