"use client";

import {
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  ArrowClockwise,
} from "@phosphor-icons/react";
import {
  GameExit,
  GameFullscreen,
  useGamePresentation,
  useFullscreenPause,
} from "../GameHost";
import { useEffect, useRef, useState } from "react";
import { useDiscoveryService } from "@/components/os/DiscoveryServiceContext";
import { useSettings } from "@/components/os/SettingsContext";
import { useShellPresentation } from "@/components/os/ShellPresentationContext";
import { safeResolveStorage } from "@/lib/storage";
import { getAchievement } from "@/registry/achievements";
import { readGamesProgress, saveShitbirdProgress } from "../storage";
import type { GameEngine, GameSnapshot } from "./engine";
import { MAX_DIFFICULTY_SCORE } from "./model";
import { deathMessages, recordFlightProgress } from "./progress";
import styles from "./ShitbirdGame.module.css";

export function ShitbirdGame() {
  const service = useDiscoveryService();
  const settings = useSettings();
  const shell = useShellPresentation();
  const { enterFullscreen } = useGamePresentation();
  const [localSound, setLocalSound] = useState(false);
  const sound = settings?.preferences.soundEnabled ?? localSound;
  const toggleSound = () =>
    settings
      ? settings.dispatch({ type: "sound/set", enabled: !sound })
      : setLocalSound(!sound);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wellRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef({ reducedMotion: false, sound: false });
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    phase: "ready",
    score: 0,
    elapsed: 0,
  });
  const [best, setBest] = useState(0);
  const [hasFlown, setHasFlown] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [message, setMessage] = useState<string>(deathMessages[0]);
  const [awards, setAwards] = useState<string[]>([]);
  const [tooShort, setTooShort] = useState(false);
  const isPlaying = snapshot.phase === "playing";
  useFullscreenPause(() => engineRef.current?.pause());
  useEffect(() => {
    if (isPlaying) canvasRef.current?.focus({ preventScroll: true });
  }, [isPlaying]);

  useEffect(() => {
    const options = {
      reducedMotion: settings?.effectiveAccessibility.reducedMotion ?? false,
      sound,
    };
    optionsRef.current = options;
    engineRef.current?.configure(options);
  }, [settings?.effectiveAccessibility.reducedMotion, sound]);

  useEffect(() => {
    const well = wellRef.current,
      arena = arenaRef.current;
    if (!well || !arena) return;
    const resize = () => {
      const { width, height } = well.getBoundingClientRect();
      const scale = Math.min(width / 360, height / 540);
      arena.style.width = `${Math.floor(360 * scale)}px`;
      arena.style.height = `${Math.floor(540 * scale)}px`;
      const short = height < 300;
      setTooShort(short);
      engineRef.current?.pause();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(well);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let canceled = false;
    let engine: GameEngine | undefined;
    const storage = safeResolveStorage(() => window.localStorage);
    let progress = readGamesProgress(storage).shitbird;
    const earned = new Set<string>();
    let deathIndex = Math.floor(Math.random() * deathMessages.length);
    // Imports WebGL only on the game route, never during OS boot or Games browsing.
    import("./engine")
      .then(({ createShitbird }) => {
        if (canceled) return;
        setBest(progress.best);
        setHasFlown(progress.hasFlown);
        engine = createShitbird(
          canvas,
          (next) => {
            if (canceled) return;
            if (next.phase !== "ready") {
              for (const id of recordFlightProgress(service, next))
                earned.add(id);
              if (!progress.hasFlown || next.score > progress.best) {
                progress = saveShitbirdProgress(
                  storage,
                  Math.max(progress.best, next.score),
                ).shitbird;
                setBest(progress.best);
                setHasFlown(true);
              }
            }
            if (next.phase === "dead") {
              setMessage(deathMessages[deathIndex++ % deathMessages.length]);
              setAwards(
                [...earned]
                  .slice(-2)
                  .map((id) => getAchievement(id)?.title ?? id),
              );
              earned.clear();
            }
            setSnapshot(next);
          },
          (message) => {
            if (canceled) return;
            engine?.destroy();
            engineRef.current = null;
            setError(message);
            setReady(false);
          },
          () => {
            if (!canceled) setReady(true);
          },
        );
        engine.configure(optionsRef.current);
        engineRef.current = engine;
      })
      .catch((reason: unknown) => {
        if (!canceled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "The game could not load. Try reloading.",
          );
          setReady(false);
        }
      });
    return () => {
      canceled = true;
      engineRef.current = null;
      engine?.destroy();
    };
  }, [service, loadAttempt]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.closest("[data-desktop-window]")?.firstElementChild;
    if (
      document.hidden ||
      !document.hasFocus() ||
      (frame && !frame.hasAttribute("data-active"))
    )
      return;
    // Never steal focus back from OS chrome or another app on an automatic pause.
    if (
      canvas?.closest("[data-game]")?.contains(document.activeElement) &&
      (snapshot.phase === "dead" || snapshot.phase === "paused")
    ) {
      actionRef.current?.focus({ preventScroll: true });
    }
  }, [snapshot.phase]);

  const act = () => {
    if (!ready || tooShort) return;
    // Focus before the next state change so blur cannot pause the new flight.
    canvasRef.current?.focus({ preventScroll: true });
    engineRef.current?.act();
  };

  const start = async () => {
    if (!ready || tooShort) return;
    await enterFullscreen();
    requestAnimationFrame(() => requestAnimationFrame(act));
  };

  return (
    <section
      className={styles.game}
      data-route-content
      data-game="shitbird"
      data-phase={snapshot.phase}
      data-shell-mode={shell}
      aria-label="SHITBIRD arcade game"
    >
      <h1 className="sr-only" tabIndex={-1}>
        SHITBIRD
      </h1>
      <header className={styles.toolbar}>
        <GameExit onExit={() => engineRef.current?.pause()} />
        <span className={styles.wordmark}>SHITBIRD</span>
        <div className={styles.toolbarActions}>
          <button
            aria-label={`Turn sound ${sound ? "off" : "on"}`}
            aria-pressed={sound}
            onClick={toggleSound}
          >
            {sound ? <SpeakerHigh size={21} /> : <SpeakerSlash size={21} />}
          </button>
          <GameFullscreen />
          <button
            type="button"
            onClick={() => engineRef.current?.pause()}
            disabled={!isPlaying}
            aria-label="Pause SHITBIRD"
          >
            <Pause size={21} weight="fill" />
          </button>
        </div>
      </header>
      <div className={styles.well} ref={wellRef}>
        <div
          className={styles.arena}
          ref={arenaRef}
          inert={tooShort || Boolean(error)}
        >
          <canvas
            key={loadAttempt}
            ref={canvasRef}
            inert={!isPlaying}
            aria-label="SHITBIRD flight area. Space or tap to flap. P or Escape to pause."
            aria-describedby="shitbird-instructions"
          />
          <div className={styles.flightHeader} aria-hidden="true">
            <span>DEAD COAST</span>
            <small>UNLICENSED AIRSPACE / 001</small>
          </div>
          <div className={styles.flightFooter} aria-hidden="true">
            PLEASE DO NOT FEED THE EGO
          </div>
          {ready && snapshot.phase !== "ready" ? (
            <div className={styles.hud} aria-label="Flight score">
              <div>
                <span>SCORE</span>
                <strong data-testid="shitbird-score">
                  {snapshot.score.toString().padStart(2, "0")}
                </strong>
              </div>
              <div>
                <span>BEST</span>
                <b data-testid="shitbird-best">
                  {best.toString().padStart(2, "0")}
                </b>
                {snapshot.score >= MAX_DIFFICULTY_SCORE ? (
                  <small>MAX HEAT</small>
                ) : null}
              </div>
            </div>
          ) : null}
          {snapshot.phase === "ready" && !error ? (
            <div className={styles.titleScreen}>
              <div className={styles.titleCopy}>
                <p>
                  WEST COSE <span>ORIGINAL Nº 001</span>
                </p>
                <h2 aria-label="SHITBIRD">
                  <svg viewBox="0 0 600 154" aria-hidden="true">
                    <defs>
                      <path
                        id="shitbird-title-arc"
                        d="M 24,131 Q 300,30 576,131"
                      />
                    </defs>
                    <text>
                      <textPath
                        href="#shitbird-title-arc"
                        startOffset="50%"
                        textAnchor="middle"
                        textLength="561"
                        lengthAdjust="spacingAndGlyphs"
                      >
                        SHITBIRD
                      </textPath>
                    </text>
                  </svg>
                </h2>
                <em>One bird. No prospects.</em>
              </div>
              <div className={styles.startCopy}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={!ready || tooShort}
                  onClick={() => void start()}
                >
                  {ready ? (
                    <>
                      <Play size={20} weight="fill" /> Start game
                    </>
                  ) : (
                    "Loading the coast…"
                  )}
                </button>
                <p>
                  {hasFlown
                    ? `Personal best: ${best}.`
                    : "Tap or press Space to flap. Miss the poles."}
                </p>
              </div>
            </div>
          ) : null}
          {(snapshot.phase === "dead" || snapshot.phase === "paused") &&
          !error ? (
            <div className={styles.overlay}>
              <div className={styles.panel}>
                <p className={styles.eyebrow}>
                  {snapshot.phase === "dead"
                    ? "FLIGHT REPORT / FILED IN BIN"
                    : "UNSCHEDULED SHORE LEAVE"}
                </p>
                <h2>
                  {snapshot.phase === "dead"
                    ? "Grounded."
                    : "Hold that thought."}
                </h2>
                <p role="status">
                  {snapshot.phase === "dead"
                    ? message
                    : "Your bad decisions can wait. Resume gives you a flap."}
                </p>
                {snapshot.phase === "dead" ? (
                  <div className={styles.results}>
                    <span>
                      THIS DISASTER <strong>{snapshot.score}</strong>
                    </span>
                    <span>
                      PERSONAL BEST <strong>{best}</strong>
                    </span>
                  </div>
                ) : null}
                <button
                  ref={actionRef}
                  className={styles.primary}
                  type="button"
                  disabled={tooShort}
                  onClick={snapshot.phase === "dead" ? () => void start() : act}
                >
                  {snapshot.phase === "dead" ? (
                    <>
                      <ArrowClockwise size={19} /> Play again
                    </>
                  ) : (
                    <>
                      <Play size={19} weight="fill" /> Resume flight
                    </>
                  )}
                </button>
                {snapshot.phase === "dead" && awards.length ? (
                  <p className={styles.awards}>
                    Filed under: {awards.join(" / ")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        {tooShort ? (
          <div className={styles.sizeNotice} role="status">
            <strong>A little more airspace.</strong>
            <p>
              {shell === "pocket"
                ? "Turn your phone upright to fly."
                : "Make the screen taller to fly."}
            </p>
          </div>
        ) : null}
        {error ? (
          <div className={styles.sizeNotice} role="alert">
            <strong>Bird failed to materialize.</strong>
            <p>{error}</p>
            <button
              className={styles.primary}
              type="button"
              onClick={() => {
                setError(null);
                setLoadAttempt((value) => value + 1);
              }}
            >
              Reload game
            </button>
          </div>
        ) : null}
      </div>
      <footer className={styles.footer} id="shitbird-instructions">
        <span>
          {shell === "pocket"
            ? "TAP THE FLIGHT AREA TO FLAP"
            : "SPACE / CLICK TO FLAP · P TO PAUSE"}
        </span>
        <span>ONE BIRD. NO PROSPECTS.</span>
      </footer>
    </section>
  );
}
