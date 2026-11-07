import {
  RouteDocument,
  RouteSection,
} from "@/components/apps/RouteDocument";
import { createRouteMetadata, projectRegistry, siteConfig } from "@/registry";

export const metadata = createRouteMetadata({
  title: "GitHub",
  description: "Verified source and profile destinations for WestCose Labs.",
  path: "/github",
});

export default function GitHubPage() {
  return (
    <RouteDocument
      eyebrow="Repository directory"
      title="GitHub"
      description="My projects, open source work, and the code behind the things I build."
      status={siteConfig.githubConfigured ? "Profile verified" : "Owner input needed"}
      presentation="github"
      actions={siteConfig.githubUrl ? [{ href: siteConfig.githubUrl, label: "Open profile", external: true, variant: "primary" }] : []}
    >
      <RouteSection title="Source relationships">
        <div className="repository-list">
          {projectRegistry.filter(project => project.githubUrl && !project.repositoryPrivate).map((project) => (
            <article key={project.slug}>
              <span>{project.category}</span>
              <h2><a href={project.githubUrl} target="_blank" rel="noopener noreferrer">{project.title} ↗</a></h2>
              <p>{project.shortDescription}</p>
            </article>
          ))}
        </div>
      </RouteSection>
      {!siteConfig.githubUrl ? (
        <RouteSection title="Configuration needed">
          <p>
            Set a verified production GitHub URL before an external profile or
            repository action is shown. No placeholder account is linked.
          </p>
        </RouteSection>
      ) : null}
    </RouteDocument>
  );
}
