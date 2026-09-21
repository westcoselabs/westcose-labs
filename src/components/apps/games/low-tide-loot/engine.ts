import kaplay from "kaplay";
import { ART, createRenderer, lootSVG } from "./art";
import { LOOT, type UpgradeId } from "./data";
import {
  bomb,
  createRun,
  fire,
  nextDay,
  openShop,
  PHYSICS,
  purchase,
  snapshot,
  stepRun,
  WORLD,
  type Snapshot,
} from "./model";

export type EngineOptions = { sound: boolean; reducedMotion: boolean };
export type LootEngine = {
  start: () => void;
  fire: () => void;
  bomb: () => void;
  pause: () => void;
  resume: () => void;
  shop: () => void;
  buy: (id: UpgradeId) => void;
  next: () => void;
  configure: (options: EngineOptions) => void;
  destroy: () => void;
};

export function createLowTideLoot(
  canvas: HTMLCanvasElement,
  onChange: (state: Snapshot) => void,
  onReady: () => void,
  onFailure: (message: string) => void,
): LootEngine {
  if (!window.AudioContext)
    throw new Error(
      "This browser cannot start the game's audio runtime. Try a browser with Web Audio support.",
    );
  if (
    !canvas.getContext("webgl", {
      antialias: true,
      depth: true,
      stencil: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
  ) {
    throw new Error(
      "The salvage crane needs WebGL. Enable graphics acceleration or try another browser.",
    );
  }
  const k = kaplay({
    canvas,
    root: canvas.parentElement!,
    width: WORLD.width,
    height: WORLD.height,
    global: false,
    stretch: true,
    focus: false,
    debug: false,
    touchToMouse: false,
    loadingScreen: false,
    texFilter: "linear",
    pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
    background: "#172b2b",
  });
  // Explicit local seed replay: development only, no game mutation hooks in production.
  const debugSeed =
    process.env.NODE_ENV === "development"
      ? Number(new URLSearchParams(window.location.search).get("lootSeed"))
      : NaN;
  let run = createRun(
    Number.isFinite(debugSeed) && debugSeed > 0 ? debugSeed : undefined,
  );
  let disposed = false,
    ready = false,
    accumulator = 0,
    lastStamp = "",
    options: EngineOptions = { sound: false, reducedMotion: false };
  let lastEvent = 0,
    effectAt = -10,
    effect = "";
  const voices = new Set<OscillatorNode>();
  const silence = () => {
    for (const voice of voices) {
      try {
        voice.stop();
      } catch {}
    }
    voices.clear();
  };
  const unlock = () => {
    if (options.sound && !disposed)
      void k.audioCtx.resume().catch(() => undefined);
  };
  const sound = (kind: string) => {
    if (!options.sound || k.audioCtx.state !== "running" || !kind) return;
    const ctx = k.audioCtx,
      t = ctx.currentTime,
      voice = ctx.createOscillator(),
      gain = ctx.createGain();
    const base =
      kind === "bomb"
        ? 90
        : kind === "money" || kind === "success"
          ? 660
          : kind === "failure"
            ? 150
            : 280;
    const length = kind === "success" ? 0.26 : kind === "bomb" ? 0.18 : 0.085;
    voice.type = kind === "bomb" ? "sawtooth" : "triangle";
    voice.frequency.setValueAtTime(base, t);
    voice.frequency.exponentialRampToValueAtTime(
      kind === "money" || kind === "success" ? base * 1.7 : base * 0.45,
      t + length,
    );
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    voice.connect(gain);
    gain.connect(ctx.destination);
    voices.add(voice);
    voice.onended = () => {
      voice.disconnect();
      gain.disconnect();
      voices.delete(voice);
    };
    voice.start();
    voice.stop(t + length);
  };
  const notify = (force = false) => {
    const stamp = `${run.phase}:${Math.ceil(run.remaining)}:${run.event}:${run.claw.state}:${run.claw.attached}`;
    if (run.event !== lastEvent) {
      lastEvent = run.event;
      effectAt = run.elapsed;
      effect = run.effect;
      sound(effect);
    }
    if (force || stamp !== lastStamp) {
      lastStamp = stamp;
      onChange(snapshot(run));
    }
  };
  const pause = () => {
    if (!disposed && run.phase === "playing") {
      run.phase = "paused";
      accumulator = 0;
      silence();
      notify();
    }
  };
  const act = (callback: () => void) => {
    if (disposed || !ready || document.hidden) return;
    unlock();
    callback();
    notify(true);
  };
  const shoot = () =>
    act(() => {
      fire(run);
    });
  const dropBomb = () =>
    act(() => {
      bomb(run);
    });
  const pointer = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    shoot();
  };
  const keyboard = (event: KeyboardEvent) => {
    if (
      !["Space", "ArrowDown", "ArrowUp", "KeyB", "Escape", "KeyP"].includes(
        event.code,
      )
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;
    if (event.code === "KeyB" || event.code === "ArrowUp") dropBomb();
    else if (event.code === "Escape" || event.code === "KeyP") pause();
    else shoot();
  };
  const hidden = () => {
    if (document.hidden) pause();
  };
  const lostFocus = (event: FocusEvent) => {
    if (
      !(event.relatedTarget instanceof Node) ||
      !canvas.closest("[data-game]")?.contains(event.relatedTarget)
    )
      pause();
  };
  const lostContext = (event: Event) => {
    event.preventDefault();
    pause();
    onFailure(
      "The graphics connection was interrupted. Reload the game to bring the crane back.",
    );
  };
  canvas.addEventListener("pointerdown", pointer);
  canvas.addEventListener("keydown", keyboard);
  canvas.addEventListener("blur", lostFocus);
  canvas.addEventListener("webglcontextlost", lostContext);
  document.addEventListener("visibilitychange", hidden);
  window.addEventListener("blur", pause);
  const frame = canvas.closest("[data-desktop-window]")?.firstElementChild;
  const observer = new MutationObserver(() => {
    if (!frame?.hasAttribute("data-active")) pause();
  });
  if (frame)
    observer.observe(frame, {
      attributes: true,
      attributeFilter: ["data-active"],
    });
  const timeout = window.setTimeout(() => {
    if (!disposed && !ready)
      onFailure(
        "The beach artwork took too long to load. Check your connection and retry.",
      );
  }, 15000);
  const assetError = () => {
    if (!disposed)
      onFailure(
        "The beach artwork could not load. Check your connection and retry.",
      );
  };
  k.loadSprite("scavenger", ART.character).onError(assetError);
  k.loadSprite("beach", ART.beach).onError(assetError);
  for (const id of Object.keys(LOOT))
    k.loadSprite(
      id,
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(lootSVG(id))}`,
    ).onError(assetError);
  k.onLoad(() => {
    if (disposed) return;
    window.clearTimeout(timeout);
    ready = true;
    onReady();
    notify(true);
  });
  const render = createRenderer(k);
  const update = k.onUpdate(() => {
    if (disposed || !ready) return;
    if (k.dt() > 0.25) {
      pause();
      return;
    }
    if (run.phase !== "playing") return;
    accumulator += k.dt();
    while (accumulator >= PHYSICS.step && run.phase === "playing") {
      stepRun(run, PHYSICS.step);
      accumulator -= PHYSICS.step;
    }
    notify();
  });
  const draw = k.onDraw(() => {
    if (disposed || !ready) return;
    render(run, options.reducedMotion);
    const age = run.elapsed - effectAt;
    if (
      !options.reducedMotion &&
      age >= 0 &&
      age < 0.8 &&
      ["money", "bomb", "success"].includes(effect)
    ) {
      for (let i = 0; i < 9; i++)
        k.drawCircle({
          pos: k.vec2(
            WORLD.originX + Math.cos(i * 2.4) * age * 90,
            206 + Math.sin(i * 2.4) * age * 70 + age * age * 60,
          ),
          radius: 3 * (1 - age),
          color: k.Color.fromHex(effect === "bomb" ? "#e6578c" : "#f5c34e"),
          opacity: 1 - age,
        });
    }
  });
  return {
    start: () =>
      act(() => {
        run = createRun(
          Number.isFinite(debugSeed) && debugSeed > 0 ? debugSeed : undefined,
        );
        run.phase = "playing";
        accumulator = 0;
        effectAt = -10;
        lastEvent = 0;
      }),
    fire: shoot,
    bomb: dropBomb,
    pause,
    resume: () =>
      act(() => {
        if (run.phase === "paused") {
          run.phase = "playing";
          accumulator = 0;
        }
      }),
    shop: () => act(() => openShop(run)),
    buy: (id) =>
      act(() => {
        purchase(run, id);
      }),
    next: () =>
      act(() => {
        nextDay(run);
        accumulator = 0;
        effectAt = -10;
      }),
    configure: (next) => {
      options = next;
      if (!next.sound) silence();
    },
    destroy: () => {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(timeout);
      silence();
      update.cancel();
      draw.cancel();
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointer);
      canvas.removeEventListener("keydown", keyboard);
      canvas.removeEventListener("blur", lostFocus);
      canvas.removeEventListener("webglcontextlost", lostContext);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("blur", pause);
      k.onCleanup(() => {
        void k.audioCtx.close().catch(() => undefined);
      });
      k.quit();
    },
  };
}
