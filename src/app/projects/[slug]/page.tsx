import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DevelopmentFixture } from "@/components/apps/DevelopmentFixture";
import { RouteDocument } from "@/components/apps/RouteDocument";
import { getProjectContent } from "@/content/projects";
import {
  createRouteMetadata,
  getProject,
  projectRegistry,
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

  return (
    <RouteDocument
      eyebrow={project.category}
      title={project.title}
      description={project.shortDescription}
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
      <div className="case-study-prose">
        {projectContent}
      </div>
    </RouteDocument>
  );
}
