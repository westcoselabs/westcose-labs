import Link from "next/link";
import { RouteCardGrid, RouteDocument, RouteSection } from "@/components/apps/RouteDocument";
import { ProjectCard } from "@/components/apps/ProjectCard";
import { projectRegistry } from "@/registry/projects";
import { serviceRegistry } from "@/registry/services";

export function ServicePage({ service }: { service: (typeof serviceRegistry)[number] }) {
  const projects = projectRegistry.filter((project) =>
    (service.projectSlugs as readonly string[]).includes(project.slug),
  );
  const related = serviceRegistry.find((entry) => entry.slug !== service.slug)!;
  return (
    <RouteDocument
      eyebrow="WestCose Labs services"
      title={service.heading}
      description={service.introduction}
      presentation="services"
      actions={[{ href: "/contact", label: "Discuss your website", variant: "primary" }, { href: "/projects", label: "Explore the portfolio" }]}
    >
      <nav aria-label="Service breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / <span aria-current="page">{service.name}</span></nav>
      {service.sections.map((section) => (
        <RouteSection title={section.heading} key={section.heading}>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </RouteSection>
      ))}
      <RouteSection title="Related project work">
        <RouteCardGrid>{projects.map((project) => <ProjectCard key={project.slug} project={project} />)}</RouteCardGrid>
      </RouteSection>
      <RouteSection title="Bring design and development together">
        <p>{related.summary}</p>
        <Link href={`/services/${related.slug}`}>Explore {related.name.toLowerCase()}</Link>
        <p><Link className="route-action route-action--primary" href="/contact">Tell us about your project</Link></p>
      </RouteSection>
    </RouteDocument>
  );
}
