import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projectStatusLabel } from "@/registry/projects";
import { RouteDocument } from "@/components/apps/RouteDocument";
import { getProjectContent } from "@/content/projects";
import {
  createRouteMetadata,
  getProject,
  projectRegistry,
  type Project,
} from "@/registry";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projectRegistry.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return createRouteMetadata({
      title: "Project not found",
      description: "The requested WestCose Labs project does not exist.",
      path: `/projects/${slug}`,
    });
  }

  return createRouteMetadata({
    title: project.collection === "Client sites"
      ? `${project.title} Website Design`
      : project.slug === "westcose-labs-os" ? "WestCose Labs OS Case Study" : project.title,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
    image: project.cover,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  const projectContent = getProjectContent(slug);

  if (!project) {
    notFound();
  }

  const actions = [
    ...(project.previewUrl
      ? [
          {
            href: project.previewUrl,
            label: "View design preview",
            external: true,
            variant: "primary" as const,
          },
        ]
      : []),
    ...(project.liveUrl
      ? [
          {
            href: project.liveUrl,
            label: "Visit live site",
            external: true,
            variant: "primary" as const,
          },
        ]
      : []),
    ...(project.githubUrl
      ? [
          {
            href: project.githubUrl,
            label: project.repositoryPrivate
              ? "Private repository"
              : "View source",
            external: true,
            variant: "secondary" as const,
          },
        ]
      : []),
  ];
  const relatedProjects = projectRegistry.filter((candidate) =>
    (project.relatedProjectSlugs as readonly string[]).includes(candidate.slug),
  );
  const gallery: Project["gallery"] = project.gallery;

  return (
    <RouteDocument
      eyebrow={project.category}
      title={project.collection === "Client sites" ? `${project.title} website design` : project.title}
      description={project.shortDescription}
      presentation="project"
      status={projectStatusLabel(project)}
      actions={actions}
    >
      <Link href="/projects">← All projects</Link>
      {project.cover ? (
        <figure className="project-hero-art">
          <Image
            alt={project.cover.alt}
            height={project.cover.height}
            priority
            sizes="(max-width: 48rem) 100vw, 64rem"
            src={project.cover.src}
            width={project.cover.width}
          />
          <figcaption>{project.coverCaption}</figcaption>
        </figure>
      ) : null}
      <section className="project-inspector" aria-label="Project information">
        {project.role ? (
          <div>
            <span>Role</span>
            <strong>{project.role}</strong>
          </div>
        ) : null}
        <div>
          <span>Status</span>
          <strong>{projectStatusLabel(project)}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{project.category}</strong>
        </div>
        {project.technologies.length ? (
          <div>
            <span>Stack</span>
            <strong>{project.technologies.join(", ")}</strong>
          </div>
        ) : null}
        {project.versionLabel ? (
          <div>
            <span>Version</span>
            <strong>{project.versionLabel}</strong>
          </div>
        ) : null}
      </section>
      <div className="case-study-prose">
        {projectContent ?? (
          <section aria-labelledby="project-overview">
            <h2 id="project-overview">{project.collection === "Client sites" ? "The website brief" : "Inside the project"}</h2>
            <p>{project.objective ?? project.shortDescription}</p>
            {project.highlights?.length ? (
              <ul>
                {project.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {project.githubUrl && (
              <p>
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  {project.repositoryPrivate
                    ? "Repository access required"
                    : "Read the repository documentation"}{" "}
                  ↗
                </a>
              </p>
            )}
          </section>
        )}
      </div>
      {project.collection === "Client sites" ? (
        <>
          <section className="route-section">
            <h2>Design approach</h2>
            {project.decisions?.map((decision) => <p key={decision}>{decision}</p>)}
          </section>
          <section className="route-section">
            <h2>Delivery and current status</h2>
            {project.outcomes?.map((outcome) => <p key={outcome}>{outcome}</p>)}
          </section>
        </>
      ) : null}
      <section className="route-section">
        <h2>Planning a similar project?</h2>
        <p>Explore our <Link href="/services/website-design">custom website design</Link> and <Link href="/services/web-development">web development services</Link> to see how we can approach your brief.</p>
        <Link className="route-action route-action--primary" href="/contact">Discuss your website</Link>
      </section>
      {gallery.length ? (
        <section
          className="project-gallery"
          aria-labelledby="project-gallery-title"
        >
          <h2 id="project-gallery-title">Screenshots</h2>
          <div>
            {gallery.map((image) => (
              <Image
                alt={image.alt}
                height={image.height}
                key={image.src}
                loading="lazy"
                sizes="(max-width: 48rem) 100vw, 50vw"
                src={image.src}
                width={image.width}
              />
            ))}
          </div>
        </section>
      ) : null}
      {relatedProjects.length ? (
        <section className="related-work" aria-labelledby="related-work-title">
          <h2 id="related-work-title">Related work</h2>
          {relatedProjects.map((relatedProject) => (
            <Link
              href={`/projects/${relatedProject.slug}`}
              key={relatedProject.slug}
            >
              <strong>{relatedProject.title}</strong>
              <span>{relatedProject.shortDescription}</span>
            </Link>
          ))}
        </section>
      ) : null}
      {project.ownerInputNeeded?.length ? (
        <section className="owner-input" aria-labelledby="owner-input-title">
          <h2 id="owner-input-title">Owner input still needed</h2>
          <ul>
            {project.ownerInputNeeded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </RouteDocument>
  );
}
