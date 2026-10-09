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
import { readGamesProgress, saveShitbirdRun, saveShitbirdSkin } from "../storage";
import type { GameEngine, GameOptions, GameSnapshot } from "./engine";
import { COASTS, coastIndex, comboMultiplier, createFlight, dailyId, validDailyId, type BirdSkin } from "./model";
import { BIRDS, deathMessage, emptyShitbirdProgress, nextGoal, recordFlightProgress, shareFlight } from "./progress";
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
  const optionsRef = useRef<GameOptions>({ reducedMotion: false, sound: false, skin: "gull", daily: null, best: 0 });
  const [snapshot, setSnapshot] = useState<GameSnapshot>(createFlight);
  const [progress, setProgress] = useState(emptyShitbirdProgress);
  const progressRef = useRef(progress);
  const [mode, setMode] = useState<"free" | "daily">("free");
  const [day, setDay] = useState("");
  const [hangarOpen, setHangarOpen] = useState(false);
  const hangarRef = useRef<HTMLDivElement>(null);
  const hangarTrigger = useRef<HTMLButtonElement | null>(null);
  const [record, setRecord] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [shareText, setShareText] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [message, setMessage] = useState("");
  const [awards, setAwards] = useState<string[]>([]);
  const [tooShort, setTooShort] = useState(false);
  const isPlaying = snapshot.phase === "playing";
  const best = progress.best;
  const displayedDay = snapshot.phase === "ready" ? day : snapshot.daily ?? day;
  const dailyBest = progress.daily[displayedDay];
  useFullscreenPause(() => engineRef.current?.pause());
  useEffect(() => {
    if (isPlaying) canvasRef.current?.focus({ preventScroll: true });
  }, [isPlaying]);

  useEffect(() => {
    const options = {
      reducedMotion: settings?.effectiveAccessibility.reducedMotion ?? false,
      sound,
      skin: progress.skin,
      daily: mode === "daily" ? day : null,
      best: mode === "daily" ? progress.daily[day]?.score ?? 0 : progress.best,
    };
    optionsRef.current = options;
    engineRef.current?.configure(options);
  }, [settings?.effectiveAccessibility.reducedMotion, sound, progress, mode, day]);

  useEffect(() => {
    const refresh = () => {
      const requested = new URLSearchParams(window.location.search).get("daily");
      setDay(validDailyId(requested) ? requested : dailyId());
    };
    const timer = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hangarOpen) hangarRef.current?.focus();
    else hangarTrigger.current?.focus();
  }, [hangarOpen]);

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
    let saved = readGamesProgress(storage).shitbird;
    const earned = new Set<string>();
    let deathIndex = 0;
    let previousPhase = "ready";
    let baseline = { score: saved.best, bonus: saved.bestBonus };
    // Imports WebGL only on the game route, never during OS boot or Games browsing.
    import("./engine")
      .then(({ createShitbird }) => {
        if (canceled) return;
        const requested = new URLSearchParams(window.location.search).get("daily");
        setDay(validDailyId(requested) ? requested : dailyId());
        if (validDailyId(requested)) setMode("daily");
        progressRef.current = saved;
        setProgress(saved);
        engine = createShitbird(
          canvas,
          (next) => {
            if (canceled) return;
            if (next.phase === "playing" && (previousPhase === "ready" || previousPhase === "dead")) {
              saved = progressRef.current;
              baseline = next.daily ? { score: saved.daily[next.daily]?.score ?? 0, bonus: saved.daily[next.daily]?.bonus ?? 0 } : { score: saved.best, bonus: saved.bestBonus };
              earned.clear(); setRecord(""); setShareStatus(""); setShareText("");
            }
            if (next.phase !== "ready") {
              for (const id of recordFlightProgress(service, next))
                earned.add(id);
              const before = progressRef.current;
              saved = saveShitbirdRun(storage, next, before);
              for (const bird of BIRDS) if (bird.unlocked(saved) && !bird.unlocked(before)) earned.add(`Unlocked: ${bird.name}`);
              progressRef.current = saved;
              setProgress(saved);
            }
            if (next.phase === "dead") {
              setMessage(deathMessage(next.deathCause, deathIndex++));
              setRecord(next.score > baseline.score ? `New ${next.daily ? "daily" : "personal"} best! +${next.score - baseline.score} poles` :
                next.bonus > baseline.bonus ? `New mischief best! +${next.bonus - baseline.bonus} points` : "");
              setAwards(
                [...earned]
                  .slice(-3)
                  .map((id) => getAchievement(id)?.title ?? id),
              );
              earned.clear();
            }
            previousPhase = next.phase;
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
        engine.configure({ ...optionsRef.current, skin: saved.skin, best: saved.best });
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

  const chooseSkin = (skin: BirdSkin) => {
    const next = saveShitbirdSkin(safeResolveStorage(() => window.localStorage), { ...progressRef.current, skin });
    progressRef.current = next; setProgress(next);
  };
  const closeHangar = () => setHangarOpen(false);
  const openHangar = (button: HTMLButtonElement) => { hangarTrigger.current = button; setHangarOpen(true); };
  const copyResult = async () => {
    const text = shareFlight(snapshot, window.location.origin);
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Result copied. Send it to your flock.");
    } catch {
      setShareText(text); setShareStatus("Select and copy your result below.");
    }
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
      <header className={styles.toolbar} inert={hangarOpen}>
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
                <span>POLES</span>
                <strong data-testid="shitbird-score">
                  {snapshot.score.toString().padStart(2, "0")}
                </strong>
              </div>
              <div>
                <span>{snapshot.daily ? "DAILY" : "BEST"}</span>
                <b data-testid="shitbird-best">
                  {(snapshot.daily ? dailyBest?.score ?? 0 : best).toString().padStart(2, "0")}
                </b>
              </div>
              <div><span>MISCHIEF</span><b data-testid="shitbird-bonus">{snapshot.bonus}</b><small data-testid="shitbird-combo">x{comboMultiplier(snapshot.combo)}</small>
              </div>
            </div>
          ) : null}
          {ready && snapshot.phase !== "ready" ? <div className={styles.coastBar} aria-label="Current coast">
            <span>{COASTS[coastIndex(snapshot.score)]}</span>
            <span>{snapshot.daily ? `DAILY ${snapshot.daily}` : snapshot.score >= 40 ? "MAX HEAT" : `${10 - snapshot.score % 10} TO NEXT DISTRICT`}</span>
          </div> : null}
          {snapshot.phase === "ready" && !error ? (
            <div className={styles.titleScreen} inert={hangarOpen}>
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
                <div className={styles.modeSwitch} role="group" aria-label="Flight mode">
                  <button type="button" aria-pressed={mode === "free"} onClick={() => setMode("free")}>Free flight</button>
                  <button type="button" aria-pressed={mode === "daily"} onClick={() => setMode("daily")}>Daily coast</button>
                </div>
                <p className={styles.howTo}>Tap / Space to flap. Fly through <strong>SHIT</strong> targets to drop automatically.</p>
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
                <p className={styles.goal}>{mode === "daily" ? `${day} · Same course for everyone. Best: ${progress.daily[day]?.score ?? 0} poles / ${progress.daily[day]?.bonus ?? 0} mischief.` : nextGoal(progress)}</p>
                <button className={styles.textButton} type="button" onClick={(e) => openHangar(e.currentTarget)}>Birds & missions · {BIRDS.filter((b) => b.unlocked(progress)).length}/4</button>
              </div>
            </div>
          ) : null}
          {(snapshot.phase === "dead" || snapshot.phase === "paused") &&
          !error ? (
            <div className={styles.overlay} inert={hangarOpen}>
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
                  <>
                  {record ? <p className={styles.record} role="status">★ {record}</p> : null}
                  <div className={styles.results}>
                    <span>
                      POLES <strong>{snapshot.score}</strong>
                    </span>
                    <span>
                      MISCHIEF <strong>{snapshot.bonus}</strong>
                    </span>
                    <span>BEST STREAK <strong>{snapshot.bestCombo}</strong></span>
                  </div>
                  <p className={styles.goal}>Next: {nextGoal(progress)}</p>
                  <p className={styles.eyebrow}>{mode === "daily" ? `NEXT FLIGHT · DAILY COAST ${day}` : "NEXT FLIGHT · FREE FLIGHT"}</p>
                  </>
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
                {snapshot.phase === "dead" ? <div className={styles.reportActions}>
                  <button className={styles.textButton} type="button" onClick={() => void copyResult()}>Copy result</button>
                  <button className={styles.textButton} type="button" onClick={(e) => openHangar(e.currentTarget)}>Birds & flight plan</button>
                </div> : null}
                {shareStatus ? <p className={styles.shareStatus} role="status">{shareStatus}</p> : null}
                {shareText ? <textarea className={styles.shareText} aria-label="Shareable flight result" readOnly value={shareText} onFocus={(e) => e.currentTarget.select()} /> : null}
                {snapshot.phase === "dead" && awards.length ? (
                  <p className={styles.awards}>
                    Filed under: {awards.join(" / ")}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
          {hangarOpen ? <div className={styles.hangar} role="dialog" aria-modal="true" aria-label="Birds and flight plan" tabIndex={-1} ref={hangarRef}
            onKeyDown={(event) => {
              if (event.key === "Escape") { event.stopPropagation(); closeHangar(); }
              if (event.key === "Tab") {
                const controls = hangarRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], textarea');
                const first = controls?.[0], last = controls?.[controls.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === hangarRef.current)) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
              }
            }}>
            <div className={styles.hangarHeading}><div><p className={styles.eyebrow}>DEPARTMENT OF BAD DECISIONS</p><h2>The flock.</h2></div><button type="button" className={styles.textButton} onClick={closeHangar}>Done</button></div>
            <p className={styles.hangarIntro}>Same wings. Different problems. Every bird flies the same.</p>
            <div className={styles.birds}>
              {BIRDS.map((bird) => <button key={bird.id} type="button" aria-pressed={progress.skin === bird.id} disabled={!bird.unlocked(progress)} onClick={() => chooseSkin(bird.id)}>
                <span className={styles.birdPortrait} data-skin={bird.id} aria-hidden="true"><i>{bird.id === "chips" ? "≋" : bird.id === "business" ? "♦" : bird.id === "punk" ? "✦" : ""}</i></span>
                <strong>{bird.name}</strong><small>{bird.unlocked(progress) ? progress.skin === bird.id ? "Equipped" : "Equip bird" : bird.requirement}</small>
              </button>)}
            </div>
            <h3>Flight plan</h3>
            <div className={styles.modeSwitch} role="group" aria-label="Next flight mode">
              <button type="button" aria-pressed={mode === "free"} onClick={() => setMode("free")}>Free flight</button>
              <button type="button" aria-pressed={mode === "daily"} onClick={() => setMode("daily")}>Daily coast</button>
            </div>
            <p className={styles.hangarIntro}>{mode === "daily" ? `${day} · Unlimited retries on the same course. New daily coast at 00:00 UTC. Records stay on this device.` : `Personal best: ${best} poles · ${progress.bestBonus} mischief. SHIT targets are optional. Missing one ends your streak, not your flight.`}</p>
            <h3>Open cases</h3>
            <ul className={styles.missions}>
              <li><span>Air mail · Hit a target</span><b>{Math.min(1, progress.bestHits)}/1</b></li>
              <li><span>Public nuisance · Chain hits</span><b>{Math.min(3, progress.bestCombo)}/3</b></li>
              <li><span>Parking violation · Cars in one flight</span><b>{Math.min(3, progress.bestCars)}/3</b></li>
              <li><span>Local nuisance · Poles in one flight</span><b>{Math.min(10, best)}/10</b></li>
              <li><span>Coastal management · Poles</span><b>{Math.min(25, best)}/25</b></li>
              <li><span>Peak bullshit · Poles</span><b>{Math.min(40, best)}/40</b></li>
            </ul>
          </div> : null}
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
