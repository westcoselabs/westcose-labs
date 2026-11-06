"use client";

import {
  Anchor,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  DeviceMobile,
  ArrowsClockwise,
  Bomb,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  Lightning,
  Clover,
  Diamond,
  BookOpen,
  Check,
  CornersOut,
} from "@phosphor-icons/react";
import {
  GameExit,
  useGamePresentation,
  useFullscreenPause,
} from "../GameHost";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/components/os/SettingsContext";
import { useShellPresentation } from "@/components/os/ShellPresentationContext";
import { safeResolveStorage } from "@/lib/storage";
import {
  readGamesProgress,
  saveSalvageScore,
  type SalvageScore,
} from "../storage";
import { LOOT, UPGRADES } from "./data";
import { createRun, levelForDay, snapshot } from "./model";
import { lootPresentation } from "./presentation";
import { FullscreenHelp } from "./FullscreenHelp";
import type { LootEngine } from "./engine";
import { money, ScoreBoard } from "./ScoreBoard";
import styles from "./LowTideLoot.module.css";

export default function LowTideLootMount() {
  const settings = useSettings(),
    shell = useShellPresentation();
  const { enterFullscreen, fullscreen } = useGamePresentation();
  const [fullscreenHelp, setFullscreenHelp] = useState(false);
  const [standalone] = useState(() => window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  const [state, setState] = useState(() => snapshot(createRun(1))),
    [ready, setReady] = useState(false),
    [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0),
    [localSound, setLocalSound] = useState(false),
    [scores, setScores] = useState<SalvageScore[]>([]);
  const [showScores, setShowScores] = useState(false),
    [showControls, setShowControls] = useState(false),
    [portrait, setPortrait] = useState(false);
  const rotationScreen = useRef<HTMLDivElement>(null);
  const orientationLocked = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    well = useRef<HTMLDivElement>(null),
    arena = useRef<HTMLDivElement>(null),
    canvasFrame = useRef<HTMLDivElement>(null),
    engine = useRef<LootEngine | null>(null);
  useEffect(() => {
    if (state.phase === "playing")
      canvas.current?.focus({ preventScroll: true });
  }, [state.phase]);
  const action = useRef<HTMLButtonElement>(null),
    options = useRef({ sound: false, reducedMotion: false });
  const sound = settings?.preferences.soundEnabled ?? localSound;
  const reducedMotion = settings?.effectiveAccessibility.reducedMotion ?? false;
  useFullscreenPause(() => engine.current?.pause());
  useEffect(() => {
    options.current = { sound, reducedMotion };
    engine.current?.configure(options.current);
  }, [sound, reducedMotion]);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    let canceled = false,
      instance: LootEngine | undefined,
      saved = false;
    const storage = safeResolveStorage(() => window.localStorage);
    setScores(readGamesProgress(storage).lowTideLoot?.scores ?? []);
    import("./engine")
      .then(({ createLowTideLoot }) => {
        if (canceled) return;
        node.dataset.compact = String(arena.current?.dataset.layout === "compact");
        instance = createLowTideLoot(
          node,
          (next) => {
            if (canceled) return;
            if (next.phase === "playing") saved = false;
            if (next.phase === "over" && !saved) {
              saved = true;
              setScores(
                saveSalvageScore(storage, {
                  score: next.score,
                  days: next.day - 1,
                  bestItem: next.best.name,
                  bestValue: next.best.value,
                  timestamp: new Date().toISOString(),
                }),
              );
            }
            setState(next);
          },
          () => {
            if (!canceled) setReady(true);
          },
          (message) => {
            if (canceled) return;
            instance?.destroy();
            engine.current = null;
            setError(message);
            setReady(false);
          },
        );
        instance.configure(options.current);
        engine.current = instance;
      })
      .catch((reason: unknown) => {
        if (!canceled) {
          setError(
            reason instanceof Error
              ? reason.message
              : "The crane failed to start. Try again.",
          );
          setReady(false);
        }
      });
    return () => {
      canceled = true;
      engine.current = null;
      instance?.destroy();
    };
  }, [attempt]);
  useEffect(() => {
    const box = well.current,
      field = arena.current,
      frame = canvasFrame.current;
    if (!box || !field || !frame) return;
    const resize = () => {
      const bounds = box.getBoundingClientRect(),
        inset = getComputedStyle(box),
        layout = lootPresentation(
          bounds.width - parseFloat(inset.paddingLeft) - parseFloat(inset.paddingRight),
          bounds.height - parseFloat(inset.paddingTop) - parseFloat(inset.paddingBottom),
        );
      field.style.width = `${Math.max(1, layout.width)}px`;
      field.style.height = `${Math.max(1, layout.height)}px`;
      field.style.setProperty("--loot-side-rail", `${layout.rail}px`);
      field.dataset.layout = layout.compact ? "compact" : "classic";
      frame.style.width = `${layout.canvasWidth}px`;
      frame.style.height = `${layout.canvasHeight}px`;
      frame.style.top = `${layout.canvasTop}px`;
      if (canvas.current) canvas.current.dataset.compact = String(layout.compact);
      setPortrait(window.matchMedia("(orientation: portrait)").matches);
      engine.current?.pause();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (portrait)
      rotationScreen.current
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
    else if (state.phase === "paused")
      action.current?.focus({ preventScroll: true });
  }, [portrait, state.phase]);
  useEffect(
    () => () => {
      if (orientationLocked.current) {
        try {
          screen.orientation?.unlock();
        } catch {
          /* Unsupported browser. */
        }
      }
    },
    [],
  );
  useEffect(() => {
    if (
      !portrait &&
      ["paused", "complete", "shop", "over"].includes(state.phase) &&
      document.hasFocus() &&
      !document.hidden
    ) {
      const frame = canvas.current?.closest(
        "[data-desktop-window]",
      )?.firstElementChild;
      if (!frame || frame.hasAttribute("data-active"))
        action.current?.focus({ preventScroll: true });
    }
  }, [state.phase, portrait]);
  const act = (method: "start" | "resume" | "fire" | "bomb" | "next") => {
    if (!ready || error || window.matchMedia("(orientation: portrait)").matches)
      return;
    canvas.current?.focus({ preventScroll: true });
    setShowScores(false);
    setShowControls(false);
    engine.current?.[method]();
  };
  const toggleSound = () =>
    settings
      ? settings.dispatch({ type: "sound/set", enabled: !sound })
      : setLocalSound(!sound);
  const attached = state.attached ? LOOT[state.attached] : null;
  const live = state.phase === "playing",
    overlay = !live;
  const quotaMet = state.cash >= state.target;
  const enterImmersive = async (offerHelp = false) => {
    const entered = standalone || await enterFullscreen();
    if (!entered && offerHelp) {
      engine.current?.pause();
      setFullscreenHelp(true);
    }
    if (!canvas.current) return;
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (value: "landscape") => Promise<void>;
    };
    if (
      entered &&
      orientation?.lock &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      try {
        await orientation.lock("landscape");
        if (!canvas.current) {
          orientation.unlock();
          return;
        }
        orientationLocked.current = true;
      } catch {
        /* The rotate screen covers browsers without orientation locking. */
      }
    }
  };
  const start = async () => {
    if (!ready || error || portrait) return;
    await enterImmersive();
    requestAnimationFrame(() => requestAnimationFrame(() => act("start")));
  };
  const icons = {
    bomb: Bomb,
    energy: Lightning,
    shell: Clover,
    polish: Diamond,
    guide: BookOpen,
  };
  return (
    <section
      className={styles.game}
      data-game="low-tide-loot"
      data-route-content
      data-shell-mode={shell}
      data-phase={state.phase}
      data-claw={state.clawState}
      data-rig-x={Math.round(state.rigX)}
      data-orientation={portrait ? "portrait" : "landscape"}
      data-quota-met={quotaMet}
      data-reduced-motion={reducedMotion}
      aria-label="LOW TIDE LOOT arcade game"
      onKeyDown={(event) => {
        if (
          event.target !== canvas.current &&
          ["Escape", "KeyP"].includes(event.code)
        ) {
          event.preventDefault();
          engine.current?.pause();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          engine.current?.pause();
      }}
    >
      <h1 className="sr-only" tabIndex={-1}>
        LOW TIDE LOOT
      </h1>
      <div
        className={styles.well}
        ref={well}
        inert={portrait}
        aria-hidden={portrait || undefined}
      >
        <div className={styles.arena} ref={arena} data-loot-stage data-playing={live}>
          <div className={styles.beach} data-loot-beach>
          <div className={styles.canvasFrame} ref={canvasFrame}>
          <canvas
            key={attempt}
            ref={canvas}
            tabIndex={live ? 0 : -1}
            inert={overlay || Boolean(error)}
            aria-label="Salvage playfield. Left and Right arrows, A and D, or drag to move. Space, Down Arrow or tap to fire. Up Arrow or B for Beach Bomb. Escape to pause."
            aria-describedby="loot-controls"
          />
          </div>
          </div>
          <header className={styles.toolbar}>
            <GameExit onExit={() => engine.current?.pause()} />
            {live ? (
              <span className={styles.arcadeBrand} aria-hidden="true">
                LOW TIDE
                <span>
                  LOOT <i>002</i>
                </span>
              </span>
            ) : null}
            {live ? (
              <div className={styles.hud} aria-label="Salvage progress">
                <div className={styles.location}>
                  <small>DAY {String(state.day).padStart(2, "0")}</small>
                  <b>{levelForDay(state.day).environment.name}</b>
                </div>
                <div className={styles.quota}>
                  <small>
                    {quotaMet ? "QUOTA MET · KEEP DIGGING" : "CASH / TARGET"}
                  </small>
                  <strong data-testid="loot-earnings">
                    {money(state.cash)} <span>/ {money(state.target)}</span>
                  </strong>
                  <meter
                    min={0}
                    max={state.target}
                    value={Math.min(state.cash, state.target)}
                    aria-label="Cash toward target"
                  />
                </div>
                <div
                  className={`${styles.timer} ${state.remaining <= 10 ? styles.warning : ""}`}
                >
                  <small>TIDE IN</small>
                  <strong data-testid="loot-time">
                    {Math.floor(Math.ceil(state.remaining) / 60)
                      .toString()
                      .padStart(2, "0")}
                    :
                    {(Math.ceil(state.remaining) % 60)
                      .toString()
                      .padStart(2, "0")}
                  </strong>
                </div>
              </div>
            ) : (
              <span className={styles.wordmark}>LOW TIDE LOOT</span>
            )}
            <div className={styles.toolbarActions}>
              <button
                aria-label={`Turn sound ${sound ? "off" : "on"}`}
                aria-pressed={sound}
                onClick={toggleSound}
              >
                {sound ? <SpeakerHigh size={21} /> : <SpeakerSlash size={21} />}
              </button>
              <button aria-label="Full screen" disabled={fullscreen || standalone} onClick={event => { event.currentTarget.focus({ preventScroll: true }); void enterImmersive(true); }}>
                <CornersOut size={20} aria-hidden="true" />
              </button>
              {live ? (
                <button
                  onClick={() => engine.current?.pause()}
                  aria-label="Pause LOW TIDE LOOT"
                >
                  <Pause size={22} weight="fill" />
                </button>
              ) : null}
            </div>
          </header>
          {overlay || error ? (
            <div
              className={`${styles.overlay} ${state.phase === "ready" ? styles.titleScreen : ""} ${state.phase === "shop" && !error ? styles.shopScene : ""}`}
            >
              <div
                className={
                  state.phase === "shop" && !error
                    ? styles.shopPanel
                    : styles.panel
                }
                data-menu={error ? "error" : state.phase}
                role="region"
                aria-label={error ? "Game unavailable" : `${state.phase} menu`}
              >
                {error ? (
                  <>
                    <p className={styles.eyebrow}>EQUIPMENT FAILURE</p>
                    <h2>Crane’s on break.</h2>
                    <p role="alert">{error}</p>
                    <button
                      className={styles.primary}
                      onClick={() => {
                        setError(null);
                        setReady(false);
                        setAttempt((n) => n + 1);
                      }}
                    >
                      Reload game
                    </button>
                  </>
                ) : !ready ? (
                  <div className={styles.loading} role="status">
                    <Anchor size={44} weight="duotone" />
                    <p>LOW TIDE LOOT</p>
                    <h2>Heading to the coast…</h2>
                    <span>
                      Loading the beach &amp; your questionable equipment
                    </span>
                    <div className={styles.loadingTrack} />
                  </div>
                ) : state.phase === "ready" ? (
                  <>
                    <p className={styles.eyebrow}>WESTCOSE AMUSEMENTS</p>
                    <h2 className={styles.title}>
                      LOW TIDE
                      <br />
                      <em>LOOT.</em>
                    </h2>
                    <p className={styles.tagline}>
                      Make rent before the tide comes back.
                    </p>
                    <button
                      ref={action}
                      className={styles.primary}
                      onClick={() => void start()}
                    >
                      <Play weight="fill" size={21} /> Start game
                    </button>
                    <p className={styles.instructions}>
                      ← → / A D / drag to move · Space / tap to drop
                      <br />
                      Collect {money(state.target)} in 60 seconds. Keep the
                      extra.
                    </p>
                  </>
                ) : state.phase === "paused" ? (
                  <>
                    <div className={styles.pauseIntro}>
                      <p className={styles.eyebrow}>UNPAID BREAK</p>
                      <h2>Tide can wait.</h2>
                      <p>The clock, claw and crabs are paused.</p>
                    </div>
                    <div className={styles.pauseActions}>
                      <button
                        ref={action}
                        className={styles.primary}
                        onClick={() => act("resume")}
                      >
                        <Play weight="fill" size={20} /> Resume salvaging
                      </button>
                      <div className={styles.menuActions}>
                        <button onClick={() => void start()}>Restart run</button>
                        <button onClick={() => setShowControls(!showControls)}>
                          Controls
                        </button>
                      </div>
                    </div>
                    {showControls ? (
                      <p className={styles.pauseHelp}>
                        ← → / A D or drag: move the rig while the claw is ready.
                        Space / ↓ / tap: fire. ↑ / B: Beach Bomb while hauling.
                        P / Escape: pause. The first object in the cable’s path
                        gets hooked.
                      </p>
                    ) : null}
                  </>
                ) : state.phase === "complete" ? (
                  <>
                    <p className={styles.eyebrow}>
                      DAY {String(state.day).padStart(2, "0")} COMPLETE
                    </p>
                    <h2>
                      Rent paid.
                      <br />
                      <em>For now.</em>
                    </h2>
                    <div className={styles.results}>
                      <span>
                        DAY’S HAUL<b>{money(state.earnings)}</b>
                      </span>
                      <span>
                        BANKED CASH<b>{money(state.cash)}</b>
                      </span>
                    </div>
                    <p>
                      Best find:{" "}
                      <b>
                        {state.dayBest.name} · {money(state.dayBest.value)}
                      </b>
                    </p>
                    <button
                      ref={action}
                      className={styles.primary}
                      onClick={() => engine.current?.shop()}
                    >
                      Continue to Surf Shop →
                    </button>
                  </>
                ) : state.phase === "shop" ? (
                  <>
                    <header className={styles.shopHeader}>
                      <div>
                        <p className={styles.eyebrow}>SALTY’S</p>
                        <h2>Surf Shop</h2>
                      </div>
                      <div className={styles.shopWallet}>
                        <span data-testid="shop-cash">
                          YOUR CASH<b>{money(state.cash)}</b>
                        </span>
                        <span>
                          DAY {state.day + 1} TARGET
                          <b>{money(levelForDay(state.day + 1).target)}</b>
                        </span>
                      </div>
                    </header>
                    <div className={styles.shopItems}>
                      {state.stock.map((id) => {
                        const item = UPGRADES[id],
                          bought = state.bought.includes(id),
                          full = id === "bomb" && state.bombs >= 5,
                          poor = state.cash < item.price,
                          Icon = icons[id];
                        return (
                          <article
                            key={id}
                            className={styles.shopItem}
                            data-bought={bought}
                          >
                            <div className={styles.shopMark}>
                              <Icon
                                size={46}
                                weight="duotone"
                                aria-hidden="true"
                              />
                            </div>
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <button
                              disabled={bought || full || poor}
                              onClick={() => engine.current?.buy(id)}
                              aria-label={`Buy ${item.name} for ${money(item.price)}`}
                            >
                              {bought ? (
                                <>
                                  <Check size={16} /> Purchased
                                </>
                              ) : full ? (
                                "Bag full"
                              ) : poor ? (
                                `${money(item.price)} · Need cash`
                              ) : (
                                `Buy · ${money(item.price)}`
                              )}
                            </button>
                          </article>
                        );
                      })}
                    </div>
                    <footer className={styles.shopFooter}>
                      <p className={styles.shopNote}>
                        Buffs last one day. Bombs carry over.
                        <br />
                        <span>
                          Spending reduces your cash, never your salvage score.
                        </span>
                      </p>
                      <button
                        ref={action}
                        className={styles.primary}
                        onClick={() => act("next")}
                      >
                        Next level{" "}
                        <ArrowDown size={19} className={styles.nextArrow} />
                      </button>
                    </footer>
                    <p className="sr-only" role="status">
                      {state.message}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={styles.eyebrow}>CLOSED FOR WATER</p>
                    <h2>Tide came in.</h2>
                    <div className={styles.results}>
                      <span>
                        TOTAL SALVAGED<b>{money(state.score)}</b>
                      </span>
                      <span>
                        DAYS SURVIVED<b>{state.day - 1}</b>
                      </span>
                    </div>
                    <p>
                      Best find:{" "}
                      <b>
                        {state.best.name} · {money(state.best.value)}
                      </b>
                    </p>
                    <button
                      ref={action}
                      className={styles.primary}
                      onClick={() => void start()}
                    >
                      Play again
                    </button>
                    <div className={styles.menuActions}>
                      <button onClick={() => setShowScores(!showScores)}>
                        High scores
                      </button>
                    </div>
                    {showScores ? <ScoreBoard scores={scores} /> : null}
                  </>
                )}
              </div>
            </div>
          ) : null}
          <footer
            className={styles.controls}
            id="loot-controls"
            inert={overlay || Boolean(error)}
            hidden={overlay || Boolean(error)}
          >
            <div
              className={styles.movement}
              role="group"
              aria-label="Move salvage rig"
            >
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  aria-label={direction < 0 ? "Move left" : "Move right"}
                  disabled={!live || state.clawState !== "swinging"}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    canvas.current?.focus({ preventScroll: true });
                    event.currentTarget.setPointerCapture(event.pointerId);
                    engine.current?.move(direction);
                  }}
                  onPointerUp={() => engine.current?.move(0)}
                  onPointerCancel={() => engine.current?.move(0)}
                  onLostPointerCapture={() => engine.current?.move(0)}
                  onKeyDown={(event) => {
                    if (["Space", "Enter"].includes(event.code)) {
                      event.preventDefault();
                      engine.current?.move(direction);
                    }
                  }}
                  onKeyUp={() => engine.current?.move(0)}
                  onBlur={() => engine.current?.move(0)}
                >
                  {direction < 0 ? (
                    <ArrowLeft size={25} weight="bold" />
                  ) : (
                    <ArrowRight size={25} weight="bold" />
                  )}
                </button>
              ))}
              <span>
                MOVE <kbd>A</kbd>
                <kbd>D</kbd>
              </span>
            </div>
            <div className={styles.feedback}>
              <p role="status" aria-live="polite">
                {attached
                  ? `${attached.name} · ${state.attachedWeight >= 5 ? "Heavy haul" : "Reeling in…"}`
                  : quotaMet
                    ? "Quota met. Keep digging!"
                    : state.message}
              </p>
              <small>
                {Object.entries(state.boosts)
                  .filter(([, on]) => on)
                  .map(([id]) => UPGRADES[id as keyof typeof UPGRADES].name)
                  .join(" + ") || "MOVE TO LINE UP · DROP TO CASH IN"}
              </small>
            </div>
            <div className={styles.controlButtons}>
              <button
                className={styles.bomb}
                data-stock={state.bombs > 0 ? "available" : "empty"}
                aria-label={`Use bomb, ${state.bombs} remaining`}
                aria-describedby="loot-bomb-help"
                title={state.bombs === 0
                  ? "Out of bombs. Restock at Salty’s."
                  : attached ? "Release this haul (B or ↑)" : "Grab loot to use a bomb (B or ↑)"}
                disabled={!live || !attached || !state.bombs}
                onClick={() => act("bomb")}
              >
                <Bomb size={24} weight="fill" aria-hidden="true" />
                <b aria-hidden="true">×{state.bombs}</b>
              </button>
              <button
                className={styles.fire}
                aria-label="Drop"
                aria-describedby="loot-drop-state"
                title={state.clawState === "swinging" ? "Drop the claw (Space or ↓)" : state.clawState === "firing" ? "Claw is dropping" : "Claw is reeling in"}
                disabled={!live || state.clawState !== "swinging"}
                onClick={() => act("fire")}
              >
                <span>Drop</span>
                <ArrowDown size={21} weight="bold" className={styles.fireIcon} aria-hidden="true" />
                <kbd className={styles.dropKey} aria-hidden="true">Space</kbd>
              </button>
            </div>
            <span id="loot-bomb-help" className="sr-only">
              {state.bombs > 0 ? "Use while hauling loot to release it. B or Up Arrow." : "No bombs left. Restock at Salty’s Surf Shop."}
            </span>
            <span id="loot-drop-state" className="sr-only">
              {state.clawState === "swinging" ? "Ready to drop. Space or Down Arrow." : state.clawState === "firing" ? "Claw is dropping." : "Claw is reeling in."}
            </span>
          </footer>
        </div>
      </div>
      <div
        className={styles.rotateScreen}
        ref={rotationScreen}
        hidden={!portrait}
        role="region"
        aria-label="Landscape required"
      >
        <div className={styles.rotateCard}>
          <p className={styles.eyebrow}>WESTCOSE ARCADE / 002</p>
          <div className={styles.rotateIcon} aria-hidden="true">
            <DeviceMobile size={74} weight="duotone" />
            <ArrowsClockwise size={32} />
          </div>
          <h2>
            More beach.
            <br />
            <em>Less squinting.</em>
          </h2>
          <p>Turn your phone sideways to play.</p>
          <small>
            {state.phase === "ready"
              ? "LOW TIDE LOOT plays in landscape."
              : "Your haul is safe. The tide is paused."}
          </small>
          <button className={styles.fullscreenCta} disabled={fullscreen || standalone} onClick={event => { event.currentTarget.focus({ preventScroll: true }); void enterImmersive(true); }}>
            <CornersOut size={20} aria-hidden="true" />
            {fullscreen || standalone ? "Full screen is on" : "Play full screen"}
          </button>
          <small className={styles.fullscreenNote}>Remove browser bars where supported.</small>
          <GameExit onExit={() => engine.current?.pause()} />
        </div>
      </div>
      {fullscreenHelp ? <FullscreenHelp onClose={() => setFullscreenHelp(false)} /> : null}
    </section>
  );
}
