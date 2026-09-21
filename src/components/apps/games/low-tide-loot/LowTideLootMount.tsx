"use client";

import {
  Anchor,
  ArrowDown,
  Bomb,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerSlash,
  DeviceMobileCamera,
  Lightning,
  Clover,
  Diamond,
  BookOpen,
  Check,
} from "@phosphor-icons/react";
import {
  GameExit,
  GameFullscreen,
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
import { createRun, levelForDay, snapshot, WORLD } from "./model";
import type { LootEngine } from "./engine";
import { money, ScoreBoard } from "./ScoreBoard";
import styles from "./LowTideLoot.module.css";

export default function LowTideLootMount() {
  const settings = useSettings(),
    shell = useShellPresentation();
  const { enterFullscreen } = useGamePresentation();
  const [portrait, setPortrait] = useState(false);
  const [state, setState] = useState(() => snapshot(createRun(1))),
    [ready, setReady] = useState(false),
    [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0),
    [localSound, setLocalSound] = useState(false),
    [scores, setScores] = useState<SalvageScore[]>([]);
  const [showScores, setShowScores] = useState(false),
    [showControls, setShowControls] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    well = useRef<HTMLDivElement>(null),
    arena = useRef<HTMLDivElement>(null),
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
    const query = window.matchMedia("(orientation: portrait)");
    const update = () => {
      setPortrait(query.matches);
      if (query.matches) engine.current?.pause();
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
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
      field = arena.current;
    if (!box || !field) return;
    const resize = () => {
      const bounds = box.getBoundingClientRect(),
        scale = Math.min(
          bounds.width / WORLD.width,
          bounds.height / WORLD.height,
        );
      field.style.width = `${Math.max(1, Math.floor(WORLD.width * scale))}px`;
      field.style.height = `${Math.max(1, Math.floor(WORLD.height * scale))}px`;
      engine.current?.pause();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (
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
  }, [state.phase]);
  const act = (method: "start" | "resume" | "fire" | "bomb" | "next") => {
    if (portrait || !ready || error) return;
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
  const start = async () => {
    if (portrait || !ready || error) return;
    await enterFullscreen();
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
      <div className={styles.well} ref={well} inert={portrait}>
        <div className={styles.arena} ref={arena} data-loot-stage>
          <canvas
            key={attempt}
            ref={canvas}
            tabIndex={live && !portrait ? 0 : -1}
            inert={overlay || portrait || Boolean(error)}
            aria-label="Salvage playfield. Space, Down Arrow or tap to fire. Up Arrow or B for Beach Bomb. Escape to pause."
            aria-describedby="loot-controls"
          />
          <header className={styles.toolbar}>
            <GameExit onExit={() => engine.current?.pause()} />
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
                  className={
                    state.remaining <= 10 ? styles.warning : styles.timer
                  }
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
              <GameFullscreen />
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
                      Space / tap to drop · ↑ / B to bomb
                      <br />
                      Collect {money(state.target)} in 60 seconds. Keep the
                      extra.
                    </p>
                  </>
                ) : state.phase === "paused" ? (
                  <>
                    <p className={styles.eyebrow}>UNPAID BREAK</p>
                    <h2>Tide can wait.</h2>
                    <p>The clock, claw and crabs are paused.</p>
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
                    {showControls ? (
                      <p>
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
            inert={overlay || portrait || Boolean(error)}
            hidden={overlay || Boolean(error)}
          >
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
                  .join(" + ") || "SPACE / TAP TO DROP · ↑ / B TO BOMB"}
              </small>
            </div>
            <div className={styles.controlButtons}>
              <button
                className={styles.bomb}
                disabled={!live || !attached || !state.bombs}
                onClick={() => act("bomb")}
              >
                <Bomb size={22} weight="duotone" />
                <span>Bomb</span>
                <b>×{state.bombs}</b>
              </button>
              <button
                className={styles.fire}
                disabled={!live || state.clawState !== "swinging"}
                onClick={() => act("fire")}
              >
                Drop claw <ArrowDown size={20} />
              </button>
            </div>
          </footer>
        </div>
      </div>
      {portrait ? (
        <div className={styles.rotate} role="status">
          <div className={styles.rotateExit}>
            <GameExit />
          </div>
          <DeviceMobileCamera size={64} weight="duotone" />
          <p className={styles.eyebrow}>LOW TIDE LOOT</p>
          <h2>A wider kind of adventure.</h2>
          <p>Turn your phone sideways to play.</p>
          <small>
            {state.phase === "paused"
              ? "Your haul is safe. Rotate, then resume."
              : "One rusty claw. A whole beach to dig."}
          </small>
        </div>
      ) : null}
    </section>
  );
}
