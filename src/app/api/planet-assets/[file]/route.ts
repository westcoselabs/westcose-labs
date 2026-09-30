import { createHash } from "node:crypto";
import { open, type FileHandle } from "node:fs/promises";
import path from "node:path";

import { getPlanetAsset, type PlanetAsset } from "@/lib/planet/asset-source";

export const runtime = "nodejs";

type Context = { params: Promise<{ file: string }> };
const verifiedFiles = new Map<string, string>();

function failure(request: Request, status: 404 | 503) {
  return new Response(
    request.method === "HEAD" ? null : JSON.stringify({
      error: status === 404 ? "Unknown planet asset." : "Planet source assets are unavailable.",
    }),
    {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    },
  );
}

function assetHeaders(asset: PlanetAsset) {
  return new Headers({
    "Content-Type": asset.filename.endsWith(".glb") ? "model/gltf-binary" : "model/gltf+json",
    "Content-Length": String(asset.bytes),
    "Cache-Control": "public, max-age=0, must-revalidate",
    ETag: `"${asset.sha256}"`,
    "X-Content-Type-Options": "nosniff",
  });
}

function isUnchanged(request: Request, headers: Headers) {
  const etag = headers.get("ETag");
  return request.headers.get("If-None-Match")?.split(",").some((candidate) => {
    const value = candidate.trim().replace(/^W\//, "");
    return value === "*" || value === etag;
  }) ?? false;
}

function emptyResponse(request: Request, headers: Headers): Response | undefined {
  if (isUnchanged(request, headers)) return new Response(null, { status: 304, headers });
  if (request.method === "HEAD") return new Response(null, { headers });
}

async function hashFile(file: FileHandle, signal: AbortSignal) {
  const digest = createHash("sha256");
  const chunk = new Uint8Array(64 * 1024);
  let position = 0;
  while (true) {
    signal.throwIfAborted();
    const { bytesRead } = await file.read(chunk, 0, chunk.length, position);
    signal.throwIfAborted();
    if (!bytesRead) return digest.digest("hex");
    digest.update(chunk.subarray(0, bytesRead));
    position += bytesRead;
  }
}

function streamFile(file: FileHandle, signal: AbortSignal) {
  let stopped = false;
  let position = 0;
  let closing: Promise<void> | undefined;
  let abort: () => void;
  const release = () => {
    signal.removeEventListener("abort", abort);
    return closing ??= file.close();
  };

  // Read directly into a Web stream. Node's Readable.toWeb bridge can race its
  // controller close with request abortion; the explicit stopped flag also
  // guards reads that complete after the consumer cancels the response body.
  return new ReadableStream<Uint8Array>({
    start(controller) {
      abort = () => {
        if (stopped) return;
        stopped = true;
        controller.error(signal.reason ?? new DOMException("Request aborted", "AbortError"));
        void release().catch(() => {});
      };
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) abort();
    },
    async pull(controller) {
      if (stopped) return;
      try {
        const chunk = new Uint8Array(64 * 1024);
        const { bytesRead } = await file.read(chunk, 0, chunk.length, position);
        if (stopped) return;
        if (!bytesRead) {
          stopped = true;
          controller.close();
          await release();
        } else {
          position += bytesRead;
          controller.enqueue(chunk.subarray(0, bytesRead));
        }
      } catch (error) {
        if (stopped) return;
        stopped = true;
        controller.error(error);
        await release().catch(() => {});
      }
    },
    cancel() {
      stopped = true;
      return release();
    },
  });
}

async function fromLocalSource(request: Request, asset: PlanetAsset) {
  // The original Designs checkout is a runtime dependency, never a build input.
  // Keep Turbopack from tracing or packaging that external filesystem tree.
  const projectRoot = path.resolve(/* turbopackIgnore: true */
    process.env.WESTCOSE_DESIGNS_ROOT ?? path.join(process.cwd(), "..", "westcose-designs"),
  );
  const filename = path.join(projectRoot, "public", asset.path.slice(1));
  const file = await open(filename, "r");
  let streamOwnsHandle = false;
  try {
    const stat = await file.stat();
    if (!stat.isFile() || stat.size !== asset.bytes) throw new Error("Source changed.");
    const fingerprint = `${asset.sha256}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}:${stat.ino}`;
    if (verifiedFiles.get(filename) !== fingerprint) {
      if (await hashFile(file, request.signal) !== asset.sha256) throw new Error("Source changed.");
      // The manifest has a fixed, small allowlist. Do not retain open handles or
      // model buffers; revalidate the hash if the source's stat metadata changes.
      verifiedFiles.set(filename, fingerprint);
    }
    const headers = assetHeaders(asset);
    const empty = emptyResponse(request, headers);
    if (empty) return empty;
    const response = new Response(streamFile(file, request.signal), { headers });
    streamOwnsHandle = true;
    return response;
  } finally {
    if (!streamOwnsHandle) await file.close();
  }
}

async function fromExistingOrigin(request: Request, asset: PlanetAsset, configuredOrigin: string) {
  const origin = new URL(configuredOrigin);
  if (
    !["https:", "http:"].includes(origin.protocol) || origin.username || origin.password ||
    origin.pathname !== "/" || origin.search || origin.hash
  ) throw new Error("Invalid asset origin.");
  const source = await fetch(new URL(asset.path, origin), {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
  });
  if (!source.ok || !source.body) throw new Error("Source unavailable.");
  const reader = source.body.getReader();
  const chunks: Uint8Array[] = [];
  const digest = createHash("sha256");
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > asset.bytes) throw new Error("Source changed.");
      digest.update(value);
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
  if (length !== asset.bytes || digest.digest("hex") !== asset.sha256) throw new Error("Source changed.");
  const headers = assetHeaders(asset);
  const empty = emptyResponse(request, headers);
  if (empty) return empty;
  // Remote responses are bounded by the manifest size and verified before any
  // bytes reach the viewer. Local model delivery above uses streaming instead.
  return new Response(Buffer.concat(chunks, length), { headers });
}

async function serve(request: Request, context: Context) {
  const { file } = await context.params;
  const asset = getPlanetAsset(file);
  if (!asset) return failure(request, 404);
  try {
    const origin = process.env.WESTCOSE_DESIGNS_ASSET_ORIGIN;
    return origin
      ? await fromExistingOrigin(request, asset, origin)
      : await fromLocalSource(request, asset);
  } catch {
    // Keep local absolute paths and upstream diagnostics out of public output.
    return failure(request, 503);
  }
}

export async function GET(request: Request, context: Context) {
  return serve(request, context);
}

export async function HEAD(request: Request, context: Context) {
  return serve(request, context);
}
