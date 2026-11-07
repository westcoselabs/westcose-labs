export const serviceRegistry = [
  {
    slug: "website-design",
    name: "Website design",
    title: "Custom Website Design in Bakersfield",
    heading: "Custom website design that actually feels like your business.",
    description: "Custom website design and redesigns with clear navigation, responsive layouts, and a distinct visual direction. See examples and discuss your site with WestCose Labs.",
    summary: "A website designer for businesses that want a distinct identity, clear service pages, and a considered mobile experience.",
    introduction: [
      "A good website needs to look right, make sense, and help people do what they came to do. I design around the business, its content, and the people using the site.",
    ],
    sections: [
      {
        heading: "Start with the real job",
        paragraphs: [
          "Before choosing colors or animations, I want to know what the website needs to accomplish. Maybe someone needs to book an appointment, compare services, find a location, see the work, or get in touch without digging through five menus.",
          "That shapes the layout and content. The design should give the business its own character, but the important information still needs to be easy to find.",
        ],
      },
      {
        heading: "What the project might include",
        paragraphs: [
          "Page planning, navigation, visual direction, responsive layouts, reusable components, service pages, galleries, and a clear path to contact or booking. A redesign might also mean cleaning up a site that has grown messy over time.",
          "We'll decide what belongs in scope based on what your site needs to do.",
        ],
      },
      {
        heading: "Design and development belong together",
        paragraphs: [
          "A layout can look great in a mockup and fall apart on a phone. I work through the layout, content, motion, and code together from the beginning.",
          "Depending on the job, that might mean WordPress, a custom Next.js build, or something simpler. The right choice is the one that fits the website and whoever needs to manage it later.",
        ],
      },
    ],
    projectSlugs: ["barber-refinery", "first-medical-associates", "simply-decorated", "trends-collision"],
    closing: "Have a current website that isn't doing its job, or starting fresh? Send me the link or tell me what you're planning. We can go from there.",
    contactLabel: "Talk about your website",
  },
  {
    slug: "web-development",
    name: "Web development",
    title: "Custom Web Development & Web Apps",
    heading: "Custom web development for ideas that need more than pages.",
    description: "Custom web development, Next.js applications, WordPress tools, and practical integrations built around real workflows. Explore projects from WestCose Labs.",
    summary: "Custom web development for responsive websites, content publishing, and business tools that need more than a standard page layout.",
    introduction: [
      "Sometimes you need a custom workflow, a directory, a checkout, a publishing tool, or an interface that works the way your business needs it to.",
      "That's the kind of problem I like working through.",
    ],
    sections: [
      {
        heading: "Build around the actual workflow",
        paragraphs: [
          "I start with what people need to do. Who signs in? Who manages content? Where does the data live? What happens after someone books, submits, pays, or publishes something?",
          "Those details decide the architecture. Adding a database, payment provider, or complicated admin panel only makes sense if the project actually needs one.",
        ],
      },
      {
        heading: "Websites, apps, and the systems behind them",
        paragraphs: [
          "I work with Next.js, React, TypeScript, WordPress, and the supporting tools a project calls for. That includes interfaces, content systems, APIs, and integrations.",
          "Estate Sales Bakersfield, Doopify, GitPress, and WestCose Labs OS show different parts of that work. Their case studies spell out what's live, in beta, or still under development.",
        ],
      },
      {
        heading: "Keep the important parts solid",
        paragraphs: [
          "I care about the experience someone has using the thing and the parts they don't see. That means clear feedback when something happens, reasonable performance, accessibility, safe handling of data, and testing the flows that matter.",
          "We'll also talk about hosting, third-party services, maintenance, and who owns what after launch.",
        ],
      },
    ],
    projectSlugs: ["estate-sales-bakersfield", "doopify", "gitpress", "westcose-labs-os"],
    closing: "If you've got a workflow that needs fixing or an app idea you want to test, tell me what it needs to do. We can figure out what the first useful version looks like.",
    contactLabel: "Discuss your build",
  },
] as const;

export type Service = (typeof serviceRegistry)[number];

type ServiceCapability = {
  id: string;
  title: string;
  scope: string;
  paragraphs: readonly string[];
  includes: readonly string[];
  projectSlugs: readonly string[];
  action: { href: string; label: string };
};

export const serviceCapabilities = [
  {
    id: "website-design",
    title: "Website design and redesign",
    scope: "Core work",
    paragraphs: [
      "New websites, complete redesigns, and better mobile experiences. I care about the visual direction, but also the page structure, the content, and whether people can find what they came for.",
    ],
    includes: [
      "New website design and page planning",
      "Redesigns and visual refreshes",
      "Responsive layouts and reusable components",
      "Content hierarchy and navigation cleanup",
      "WordPress design and implementation when appropriate",
    ],
    projectSlugs: serviceRegistry[0].projectSlugs,
    action: { href: "/services/website-design", label: "Website design details" },
  },
  {
    id: "web-development",
    title: "Custom web development and apps",
    scope: "Core work",
    paragraphs: [
      "Some projects need more than a homepage and contact form. I build custom front ends, publishing systems, business tools, and applications with their own workflows and moving parts.",
    ],
    includes: [
      "Next.js, React, and TypeScript applications",
      "Custom business and admin interfaces",
      "Directories, commerce flows, and booking-related tools",
      "WordPress development and practical integrations",
      "Data, authentication, and payments when the project needs them",
    ],
    projectSlugs: serviceRegistry[1].projectSlugs,
    action: { href: "/services/web-development", label: "Web development details" },
  },
  {
    id: "tools",
    title: "Tools, integrations, and automation",
    scope: "Project dependent",
    paragraphs: [
      "If a job keeps eating up time because somebody has to repeat the same steps over and over, that's usually a good reason to build a tool. I like connecting systems, cleaning up workflows, and making small utilities that remove busywork.",
      "I'm also testing ways to automate repetitive parts of creative work.",
    ],
    includes: [
      "Custom WordPress plugins and utilities",
      "Content and publishing workflows",
      "API integrations",
      "Internal tools and repeatable build scripts",
      "Creative workflow experiments and automation prototypes",
    ],
    projectSlugs: ["gitpress-forms", "gitpress", "broseph"],
    action: { href: "/projects/gitpress-forms", label: "See GitPress Forms" },
  },
  {
    id: "interactive",
    title: "Interactive websites and 3D experiences",
    scope: "Selected projects",
    paragraphs: [
      "Sometimes the idea needs more than a normal page. I build interactive interfaces, WebGL experiments, and Three.js scenes where the interaction is part of the story.",
    ],
    includes: [
      "Three.js and React Three Fiber experiences",
      "Interactive product or environment demos",
      "Motion-driven interfaces",
      "Browser-based prototypes",
      "Performance and reduced-motion fallbacks",
    ],
    projectSlugs: ["westcose-world", "westcose-labs-os", "trends-collision"],
    action: { href: "/projects/westcose-world", label: "Explore WestCose World" },
  },
  {
    id: "games",
    title: "Games and prototypes",
    scope: "Experimental / selected projects",
    paragraphs: [
      "I build browser games, game systems, characters, interfaces, and prototypes because sometimes the only way to know whether an idea is any good is to make it playable.",
      "Most of this is original work. I take on game projects selectively.",
    ],
    includes: [
      "Browser game prototypes",
      "Game menus, HUDs, and interaction systems",
      "Gameplay experiments",
      "World building tools and development workflows",
    ],
    projectSlugs: ["citryn-fight-club", "westcose-world"],
    action: { href: "/games", label: "See game projects" },
  },
  {
    id: "design-systems",
    title: "Digital design systems",
    scope: "Core skill / project dependent",
    paragraphs: [
      "Good interfaces need rules that hold up beyond the first mockup. I build reusable patterns for components, icons, and the different states an interface can be in.",
      "WestCose Designs is where I do identity and illustration work. Labs is where that visual thinking becomes a working interface or product.",
    ],
    includes: [
      "UI art direction",
      "Reusable component patterns",
      "Type, color, spacing, and motion systems",
      "Custom interface icons",
      "Design handoff and implementation",
    ],
    projectSlugs: ["westcose-labs-os", "westcose-designs", "first-medical-associates"],
    action: { href: "/projects/westcose-designs", label: "View the design work" },
  },
] as const satisfies readonly ServiceCapability[];

export const projectTypes = [
  { title: "New build", description: "Start with the idea and work toward something real." },
  { title: "Redesign", description: "Keep what works. Fix what doesn't. Give it a better direction." },
  { title: "Migration", description: "Move an existing site while keeping the content and functionality that matter." },
  { title: "Prototype", description: "Test the interesting or risky part before committing to the full build." },
  { title: "Integration", description: "Make existing services and tools work together." },
  { title: "Automation", description: "Let a tool handle the task you keep doing by hand." },
] as const;
