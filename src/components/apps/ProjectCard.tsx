import Link from "next/link";

import type { RegisteredProject } from "@/registry/projects";

export function ProjectCard({ project }: { project: RegisteredProject }) {
  return (
    <article className="project-card">
      <div className="project-card__art" aria-hidden="true">
        <span>WCL / PROJECT FILE</span>
      </div>
      <div className="project-card__content">
        <p className="project-card__meta">
          {project.category} · {formatProjectStatus(project.status)}
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
