import Link from "next/link";

import { ProjectCard } from "@/components/apps/ProjectCard";
import { RouteCardGrid, RouteDocument, RouteSection } from "@/components/apps/RouteDocument";
import { createRouteMetadata, projectRegistry, siteConfig } from "@/registry";
import { homeTitle } from "@/registry/seo";
import { serviceRegistry } from "@/registry/services";

export const metadata = createRouteMetadata({
  title: homeTitle,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const clientProjects = projectRegistry.filter((project) => project.collection === "Client sites");
  return (
    <RouteDocument
      eyebrow="WestCose Labs · Website design & development"
      title="Custom websites built around your business"
      description="Work with a website designer and developer who connects your brand, your content, and the way your customers use the web. WestCose Labs creates business websites, custom interfaces, and practical web applications."
      presentation="home"
      actions={[
        { href: "/contact", label: "Discuss your website", variant: "primary" },
        { href: "/projects", label: "View website projects" },
      ]}
    >
      <RouteSection title="Website design and web development services">
        <RouteCardGrid>
          {serviceRegistry.map((service) => (
            <article className="route-card" key={service.slug}>
              <h3><Link href={`/services/${service.slug}`}>{service.name}</Link></h3>
              <p>{service.summary}</p>
              <Link href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()}</Link>
            </article>
          ))}
        </RouteCardGrid>
        <p><Link href="/services">See all website services</Link></p>
      </RouteSection>
      <RouteSection title="Selected client website projects">
        <p>Explore websites for service businesses, healthcare, and creative work. Each project explains its scope and identifies whether you are viewing a live site or a design preview.</p>
        <RouteCardGrid>{clientProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}</RouteCardGrid>
      </RouteSection>
      <RouteSection title="A clear path from idea to website">
        <p>Start with your audience, the information they need, and the action you want them to take. Those priorities guide the page structure, visual direction, and development approach.</p>
        <p>Whether you need a new business website, a redesign, or a custom web application, we can discuss the right scope, content responsibilities, and next steps before work begins.</p>
        <Link className="route-action route-action--primary" href="/contact">Tell us what you are building</Link>
      </RouteSection>
      <RouteSection title="Meet WestCose Labs">
        <p>Based in Bakersfield, California, WestCose Labs brings design and development together. Alongside client websites, the portfolio includes publishing tools, games, and technical experiments.</p>
        <nav aria-label="Explore WestCose Labs">
          <Link href="/about">About the studio</Link>{" · "}
          <Link href="/projects">All projects</Link>{" · "}
          <Link href="/experiments">Experiments</Link>{" · "}
          <Link href="/games">Games</Link>
        </nav>
      </RouteSection>
    </RouteDocument>
  );
}
