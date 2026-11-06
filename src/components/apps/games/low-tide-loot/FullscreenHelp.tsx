"use client";

import { useEffect, useRef, useState } from "react";
import { Export } from "@phosphor-icons/react";
import styles from "./LowTideLoot.module.css";

export function FullscreenHelp({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [ios] = useState(() => /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.showModal();
    return () => {
      node?.close();
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog ref={dialog} className={styles.fullscreenHelp} aria-labelledby="fullscreen-help-title"
      onClose={onClose} onCancel={onClose} onKeyDown={event => event.stopPropagation()}>
      <p className={styles.eyebrow}>MORE ROOM TO PLAY</p>
      <h2 id="fullscreen-help-title">{ios ? "Give the beach its own screen." : "Keep the beach open."}</h2>
      {ios ? <>
        <p>Safari may keep its bars visible. Add LOW TIDE LOOT to your Home Screen to play without them.</p>
        <ol>
          <li>In Safari, open <b>Share</b> <Export size={16} aria-hidden="true" />.</li>
          <li>Choose <b>Add to Home Screen</b>. Turn on <b>Open as Web App</b> if shown, then tap <b>Add</b>.</li>
          <li>Open the new icon and turn your phone sideways.</li>
        </ol>
        <p className={styles.helpNote}>The Home Screen app starts a new session. Your current haul stays in this tab.</p>
      </> : <p>Your browser couldn’t enter full screen. You can use its full-screen command, or keep playing here — the beach adapts to the available space.</p>}
      <button className={styles.primary} onClick={onClose}>Keep playing in browser</button>
    </dialog>
  );
}
