"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { useDiscoveryService } from "@/components/os/DiscoveryServiceContext";
import { personalityRegistry } from "@/registry";

import styles from "./InteractiveApps.module.css";

export function RecycleExplorer() {
  const discoveryService = useDiscoveryService();
  const [restoredIds, setRestoredIds] = useState<readonly string[]>([]);
  const [message, setMessage] = useState("");

  return (
    <section aria-label="Recently deleted ideas" className={styles.archive}>
      {personalityRegistry.recycleFiles.map((file) => {
        const restored = restoredIds.includes(file.id);
        return (
          <article className={styles.archiveRow} key={file.id}>
            <span>
              <strong>{file.name}</strong>
              <small>{restored ? "Restored to Questionable Ideas" : file.note}</small>
            </span>
            <Button
              disabled={restored}
              onClick={() => {
                setRestoredIds((ids) => [...ids, file.id]);
                setMessage(personalityRegistry.discoveries.recycleRestore);
                discoveryService?.recordRecycleRestoration(file.id);
                discoveryService?.incrementCounter("recycleRestorations");
                discoveryService?.recordDiscovery(
                  "recycle.first-restoration",
                );
              }}
            >
              {restored ? "Restored" : "Restore"}
            </Button>
          </article>
        );
      })}
      <p aria-live="polite" className={styles.feedback}>{message}</p>
    </section>
  );
}
