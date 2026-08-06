import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  projectRegistry,
  routeRegistry,
} from "@/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = routeRegistry
    .filter((route) => !route.path.includes("["))
    .map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.path === "/" ? "weekly" : "monthly",
      priority: route.path === "/" ? 1 : 0.7,
    })) satisfies MetadataRoute.Sitemap;

  const projectRoutes = projectRegistry.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    changeFrequency: "monthly" as const,
    priority: project.featured ? 0.8 : 0.6,
    ...(project.publishedAt ? { lastModified: project.publishedAt } : {}),
  }));

  return [...staticRoutes, ...projectRoutes];
}
