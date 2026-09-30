"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { planetSourceManifest } from "@/lib/planet/asset-source";
import { createPlanetRuntime, type PlanetAssetOption, type PlanetStats } from "./scene-runtime";
import styles from "./PlanetExperiment.module.css";

const materialModes = [["final", "Final Materials"], ["clay", "Clay"], ["wireframe", "Wireframe"]] as const;

export default function PlanetViewer({ worldId, quality, reducedMotion, onClose, onRestart }: {
  worldId: string;
  quality: "full" | "compact";
  reducedMotion: boolean;
  onClose: () => void;
  onRestart: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const runtime = useRef<ReturnType<typeof createPlanetRuntime> | null>(null);
  const motion = useRef(reducedMotion);
  const [assets, setAssets] = useState<PlanetAssetOption[]>([]);
  const [stats, setStats] = useState<PlanetStats | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [inspector, setInspector] = useState(false);
  const [selected, setSelected] = useState(worldId);
  const [materialMode, setMaterialMode] = useState<"final" | "clay" | "wireframe">("final");
  const [controlMode, setControlMode] = useState<"rotate" | "move">("rotate");
  const [autoRotate, setAutoRotate] = useState(true);
  const titleId = useId();
  const hintId = useId();
  const inspectorId = useId();
  const radioName = useId();
  const world = planetSourceManifest.worlds.find((item) => item.id === worldId)!;

  // Reuse ProjectQuickView's native modal/portal pattern, above OS windows.
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    element?.showModal();
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    motion.current = reducedMotion;
    runtime.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    if (!stage.current) return;
    let mounted = true;
    const instance = createPlanetRuntime(stage.current, {
      worldId, quality, reducedMotion: motion.current,
      onReady: (options, values) => {
        if (!mounted) return;
        setAssets(options);
        setStats(values);
        setReady(true);
      },
      onStats: (values) => { if (mounted) setStats(values); },
      onError: (message) => { if (mounted) setError(message); },
      onProgress: () => {},
    });
    runtime.current = instance;
    return () => { mounted = false; runtime.current = null; instance.dispose(); };
  }, [worldId, quality]);

  const disabled = !ready || Boolean(error);
  const activeAsset = assets.find((asset) => asset.id === selected);

  return createPortal(
    <dialog ref={dialog} className={styles.viewer} aria-labelledby={titleId}
      data-planet-viewer data-planet={worldId} data-status={error ? "error" : ready ? "ready" : "loading"}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className={styles.topBar}>
        <div><p className={styles.kicker}>PLANET STUDY</p><h2 id={titleId}>{world.label}</h2></div>
        <Button buttonRef={closeButton} onClick={onClose}>Close 3D</Button>
      </header>
      <div className={styles.stage} ref={stage} tabIndex={0} role="group" aria-label="3D planet controls"
        aria-describedby={hintId} data-planet-stage
        onPointerDown={(event) => event.currentTarget.focus({ preventScroll: true })}
        onKeyDown={(event) => {
          if (disabled || event.ctrlKey || event.metaKey || event.altKey) return;
          const controls = runtime.current;
          const move = event.shiftKey || controlMode === "move";
          switch (event.key) {
            case "ArrowLeft": if (move) controls?.pan(-0.05, 0); else controls?.rotate(-0.15, 0); break;
            case "ArrowRight": if (move) controls?.pan(0.05, 0); else controls?.rotate(0.15, 0); break;
            case "ArrowUp": if (move) controls?.pan(0, -0.05); else controls?.rotate(0, -0.15); break;
            case "ArrowDown": if (move) controls?.pan(0, 0.05); else controls?.rotate(0, 0.15); break;
            case "+": case "=": controls?.zoom(0.8); break;
            case "-": controls?.zoom(1.25); break;
            case "Home": controls?.resetCamera(); break;
            default: return;
          }
          event.preventDefault(); event.stopPropagation();
        }} />
      {disabled && <div className={styles.message} role={error ? "alert" : "status"}>
        <p>{error || `Loading ${world.label}…`}</p>
        {error && <Button onClick={onRestart}>Try again</Button>}
      </div>}
      <footer className={styles.toolbar}>
        <div className={styles.controls}>
          <div className={styles.controlGroup} role="group" aria-label="Drag behavior">
            {(["rotate", "move"] as const).map((mode) => <Button key={mode} disabled={disabled}
              aria-pressed={controlMode === mode} tone={controlMode === mode ? "primary" : "secondary"}
              onClick={() => { setControlMode(mode); runtime.current?.setControlMode(mode); }}>
              {mode === "rotate" ? "Rotate" : "Move"}
            </Button>)}
          </div>
          <div className={styles.controlGroup} role="group" aria-label="Camera controls">
            <Button disabled={disabled} aria-label="Zoom in" onClick={() => runtime.current?.zoom(0.8)}>+</Button>
            <Button disabled={disabled} aria-label="Zoom out" onClick={() => runtime.current?.zoom(1.25)}>−</Button>
            <Button disabled={disabled} onClick={() => runtime.current?.resetCamera()}>Reset</Button>
          </div>
          <label className={styles.autoRotate}>
            <input type="checkbox" checked={autoRotate && !reducedMotion} disabled={disabled || reducedMotion}
              onChange={(event) => { setAutoRotate(event.target.checked); runtime.current?.setAutoRotate(event.target.checked); }} />
            Slow spin{reducedMotion ? " · motion reduced" : ""}
          </label>
          <Button disabled={disabled} aria-expanded={inspector} aria-controls={inspectorId} onClick={() => setInspector(!inspector)}>Inspect</Button>
        </div>
        <p id={hintId} className={styles.hint}>Drag to {controlMode}. Pinch or scroll to zoom. Arrows {controlMode}; Shift + arrows move. Home resets. Esc closes.</p>
      </footer>
      {inspector && <aside id={inspectorId} className={styles.inspector} aria-label="Planet inspector">
        <div className={styles.inspectorHeading}><h3>Inspect {world.label.replace("WestCose ", "")}</h3>
          <Button onClick={() => setInspector(false)}>Hide inspector</Button></div>
        {assets.length > 1 && <label className={styles.selectLabel}>Model parts
          <select value={selected} onChange={(event) => { setSelected(event.target.value); runtime.current?.select(event.target.value); }}>
            {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.kind === "model" ? "Complete planet" : asset.label.replace(`${world.label} / `, "")}</option>)}
          </select>
        </label>}
        <fieldset className={styles.materialControls}>
          <legend>Technical View</legend>
          {materialModes.map(([value, label]) => <label key={value}>
            <input type="radio" name={radioName} checked={materialMode === value} onChange={() => {
              setMaterialMode(value); runtime.current?.setMaterialMode(value);
            }} />{label}
          </label>)}
        </fieldset>
        <dl className={styles.stats} aria-label="Visible source model statistics" data-planet-stats>
          {([["Meshes", stats?.meshes], ["Triangles", stats?.triangles], ["Vertices", stats?.vertices],
            ["Source materials", stats?.materials], ["Textures", stats?.textures]] as const).map(([label, value]) =>
            <div key={label}><dt>{label}</dt><dd>{value?.toLocaleString("en-US") ?? "—"}</dd></div>)}
        </dl>
        <p className={styles.hint}>Counts follow the selected geometry. Original materials and textures are reused.</p>
        {activeAsset && <code className={styles.sourceName}>{activeAsset.source.split("/").at(-1)}</code>}
      </aside>}
    </dialog>, document.body,
  );
}
