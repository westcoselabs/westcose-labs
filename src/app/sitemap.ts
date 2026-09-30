import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  experimentRegistry,
  projectRegistry,
  routeRegistry,
} from "@/registry";
import { isIndexablePath } from "@/registry/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = routeRegistry
    .filter((route) => !route.path.includes("[") && route.path !== "/games/arcade" && isIndexablePath(route.path))
    .map((route) => ({
      url: absoluteUrl(route.path),
    })) satisfies MetadataRoute.Sitemap;

  const projectRoutes = projectRegistry.filter((project) =>
    project.status !== "development-fixture" && project.status !== "empty",
  ).map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    ...(project.publishedAt ? { lastModified: project.publishedAt } : {}),
  }));

  const experimentRoutes = experimentRegistry
    .filter((experiment) => experiment.status === "stable" || experiment.status === "beta")
    .map((experiment) => ({ url: absoluteUrl(`/experiments/${experiment.slug}`) }));

  return [...staticRoutes, ...projectRoutes, ...experimentRoutes];
}
