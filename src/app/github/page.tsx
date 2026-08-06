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
      description="Static project and source relationships without unverified live API data."
      status={siteConfig.githubConfigured ? "Profile verified" : "Owner input needed"}
      presentation="github"
      actions={siteConfig.githubUrl ? [{ href: siteConfig.githubUrl, label: "Open profile", external: true, variant: "primary" }] : []}
    >
      <RouteSection title="Source relationships">
        <div className="repository-list">
          {projectRegistry.map((project) => (
            <article key={project.slug}>
              <span>{project.category}</span>
              <h2>{project.title}</h2>
              <p>{project.githubUrl ? "Verified source available" : "Public source link not configured"}</p>
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
