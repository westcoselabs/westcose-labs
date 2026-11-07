import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import planetManifest from "./src/lib/planet/source-manifest.json";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async rewrites() {
    return {
      // Serve the verified build artifacts before the filesystem-only fallback.
      beforeFiles: planetManifest.files.map((asset) => ({
        source: `/api/planet-assets/${asset.filename}`,
        destination: `/planet-assets/${asset.sha256}/${asset.filename}`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return planetManifest.files.map((asset) => ({
      source: `/api/planet-assets/${asset.filename}`,
      headers: [
        { key: "Content-Type", value: asset.filename.endsWith(".glb") ? "model/gltf-binary" : "model/gltf+json" },
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "ETag", value: `"${asset.sha256}"` },
      ],
    }));
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
