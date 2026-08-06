import type { Project } from "./types";

export const projectRegistry = [
  {
    slug: "westcose-labs-os",
    title: "WestCose Labs OS",
    shortDescription:
      "A route-driven portfolio presented as a desktop, a pocket device, and a conventional site.",
    status: "published",
    category: "Portfolio system",
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
      "One content model must work in three presentation shells.",
      "System screens must remain usable on short mobile viewports.",
      "Heavy game and media experiences stay outside the initial bundle.",
    ],
    decisions: [
      "Keep the route as the source of truth.",
      "Use typed registries for apps, content, placement, and metadata.",
      "Preserve a server-rendered Normal View fallback.",
    ],
    outcomes: [
      "Desktop, Pocket, and Normal presentations share stable URLs.",
      "Accessibility preferences and Pocket session state persist locally.",
      "The repository validation baseline passes lint, types, tests, and production build.",
    ],
    versionLabel: "V2 in progress",
    accentTone: "blue",
    pocketSummary: "One portfolio, three presentation shells.",
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
      "A development-fixture case study used to prove the shared content architecture.",
    status: "development-fixture",
    category: "Architecture fixture",
    technologies: [],
    cover: undefined,
    gallery: [],
    liveUrl: undefined,
    githubUrl: undefined,
    featured: false,
    relatedProjectSlugs: [],
    publishedAt: undefined,
    role: undefined,
    objective: undefined,
    constraints: [],
    decisions: [],
    outcomes: [],
    versionLabel: undefined,
    accentTone: "silver",
    pocketSummary: "Case-study structure awaiting approved project facts.",
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
