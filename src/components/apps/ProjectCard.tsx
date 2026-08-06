import Image from "next/image";
import Link from "next/link";

import type { RegisteredProject } from "@/registry/projects";

export function ProjectCard({ project }: { project: RegisteredProject }) {
  return (
    <article className="project-card" data-tone={project.accentTone}>
      <div className="project-card__art">
        {project.cover ? (
          <Image
            alt={project.cover.alt}
            fill
            sizes="(max-width: 48rem) 100vw, 50vw"
            src={project.cover.src}
          />
        ) : (
          <span aria-hidden="true">WCL / PROJECT FILE</span>
        )}
      </div>
      <div className="project-card__content">
        <p className="project-card__meta">
          <span>{project.category}</span>
          <span>{formatProjectStatus(project.status)}</span>
        </p>
        <h2>
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h2>
        <p>{project.shortDescription}</p>
        <Link className="project-card__open" href={`/projects/${project.slug}`}>
          Read case study
        </Link>
      </div>
    </article>
  );
}

function formatProjectStatus(status: RegisteredProject["status"]): string {
  return status === "development-fixture" ? "Development fixture" : "Published";
}
