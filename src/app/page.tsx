import Link from "next/link";

import { ProjectCard } from "@/components/apps/ProjectCard";
import {
  RouteCardGrid,
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import {
  capabilityRegistry,
  createRouteMetadata,
  experimentRegistry,
  projectRegistry,
  siteConfig,
  systemFacts,
} from "@/registry";

export const metadata = createRouteMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const featured = projectRegistry.find((project) => project.featured);

  return (
    <RouteDocument
      eyebrow="Personal creative workstation"
      title="Software, systems, games, and useful experiments."
      description="WestCose Labs designs and builds digital products with a strong point of view and a practical core."
      presentation="home"
      actions={[
        { href: "/projects", label: "View projects", variant: "primary" },
        { href: "/contact", label: "Contact" },
      ]}
    >
      {featured ? (
        <RouteSection title="Featured project">
          <ProjectCard project={featured} />
        </RouteSection>
      ) : null}

      <RouteSection title="Selected experiments">
        <RouteCardGrid>
          {experimentRegistry.slice(0, 4).map((experiment) => (
            <article className="route-card experiment-card" key={experiment.slug}>
              <p className="route-card__index">{experiment.status}</p>
              <h2>
                <Link href={`/experiments/${experiment.slug}`}>
                  {experiment.title}
                </Link>
              </h2>
              <p>{experiment.purpose}</p>
              <Link className="route-card__open" href={`/experiments/${experiment.slug}`}>
                Open study
              </Link>
            </article>
          ))}
        </RouteCardGrid>
      </RouteSection>

      <RouteSection title="Capabilities">
        <div className="capability-index">
          {capabilityRegistry.map((capability) => (
            <article key={capability.id}>
              <h2>{capability.title}</h2>
              <p>{capability.description}</p>
              <Link href={capability.proofHref}>{capability.proofLabel}</Link>
            </article>
          ))}
        </div>
      </RouteSection>

      <RouteSection title="About the system">
        <div className="system-fact-grid">
          {systemFacts.slice(0, 6).map((fact) => (
            <div key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
        <p>
          Desktop OS, Pocket OS, and Normal View share the same routes and
          content. The interface changes. The facts do not.
        </p>
        <Link className="route-action route-action--secondary" href="/about">
          About WestCose Labs
        </Link>
      </RouteSection>
    </RouteDocument>
  );
}
