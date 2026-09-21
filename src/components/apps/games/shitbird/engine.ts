import kaboom from "kaboom";
import { createCoastRenderer } from "./art";
import { createFlight, flap, PHYSICS, startFlight, stepFlight, WORLD, type Flight } from "./model";

export type GameSnapshot = Pick<Flight, "phase" | "score" | "elapsed">;
export type GameEngine = {
  act: () => void; pause: () => void; destroy: () => void;
  configure: (options: { reducedMotion: boolean; sound: boolean }) => void;
};

export function createShitbird(
  canvas: HTMLCanvasElement,
  onChange: (flight: GameSnapshot) => void,
  onFailure: (message: string) => void,
  onReady: () => void,
): GameEngine {
  // Check before Kaboom allocates listeners/GL resources: its constructor always
  // creates an AudioContext, including when game sound is disabled.
  if (!(window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)) {
    throw new Error("This browser does not provide Web Audio, which Kaboom needs to start. Try another browser.");
  }
  if (!canvas.getContext("webgl", { antialias: true, depth: true, stencil: true, alpha: true, preserveDrawingBuffer: true })) {
    throw new Error("WebGL is unavailable. Enable graphics acceleration or try another browser.");
  }
  const k = kaboom({ canvas, root: canvas.parentElement!, width: WORLD.width, height: WORLD.height,
    stretch: true, texFilter: "linear", pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
    global: false, debug: false, touchToMouse: false, loadingScreen: false, background: "#0b100d" });
  let flight = createFlight();
  let accumulator = 0;
  let deadAt = 0;
  let destroyed = false;
  let assetsReady = false;
  const loadingTimeout = window.setTimeout(() => {
    if (!destroyed && !assetsReady) onFailure("The coast is taking too long to arrive. Check your connection and reload the game.");
  }, 15000);
  for (const name of ["coast", "gull"]) {
    k.loadSprite(name, `/games/shitbird/${name}.webp`).onError(() => {
      if (!destroyed) onFailure("The game artwork could not load. Check your connection and reload the game.");
    });
  }
  k.onLoad(() => {
    window.clearTimeout(loadingTimeout);
    if (!destroyed) { assetsReady = true; onReady(); }
  });
  let settings = { reducedMotion: false, sound: false };
  const render = createCoastRenderer(k);
  const notify = () => onChange({ phase: flight.phase, score: flight.score, elapsed: flight.elapsed });
  // Tiny original oscillator sounds through Kaboom's existing AudioContext.
  const voices = new Set<OscillatorNode>();
  const silence = () => { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); };
  const sound = (kind: "flap" | "score" | "impact") => {
    if (!settings.sound || destroyed || k.audioCtx.state !== "running") return;
    const ctx = k.audioCtx, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    const t = ctx.currentTime, duration = kind === "impact" ? 0.16 : 0.065;
    oscillator.type = kind === "impact" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(kind === "score" ? 740 : kind === "flap" ? 240 : 110, t);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "score" ? 1000 : 65, t + duration);
    gain.gain.setValueAtTime(0.035, t); gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    oscillator.connect(gain); gain.connect(ctx.destination); voices.add(oscillator);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices.delete(oscillator); };
    oscillator.start(); oscillator.stop(t + duration);
  };
  const pause = () => {
    if (flight.phase !== "playing" || destroyed) return;
    flight.phase = "paused"; accumulator = 0; silence(); notify();
  };
  const act = () => {
    if (destroyed || !assetsReady || document.hidden) return;
    if (settings.sound) void k.audioCtx.resume().catch(() => undefined);
    if (flight.phase === "ready" || (flight.phase === "dead" && performance.now() - deadAt > 200)) {
      flight = startFlight(); accumulator = 0; notify(); sound("flap");
    } else if (flight.phase === "paused") {
      flight.phase = "playing"; accumulator = 0; flap(flight); notify(); sound("flap");
    } else if (flight.phase === "playing") { flap(flight); sound("flap"); }
  };
  const pointer = (event: PointerEvent) => {
    if (event.button !== 0 || !event.isPrimary) return;
    event.preventDefault(); canvas.focus({ preventScroll: true }); act();
  };
  const keyboard = (event: KeyboardEvent) => {
    if (event.code === "Space") {
      event.preventDefault(); event.stopPropagation(); if (!event.repeat) act();
    } else if (event.code === "Escape" || event.code === "KeyP") {
      event.preventDefault(); event.stopPropagation(); pause();
    }
  };
  const hidden = () => { if (document.hidden) pause(); };
  const lostContext = (event: Event) => {
    event.preventDefault(); pause();
    onFailure("The graphics connection was interrupted. Reload the game; your best score is safe.");
  };
  canvas.addEventListener("pointerdown", pointer);
  canvas.addEventListener("keydown", keyboard);
  canvas.addEventListener("blur", pause);
  canvas.addEventListener("webglcontextlost", lostContext);
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", hidden);
  // Covers OS utility windows opening above the route while keyboard focus stays elsewhere.
  const frame = canvas.closest("[data-desktop-window]")?.firstElementChild;
  const focusObserver = new MutationObserver(() => { if (!frame?.hasAttribute("data-active")) pause(); });
  if (frame) focusObserver.observe(frame, { attributes: true, attributeFilter: ["data-active"] });
  const updates = k.onUpdate(() => {
    if (destroyed) return;
    const dt = k.dt();
    // Discard long stalls; explicit resume supplies a flap, never a hidden time jump.
    if (dt > 0.2) { pause(); return; }
    if (flight.phase !== "playing") return;
    const score = flight.score;
    accumulator += dt;
    while (accumulator >= PHYSICS.step && flight.phase === "playing") {
      stepFlight(flight, PHYSICS.step); accumulator -= PHYSICS.step;
    }
    if ((flight as Flight).phase === "dead") { deadAt = performance.now(); sound("impact"); notify(); }
    else if (flight.score !== score) { sound("score"); notify(); }
  });
  const draws = k.onDraw(() => { if (!destroyed && assetsReady) render(flight, settings.reducedMotion); });
  notify();
  return {
    act, pause,
    configure: (options) => { settings = options; if (!options.sound) silence(); },
    destroy: () => {
      if (destroyed) return;
      destroyed = true; window.clearTimeout(loadingTimeout); silence(); updates.cancel(); draws.cancel(); focusObserver.disconnect();
      canvas.removeEventListener("pointerdown", pointer); canvas.removeEventListener("keydown", keyboard);
      canvas.removeEventListener("blur", pause); canvas.removeEventListener("webglcontextlost", lostContext);
      window.removeEventListener("blur", pause); document.removeEventListener("visibilitychange", hidden);
      // Kaboom frees GL resources/listeners on frameEnd; its AudioContext needs explicit closing.
      k.onCleanup(() => { void k.audioCtx.close().catch(() => undefined); });
      k.quit();
    },
  };
}
