"use client";

import { useId, useRef, useState } from "react";

import { Button, SurfaceRecessed } from "@/components/ui";
import { useEvasiveControl } from "@/components/ui/useEvasiveControl";
import { usePersonality } from "@/components/eggs/PersonalityProvider";

import styles from "./DoNotOpen.module.css";

const REACTIONS = [
  "I have a terrible feeling about you.",
  "Missed me. Emotionally, I'm thriving.",
  "Have you considered literally any other hobby?",
  "Fine. But you're their parent now.",
];
const BUTTON_ASIDES = ["Seriously. Don't.", "Nope. Nice try.", "I'm telling IT.", "My cardio ends here."];
const DODGES = 3;

function DangerousButton() {
  const eggs = usePersonality();
  const bounds = useRef<HTMLDivElement>(null);
  const [dodges, setDodges] = useState(0);
  const reactionId = useId();
  const control = useEvasiveControl({
    containerRef: bounds,
    reducedMotion: eggs?.reducedMotion,
    distance: 230,
    maxEvasions: DODGES,
    touchEvasions: DODGES,
    maxTotalEvasions: DODGES,
    onEvade: setDodges,
    fleePointer: true,
    onActivate: () => {
      const rect = bounds.current?.querySelector("button")?.getBoundingClientRect();
      eggs?.startOutbreak({
        x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
        y: (rect?.top ?? 0) + (rect?.height ?? 0) / 2,
      });
    },
  });
  return (
    <div className={styles.experiment} data-dodges={dodges}>
      <div ref={bounds} className={styles.buttonBounds} data-evasion-arena>
        <Button
          {...control}
          tone="danger"
          className={styles.danger}
          aria-label="DO NOT PRESS"
          aria-describedby={reactionId}
          data-quarantine-trigger
        >
          <span className={styles.buttonFace}>
            <svg className={styles.warning} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3 22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 9v5m0 2.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className={styles.buttonWords}>
              <strong>DO NOT PRESS</strong>
              <span>{BUTTON_ASIDES[dodges]}</span>
            </span>
          </span>
        </Button>
      </div>
      <div className={styles.reaction}>
        <p id={reactionId} aria-live="polite" aria-atomic="true">{REACTIONS[dodges]}</p>
        {!eggs?.reducedMotion && (
          <div className={styles.escapeMeter} aria-label={`${DODGES - dodges} escapes remaining`}>
            <span aria-hidden="true" className={styles.pips}>
              {Array.from({ length: DODGES }, (_, i) => <i key={i} data-spent={i < dodges} />)}
            </span>
            <span>{dodges === DODGES ? "Out of excuses" : `${DODGES - dodges} escapes left`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DoNotOpen() {
  const eggs = usePersonality();
  const active = eggs?.outbreak?.phase === "active" || eggs?.outbreak?.phase === "escaping";
  return (
    <SurfaceRecessed className={styles.panel} id="quarantine" data-quarantine-origin>
      <div className={styles.copy}>
        <div className={styles.fileHeading}>
          <strong>quarantine.zip</strong>
          <span className={styles.badge}>{active ? "UNCONTAINED" : "BAD IDEA"}</span>
        </div>
        <p>Eight tiny problems. Zero supervision.</p>
      </div>
      {active ? (
        <div className={styles.failed} role="status">
          <strong>WELL, FUCK.</strong>
          <p>Containment failed. The button literally said not to.</p>
          <Button onClick={eggs?.contain} disabled={eggs?.outbreak?.phase === "escaping"}>
            Contain outbreak
          </Button>
        </div>
      ) : <DangerousButton />}
    </SurfaceRecessed>
  );
}
