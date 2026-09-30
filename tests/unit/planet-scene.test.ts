import { describe, expect, it } from "vitest";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Texture,
  Vector3,
} from "three";
import {
  inspectSourceMeshes,
  namedSourceGroups,
  sourceMeshBounds,
  sourceMeshes,
} from "@/lib/planet/scene-inspection";
import { planetSourceManifest } from "@/lib/planet/asset-source";

describe("planet source inspection", () => {
  it("counts glTF primitives and shared accessors without duplicating vertices or textures", () => {
    const position = new BufferAttribute(new Float32Array([
      0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
    ]), 3);
    const texture = new Texture();
    const first = new Mesh(
      new BufferGeometry().setAttribute("position", position).setIndex([0, 1, 2]),
      new MeshStandardMaterial({ map: texture }),
    );
    const second = new Mesh(
      new BufferGeometry().setAttribute("position", position).setIndex([0, 2, 3]),
      new MeshStandardMaterial({ map: texture }),
    );
    expect(inspectSourceMeshes([first, second, first])).toEqual({
      meshes: 2, triangles: 2, vertices: 4, materials: 2, textures: 1,
    });
    const originals = new Map([[first, first.material], [second, second.material]]);
    first.material = second.material = new MeshStandardMaterial({ wireframe: true });
    expect(inspectSourceMeshes([first, second], originals)).toEqual({
      meshes: 2, triangles: 2, vertices: 4, materials: 2, textures: 1,
    });
  });

  it("honors material groups and draw ranges when counting rendered triangles", () => {
    const geometry = new BufferGeometry()
      .setAttribute("position", new BufferAttribute(new Float32Array(18), 3))
      .setIndex([0, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4, 5]);
    geometry.addGroup(0, 6, 0);
    geometry.addGroup(6, 6, 1);
    geometry.setDrawRange(3, 6);
    const mesh = new Mesh(geometry, [new MeshBasicMaterial(), new MeshBasicMaterial()]);
    expect(inspectSourceMeshes([mesh])).toMatchObject({ triangles: 2, vertices: 6, materials: 2 });
  });

  it("frames only selected geometry while preserving imported quantization transforms", () => {
    const group = new Group();
    group.position.set(12, 2, -3);
    group.scale.set(0.25, 0.5, 0.125);
    const selected = new Mesh(new BoxGeometry(2, 2, 2));
    const other = new Mesh(new BoxGeometry(1000, 1000, 1000));
    other.visible = false;
    group.add(selected, other);
    const position = group.position.clone();
    const scale = group.scale.clone();
    const bounds = sourceMeshBounds([selected]);
    expect(bounds.getCenter(new Vector3()).toArray()).toEqual([12, 2, -3]);
    expect(bounds.getSize(new Vector3()).toArray()).toEqual([0.5, 1, 0.25]);
    expect(group.position.equals(position)).toBe(true);
    expect(group.scale.equals(scale)).toBe(true);
  });

  it("partitions the actual Labs named meshes into existing source groups", () => {
    const file = planetSourceManifest.files.find((entry) => entry.filename.includes("labs") && entry.filename.includes("compact"))!;
    const meshes = file.nodes.map((node) => {
      const mesh = new Mesh();
      mesh.name = node.name ?? "";
      return mesh;
    });
    const groups = namedSourceGroups("labs", meshes);
    expect(Object.fromEntries(groups.map((group) => [group.id, group.meshes.length]))).toEqual({
      "labs:shell": 1,
      "labs:dish": 95,
      "labs:hologram": 15,
      "labs:mast": 3,
      "labs:monitor": 12,
      "labs:orbit": 1,
      "labs:plaque": 3,
      "labs:portal": 50,
      "labs:server": 106,
    });
    expect(new Set(groups.flatMap((group) => group.meshes)).size).toBe(meshes.length);
  });

  it("uses the real parent node for multi-primitive glTF meshes", () => {
    const node = new Group();
    node.name = "wc_apparel_cap_cloth";
    node.add(new Mesh(), new Mesh());
    const meshes = sourceMeshes(node);
    expect(meshes).toHaveLength(2);
    expect(namedSourceGroups("shop", meshes)[0]).toMatchObject({ id: "shop:apparel", meshes });
  });

  it("does not invent subparts for the fused Designs model", () => {
    const mesh = new Mesh();
    mesh.name = "mesh";
    expect(namedSourceGroups("designs", [mesh])).toEqual([]);
  });
});
