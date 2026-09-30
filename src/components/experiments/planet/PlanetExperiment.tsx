"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, SurfaceRecessed } from "@/components/ui";
import { useSettings } from "@/components/os/SettingsContext";
import { getPlanetAsset, planetSourceManifest } from "@/lib/planet/asset-source";
import styles from "./PlanetExperiment.module.css";

const PlanetViewer = dynamic(() => import("./PlanetViewer"), {
  ssr: false,
  loading: () => <p role="status">Opening the scene viewer…</p>,
});

const fullTextureQuery = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";
function subscribeQuality(callback: () => void) {
  const media = window.matchMedia(fullTextureQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const prefersFullTextures = () => window.matchMedia(fullTextureQuery).matches;
const serverPrefersFullTextures = () => false;

export function PlanetExperiment() {
  const settings = useSettings();
  const reducedMotion = settings?.effectiveAccessibility.reducedMotion ?? false;
  const fullTextures = useSyncExternalStore(subscribeQuality, prefersFullTextures, serverPrefersFullTextures);
  const [qualityOverride, setQuality] = useState<"full" | "compact" | null>(null);
  const quality = qualityOverride ?? (fullTextures ? "full" : "compact");
  const [selected, setSelected] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !selected) trigger.current?.focus({ preventScroll: true });
    wasOpen.current = Boolean(selected);
  }, [selected]);
  const files = planetSourceManifest.worlds.map((world) => world.assets[quality])
    .map((path) => getPlanetAsset(path.split("/").at(-1)!))
    .filter((file) => file !== undefined);

  return (
    <section className={styles.experiment} aria-label="WestCose Designs scene breakdown">
      <SurfaceRecessed className={styles.launcher}>
          <p className={styles.kicker}>WESTCOSE DESIGNS / ORIGINAL ORBIT SCENE</p>
          <h2>Pick a planet.</h2>
          <p>Three worlds from WestCose Designs. Open one full screen, turn it around, and look closer.</p>
          <div className={styles.launchActions}>
            <label className={styles.selectLabel}>
              Texture quality
              <select value={quality} onChange={(event) => setQuality(event.target.value as "full" | "compact")}>
                <option value="full">Full textures</option>
                <option value="compact">Compact textures</option>
              </select>
            </label>
          </div>
          <div className={styles.planetList}>
            {planetSourceManifest.worlds.map((world, index) => (
              <article className={styles.planetCard} key={world.id}>
                <span className={styles.kicker}>0{index + 1}</span>
                <h3>{world.label}</h3>
                <p>{world.summary}</p>
                <Button aria-haspopup="dialog" onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setQuality(quality);
                  setSelected(world.id);
                }}>Explore {world.label.replace("WestCose ", "")}</Button>
                <small>{((files[index]?.bytes ?? 0) / 1_000_000).toFixed(1)} MB · Full-screen 3D</small>
              </article>
            ))}
          </div>
          <small>Drag to rotate or move. Pinch or scroll to zoom. Slow rotation respects Reduced Motion.</small>
      </SurfaceRecessed>
      {selected && (
        <PlanetViewer
          key={`${selected}-${quality}-${attempt}`}
          worldId={selected}
          quality={quality}
          reducedMotion={reducedMotion}
          onClose={() => setSelected(null)}
          onRestart={() => setAttempt((value) => value + 1)}
        />
      )}
      <details className={styles.inventory}>
        <summary>Source files · {files.length} models</summary>
        <p>The original WestCose Designs models, with their embedded textures and authored materials. Only the planet you open is loaded.</p>
        <ul>
          {files.map((file) => (
            <li key={file.filename}>
              <code>{file.filename}</code>
              <small>{file.meshes.length} source meshes · {file.materials.length} materials · {file.images.length} images · {(file.bytes / 1_000_000).toFixed(2)} MB</small>
            </li>
          ))}
        </ul>
      </details>
      <noscript>The interactive viewer needs JavaScript. The source inventory above remains available.</noscript>
    </section>
  );
}
