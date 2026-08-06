"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui";

import styles from "./PocketStartup.module.css";

interface PocketStartupProps {
  readonly normalViewHref?: string;
  readonly onComplete: () => void;
  readonly reducedMotion: boolean;
}

export function PocketStartup({
  normalViewHref,
  onComplete,
  reducedMotion,
}: PocketStartupProps) {
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
            WestCose Pocket OS
          </h1>
          <p>Checking routes and unfinished business</p>
        </div>
        <div
          aria-label="Starting Pocket OS"
          aria-valuetext="Loading"
          className={styles.progress}
          role="progressbar"
        />
        <Button onClick={onComplete}>Skip startup</Button>
        {normalViewHref ? (
          <ButtonLink href={normalViewHref}>Open Normal View</ButtonLink>
        ) : null}
      </div>
    </main>
  );
}
