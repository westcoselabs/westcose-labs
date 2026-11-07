import Link from "next/link";

import {
  RouteCardGrid,
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, getProject, projectStatusLabel, siteConfig, systemFacts } from "@/registry";

export const metadata = createRouteMetadata({
  title: "About Brandon",
  description: "I'm Brandon, a designer and developer based in Bakersfield. I build websites, web apps, games, tools, and experiments through WestCose Labs.",
  path: "/about",
});

const operatorFacts = [
  { label: "Operator", value: siteConfig.ownerName },
  { label: "Based in", value: "Bakersfield, California" },
  { label: "Background", value: "Graphic design, branding, web design" },
  { label: "Current mode", value: "Design + development" },
  { label: "Main interests", value: "Websites, software, games, 3D, tools" },
  { label: "Setup", value: "Independent" },
  { label: "Status", value: "Building" },
  { label: "Known issue", value: "One more feature" },
];

const designs = getProject("westcose-designs");
const world = getProject("westcose-world");
const currentProjects = [world, getProject("doopify"), getProject("westcose-labs-os"), getProject("gitpress-forms")]
  .filter((project) => project !== undefined);

export default function AboutPage() {
  return (
    <RouteDocument
      eyebrow="Operator profile"
      title={`Hey, I'm ${siteConfig.ownerName}.`}
      description={[
        "I started on the design side and got into code because I wanted to build the ideas myself. Now I work on websites, web apps, games, tools, and whatever else I get curious enough to figure out.",
        'Some of it is client work. Some of it is a project I wanted to exist. A few of those "small ideas" have gotten completely out of hand.',
      ]}
      presentation="about"
      actions={[
        { href: "/projects", label: "See what I've built", variant: "primary" },
        { href: "/contact", label: "Have a project?" },
      ]}
    >
      <RouteSection title="Operator Information">
        <div className="system-information">
          {operatorFacts.map(({ label, value }) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </RouteSection>

      <RouteSection title="How I got here">
        <p>I&apos;ve worked across graphic design, branding, websites, and the development behind them. Eventually, handing off the idea stopped being enough. I wanted to know how to build it, change it, and make it work the way I pictured it.</p>
        <p>That turned into custom websites, product ideas, WordPress tools, 3D experiments, and browser games. The work changes, but my favorite part is taking a rough idea and making something you can click, use, or play.</p>
        <p>I still think like a designer. I care about the details, and I&apos;m also the one dealing with the code that has to make them happen.</p>
      </RouteSection>

      <RouteSection title="Three parts of WestCose">
        <h3>{designs ? <Link href={`/projects/${designs.slug}`}>{designs.title}</Link> : "WestCose Designs"}</h3>
        <p>The original creative side. Branding, illustration, visual identity, apparel, and all the design work that doesn&apos;t need a database or a game engine.</p>
        <h3>WestCose Labs</h3>
        <p>Where the design turns into software. Websites, applications, tools, experiments, and ideas that probably didn&apos;t need an entire custom interface, but got one anyway.</p>
        <h3>{world ? <Link href={`/projects/${world.slug}`}>{world.title}</Link> : "WestCose World"}</h3>
        <p>The place where both sides meet. It&apos;s an original coastal world with its own art, shops, games, and strange characters. It&apos;s the biggest example of what happens when I keep following an idea.</p>
      </RouteSection>

      <RouteSection title="How I work">
        <p>I usually start by figuring out what the thing actually needs to do. Then I work through the layout, the interactions, and what makes it feel like its own thing.</p>
        <p>I think about design and development together. A great-looking screen still needs to be easy to use and maintain. And a technically perfect app isn&apos;t much fun if nobody wants to use it.</p>
        <p>I prototype early, test the parts that matter, and keep fixing what feels off. I also build tools for the repetitive work. That gives me more time for the parts that actually need judgment.</p>
      </RouteSection>

      {currentProjects.length ? (
        <RouteSection title="Currently taking up space in my brain.">
          <p>There&apos;s almost always more than one project open. These are a few of the things I&apos;m building, refining, or experimenting with.</p>
          <RouteCardGrid>
            {currentProjects.map((project) => (
              <article className="route-card" key={project.slug}>
                <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
                <p>{projectStatusLabel(project)}</p>
              </article>
            ))}
          </RouteCardGrid>
        </RouteSection>
      ) : null}

      <RouteSection title="A few things I believe">
        <ul>
          <li>Make it useful first. Make it interesting too.</li>
          <li>If a feature doesn&apos;t help the person using it, it better have a really good reason to exist.</li>
          <li>A good visual idea still needs good implementation.</li>
          <li>New tools are great. Knowing when to leave them out is better.</li>
          <li>Finish what matters. Then go break something in the lab.</li>
        </ul>
      </RouteSection>

      <RouteSection title="About This Device">
        <div className="system-information">
          {systemFacts.map(({ label, value }) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </RouteSection>

      {siteConfig.githubUrl ? (
        <RouteSection title="Find me elsewhere" id="links">
          <p><a href={siteConfig.githubUrl} rel="noreferrer" target="_blank">GitHub profile<span className="sr-only"> (opens in a new tab)</span></a></p>
        </RouteSection>
      ) : null}

      <RouteSection title="Get in touch">
        <p>Got something you want to build, fix, or completely rethink? Send it over. If it&apos;s a good fit, I&apos;ll tell you what I&apos;d do with it.</p>
        <Link className="route-action route-action--primary" href="/contact">Get in touch</Link>
      </RouteSection>
    </RouteDocument>
  );
}
