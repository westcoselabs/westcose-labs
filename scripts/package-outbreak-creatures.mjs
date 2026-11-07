import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import sharp from "sharp";

const sourceDirectory = process.argv[2];
if (!sourceDirectory) {
  throw new Error("Pass the directory containing the generated source strips.");
}

const manifestPath = resolve("docs/OUTBREAK_CREATURES.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const { frame_size: frameSize, baseline } = manifest.technical;
let totalBytes = 0;

for (const asset of manifest.assets) {
  const source = join(sourceDirectory, asset.source_file);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.width % 2 !== 0) throw new Error(`Unequal frame halves in ${asset.id}`);
  const half = info.width / 2;
  let left = half, top = info.height, right = -1, bottom = -1, transparent = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha === 0) transparent++;
      if (alpha <= 32) continue;
      const localX = x % half;
      left = Math.min(left, localX);
      right = Math.max(right, localX);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || transparent < info.width * info.height * 0.2) {
    throw new Error(`Missing silhouette or transparent background in ${asset.id}`);
  }

  // One shared crop and scale preserves the camera and body size across poses.
  left = Math.max(0, left - 4);
  top = Math.max(0, top - 4);
  right = Math.min(half - 1, right + 4);
  bottom = Math.min(info.height - 1, bottom + 4);
  const width = right - left + 1;
  const height = bottom - top + 1;
  const scale = Math.min((frameSize - 40) / width, (baseline - 24) / height);
  const outputWidth = Math.round(width * scale);
  const outputHeight = Math.round(height * scale);
  const frames = await Promise.all([0, 1].map(async (frame) => ({
    input: await sharp(source)
      .extract({ left: left + frame * half, top, width, height })
      .resize(outputWidth, outputHeight)
      .png()
      .toBuffer(),
    left: frame * frameSize + Math.floor((frameSize - outputWidth) / 2),
    top: baseline - outputHeight,
  })));
  const output = resolve(asset.path);
  await mkdir(resolve(output, ".."), { recursive: true });
  await sharp({
    create: {
      width: frameSize * 2,
      height: frameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(frames).webp({ quality: 90, alphaQuality: 100 }).toFile(output);
  const bytes = (await stat(output)).size;
  totalBytes += bytes;
  asset.source_dimensions = [info.width, info.height];
  asset.source_crop_per_frame = { left, top, width, height };
  asset.bytes = bytes;
  asset.verification.alpha_checked = true;
  console.log(`${asset.name}: ${bytes} bytes`);
}
if (totalBytes > manifest.technical.max_total_bytes) {
  throw new Error(`Outbreak textures exceed their byte budget: ${totalBytes}`);
}
manifest.technical.total_bytes = totalBytes;
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Packaged eight two-frame strips, ${totalBytes} bytes total.`);
