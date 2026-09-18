"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";
import { useAppearance } from "@/components/os/AppearanceContext";

import styles from "./PocketStartup.module.css";

interface PocketStartupProps {
  readonly onComplete: () => void;
  readonly reducedMotion: boolean;
}

export function PocketStartup({
  onComplete,
  reducedMotion,
}: PocketStartupProps) {
  const { theme } = useAppearance();
  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const timeout = window.setTimeout(onComplete, 1200);
    return () => window.clearTimeout(timeout);
  }, [onComplete, reducedMotion]);

  return (
    <main aria-labelledby="pocket-startup-title" className={styles.startup}>
      <div className={styles.sequence}>
        <div aria-hidden="true" className={styles.mark}>
          WCL
        </div>
        <div className={styles.copy}>
          <h1 className="type-headline-sm" id="pocket-startup-title">
            {theme.copy?.startupTitle ?? "WestCose Pocket OS"}
          </h1>
          <p>{theme.copy?.startupStatus ?? "Checking routes and unfinished business"}</p>
        </div>
        <div
          aria-label="Starting Pocket OS"
          aria-valuetext="Loading"
          className={styles.progress}
          role="progressbar"
        />
        <Button onClick={onComplete}>Skip startup</Button>
      </div>
    </main>
  );
}
