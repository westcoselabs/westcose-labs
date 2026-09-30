"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { useDiscoveryState } from "@/components/os/DiscoveryServiceContext";
import { usePersonality } from "@/components/eggs/PersonalityProvider";
import { FINAL_FILES, finalRevision } from "@/lib/personality-eggs";
import { personalityRegistry } from "@/registry";

import styles from "./InteractiveApps.module.css";

export function RecycleExplorer() {
  const discoveries = useDiscoveryState();
  const eggs = usePersonality();
  const [message, setMessage] = useState("");

  return (
    <section aria-label="Recently deleted ideas" className={styles.archive}>
      {personalityRegistry.recycleFiles.map((file) => {
        return (
          <article className={styles.archiveRow} key={file.id}>
            <span>
              <strong style={{ overflowWrap: "anywhere" }}>
                {file.id === "final-final"
                  ? FINAL_FILES[
                      finalRevision(discoveries?.recycleRestorationIds)
                    ]
                  : file.name}
              </strong>
              <small>{file.note}</small>
            </span>
            <Button
              aria-label={`Restore ${file.id === "final-final" ? "final-final file" : file.name}`}
              onClick={() => {
                setMessage(
                  eggs?.restoreFile(file.id) ??
                    "Restored. The idea remains questionable.",
                );
              }}
            >
              Restore
            </Button>
          </article>
        );
      })}
      <p aria-live="polite" className={styles.feedback}>
        {message}
      </p>
    </section>
  );
}
