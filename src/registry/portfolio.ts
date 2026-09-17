import type {
  Capability,
  Experiment,
  SystemFact,
} from "./types";

export const experimentRegistry = [
  {
    slug: "three-shell-router",
    title: "Route presentation router",
    purpose:
      "Present one semantic route through Desktop and Pocket shells with a document fallback.",
    status: "stable",
    requirements: "Best explored by opening the same route on desktop and mobile.",
    proof:
      "The route remains the source of truth while each OS shell controls presentation.",
    iconKey: "experiments",
    tone: "cyan",
  },
  {
    slug: "pocket-viewport",
    title: "Pocket viewport lab",
    purpose: "Keep startup, lock, and Home inside the usable mobile viewport.",
    status: "stable",
    requirements: "Designed for browser toolbar changes, safe areas, and short screens.",
    proof: "A visual viewport hook updates shell dimensions without scrolling system screens.",
    iconKey: "phone",
    tone: "blue",
  },
  {
    slug: "accessible-unlock",
    title: "Accessible unlock control",
    purpose: "Pair a tactile slide gesture with keyboard and visible tap alternatives.",
    status: "beta",
    requirements: "Pointer, keyboard, or touch input.",
    proof: "The lock screen exposes the same result without requiring precise dragging.",
    iconKey: "about",
    tone: "silver",
  },
  {
    slug: "window-geometry",
    title: "Window geometry study",
    purpose: "Support drag, resize, snapping, and viewport recovery without a dependency.",
    status: "stable",
    requirements: "Desktop OS on a pointer-oriented viewport.",
    proof: "Pure geometry helpers are covered by unit tests and used by route windows.",
    iconKey: "projects",
    tone: "indigo",
  },
] as const satisfies readonly Experiment[];

export const capabilityRegistry = [
  {
    id: "web",
    title: "Web design and development",
    description: "Responsive sites built around real content, semantic routes, and measurable performance limits.",
    proofLabel: "See the Labs OS architecture",
    proofHref: "/projects/westcose-labs-os",
  },
  {
    id: "product",
    title: "Software product design",
    description: "Interaction models, component contracts, and interface states developed together.",
    proofLabel: "Explore Pocket OS",
    proofHref: "/?view=os",
  },
  {
    id: "creative",
    title: "Creative development",
    description: "Memorable interface concepts grounded in accessible browser behavior.",
    proofLabel: "Open Experiments",
    proofHref: "/experiments",
  },
  {
    id: "games",
    title: "Game and prototype development",
    description: "Launcher and presentation architecture that keeps heavy builds behind an explicit boundary.",
    proofLabel: "Open Games",
    proofHref: "/games",
  },
  {
    id: "systems",
    title: "Design systems",
    description: "Tokenized color, type, spacing, depth, motion, and accessibility rules shared across modes.",
    proofLabel: "Read the system note",
    proofHref: "/notes",
  },
  {
    id: "brand",
    title: "Branding for digital products",
    description: "Product identities expressed through interface language, icon tone, material, and restrained motion.",
    proofLabel: "View About",
    proofHref: "/about",
  },
] as const satisfies readonly Capability[];

export const systemFacts = [
  { label: "Operator", value: "Brandon" },
  { label: "Mode", value: "Design + development" },
  { label: "Primary functions", value: "Software, web systems, games, experiments" },
  {
    label: "Interface family",
    value: "Desktop OS, Pocket OS, semantic document fallback",
  },
  { label: "Build status", value: "Active", detail: "Validation baseline passing" },
  { label: "Current focus", value: "WestCose Labs OS V3 foundation" },
  { label: "Framework", value: "Next.js App Router" },
  { label: "Presentation", value: "Route-driven" },
  { label: "Storage", value: "Local, versioned, reversible" },
  { label: "Location", value: "Bakersfield, California" },
] as const satisfies readonly SystemFact[];

export function getExperiment(slug: string) {
  return experimentRegistry.find((experiment) => experiment.slug === slug);
}
