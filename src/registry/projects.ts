import type { Project } from "./types";

const github = (name: string): `https://${string}` =>
  `https://github.com/westcoselabs/${name}`;
const cover = (name: string, alt: string, width: number, height: number) => ({
  src: `/images/projects/${name}.webp`,
  alt,
  width,
  height,
});
const websitePreview = (slug: string, title: string, caption: string) => ({
  desktop: cover(
    `${slug}-desktop`,
    `${title} desktop website capture`,
    1440,
    1000,
  ),
  mobile: cover(`${slug}-mobile`, `${title} mobile website capture`, 390, 844),
  caption,
});
const project = (
  entry: Omit<Project, "gallery" | "relatedProjectSlugs"> &
    Partial<Pick<Project, "gallery" | "relatedProjectSlugs">>,
): Project => ({ gallery: [], relatedProjectSlugs: [], ...entry });

/** Copy and artwork reviewed against public repositories on 2026-09-21.
 * Source revisions and asset attribution: docs/PROJECT_SOURCES.md.
 */
export const projectRegistry: readonly Project[] = [
  project({
    slug: "barber-refinery",
    title: "Barber Refinery",
    shortDescription:
      "A sharp digital home for fresh cuts, unlimited memberships, and two San Diego County shops.",
    status: "published",
    category: "Grooming & lifestyle",
    collection: "Client sites",
    role: "Website design",
    technologies: ["Next.js", "React", "TypeScript", "Squire"],
    cover: cover(
      "barber-refinery-desktop",
      "Barber Refinery’s black and gold website with its membership and booking experience",
      1440,
      1000,
    ),
    coverCaption: "Desktop capture of barberrefinery.com, September 2026.",
    preview: websitePreview(
      "barber-refinery",
      "Barber Refinery",
      "Live website captures · September 2026",
    ),
    liveUrl: "https://barberrefinery.com/",
    githubUrl:
      "https://github.com/citrynmarketingdevelopment/barberrefinery-frontend",
    repositoryPrivate: true,
    featured: true,
    versionLabel: "Live website",
    accentTone: "amber",
    objective:
      "Give Barber Refinery a distinct online identity and clear routes into services, memberships, and location-specific booking.",
    decisions: [
      "Black and gold art direction, oversized typography, and shop photography establish a recognizable identity. Service information and membership options sit alongside direct paths to booking.",
      "Separate San Marcos and Escondido pages help visitors choose a shop before continuing to Squire booking or a location-specific membership signup. These are handoffs to the booking provider, with each destination tied to the selected location.",
    ],
    outcomes: [
      "The live website presents both shop locations, service menus, and membership options. The portfolio includes desktop and mobile captures of the published design and a link to the live site.",
    ],
    highlights: [
      "Black and gold art direction with oversized type and shop photography.",
      "Service menus and separate San Marcos and Escondido location pages.",
      "Squire booking and location-specific membership signup handoffs.",
    ],
    relatedProjectSlugs: ["first-medical-associates", "trends-collision"],
  }),
  project({
    slug: "first-medical-associates",
    title: "First Medical Associates",
    shortDescription:
      "A welcoming route to care, connecting patients with providers, locations, and appointment booking.",
    status: "published",
    category: "Healthcare",
    collection: "Client sites",
    role: "Website design",
    technologies: ["Next.js", "React", "Prisma", "PostgreSQL"],
    cover: cover(
      "first-medical-associates-desktop",
      "First Medical Associates website with blue typography, patient photography, and appointment search",
      1440,
      1000,
    ),
    coverCaption: "Desktop capture of drsfirst.com, September 2026.",
    preview: websitePreview(
      "first-medical-associates",
      "First Medical Associates",
      "Live website captures · September 2026",
    ),
    liveUrl: "https://drsfirst.com/",
    githubUrl: "https://github.com/firstmedicalassociates/fma-website",
    featured: true,
    versionLabel: "Live website",
    accentTone: "blue",
    objective:
      "Organize a multi-location medical practice around the patient’s next step: find care, choose a provider, and book an appointment.",
    decisions: [
      "The website organizes care services, providers, and practice locations into distinct paths. This supports patients who know the type of care they need as well as those beginning with a nearby location.",
      "A consistent visual language connects practice information and patient resources. Prominent appointment and patient portal entry points provide clear routes into the existing patient experience.",
    ],
    outcomes: [
      "The published website connects patients with provider and location information across Maryland and Northern Virginia. Desktop and mobile captures in this portfolio document the live design.",
    ],
    highlights: [
      "Provider and location discovery across Maryland and Northern Virginia.",
      "A unified visual language for care services, patient resources, and practice information.",
      "Appointment booking handoffs and a prominent patient portal entry.",
    ],
    relatedProjectSlugs: ["barber-refinery", "simply-decorated"],
  }),
  project({
    slug: "simply-decorated",
    title: "Simply Decorated by Riley",
    shortDescription:
      "Room to imagine. A warm, image-led website for interior design, home staging, and estate sales.",
    status: "published",
    category: "Interiors & home",
    collection: "Client sites",
    role: "Website design",
    technologies: ["WordPress", "Divi"],
    cover: cover(
      "simply-decorated",
      "Interior photography from Simply Decorated’s website, with a bright kitchen, cream seating, and teal accents",
      1440,
      612,
    ),
    coverCaption: "Original homepage photography from decoratedbyriley.com.",
    liveUrl: "https://decoratedbyriley.com/",
    featured: true,
    versionLabel: "Live website",
    accentTone: "teal",
    objective:
      "Translate Riley’s personal approach into a visual website that introduces her work and makes each service easy to explore.",
    decisions: [
      "Interior photography leads the design so visitors can understand the visual character of Riley’s work. The website pairs that imagery with an introduction to the person behind the services.",
      "Interior design, home staging, and estate sale management have dedicated pages. This gives each offering room to explain its purpose while keeping project inquiries close to the work. The site uses WordPress and Divi.",
    ],
    outcomes: [
      "The live website introduces Riley, showcases interior imagery, and provides direct contact paths for project inquiries. The portfolio links to the published site and uses its original homepage photography.",
    ],
    highlights: [
      "Interior photography leads the homepage and service stories.",
      "Dedicated pages for interior design, home staging, and estate sale management.",
      "An introduction to Riley and direct contact paths for project inquiries.",
    ],
    relatedProjectSlugs: ["estate-sales-bakersfield", "barber-refinery"],
  }),
  project({
    slug: "trends-collision",
    title: "Trends Collision Center",
    shortDescription:
      "Automotive craft, translated to the screen. A cinematic website design for a Bakersfield collision center.",
    status: "preview",
    category: "Automotive",
    collection: "Client sites",
    role: "Website design",
    technologies: ["Next.js", "TypeScript", "Three.js"],
    cover: cover(
      "trends-collision-desktop",
      "Trends Collision Center redesign preview with its original logo and cinematic automotive art direction",
      1440,
      1000,
    ),
    coverCaption:
      "Capture of the repository’s redesign preview. The current trendsautocollision.com website has a different layout.",
    preview: websitePreview(
      "trends-collision",
      "Trends Collision Center",
      "Redesign preview captures · September 2026",
    ),
    previewUrl: "https://trends-frontend-eight.vercel.app/",
    liveUrl: "https://trendsautocollision.com/",
    githubUrl: "https://github.com/citrynmarketingdevelopment/trends-frontend",
    featured: true,
    versionLabel: "Redesign preview",
    accentTone: "red",
    objective:
      "Build an expressive automotive website that introduces the repair process, explains services, and provides a clear way to start an inquiry.",
    decisions: [
      "The redesign combines original brand assets with cinematic automotive imagery and optional 3D scenes. Service pages organize collision repair, mechanical work, tires, towing, and roadside assistance into distinct topics.",
      "Mobile and reduced-motion layouts preserve readable service information without requiring WebGL. The visual effects support the repair story while the core pages remain useful on less capable devices.",
    ],
    outcomes: [
      "This work is a redesign preview, not the current production website. The preview captures and design-preview link show the proposed experience; the separately linked live website has a different layout.",
    ],
    highlights: [
      "Original brand assets and optional 3D scenes bring the repair story to life.",
      "Service pages cover collision repair, mechanical work, tires, towing, and roadside assistance.",
      "Readable mobile and reduced-motion layouts keep the core experience accessible without WebGL.",
    ],
    relatedProjectSlugs: ["barber-refinery", "westcose-designs"],
  }),
  project({
    slug: "westcose-designs",
    title: "WestCose Designs",
    repositoryName: "westcose-designs",
    shortDescription:
      "Brand identities, original illustration, and a studio portfolio that moves with you.",
    status: "preview",
    category: "Design & creative development",
    collection: "Web",
    technologies: ["Next.js", "React", "GSAP", "WebGL"],
    cover: cover(
      "westcose-designs",
      "Original mint-green Impala illustration from the WestCose Designs sketchbook",
      1350,
      1080,
    ),
    coverCaption: "Original illustration from the WestCose Designs sketchbook.",
    githubUrl: github("westcose-designs"),
    featured: true,
    accentTone: "green",
    versionLabel: "In development",
    objective:
      "Bring identity systems, illustration, and web experiences together in an expressive studio portfolio.",
    highlights: [
      "Nine connected homepage scenes with scroll-driven transitions.",
      "Original illustration and portfolio spreads, plus a 3D destination selector.",
      "Reduced-motion and mobile alternatives, with a server-validated project brief.",
    ],
  }),
  project({
    slug: "estate-sales-bakersfield",
    title: "Estate Sales Bakersfield",
    repositoryName: "estate-sales-bakersfield",
    shortDescription:
      "Find the next great secondhand find. A local directory for estate and yard sales.",
    status: "beta",
    category: "Local marketplace",
    collection: "Web",
    technologies: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "MapLibre",
      "Stripe",
    ],
    cover: cover(
      "estate-sales-bakersfield",
      "Warm vintage furniture and collected objects from the marketplace’s own hero artwork",
      1400,
      700,
    ),
    coverCaption:
      "Marketplace hero artwork from the Estate Sales Bakersfield repository.",
    liveUrl: "https://estate-sales-bakersfield.vercel.app",
    githubUrl: github("estate-sales-bakersfield"),
    featured: true,
    accentTone: "amber",
    versionLabel: "Public beta",
    relatedProjectSlugs: ["westcose-labs-os"],
    objective:
      "Help Bakersfield shoppers discover local sales and give organizers a considered path from event draft to publication.",
    highlights: [
      "Public sale listings and map-based discovery.",
      "Organizer onboarding, private drafts, photo uploads, and exact event previews.",
      "Revision-bound approval and Stripe test Checkout before publication.",
    ],
  }),
  project({
    slug: "westcose-world",
    title: "WestCose World",
    repositoryName: "westcose-world",
    shortDescription:
      "A little planet with a lot to explore. Walk through a playable coastal portfolio.",
    status: "preview",
    category: "Interactive 3D world",
    collection: "Play",
    technologies: ["Next.js", "Three.js", "React Three Fiber", "TypeScript"],
    cover: cover(
      "westcose-world",
      "Actual WestCose World screenshot showing a coastal town and timber pier on a small planet",
      1400,
      875,
    ),
    coverCaption:
      "In-engine screenshot from the repository’s WestCose Coast review.",
    githubUrl: github("westcose-world"),
    featured: true,
    accentTone: "teal",
    versionLabel: "Playable development build",
    objective:
      "Turn portfolio exploration into a walk through a California-inspired coastal town on a small planet.",
    highlights: [
      "Continuous movement around a spherical world, on keyboard or touch.",
      "Five enterable interiors, including a studio, workshop, arcade, and hidden lab.",
      "Coastal trails, a timber pier, authored groves, and device-local field notes.",
    ],
  }),
  project({
    slug: "doopify",
    title: "Doopify",
    repositoryName: "doopify",
    shortDescription:
      "Commerce you can make your own. A developer-first, self-hostable store engine.",
    status: "beta",
    category: "Commerce platform",
    collection: "Web",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Stripe"],
    cover: cover(
      "doopify",
      "Dark headphones product photograph bundled with the Doopify storefront",
      512,
      512,
    ),
    coverCaption: "Sample product photography from the Doopify repository.",
    liveUrl: "https://doopify.vercel.app",
    githubUrl: github("doopify"),
    featured: true,
    accentTone: "silver",
    versionLabel: "Private beta",
    objective:
      "Give developers a self-hostable commerce foundation, from product catalog to order management.",
    highlights: [
      "Protected admin with team roles, owner MFA, and audit logs.",
      "Public storefront, cart, and server-owned Stripe checkout.",
      "Digital downloads, shipping rules, refunds, and abandoned-checkout recovery.",
    ],
  }),
  project({
    slug: "gitpress-forms",
    title: "GitPress Forms",
    repositoryName: "gitpress-forms",
    shortDescription:
      "Your forms. Your data. A standalone WordPress builder without subscription gates.",
    status: "preview",
    category: "WordPress form builder",
    collection: "Tools",
    technologies: ["WordPress", "PHP", "React", "TypeScript"],
    cover: cover(
      "gitpress-forms",
      "Actual GitPress Forms editor with contact fields and a drag-and-drop field palette",
      1400,
      1123,
    ),
    coverCaption:
      "Form-builder screenshot from the repository’s verification evidence.",
    githubUrl: github("gitpress-forms"),
    featured: true,
    accentTone: "blue",
    versionLabel: "0.1.1-dev · Development preview",
    objective:
      "Build and manage forms inside WordPress, with optional GitPress integration and no hosted service requirement.",
    highlights: [
      "Visual form builder with shortcodes, blocks, and popup embedding.",
      "WordPress-owned form definitions, entries, and workflows.",
      "Development preview: payments are not implemented and integrations are still being verified.",
    ],
  }),
  project({
    slug: "citryn-fight-club",
    title: "Citryn Fight Club",
    repositoryName: "CITRYN-FIGHT-CLUB",
    shortDescription:
      "Clock out. Square up. A browser fighter with a very familiar cast of characters.",
    status: "published",
    category: "Browser fighting game",
    collection: "Play",
    technologies: ["JavaScript", "Canvas", "HTML"],
    cover: cover(
      "citryn-fight-club",
      "Citryn Fight Club title artwork with pixel-art office building at sunset",
      1400,
      788,
    ),
    coverCaption: "Main-menu artwork from the Citryn Fight Club repository.",
    liveUrl: "https://rosy-oak-905.higgsfield.gg/",
    githubUrl: github("CITRYN-FIGHT-CLUB"),
    featured: true,
    accentTone: "red",
    versionLabel: "Playable",
    objective:
      "Bring arcade fighting to the browser with original character sprites and illustrated stages.",
    highlights: [
      "Character-specific attacks and special-move sequences.",
      "Keyboard controls and on-screen touch controls.",
      "Canvas rendering with locally bundled character and stage artwork.",
    ],
  }),
  project({
    slug: "westcose-labs-os",
    title: "WestCose Labs OS",
    repositoryName: "westcose-labs",
    shortDescription:
      "A portfolio you can open, play, and explore. Desktop on your desk. Pocket on your phone.",
    status: "published",
    category: "Experimental portfolio",
    collection: "Web",
    technologies: ["Next.js", "React", "TypeScript", "CSS Modules", "MDX"],
    cover: cover(
      "westcose-labs-os-cover",
      "Concept artwork of a graphite workstation and pocket device overlooking Bakersfield at dusk",
      1200,
      800,
    ),
    coverCaption: "Concept cover artwork from the WestCose Labs OS repository.",
    githubUrl: github("westcose-labs"),
    featured: true,
    accentTone: "blue",
    versionLabel: "Desktop + Pocket",
    relatedProjectSlugs: ["estate-sales-bakersfield", "westcose-world"],
    role: "Design and front-end system implementation",
    objective:
      "Make a professional portfolio memorable without sacrificing real routes, semantic content, or conventional access.",
    constraints: [
      "One content model supports two OS presentations and a semantic fallback.",
      "Heavy game and media experiences stay outside the initial bundle.",
    ],
    decisions: [
      "Keep the route as the source of truth.",
      "Use typed registries for content, placement, and metadata.",
    ],
    outcomes: [
      "Desktop, Pocket, and semantic presentations share stable URLs.",
    ],
  }),
  project({
    slug: "gitpress",
    title: "GitPress",
    repositoryName: "Gitpress",
    shortDescription:
      "Write in GitHub. Publish through WordPress. Server-rendered content with caching and push updates.",
    status: "source",
    category: "Publishing plugin",
    collection: "Tools",
    technologies: ["WordPress", "PHP", "GitHub API"],
    githubUrl: github("Gitpress"),
    featured: true,
    accentTone: "blue",
    versionLabel: "Source available",
    highlights: [
      "Render HTML, Markdown, text, or code through a shortcode.",
      "Cache content and keep a last-good snapshot when GitHub is unavailable.",
      "Invalidate changed content through GitHub push webhooks.",
    ],
  }),
  project({
    slug: "broseph",
    title: "Broseph",
    repositoryName: "broseph-plugin",
    shortDescription:
      "A WordPress bridge for AI-assisted content, Divi page management, and site health reporting.",
    status: "preview",
    category: "WordPress integration",
    collection: "Tools",
    technologies: ["WordPress", "PHP", "REST API"],
    githubUrl: github("broseph-plugin"),
    featured: false,
    accentTone: "teal",
    versionLabel: "0.1.1 · Development",
    highlights: [
      "Signed API requests connect WordPress to the Open Claw agent system.",
      "Divi page management, GitPress integration, and site reports.",
      "Approval is required before content changes are published.",
    ],
  }),
  project({
    slug: "public",
    title: "WordPress workspace",
    repositoryName: "public",
    shortDescription:
      "A WordPress site workspace with Divi and bundled themes.",
    status: "source",
    category: "Site workspace",
    collection: "Archive",
    technologies: ["WordPress", "PHP", "Divi"],
    githubUrl: github("public"),
    featured: false,
    accentTone: "silver",
    versionLabel: "Repository",
    highlights: [
      "WordPress site files and bundled themes.",
      "A site workspace; WordPress and Divi retain their own authorship.",
    ],
  }),
];

export type RegisteredProject = Project;
export function getProject(slug: string): RegisteredProject | undefined {
  return projectRegistry.find((entry) => entry.slug === slug);
}
export function isProjectSlug(slug: string): boolean {
  return projectRegistry.some((entry) => entry.slug === slug);
}
export function projectStatusLabel(entry: Project): string {
  return (
    entry.versionLabel ??
    (entry.status === "published" ? "Published" : "In development")
  );
}
