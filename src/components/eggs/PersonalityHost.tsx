"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { X, ShieldWarning } from "@phosphor-icons/react";
import { Button, IconButton, SurfaceFloating } from "@/components/ui";
import { EGG_PANEL_TITLES, OUTBREAK_ALERTS } from "@/lib/personality-eggs";
import { EggPanel } from "./EggPanel";
import { usePersonality } from "./PersonalityProvider";
import styles from "./Personality.module.css";

const CreatureField = dynamic(() => import("./CreatureField"), { ssr: false });

export function PersonalityHost({
  shell,
}: {
  shell: "desktop" | "pocket" | "normal";
}) {
  const eggs = usePersonality();
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const cleanupRef = useRef<HTMLButtonElement>(null);
  const panelId = eggs?.panel?.id;
  const outbreakId = eggs?.outbreak?.id;
  useEffect(() => {
    if (shell !== "desktop" && panelId) mobileCloseRef.current?.focus();
  }, [panelId, shell]);
  useEffect(() => {
    // Activating quarantine replaces its trigger; keep the immediate exit in
    // the keyboard flow. Later alerts never take focus away from navigation.
    if (outbreakId && document.activeElement === document.body) {
      cleanupRef.current?.focus({ preventScroll: true });
    }
  }, [outbreakId]);
  if (!eggs) return null;
  const { outbreak, panel } = eggs;
  const active = outbreak?.phase === "active";
  const alerts = active
    ? outbreak.alerts
        .slice(0, outbreak.shown)
        .filter((id) => !outbreak.dismissed.includes(id))
    : [];
  const visibleAlerts = alerts.slice(0, shell === "desktop" ? 3 : 1);
  return (
    <>
      {outbreak && outbreak.phase !== "restored" && (
        <CreatureField outbreak={outbreak} reducedMotion={eggs.reducedMotion} />
      )}
      <div
        className={styles.host}
        data-egg-host
        data-mobile={shell !== "desktop"}
      >
        {active && (
          <aside
            className={styles.pestControl}
            aria-label="WestCose Pest Control"
          >
            <SurfaceFloating
              className={outbreak.cleanupReady ? styles.pestCard : styles.pestIdle}
            >
              <div hidden={!outbreak.cleanupReady}>
                <p className={styles.eyebrow}>
                  <ShieldWarning aria-hidden="true" size={18} /> WESTCOSE PEST
                  CONTROL
                </p>
                <p>Containment is technically possible.</p>
              </div>
              <Button
                buttonRef={cleanupRef}
                onClick={eggs.contain}
                tone={outbreak.cleanupReady ? "danger" : "secondary"}
                className={outbreak.cleanupReady ? undefined : styles.earlyCleanup}
                data-outbreak-control
              >
                {outbreak.cleanupReady ? "GET THESE FUCKERS OUT" : "Contain outbreak"}
              </Button>
            </SurfaceFloating>
          </aside>
        )}
        {visibleAlerts.length > 0 && (
          <div className={styles.alerts} aria-label="WestCose system alerts">
            {visibleAlerts.map((id) => (
              <SurfaceFloating
                as="section"
                className={styles.alert}
                key={`${outbreak?.id}-${id}`}
                data-egg-alert
              >
                <header>
                  <strong>{OUTBREAK_ALERTS[id].title}</strong>
                  <IconButton
                    label={`Dismiss ${OUTBREAK_ALERTS[id].title}`}
                    onClick={() => eggs.dismissAlert(id)}
                  >
                    <X size={18} />
                  </IconButton>
                </header>
                <p>{OUTBREAK_ALERTS[id].body}</p>
              </SurfaceFloating>
            ))}
            {alerts.length > visibleAlerts.length && (
              <small className={styles.queued}>
                {alerts.length - visibleAlerts.length} more questionable notices
              </small>
            )}
          </div>
        )}
        {panel && shell !== "desktop" && (
          <SurfaceFloating
            as="section"
            className={styles.mobilePanel}
            aria-label={EGG_PANEL_TITLES[panel.kind]}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                eggs.closePanel();
              }
            }}
          >
            <header className={styles.panelTitle}>
              <strong>{EGG_PANEL_TITLES[panel.kind]}</strong>
              <IconButton
                buttonRef={mobileCloseRef}
                label={`Close ${EGG_PANEL_TITLES[panel.kind]}`}
                onClick={eggs.closePanel}
              >
                <X size={18} />
              </IconButton>
            </header>
            <EggPanel />
          </SurfaceFloating>
        )}
        {eggs.toast && (
          <SurfaceFloating className={styles.toast}>
            <p role="status">{eggs.toast}</p>
            <IconButton
              label="Dismiss notification"
              onClick={eggs.dismissToast}
            >
              <X size={18} />
            </IconButton>
          </SurfaceFloating>
        )}
      </div>
    </>
  );
}
