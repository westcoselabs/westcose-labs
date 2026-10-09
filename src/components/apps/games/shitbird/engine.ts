import kaboom from "kaboom";
import { createCoastRenderer } from "./art";
import { COAST_ART } from "./scenery";
import { courseRandom, createFlight, flap, PHYSICS, startFlight, stepFlight, WORLD, type BirdSkin, type Flight } from "./model";

export type GameSnapshot = Pick<Flight, "phase" | "score" | "elapsed" | "bonus" | "hits" | "combo" | "bestCombo" | "carHits" | "deathCause" | "daily">;
export type GameOptions = { reducedMotion: boolean; sound: boolean; skin: BirdSkin; daily: string | null; best: number };
export type GameEngine = {
  act: () => void; pause: () => void; destroy: () => void;
  configure: (options: GameOptions) => void;
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
    // Kaboom's fixed world also fixes its internal framebuffer. Supersample desktop
    // and retain up to 3× detail on phones instead of stretching a 360px render.
    stretch: true, texFilter: "linear", pixelDensity: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    global: false, debug: false, touchToMouse: false, loadingScreen: false, background: "#0b100d" });
  let flight = createFlight();
  let accumulator = 0;
  let deadAt = 0;
  let destroyed = false;
  let assetsReady = false;
  let random = Math.random;
  let deathAge = 0;
  let runBest = 0;
  const loadingTimeout = window.setTimeout(() => {
    if (!destroyed && !assetsReady) onFailure("The coast is taking too long to arrive. Check your connection and reload the game.");
  }, 15000);
  for (const name of ["coast", ...Object.values(COAST_ART), "gull", "targets-west-cose"]) {
    k.loadSprite(name, `/games/shitbird/${name === "coast" ? "coast-refined" : name}.webp`).onError(() => {
      if (!destroyed) onFailure("The game artwork could not load. Check your connection and reload the game.");
    });
  }
  k.onLoad(() => {
    window.clearTimeout(loadingTimeout);
    if (!destroyed) { assetsReady = true; onReady(); }
  });
  let settings: GameOptions = { reducedMotion: false, sound: false, skin: "gull", daily: null, best: 0 };
  const render = createCoastRenderer(k);
  const notify = () => onChange({ phase: flight.phase, score: flight.score, elapsed: flight.elapsed,
    bonus: flight.bonus, hits: flight.hits, combo: flight.combo, bestCombo: flight.bestCombo,
    carHits: flight.carHits, deathCause: flight.deathCause, daily: flight.daily });
  // Tiny original oscillator sounds through Kaboom's existing AudioContext.
  const voices = new Set<OscillatorNode>();
  const silence = () => { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); };
  const sound = (kind: "flap" | "score" | "impact" | "splat" | "record") => {
    if (!settings.sound || destroyed || k.audioCtx.state !== "running") return;
    const ctx = k.audioCtx, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    const t = ctx.currentTime, duration = kind === "record" ? 0.3 : kind === "splat" ? 0.18 : kind === "impact" ? 0.16 : 0.065;
    oscillator.type = kind === "impact" || kind === "splat" ? "sawtooth" : "triangle";
    const frequency = kind === "record" ? 660 : kind === "splat" ? 170 + flight.combo * 45 : kind === "score" ? 740 : kind === "flap" ? 240 : 110;
    oscillator.frequency.setValueAtTime(frequency, t);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "record" ? 1320 : kind === "score" ? 1000 : 65, t + duration);
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
      random = settings.daily ? courseRandom(settings.daily) : Math.random;
      flight = startFlight(settings.daily); accumulator = 0; deathAge = 0; runBest = settings.best; notify(); sound("flap");
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
    if (flight.phase === "dead") { deathAge = Math.min(2, deathAge + dt); return; }
    if (flight.phase !== "playing") return;
    const score = flight.score, hits = flight.hits, combo = flight.combo;
    accumulator += dt;
    while (accumulator >= PHYSICS.step && flight.phase === "playing") {
      stepFlight(flight, PHYSICS.step, random); accumulator -= PHYSICS.step;
    }
    if ((flight as Flight).phase === "dead") { deadAt = performance.now(); sound("impact"); notify(); }
    else if (flight.score !== score || flight.hits !== hits || flight.combo !== combo) {
      if (flight.score > runBest && score <= runBest && runBest > 0) {
        flight.notice = "NEW PERSONAL BEST!"; flight.noticeTime = 2; sound("record");
      } else if (flight.hits !== hits) sound("splat");
      else if (flight.score !== score) sound("score");
      notify();
    }
  });
  const draws = k.onDraw(() => { if (!destroyed && assetsReady) render(flight, settings.reducedMotion, settings.skin, deathAge); });
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
