"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box3, Color, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, Sphere, Spherical, Texture, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { WorldModel } from "./content";
import styles from "./WorldShowcase.module.css";

type Inspector = { turn: (x: number, y: number) => void; zoom: (scale: number) => void; reset: () => void; wire: (value: boolean) => void };

export default function ModelViewer({ model }: { model: WorldModel }) {
  const [attempt, setAttempt] = useState(0);
  return <Inspector key={attempt} model={model} retry={() => setAttempt(value => value + 1)} />;
}

function Inspector({ model, retry }: { model: WorldModel; retry: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<Inspector | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [wire, setWire] = useState(false);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    const abort = new AbortController();
    let disposed = false;
    let renderer: WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let observer: ResizeObserver | undefined;
    const scene = new Scene();
    const geometries = new Set<import("three").BufferGeometry>();
    const materials = new Set<import("three").Material>();
    const textures = new Set<Texture>();
    function collect(object: import("three").Object3D) {
      object.traverse(node => {
        if (!(node instanceof Mesh)) return;
        geometries.add(node.geometry);
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value);
        }
      });
    }
    function releaseAssets() {
      textures.forEach(texture => { texture.dispose(); if (typeof ImageBitmap !== "undefined" && texture.source.data instanceof ImageBitmap) texture.source.data.close(); });
      materials.forEach(material => material.dispose());
      geometries.forEach(geometry => geometry.dispose());
      textures.clear(); materials.clear(); geometries.clear();
    }
    const lost = (event: Event) => { event.preventDefault(); if (!disposed) setStatus("error"); };
    async function load() {
      try {
        renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.addEventListener("webglcontextlost", lost);
        host!.appendChild(renderer.domElement);
        scene.background = new Color("#dce2dc");
        scene.add(new HemisphereLight(0xffffff, 0x55665c, 2.6));
        const sun = new DirectionalLight(0xffffff, 3); sun.position.set(4, 7, 5); scene.add(sun);
        const camera = new PerspectiveCamera(40, 1, .01, 1000);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.enablePan = false;
        const response = await fetch(model.src, { signal: abort.signal });
        if (!response.ok) throw new Error("Model unavailable");
        const data = await response.arrayBuffer();
        if (disposed) return;
        const gltf = await new GLTFLoader().parseAsync(data, "");
        collect(gltf.scene);
        if (disposed) { releaseAssets(); return; }
        scene.add(gltf.scene);
        const sphere = new Box3().setFromObject(gltf.scene).getBoundingSphere(new Sphere());
        const distance = Math.max(sphere.radius * 3.3, 1);
        const target = sphere.center;
        const home = new Vector3(.95, .5, 1.25).normalize().multiplyScalar(distance).add(target);
        camera.near = Math.max(distance / 1000, .001); camera.far = distance * 20;
        controls.target.copy(target); controls.minDistance = distance * .32; controls.maxDistance = distance * 2.6;
        const render = () => { if (!disposed) renderer!.render(scene, camera); };
        const reset = () => { camera.position.copy(home); controls!.target.copy(target); controls!.update(); render(); };
        api.current = {
          turn(x, y) { const spherical = new Spherical().setFromVector3(camera.position.clone().sub(target)); spherical.theta += x; spherical.phi = Math.max(.08, Math.min(Math.PI - .08, spherical.phi + y)); camera.position.setFromSpherical(spherical).add(target); controls!.update(); render(); },
          zoom(scale) { const delta = camera.position.clone().sub(target); delta.setLength(Math.max(controls!.minDistance, Math.min(controls!.maxDistance, delta.length() * scale))); camera.position.copy(target).add(delta); controls!.update(); render(); },
          reset,
          wire(value) { materials.forEach(material => { if ("wireframe" in material) (material as MeshStandardMaterial).wireframe = value; }); render(); },
        };
        controls.addEventListener("change", render);
        observer = new ResizeObserver(() => {
          const { width, height } = host!.getBoundingClientRect();
          renderer!.setSize(Math.max(1, width), Math.max(1, height));
          camera.aspect = Math.max(1, width) / Math.max(1, height); camera.updateProjectionMatrix(); render();
        });
        observer.observe(host!);
        reset(); setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    }
    void load();
    return () => {
      disposed = true; abort.abort(); api.current = null;
      observer?.disconnect(); controls?.dispose(); releaseAssets(); scene.clear();
      if (renderer) { renderer.domElement.removeEventListener("webglcontextlost", lost); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); }
    };
  }, [model]);

  return <div className={styles.inspector}>
    <div className={styles.modelStage} role="group" aria-label={`${model.title} interactive model. Arrow keys rotate; plus and minus zoom; Home resets.`} tabIndex={0}
      onKeyDown={event => {
        const commands: Record<string, () => void> = {
          ArrowLeft: () => api.current?.turn(.15, 0), ArrowRight: () => api.current?.turn(-.15, 0),
          ArrowUp: () => api.current?.turn(0, -.15), ArrowDown: () => api.current?.turn(0, .15),
          "+": () => api.current?.zoom(.85), "=": () => api.current?.zoom(.85), "-": () => api.current?.zoom(1.15), Home: () => api.current?.reset(),
        };
        if (commands[event.key]) { event.preventDefault(); event.stopPropagation(); commands[event.key](); }
      }}>
      <div ref={mount} className={styles.modelCanvas} style={{ visibility: status === "ready" ? "visible" : "hidden" }} />
      {status !== "ready" && <Image src={model.poster.src} width={model.poster.width} height={model.poster.height} alt={model.poster.alt} sizes="90vw" />}
    </div>
    <div className={styles.modelControls}>
      {status === "ready" ? <>
        <button type="button" onClick={() => api.current?.turn(.3, 0)}>Rotate left</button>
        <button type="button" onClick={() => api.current?.turn(-.3, 0)}>Rotate right</button>
        <button type="button" onClick={() => api.current?.zoom(.8)}>Zoom in</button>
        <button type="button" onClick={() => api.current?.zoom(1.25)}>Zoom out</button>
        <button type="button" onClick={() => { api.current?.reset(); api.current?.wire(false); setWire(false); }}>Reset view</button>
        <button type="button" aria-pressed={wire} onClick={() => { api.current?.wire(!wire); setWire(!wire); }}>Wireframe</button>
      </> : <p role="status">{status === "loading" ? "Loading the model…" : <>The 3D view is unavailable. The project capture remains available. <button type="button" onClick={retry}>Retry 3D view</button></>}</p>}
    </div>
    <p className={styles.exhibitNote}>Drag to rotate. Scroll or pinch to zoom. Keyboard: arrows, + / −, Home.</p>
    <p className={styles.credit}>{model.credit}</p>
  </div>;
}
