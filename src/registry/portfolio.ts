import type {
  Capability,
  Experiment,
  SystemFact,
} from "./types";

export const experimentCategories = {
  "3d-worlds": "3D + Worlds", "game-labs": "Game Labs", "tools-automation": "Tools + Automation",
  "interfaces-motion": "Interfaces + Motion", "os-internals": "OS Internals",
} as const;
export const experimentPresentations = {
  "live-demo": "Live demo", "build-log": "Build log", research: "Research", concept: "Concept",
} as const;

export const experimentRegistry: readonly Experiment[] = [
  {
    slug: "three-shell-router", title: "One site, three ways to use it", category: "os-internals", presentation: "live-demo", demoKey: "three-shell-router",
    purpose: "I built a portfolio that looks like a desktop, a phone, and a normal website. The same content has to survive all three.",
    question: "How do I keep the weird interface without breaking real website navigation?",
    approach: "The route owns the content. The shell changes how you interact with it.",
    proof: "One piece of content can appear in multiple shells without duplicating the entire page.",
    status: "stable", requirements: "Switch layouts in the preview. The content stays the same.", iconKey: "experiments", tone: "cyan", actionLabel: "Try the layouts", projectSlug: "westcose-labs-os",
  },
  {
    slug: "pocket-viewport", title: "Mobile browsers keep moving", category: "os-internals", presentation: "live-demo", demoKey: "pocket-viewport",
    purpose: "The usable screen changes when the browser toolbar moves. Here’s a small test of why that matters.",
    question: "How do I keep a fake phone OS from getting cut off by a real phone browser?",
    approach: "Measure the visible space and work around browser chrome and safe areas.",
    proof: "This simulator illustrates the sizing problem. Real browser measurements vary by device.",
    status: "stable", requirements: "Change the simulated browser toolbar and compare the available height.", iconKey: "phone", tone: "blue", actionLabel: "Try the viewport", projectSlug: "westcose-labs-os",
  },
  {
    slug: "accessible-unlock", title: "A lock screen for a website", category: "os-internals", presentation: "live-demo", demoKey: "accessible-unlock",
    purpose: "I made a slide-to-unlock for a portfolio. Then I had to make sure sliding wasn’t the only way to get in.",
    question: "Can an interaction feel like a device without making the site harder to use?",
    approach: "Support dragging, tapping, and keyboard access to the same state.",
    proof: "The unlock has a usable alternative. Fancy interactions don’t get to be mandatory.",
    status: "beta", requirements: "Drag the control, tap the button, or use your keyboard.", iconKey: "about", tone: "silver", actionLabel: "Try the unlock", projectSlug: "westcose-labs-os",
  },
  {
    slug: "window-geometry", title: "Moving windows around for no good reason", category: "os-internals", presentation: "live-demo", demoKey: "window-geometry",
    purpose: "A portfolio didn’t strictly need draggable windows and snapping. I built the geometry anyway.",
    question: "Can I make windows behave like desktop software without pulling in a giant dependency?",
    approach: "Bounded geometry and reusable snap calculations.",
    proof: "The demo uses the window snapping calculations used by the desktop OS.",
    status: "stable", requirements: "Try each snap position in this simulation of the desktop’s window logic.", iconKey: "projects", tone: "indigo", actionLabel: "Move some windows", projectSlug: "westcose-labs-os",
  },
  {
    slug: "westcose-world", title: "The WestCose Orbit Scene", category: "3d-worlds", presentation: "live-demo", demoKey: "westcose-world",
    purpose: "Three planets from the WestCose Designs orbit scene. Rotate one, zoom in, or look at the models without having to open Blender.",
    question: "Can I make the original 3D pieces worth exploring on their own?",
    approach: "Use the original models and materials, load one planet only when opened, and offer different inspection views.",
    proof: "The full-screen viewer lets you inspect the Designs, Labs, and Shop models. The playable WestCose World game is a separate project.",
    status: "beta", requirements: "Choose a planet to open the viewer. Rotate, move, zoom, or switch inspection modes. The source inventory stays readable without WebGL.", iconKey: "experiments", tone: "teal", actionLabel: "Inspect the planets", projectSlug: "westcose-designs",
    art: { src: "/images/projects/westcose-world.webp", alt: "The original WestCose Designs orbit planet with its streets, buildings, and pier", caption: "Original orbit-scene model, separate from the playable WestCose World project." },
  },
  {
    slug: "concept-to-glb", title: "From concept art to a clean GLB", category: "3d-worlds", presentation: "build-log",
    purpose: "An image can look perfect and still turn into a terrible 3D model. I’ve been working on a repeatable way to get from concept art to something I can actually use.",
    question: "How much cleanup can I automate without losing what made the artwork good?",
    approach: "For the Dead Coast Pier sign, I used my original artwork, generated a model with Tripo, then assembled and refined the fittings and materials in Blender. The raw export stays untouched.",
    proof: "The published World case study includes the sign’s model and its in-game placement. That proves this asset’s path through the pipeline, not that every export is automatically game-ready.",
    status: "beta", statusLabel: "Working pipeline, still being refined", requirements: "Read the process and compare the model with its game placement in the related project.", iconKey: "experiments", tone: "teal", projectSlug: "westcose-world", relatedNoteId: "concept-to-glb",
    art: { src: "/images/projects/westcose-world/pier-model.webp", alt: "The Dead Coast Pier sign model with its original WestCose lettering and assembled fittings", caption: "Existing model capture from the WestCose World case study." },
    sections: [
      { title: "The problem", body: "Generation gets me a starting point. I still need to check the silhouette, scale, materials, and how the pieces fit together." },
      { title: "The pipeline", body: "Original artwork → generated model → preserved raw export → Blender assembly and material work → GLB inspection → a separate game integration check." },
      { title: "What passed", body: "The pier sign has both an inspectable model and a documented place in the game. The case study lets you compare the object with the scene it was made for." },
      { title: "What still needs work", body: "The checks repeat for every asset. A clean viewer render can still hide the wrong scale, excessive geometry, or materials that behave badly under game lighting." },
      { title: "What I learned", body: "The useful automation is the part that leaves me time to make decisions. Somebody still has to decide whether the result belongs in the world." },
    ],
  },
  {
    slug: "world-builder-lab", title: "Building a builder for WestCose World", category: "3d-worlds", presentation: "build-log",
    purpose: "I got tired of moving things around in code every time I wanted to change the town. So I started building tools to place, review, and organize the world inside the world.",
    question: "How do I make a weird little planet easier to build without breaking the actual game?",
    approach: "Use an asset library, scene selection, transform controls, player-height walkthroughs, and a saved-version review before applying a layout.",
    proof: "World Builder is part of the World development workflow. These are actual tool captures, not a public browser builder.",
    status: "beta", statusLabel: "In development", requirements: "Read the build log and follow the World case study for the placement, walkthrough, and review captures.", iconKey: "projects", tone: "indigo", projectSlug: "westcose-world",
    art: { src: "/images/projects/westcose-world/builder.webp", alt: "World Builder showing its asset library, 3D scene, and selected-object inspector", caption: "A capture of the actual development tool. The builder is not embedded on this page." },
    sections: [
      { title: "The problem", body: "A scene is awkward to edit when every placement means another code change. I wanted the object I selected to connect directly to the settings that control it." },
      { title: "Placement and review", body: "The inspector brings dimensions, mounting, appearance, and game inclusion together. A player-height walkthrough checks the layout from the view that actually matters." },
      { title: "Keeping the world consistent", body: "Review works against a saved layout version. Clearance and route checks sit beside the changes before the layout is applied to the local game." },
      { title: "What I’m refining", body: "The tool is still part of an evolving workflow. The next layout needs the same care as the last one, especially where placement affects movement and sightlines." },
    ],
  },
  {
    slug: "combat-feel-lab", title: "Making zombie combat feel right", category: "game-labs", presentation: "build-log",
    purpose: "A zombie taking damage shouldn’t look like someone hit Pause on its walk animation. This is where I test reactions, movement, weapons, and the small things that make combat feel good.",
    question: "How do I make a hit readable without enemies snapping, freezing, or getting stuck in reactions?",
    approach: "Use separate animation, damage-range, and effects labs to inspect locomotion, attacks, reactions, hit regions, and weapon feedback in controlled scenes.",
    proof: "The existing lab captures document the test environments. Combat tuning is ongoing; this page is a build log rather than a playable combat sandbox.",
    status: "beta", statusLabel: "Iterative test", requirements: "Read the observations and see the lab captures in the World case study.", iconKey: "fightclub", tone: "red", projectSlug: "westcose-world",
    art: { src: "/images/projects/westcose-world/lab-zombies.webp", alt: "The zombie animation development lab with an enemy and animation playback controls", caption: "An existing capture of the original World animation lab." },
    sections: [
      { title: "What felt wrong", body: "Movement and reactions have to read as one character. An isolated hit animation tells me very little about what happens when the enemy is already moving." },
      { title: "What I changed", body: "I split the questions across small development labs. Animation playback checks the handoffs. The damage range checks distance, hit regions, ammunition, and occlusion. The effects lab puts visual and audio feedback beside the events that trigger it." },
      { title: "What improved", body: "The test scenes make each part easier to inspect and repeat. I can examine a weapon or reaction without starting a full survival run." },
      { title: "What still bugs me", body: "An isolated test is only part of the answer. The same feedback still has to make sense in a busy encounter, from the player’s camera." },
    ],
  },
  {
    slug: "theme-workshop", title: "Different operating systems. Same bad habits.", category: "interfaces-motion", presentation: "build-log",
    purpose: "One custom operating system wasn’t enough, so I started giving it different personalities. The hard part is making the themes actually change the interface without breaking it.",
    question: "Can the same apps, routes, and accessibility rules survive completely different theme treatments?",
    approach: "Dusk, WestCose 95, Liquid Glass, and WestCose XP share content and behavior while changing chrome, materials, icons, and component treatments.",
    proof: "The working theme registry and visual checks cover both shells. Try the public themes in Appearance settings.",
    status: "stable", statusLabel: "Working themes", requirements: "Open Appearance settings and choose a theme. The recommendation offers a matching wallpaper separately.", iconKey: "themes", tone: "blue", projectSlug: "westcose-labs-os", actionLabel: "Try the themes", actionHref: "/settings/appearance",
    sections: [
      { title: "The shared system", body: "One set of apps, routes, content, and preferences sits underneath every theme. Changing the surface should not mean rebuilding the application." },
      { title: "What actually changes", body: "The treatments cover window chrome, taskbars, surfaces, depth, typography, and icons. A wallpaper is a separate choice." },
      { title: "What must stay usable", body: "Keyboard focus, readable text, high contrast, reduced motion, and touch targets have to survive the change. A convincing old computer is still a website somebody needs to use." },
    ],
  },
];

export const capabilityRegistry = [
  {
    id: "web",
    title: "Website design and web development",
    description: "Custom websites built around your brand, your content, and your customers.",
    proofLabel: "Explore website services",
    proofHref: "/services",
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
  {
    label: "Interfaces",
    value: "Desktop OS, Pocket OS, and a plain web view",
  },
  { label: "Framework", value: "Next.js App Router" },
  { label: "Presentation", value: "Route-driven" },
  { label: "Storage", value: "Notes and settings are saved in this browser" },
] as const satisfies readonly SystemFact[];

export function getExperiment(slug: string) {
  return experimentRegistry.find((experiment) => experiment.slug === slug);
}
