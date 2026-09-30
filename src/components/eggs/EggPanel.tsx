"use client";

import { Button, SurfaceRecessed } from "@/components/ui";
import {
  MEETING_LINES,
  PROCESS_PROGRESS,
  UPDATE_PROGRESS,
} from "@/lib/personality-eggs";
import { usePersonality } from "./PersonalityProvider";
import styles from "./Personality.module.css";

export function EggPanel() {
  const eggs = usePersonality();
  const panel = eggs?.panel;
  if (!panel) return null;
  if (panel.kind === "weekend")
    return (
      <div className={styles.panelBody} data-egg-panel="weekend">
        <p className={styles.eyebrow}>BACKGROUND PROCESS / SINCE A WHILE AGO</p>
        <h3>weekend-project</h3>
        <p>Basically done</p>
        <div className={styles.progressHeader}>
          <span>Progress</span>
          <strong>{PROCESS_PROGRESS[panel.step]}%</strong>
        </div>
        <progress
          aria-label="Weekend project progress"
          max="100"
          value={PROCESS_PROGRESS[panel.step]}
        />
        <dl className={styles.stats}>
          <div>
            <dt>Runtime</dt>
            <dd>438 days</dd>
          </div>
          <div>
            <dt>CPU</dt>
            <dd>104%</dd>
          </div>
          <div>
            <dt>Memory</dt>
            <dd>Don’t worry about it.</dd>
          </div>
        </dl>
        <p className={styles.footnote}>
          The remaining 1% has become load-bearing.
        </p>
      </div>
    );
  if (panel.kind === "meeting")
    return (
      <div className={styles.panelBody} data-egg-panel="meeting">
        <p className={styles.eyebrow}>WESTCOSE / QUICK SYNC</p>
        <div
          className={styles.attendees}
          role="group"
          aria-label={
            panel.step >= 7 ? "No participants remaining" : "5 participants"
          }
          data-left={panel.step >= 7}
        >
          {["C", "C", "C", "C", "You"].map((label, i) => (
            <span key={i} aria-hidden={panel.step >= 7 || undefined}>
              {label}
              <small>{i === 4 ? "muted" : "also muted"}</small>
            </span>
          ))}
        </div>
        <SurfaceRecessed className={styles.meetingLine}>
          <p aria-live="polite">{MEETING_LINES[panel.step]}</p>
        </SurfaceRecessed>
        <p className={styles.footnote}>
          {panel.step === 8
            ? "Nothing was decided."
            : "Agenda: to be discussed."}
        </p>
        {panel.step >= 7 && (
          <Button onClick={eggs.closePanel}>Leave meeting</Button>
        )}
      </div>
    );
  const done = panel.step >= 8;
  return (
    <div className={styles.panelBody} data-egg-panel="update">
      <p className={styles.eyebrow}>WESTCOSE OS UPDATE</p>
      <h3 aria-live="polite" aria-atomic="true">
        {panel.step === 9
          ? "Client requested another revision."
          : done
            ? "Update complete."
            : "Installing one small change…"}
      </h3>
      <div className={styles.progressHeader}>
        <span>
          {done ? "All changes installed" : "Please lower your expectations"}
        </span>
        <strong>{done ? 100 : UPDATE_PROGRESS[panel.step]}%</strong>
      </div>
      <progress
        aria-label="WestCose update progress"
        max="100"
        value={done ? 100 : UPDATE_PROGRESS[panel.step]}
      />
      {panel.step === 9 ? (
        <Button onClick={eggs.closePanel} tone="primary">
          OF COURSE
        </Button>
      ) : (
        <p className={styles.footnote}>
          You can close this. It has no authority here.
        </p>
      )}
    </div>
  );
}
