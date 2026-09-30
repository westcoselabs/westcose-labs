import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.resolve(
  process.env.WESTCOSE_DESIGNS_ROOT ?? path.join(projectRoot, "..", "westcose-designs"),
);
const sourceConfig = "lib/home/orbit-worlds.ts";
const manifestPath = path.join(projectRoot, "src/lib/planet/source-manifest.json");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

function readGltf(bytes, filename) {
  if (filename.endsWith(".gltf")) return JSON.parse(bytes.toString("utf8"));
  if (
    bytes.readUInt32LE(0) !== 0x46546c67 ||
    bytes.readUInt32LE(4) !== 2 ||
    bytes.readUInt32LE(8) !== bytes.length
  ) throw new Error(`Invalid GLB header: ${filename}`);
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    if (offset + 8 + length > bytes.length) throw new Error(`Invalid GLB chunk: ${filename}`);
    if (type === 0x4e4f534a) {
      return JSON.parse(bytes.subarray(offset + 8, offset + 8 + length).toString("utf8").replace(/\0+$/, ""));
    }
    offset += 8 + length;
  }
  throw new Error(`Missing GLB JSON chunk: ${filename}`);
}

function named(items = []) {
  return items.map((item, index) => ({ index, name: item.name ?? null, ...item }));
}

async function inspect(assetPath) {
  if (!/^\/experience\/orbit\/models\/[\w.-]+\.(glb|gltf)$/.test(assetPath)) {
    throw new Error(`Unexpected canonical model path: ${assetPath}`);
  }
  const filename = path.posix.basename(assetPath);
  const bytes = await readFile(path.join(sourceRoot, "public", assetPath.slice(1)));
  const gltf = readGltf(bytes, filename);
  // These exact exports are self-contained. Fail if a later source revision
  // introduces sidecars, rather than silently copying or omitting resources.
  for (const resource of [...(gltf.buffers ?? []), ...(gltf.images ?? [])]) {
    if (resource.uri && !resource.uri.startsWith("data:")) {
      throw new Error(`External resource needs explicit review: ${filename}`);
    }
  }
  return {
    filename,
    path: assetPath,
    bytes: bytes.length,
    sha256: hash(bytes),
    asset: gltf.asset,
    scene: gltf.scene ?? 0,
    scenes: named(gltf.scenes),
    nodes: named(gltf.nodes),
    meshes: named(gltf.meshes),
    materials: named(gltf.materials),
    textures: named(gltf.textures),
    images: named(gltf.images).map(({ uri, ...image }) => ({
      ...image,
      ...(uri ? { embedded: true, mimeType: image.mimeType ?? uri.slice(5, uri.indexOf(";")) } : {}),
    })),
    extensionsUsed: gltf.extensionsUsed ?? [],
    extensionsRequired: gltf.extensionsRequired ?? [],
  };
}

try {
  const configBytes = await readFile(path.join(sourceRoot, sourceConfig));
  const transpiled = ts.transpileModule(configBytes.toString("utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
    fileName: "orbit-worlds.ts",
  }).outputText;
  const { ORBIT_CENTER_MODEL_SRC, ORBIT_WORLDS } = await import(
    `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`
  );
  if (!Array.isArray(ORBIT_WORLDS) || typeof ORBIT_CENTER_MODEL_SRC !== "string") {
    throw new Error("Canonical orbit config is missing its center or worlds.");
  }
  const modelPaths = [ORBIT_CENTER_MODEL_SRC];
  for (const world of ORBIT_WORLDS) {
    for (const quality of ["full", "compact"]) {
      const assetPath = world.assets?.[quality];
      if (typeof assetPath !== "string" || !assetPath.endsWith(`.web-${quality}.glb`)) {
        throw new Error(`Missing exact ${quality} export for ${world.id}`);
      }
      modelPaths.push(assetPath);
    }
  }
  const files = await Promise.all([...new Set(modelPaths)].map(inspect));
  if (new Set(files.map((file) => file.filename)).size !== files.length) {
    throw new Error("Canonical asset filenames must be unique.");
  }
  const center = files[0];
  const manifest = {
    sourceProject: "westcose-designs",
    sourceConfig,
    sourceConfigSha256: hash(configBytes),
    center: { path: center.path, filename: center.filename, bytes: center.bytes, sha256: center.sha256 },
    worlds: ORBIT_WORLDS,
    files,
  };
  const output = `${JSON.stringify(manifest, null, 2)}\n`;
  if (process.argv.includes("--check")) {
    if (await readFile(manifestPath, "utf8") !== output) {
      throw new Error("Planet manifest is stale. Run npm run planet:inspect and review its diff.");
    }
    console.log(`Planet manifest verified: ${files.length} original files, matching SHA-256 digests.`);
  } else {
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, output);
    console.log(`Inspected ${files.length} original files. Wrote metadata only to src/lib/planet/source-manifest.json.`);
  }
} catch (error) {
  console.error(`Planet inspection failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
}
