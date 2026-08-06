"use client";

import { CaretRight, LockSimple, X } from "@phosphor-icons/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, ButtonLink, IconButton } from "@/components/ui";

import styles from "./PocketLockScreen.module.css";
import type { PocketNotificationItem } from "./types";

interface PocketLockScreenProps {
  readonly normalViewHref?: string;
  readonly notifications: readonly PocketNotificationItem[];
  readonly onDismissNotification: (notificationId: string) => void;
  readonly onUnlock: () => void;
}

function useClock() {
  const [clock, setClock] = useState({
    date: "Pocket OS",
    time: "09:09",
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        date: new Intl.DateTimeFormat(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(now),
        time: new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(now),
      });
    };

    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return clock;
}

export function PocketLockScreen({
  normalViewHref,
  notifications,
  onDismissNotification,
  onUnlock,
}: PocketLockScreenProps) {
  const clock = useClock();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const pointerStartRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const latestXRef = useRef(0);

  const renderPosition = (position: number, progress: number) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    track.style.setProperty("--unlock-progress", String(progress));
    thumb.style.setProperty("--unlock-x", `${position}px`);
  };

  const reset = () => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    track?.style.removeProperty("--unlock-progress");
    thumb?.style.removeProperty("--unlock-x");
    pointerStartRef.current = null;
    latestXRef.current = 0;
  };

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (pointerStartRef.current === null || !track || !thumb) return;

    const travel = Math.max(
      1,
      track.clientWidth - thumb.offsetWidth - thumb.offsetLeft * 2,
    );
    const progress = latestXRef.current / travel;
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
    pointerStartRef.current = null;

    if (progress >= 0.68) {
      renderPosition(travel, 1);
      onUnlock();
    } else {
      reset();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (pointerStartRef.current === null || !track || !thumb) return;

    const travel = Math.max(
      1,
      track.clientWidth - thumb.offsetWidth - thumb.offsetLeft * 2,
    );
    latestXRef.current = Math.min(
      travel,
      Math.max(0, event.clientX - pointerStartRef.current),
    );

    if (!frameRef.current) {
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        renderPosition(latestXRef.current, latestXRef.current / travel);
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onUnlock();
    }
  };

  useEffect(
    () => () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <main aria-labelledby="lock-time" className={styles.lock}>
      <div className={styles.clock}>
        <p className={styles.identity}>
          <span aria-hidden="true"><LockSimple weight="duotone" /></span>
          WestCose Pocket
        </p>
        <h1 className={styles.time} id="lock-time">
          {clock.time}
        </h1>
        <p className={styles.date}>{clock.date}</p>
        {normalViewHref ? (
          <ButtonLink href={normalViewHref}>Open Normal View</ButtonLink>
        ) : null}
      </div>

      <div aria-label="Notifications" className={styles.notifications}>
        {notifications.slice(0, 2).map((notification) => (
          <article className={styles.notification} key={notification.id}>
            <div className={styles.notificationCopy}>
              <p className={styles.notificationSource}>
                {notification.appLabel}
              </p>
              <p className={styles.notificationTitle}>{notification.title}</p>
              <p className={styles.notificationBody}>{notification.body}</p>
            </div>
            <IconButton
              label={`Dismiss ${notification.title}`}
              onClick={() => onDismissNotification(notification.id)}
            >
              <X aria-hidden="true" weight="bold" />
            </IconButton>
          </article>
        ))}
      </div>

      <div className={styles.unlockRegion}>
        <div className={styles.unlockTrack} ref={trackRef}>
          <div aria-hidden="true" className={styles.unlockFill} />
          <span className={styles.unlockLabel} id="unlock-instructions">
            Slide to unlock
          </span>
          <button
            aria-describedby="unlock-instructions"
            aria-label="Slide to unlock, or press Enter"
            className={styles.unlockThumb}
            onKeyDown={handleKeyDown}
            onPointerCancel={reset}
            onPointerDown={(event) => {
              pointerStartRef.current = event.clientX;
              latestXRef.current = 0;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={finish}
            ref={thumbRef}
            type="button"
          >
            <CaretRight aria-hidden="true" size={24} weight="bold" />
          </button>
        </div>
        <Button fullWidth onClick={onUnlock} tone="primary">
          Tap to unlock
        </Button>
      </div>
    </main>
  );
}
