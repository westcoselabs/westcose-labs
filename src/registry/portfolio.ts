import type {
  Capability,
  Experiment,
  Note,
  SystemFact,
} from "./types";

export const experimentRegistry = [
  {
    slug: "three-shell-router",
    title: "Three-shell router",
    purpose: "Present one semantic route through Desktop, Pocket, and Normal shells.",
    status: "stable",
    requirements: "Best explored by changing the view query on the same route.",
    proof: "The route remains the source of truth while each shell controls presentation.",
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

export const noteRegistry = [
  {
    id: "readme",
    title: "WestCose Labs README",
    summary: "The shortest useful orientation to the workstation.",
    tag: "README",
    pinned: true,
    body: [
      "Building software. Designing systems. Making games. Exploring weird ideas.",
      "Every important destination is a real route. The operating-system layer adds personality without trapping the content.",
    ],
  },
  {
    id: "do-not-redesign",
    title: "Do not redesign this again",
    summary: "A preservation note written immediately before a careful redesign.",
    tag: "Process",
    body: [
      "Keep the route model, the three shells, the Dusk tokens, and the accessible alternatives.",
      "Change the hierarchy where it feels generic. Keep the parts that already behave correctly.",
    ],
  },
  {
    id: "features-nobody-asked-for",
    title: "Features nobody asked for",
    summary: "A small inventory of harmless side quests.",
    tag: "System humor",
    body: [
      "A Recycle Bin with emotional retention settings.",
      "A lock screen for a website. A terminal that cannot damage anything. Window snapping for a portfolio.",
    ],
  },
  {
    id: "finish-first",
    title: "Things to finish before starting another SaaS",
    summary: "The list remains intentionally short and suspiciously reusable.",
    tag: "Process",
    body: [
      "Finish the current project story. Verify the public links. Export the approved screenshots.",
      "Only then is a new folder allowed to contain the word final.",
    ],
  },
] as const satisfies readonly Note[];

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
  { label: "Interface family", value: "Desktop OS, Pocket OS, Normal View" },
  { label: "Build status", value: "Active", detail: "Validation baseline passing" },
  { label: "Current focus", value: "WestCose Labs OS V2" },
  { label: "Framework", value: "Next.js App Router" },
  { label: "Presentation", value: "Route-driven" },
  { label: "Storage", value: "Local, versioned, reversible" },
  { label: "Location", value: "Bakersfield, California" },
] as const satisfies readonly SystemFact[];

export function getExperiment(slug: string) {
  return experimentRegistry.find((experiment) => experiment.slug === slug);
}
