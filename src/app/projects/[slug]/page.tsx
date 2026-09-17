import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DevelopmentFixture } from "@/components/apps/DevelopmentFixture";
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
    title: project.title,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
    image: project.cover,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  const projectContent = getProjectContent(slug);

  if (!project || !projectContent) {
    notFound();
  }

  const actions = [
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
            label: "View source",
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
      title={project.title}
      description={project.shortDescription}
      presentation="project"
      status={
        project.status === "development-fixture"
          ? "Development fixture"
          : "Published case study"
      }
      actions={actions}
    >
      {project.status === "development-fixture" ? (
        <DevelopmentFixture>
          Production facts and artwork for this case study are awaiting owner
          confirmation. Nothing below should be read as a shipped-project claim.
        </DevelopmentFixture>
      ) : null}
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
          <figcaption>Concept cover art, not a product screenshot.</figcaption>
        </figure>
      ) : null}
      <section className="project-inspector" aria-label="Project information">
        <div><span>Role</span><strong>{project.role ?? "Owner input needed"}</strong></div>
        <div><span>Status</span><strong>{project.status === "published" ? "Published" : "Development fixture"}</strong></div>
        <div><span>Category</span><strong>{project.category}</strong></div>
        <div><span>Stack</span><strong>{project.technologies.length ? project.technologies.join(", ") : "Owner input needed"}</strong></div>
        {project.versionLabel ? <div><span>Version</span><strong>{project.versionLabel}</strong></div> : null}
      </section>
      <div className="case-study-prose">
        {projectContent}
      </div>
      {gallery.length ? (
        <section className="project-gallery" aria-labelledby="project-gallery-title">
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
            <Link href={`/projects/${relatedProject.slug}`} key={relatedProject.slug}>
              <strong>{relatedProject.title}</strong>
              <span>{relatedProject.shortDescription}</span>
            </Link>
          ))}
        </section>
      ) : null}
      {project.ownerInputNeeded?.length ? (
        <section className="owner-input" aria-labelledby="owner-input-title">
          <h2 id="owner-input-title">Owner input still needed</h2>
          <ul>{project.ownerInputNeeded.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}
    </RouteDocument>
  );
}
