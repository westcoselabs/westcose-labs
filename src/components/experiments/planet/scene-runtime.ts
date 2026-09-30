import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { planetAssetUrl, planetSourceManifest } from "@/lib/planet/asset-source";
import {
  inspectSourceMeshes,
  materialTextures,
  namedSourceGroups,
  sourceMeshBounds,
  sourceMeshes,
  type PlanetAssetOption,
  type PlanetStats,
  type SourceMaterial,
} from "@/lib/planet/scene-inspection";

export type { PlanetAssetOption, PlanetStats } from "@/lib/planet/scene-inspection";
export type PlanetMaterialMode = "final" | "clay" | "wireframe";
export type PlanetRuntime = {
  dispose: () => void;
  select: (id: string) => void;
  setControlMode: (mode: "rotate" | "move") => void;
  pan: (dx: number, dy: number) => void;
  setMaterialMode: (mode: PlanetMaterialMode) => void;
  setAutoRotate: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetCamera: () => void;
  /** Radians around the camera's target. */
  rotate: (dx: number, dy: number) => void;
  /** Multiplies camera distance; values below one zoom in. */
  zoom: (factor: number) => void;
};
type RuntimeOptions = {
  worldId: string;
  quality: "full" | "compact";
  reducedMotion: boolean;
  onReady: (assets: PlanetAssetOption[], stats: PlanetStats) => void;
  onStats: (stats: PlanetStats) => void;
  onError: (message: string) => void;
  /** Only the selected planet is requested. */
  onProgress: (loaded: number, total: number) => void;
};
type World = (typeof planetSourceManifest.worlds)[number];
type Model = {
  id: string;
  label: string;
  source: string;
  anchor: THREE.Group;
  meshes: THREE.Mesh[];
  world?: World;
};

class ResourcePool {
  private closed = false;
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private closedImages = new Set<object>();

  track(value: unknown) {
    if (value instanceof THREE.Object3D) {
      value.traverse((node) => {
        if (node instanceof THREE.Mesh || node instanceof THREE.Line || node instanceof THREE.Points) {
          this.track(node.geometry);
          this.track(node.material);
        }
      });
    } else if (Array.isArray(value)) {
      value.forEach((entry) => this.track(entry));
    } else if (value instanceof THREE.BufferGeometry) {
      if (this.geometries.has(value)) return;
      this.geometries.add(value);
      if (this.closed) value.dispose();
    } else if (value instanceof THREE.Material) {
      if (this.materials.has(value)) return;
      this.materials.add(value);
      materialTextures(value).forEach((texture) => this.track(texture));
      if (this.closed) value.dispose();
    } else if (value instanceof THREE.Texture) {
      if (this.textures.has(value)) return;
      this.textures.add(value);
      if (this.closed) this.disposeTexture(value);
    }
  }

  private disposeTexture(texture: THREE.Texture) {
    texture.dispose();
    const image: unknown = texture.source.data;
    if (image && typeof image === "object" && "close" in image &&
        typeof image.close === "function" && !this.closedImages.has(image)) {
      this.closedImages.add(image);
      image.close();
    }
  }

  dispose() {
    if (this.closed) return;
    this.closed = true;
    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.textures.forEach((texture) => this.disposeTexture(texture));
  }
}

const worlds = planetSourceManifest.worlds;

export function createPlanetRuntime(container: HTMLElement, options: RuntimeOptions): PlanetRuntime {
  let disposed = false;
  let ready = false;
  let announcedReady = false;
  let readyFrames = 0;
  let autoRotate = true;
  let interacting = false;
  let reducedMotion = options.reducedMotion;
  let selection = options.worldId;
  let mode: PlanetMaterialMode = "final";
  let frame = 0;
  let settlingFrames = 0;
  let previousTime = 0;
  let intersecting = true;
  let width = 1;
  let height = 1;
  let fitDistance = 8.98;
  let renderer: THREE.WebGLRenderer | undefined;
  let controls: OrbitControls | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;
  let environment: THREE.WebGLRenderTarget | undefined;
  const abort = new AbortController();
  const manager = new THREE.LoadingManager();
  const pool = new ResourcePool();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 48);
  const inspectionPivot = new THREE.Group();
  const stage = new THREE.Group();
  inspectionPivot.add(stage);
  scene.add(inspectionPivot);
  const models: Model[] = [];
  const assets: PlanetAssetOption[] = [];
  const selections = new Map<string, { model: Model; meshes: THREE.Mesh[] }>();
  const originals = new Map<THREE.Mesh, SourceMaterial>();
  const clay = new THREE.MeshStandardMaterial({ color: "#777b74", roughness: 1, metalness: 0, envMapIntensity: 0.35, side: THREE.DoubleSide });
  const wire = new THREE.MeshBasicMaterial({ color: "#99c6dc", wireframe: true, side: THREE.DoubleSide });
  pool.track([clay, wire]);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  const cameraOffset = new THREE.Vector3();
  const spherical = new THREE.Spherical();
  const panOffset = new THREE.Vector3();
  const panAxis = new THREE.Vector3();

  function visibleMeshes() {
    return selections.get(selection)?.meshes ?? [];
  }
  function mayRender() {
    return !disposed && document.visibilityState !== "hidden" && intersecting && width > 0 && height > 0;
  }
  function queueFrame() {
    if (!frame && mayRender()) frame = window.requestAnimationFrame(draw);
  }
  function invalidate() {
    // Present the final still frame through double-buffered WebKit contexts.
    // A single demand frame can leave the previous camera/material visible.
    settlingFrames = 2;
    queueFrame();
  }
  function halt() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }
  function fail(message: string) {
    if (disposed) return;
    dispose();
    options.onError(message);
  }
  function draw(now: number) {
    frame = 0;
    if (!mayRender() || !renderer) return;
    try {
      if (ready && autoRotate && !reducedMotion && !interacting) {
        const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
        inspectionPivot.rotation.y += delta * 0.08;
      }
      previousTime = now;
      renderer.render(scene, camera);
      settlingFrames = Math.max(0, settlingFrames - 1);
      if (ready && !announcedReady) {
        // Allow the first model frame to reach the compositor before enabling
        // inspection, including demand rendering under Reduced Motion.
        readyFrames++;
        if (readyFrames >= 2) {
          announcedReady = true;
          options.onReady(assets, inspectSourceMeshes(visibleMeshes(), originals));
        }
      }
      if (settlingFrames > 0 || (ready && autoRotate && !reducedMotion && !interacting)) queueFrame();
    } catch {
      fail("The 3D renderer stopped responding. Close the scene or retry loading it.");
    }
  }
  function frameCamera(reset: boolean) {
    if (!controls) return;
    stage.updateWorldMatrix(true, true);
    const bounds = sourceMeshBounds(visibleMeshes());
    if (bounds.isEmpty()) return;
    bounds.getSize(size);
    const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const required = Math.max(size.y / (2 * vertical), size.x / (2 * vertical * camera.aspect)) * 1.16 + size.z / 2;
    const nextFit = Math.max(3, required);
    const ratio = reset ? 1 : camera.position.distanceTo(controls.target) / fitDistance;
    if (reset) cameraOffset.set(0, 0.18, 8.98).normalize();
    else cameraOffset.copy(camera.position).sub(controls.target).normalize();
    if (reset) controls.target.set(0, 0, 0);
    fitDistance = nextFit;
    controls.minDistance = 0.75;
    controls.maxDistance = Math.min(42, nextFit * 4);
    camera.position.copy(controls.target).addScaledVector(cameraOffset, THREE.MathUtils.clamp(nextFit * ratio, controls.minDistance, controls.maxDistance));
    controls.update();
    invalidate();
  }
  function appearance() {
    scene.background = new THREE.Color(mode === "final" ? "#080b0a" : "#1b201e");
    originals.forEach((original, mesh) => {
      const technical = mode === "clay" ? clay : wire;
      mesh.material = mode === "final" ? original : Array.isArray(original) ? original.map(() => technical) : technical;
    });
  }
  function select(id: string) {
    if (disposed || !selections.has(id)) return;
    selection = id;
    inspectionPivot.rotation.set(0, 0, 0);
    stage.position.set(0, 0, 0);
    stage.scale.setScalar(1);
    const selected = selections.get(id)!;
    const included = new Set(selected.meshes);
    models.forEach((model) => {
      model.anchor.visible = selected.model === model;
      model.anchor.position.set(0, 0, 0);
      model.anchor.rotation.set(0, 0, 0);
      model.meshes.forEach((mesh) => { mesh.visible = included.has(mesh); });
    });
    const bounds = sourceMeshBounds(selected.meshes);
    bounds.getSize(size);
    const scale = 3.2 / Math.max(size.x, size.y, size.z, 0.001);
    bounds.getCenter(center);
    stage.scale.setScalar(scale);
    stage.position.copy(center).multiplyScalar(-scale);
    appearance();
    frameCamera(true);
    options.onStats(inspectSourceMeshes(visibleMeshes(), originals));
    invalidate();
  }
  function resize() {
    if (!renderer || disposed) return;
    const bounds = container.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) { halt(); return; }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (ready) frameCamera(false);
    invalidate();
  }
  function visibilityChanged() {
    if (document.visibilityState === "hidden") halt();
    else { previousTime = 0; invalidate(); }
  }
  function interactionStart() { interacting = true; previousTime = 0; }
  function interactionEnd() { interacting = false; previousTime = 0; invalidate(); }
  function contextLost(event: Event) {
    event.preventDefault();
    fail("The browser released the 3D context. Your scene can be loaded again.");
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    halt();
    abort.abort();
    manager.abort();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", visibilityChanged);
    window.removeEventListener("resize", resize);
    controls?.removeEventListener("change", invalidate);
    controls?.removeEventListener("start", interactionStart);
    controls?.removeEventListener("end", interactionEnd);
    controls?.dispose();
    renderer?.domElement.removeEventListener("webglcontextlost", contextLost);
    pool.dispose();
    environment?.dispose();
    scene.clear();
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
  }

  function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: options.quality === "full", failIfMajorPerformanceCaveat: true, powerPreference: "high-performance", preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.quality === "full" ? 1.5 : 1.2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.setClearColor(0x080b0a, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-label", `${worlds.find((world) => world.id === options.worldId)?.label ?? "WestCose"} planet`);
    canvas.setAttribute("role", "img");
    canvas.tabIndex = -1;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);
    canvas.addEventListener("webglcontextlost", contextLost);
    camera.position.set(0, 0.18, 8.9);
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.maxTargetRadius = 3;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.target.set(0, 0, 0);
    controls.update();
    controls.addEventListener("change", invalidate);
    controls.addEventListener("start", interactionStart);
    controls.addEventListener("end", interactionEnd);

    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    try { environment = pmrem.fromScene(room, 0.04); }
    finally { pmrem.dispose(); room.dispose(); }
    scene.environment = environment.texture;
    scene.add(new THREE.AmbientLight("#d8e0da", 0.72), new THREE.HemisphereLight("#eef4ef", "#151b18", 1.9));
    const light = (color: string, intensity: number, x: number, y: number, z: number) => {
      const result = new THREE.DirectionalLight(color, intensity);
      result.position.set(x, y, z);
      scene.add(result);
    };
    light("#fff1df", 4.4, 4.8, 7.2, 6.5);
    light("#72a9d0", 2.45, -5.5, 2.2, 4.2);
    light("#d9e6d8", 2.9, 0.6, -4.8, -3.5);
    const focus = new THREE.PointLight("#a7c2aa", 9, 10, 1.7);
    focus.position.set(1.8, 1.25, 3.7);
    const warm = new THREE.PointLight("#e18453", 7.5, 9, 1.8);
    warm.position.set(-3.2, -1.8, 4.1);
    scene.add(focus, warm);
    appearance();
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        intersecting = entry.isIntersecting;
        if (intersecting) { previousTime = 0; invalidate(); }
        else halt();
      });
      intersectionObserver.observe(container);
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("resize", resize);
  }

  async function loadModel(id: string, label: string, source: string, world?: World): Promise<Model | undefined> {
    const response = await fetch(planetAssetUrl(source), { signal: abort.signal });
    if (!response.ok) throw new Error(`Could not load ${label}.`);
    const buffer = await response.arrayBuffer();
    if (disposed) return;
    const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
    // Track dependencies as they resolve, including partial parses and work that
    // finishes after cancellation. The pool disposes each resource exactly once.
    loader.register((parser) => {
      const dependency = parser.getDependency.bind(parser);
      parser.getDependency = (type, index) => dependency(type, index).then((value: unknown) => {
        pool.track(value);
        return value;
      });
      return { name: "WESTCOSE_RESOURCE_LIFECYCLE" };
    });
    const gltf = await loader.parseAsync(buffer, "");
    gltf.scenes.forEach((root) => pool.track(root));
    if (disposed) return;
    const root = gltf.scene;
    const meshes = sourceMeshes(root);
    const processed = new Set<THREE.Material>();
    meshes.forEach((mesh) => {
      originals.set(mesh, mesh.material);
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (processed.has(material)) return;
        processed.add(material);
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = world?.presentation.envMapIntensity ?? 1.18;
          material.color.multiply(new THREE.Color(world?.presentation.colorMultiplier ?? "#ffffff"));
          material.needsUpdate = true;
        }
      });
    });
    root.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(root, true);
    bounds.getSize(size);
    const scale = (world?.presentation.targetSize ?? 0.96) / Math.max(size.x, size.y, size.z, Number.EPSILON);
    bounds.getCenter(center);
    const normalization = new THREE.Group();
    normalization.scale.setScalar(scale);
    normalization.position.copy(center).multiplyScalar(-scale);
    normalization.add(root);
    const presentation = new THREE.Group();
    const rotation = world?.presentation.rotation ?? [0, 0, 0];
    presentation.rotation.set(rotation[0], rotation[1], rotation[2]);
    presentation.add(normalization);
    const anchor = new THREE.Group();
    anchor.add(presentation);
    // Source nodes retain their imported quantization scales/translations.
    return { id, label, source, anchor, meshes, world };
  }

  async function initialize() {
    try {
      if (disposed) return;
      setupRenderer();
      manager.onError = () => fail("A scene dependency could not be decoded. Retry loading the original scene.");
      options.onProgress(0, 1);
      const world = worlds.find((candidate) => candidate.id === options.worldId);
      if (!world) throw new Error("Unknown source planet.");
      const loadedModel = await loadModel(world.id, world.label, world.assets[options.quality], world);
      if (disposed) return;
      options.onProgress(1, 1);
      [loadedModel].forEach((model) => {
        if (!model) return;
        models.push(model);
        stage.add(model.anchor);
        selections.set(model.id, { model, meshes: model.meshes });
        assets.push({ id: model.id, label: model.label, source: model.source, kind: "model", meshCount: model.meshes.length });
        namedSourceGroups(model.id, model.meshes).forEach((group) => {
          selections.set(group.id, { model, meshes: group.meshes });
          assets.push({ id: group.id, label: `${model.label} / ${group.label}`, source: model.source, kind: "group", meshCount: group.meshes.length });
        });
      });
      ready = true;
      previousTime = 0;
      select(world.id);
    } catch (error) {
      if (!disposed) fail(error instanceof Error && error.message.startsWith("Could not load")
        ? `${error.message} Retry or continue reading the scene breakdown.`
        : "The 3D scene could not start. Check WebGL support or retry loading it.");
    }
  }
  // Return a cancellable handle before WebGL or network initialization begins.
  void Promise.resolve().then(initialize);

  return {
    dispose,
    select,
    setControlMode(next) {
      if (!controls || disposed) return;
      controls.mouseButtons.LEFT = next === "move" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
      controls.touches.ONE = next === "move" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
    },
    pan(dx, dy) {
      if (!controls || disposed) return;
      camera.updateMatrixWorld();
      const span = 2 * camera.position.distanceTo(controls.target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      panOffset.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(-dx * span);
      panAxis.setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(dy * span);
      panOffset.add(panAxis);
      camera.position.add(panOffset);
      controls.target.add(panOffset);
      controls.update();
      invalidate();
    },
    setMaterialMode(next) { if (!disposed) { mode = next; appearance(); invalidate(); } },
    setAutoRotate(enabled) { autoRotate = enabled; previousTime = 0; invalidate(); },
    setReducedMotion(enabled) { reducedMotion = enabled; previousTime = 0; invalidate(); },
    resetCamera() { if (!disposed && ready) { inspectionPivot.rotation.set(0, 0, 0); frameCamera(true); } },
    rotate(dx, dy) {
      if (!controls || disposed) return;
      cameraOffset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(cameraOffset);
      spherical.theta += dx;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi + dy, 0.05, Math.PI - 0.05);
      camera.position.copy(controls.target).add(cameraOffset.setFromSpherical(spherical));
      controls.update();
      invalidate();
    },
    zoom(factor) {
      if (!controls || disposed || !Number.isFinite(factor) || factor <= 0) return;
      cameraOffset.copy(camera.position).sub(controls.target);
      const distance = THREE.MathUtils.clamp(cameraOffset.length() * factor, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(cameraOffset.setLength(distance));
      controls.update();
      invalidate();
    },
  };
}
