"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui";
import { personalityRegistry } from "@/registry";

import styles from "./InteractiveApps.module.css";

export function FightClubLauncher() {
  const [message, setMessage] = useState("");

  return (
    <section aria-label="FightClub launcher" className={styles.launcher}>
      <div className={styles.launcherArt}>
        <Image
          alt="Concept cover art of a worn boxing glove inside a graphite arcade cabinet"
          fill
          priority
          sizes="(max-width: 44rem) 100vw, 55vw"
          src="/images/projects/fightclub-concept-cover.webp"
        />
        <span>Concept cover art</span>
      </div>
      <div className={styles.launcherPanel}>
        <p className="route-card__index">Development launcher</p>
        <h2>Build unavailable</h2>
        <p>
          The presentation boundary is ready. A Play action will appear only
          after a build, controls, and release status are verified.
        </p>
        <div className={styles.launcherActions}>
          <Button disabled tone="primary">Play unavailable</Button>
          <Button
            onClick={() =>
              setMessage(personalityRegistry.discoveries.fightclubUninstall)
            }
            tone="danger"
          >
            Uninstall
          </Button>
        </div>
        <p aria-live="polite" className={styles.feedback}>{message}</p>
      </div>
    </section>
  );
}
