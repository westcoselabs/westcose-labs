import {
  Box3,
  InstancedMesh,
  Mesh,
  Texture,
  type BufferAttribute,
  type InterleavedBufferAttribute,
  type Material,
  type Object3D,
} from "three";

export type PlanetStats = {
  meshes: number;
  triangles: number;
  vertices: number;
  materials: number;
  textures: number;
};
export type PlanetAssetOption = {
  id: string;
  label: string;
  source: string;
  kind: "model" | "group";
  meshCount: number;
};
export type SourceMaterial = Material | Material[];

export function sourceMeshes(root: Object3D): Mesh[] {
  const meshes: Mesh[] = [];
  root.traverse((node) => {
    if (node instanceof Mesh) meshes.push(node);
  });
  return meshes;
}

export function materialTextures(material: Material): Texture[] {
  return Object.values(material).filter(
    (value): value is Texture => value instanceof Texture,
  );
}

/** Primitives count as meshes; triangles count drawn instances, vertices count
 * unique source position accessors. Materials/textures are unique references. */
export function inspectSourceMeshes(
  meshes: readonly Mesh[],
  originalMaterials?: ReadonlyMap<Mesh, SourceMaterial>,
): PlanetStats {
  const positions = new Set<BufferAttribute | InterleavedBufferAttribute>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  let triangles = 0;
  let vertices = 0;
  const uniqueMeshes = new Set(meshes);
  for (const mesh of uniqueMeshes) {
    const geometry = mesh.geometry;
    const position = geometry.getAttribute("position");
    if (position && !positions.has(position)) {
      positions.add(position);
      vertices += position.count;
    }
    const sourceMaterial = originalMaterials?.get(mesh) ?? mesh.material;
    const slots = Array.isArray(sourceMaterial) ? sourceMaterial : [sourceMaterial];
    for (const material of slots) {
      materials.add(material);
      materialTextures(material).forEach((texture) => textures.add(texture));
    }
    const total = geometry.index?.count ?? position?.count ?? 0;
    const start = Math.max(0, geometry.drawRange.start);
    const end = Math.min(total, start + geometry.drawRange.count);
    const count = (from: number, to: number) =>
      Math.floor(Math.max(0, Math.min(end, to) - Math.max(start, from)) / 3);
    const primitiveTriangles = Array.isArray(sourceMaterial)
      ? geometry.groups.reduce(
          (sum, group) => sum + (slots[group.materialIndex ?? 0]
            ? count(group.start, group.start + group.count)
            : 0),
          0,
        )
      : count(0, total);
    triangles += primitiveTriangles * (mesh instanceof InstancedMesh ? mesh.count : 1);
  }
  return {
    meshes: uniqueMeshes.size,
    triangles,
    vertices,
    materials: materials.size,
    textures: textures.size,
  };
}

/** Use explicit selected meshes: Box3.setFromObject also includes hidden peers. */
export function sourceMeshBounds(meshes: readonly Mesh[]): Box3 {
  const bounds = new Box3();
  const meshBounds = new Box3();
  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (mesh.geometry.boundingBox) {
      meshBounds.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
      bounds.union(meshBounds);
    }
  }
  return bounds;
}

const NAMED_GROUPS: Record<string, readonly [string, string, RegExp][]> = {
  labs: [
    ["shell", "Labs shell", /^geometry_0(?:\.|$)/],
    ["dish", "Satellite dish", /^wc_labs_dish_/],
    ["hologram", "Hologram", /^wc_labs_hologram_/],
    ["mast", "Mast", /^wc_labs_mast_/],
    ["monitor", "Monitors", /^wc_labs_monitor_/],
    ["orbit", "Orbit detail", /^wc_labs_orbit_/],
    ["plaque", "Plaques", /^wc_labs_plaque_/],
    ["portal", "Portal", /^wc_labs_portal_/],
    ["server", "Server banks", /^wc_labs_server_/],
  ],
  shop: [
    ["apparel", "Apparel & hangers", /^wc_apparel_/],
    ["brand", "Brand marks", /^wc_brand_/],
    ["body", "Shop body", /^wc_building_westcose_shop_/],
    ["container", "Container details", /^wc_container_/],
    ["exterior", "Exterior panels", /^wc_shop_exterior_/],
  ],
};

/** Only existing named prefixes are exposed. A fused model has no invented parts. */
export function namedSourceGroups(modelId: string, meshes: readonly Mesh[]) {
  return (NAMED_GROUPS[modelId] ?? []).flatMap(([id, label, prefix]) => {
    const selected = meshes.filter((mesh) => {
      let node: Object3D | null = mesh;
      while (node) {
        if (prefix.test(node.name)) return true;
        node = node.parent;
      }
      return false;
    });
    return selected.length ? [{ id: `${modelId}:${id}`, label, meshes: selected }] : [];
  });
}
