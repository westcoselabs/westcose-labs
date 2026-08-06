"use client";

import { useState } from "react";

import { Button, SurfaceRecessed } from "@/components/ui";

import styles from "./DoNotOpen.module.css";

export function DoNotOpen() {
  const [opened, setOpened] = useState(false);

  if (!opened) {
    return (
      <Button onClick={() => setOpened(true)} tone="danger">
        Do not open definitely-not-a-theme.zip
      </Button>
    );
  }

  return (
    <SurfaceRecessed className={styles.panel}>
      <div className={styles.copy}>
        <strong>Nothing escaped.</strong>
        <p aria-live="polite">
          The archive contains one suspiciously enthusiastic drop shadow and a
          note that says “ship Dusk first.”
        </p>
      </div>
      <Button onClick={() => setOpened(false)}>Return it to Recycle</Button>
    </SurfaceRecessed>
  );
}
