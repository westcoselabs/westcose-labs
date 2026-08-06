import type { Project } from "./types";

export const projectRegistry = [
  {
    slug: "estate-sales-bakersfield",
    title: "Estate Sales Bakersfield",
    shortDescription:
      "A development-fixture case study used to prove the shared content architecture.",
    status: "development-fixture",
    category: "Architecture fixture",
    technologies: [],
    cover: undefined,
    gallery: [],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    relatedProjectSlugs: [],
    publishedAt: undefined,
  },
] as const satisfies readonly Project[];

export type RegisteredProject = (typeof projectRegistry)[number];

export function getProject(slug: string): RegisteredProject | undefined {
  return projectRegistry.find((project) => project.slug === slug);
}

export function isProjectSlug(slug: string): slug is RegisteredProject["slug"] {
  return projectRegistry.some((project) => project.slug === slug);
}
