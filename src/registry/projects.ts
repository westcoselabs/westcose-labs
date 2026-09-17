import type { Project } from "./types";

export const projectRegistry = [
  {
    slug: "westcose-labs-os",
    title: "WestCose Labs OS",
    shortDescription:
      "A route-driven portfolio with distinct Desktop and Pocket operating-system presentations over shared semantic content.",
    status: "published",
    category: "Software",
    technologies: ["Next.js", "React", "TypeScript", "CSS Modules", "MDX"],
    cover: {
      src: "/images/projects/westcose-labs-os-cover.webp",
      alt: "Concept artwork of a graphite workstation and pocket device overlooking Bakersfield at dusk",
      width: 1200,
      height: 800,
    },
    gallery: [],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    relatedProjectSlugs: ["estate-sales-bakersfield"],
    publishedAt: undefined,
    role: "Design and front-end system implementation",
    objective:
      "Make a professional portfolio memorable without sacrificing real routes, semantic content, or conventional access.",
    constraints: [
      "One content model must support two OS presentations and a semantic fallback.",
      "System screens must remain usable on short mobile viewports.",
      "Heavy game and media experiences stay outside the initial bundle.",
    ],
    decisions: [
      "Keep the route as the source of truth.",
      "Use typed registries for apps, content, placement, and metadata.",
      "Preserve a server-rendered semantic document fallback.",
    ],
    outcomes: [
      "Desktop, Pocket, and semantic presentations share stable URLs.",
      "Accessibility preferences and Pocket session state persist locally.",
      "The repository validation baseline passes lint, types, tests, and production build.",
    ],
    versionLabel: "V3 in progress",
    accentTone: "blue",
    pocketSummary: "One portfolio, two OS shells, and one semantic route model.",
    desktopPresentation: "portfolio-explorer",
    ownerInputNeeded: [
      "Approved production screenshots for a full gallery",
      "Public repository or live URL, if either should be shown",
    ],
  },
  {
    slug: "estate-sales-bakersfield",
    title: "Estate Sales Bakersfield",
    shortDescription:
      "A transparent product-direction case file for a proposed local estate-sale discovery and listing platform.",
    status: "development-fixture",
    category: "Marketplace concept",
    technologies: [],
    cover: undefined,
    gallery: [],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: true,
    relatedProjectSlugs: ["westcose-labs-os"],
    publishedAt: undefined,
    role: undefined,
    objective:
      "Explore how local buyers might discover relevant estate sales and how sellers might publish trustworthy event information.",
    constraints: [],
    decisions: [],
    outcomes: [],
    versionLabel: "Development fixture",
    accentTone: "silver",
    pocketSummary: "A labeled concept case file awaiting approved production evidence.",
    desktopPresentation: "portfolio-explorer",
    ownerInputNeeded: [
      "Summary and role",
      "Constraints, process, and outcomes",
      "Technology list",
      "Approved screenshots and public links",
    ],
  },
] as const satisfies readonly Project[];

export type RegisteredProject = (typeof projectRegistry)[number];

export function getProject(slug: string): RegisteredProject | undefined {
  return projectRegistry.find((project) => project.slug === slug);
}

export function isProjectSlug(slug: string): slug is RegisteredProject["slug"] {
  return projectRegistry.some((project) => project.slug === slug);
}
