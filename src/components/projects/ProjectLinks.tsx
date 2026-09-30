import Link from "next/link";
import { ArrowRight, ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import type { Project } from "@/registry";
import styles from "./ProjectShowcase.module.css";

export function ProjectLinks({
  project,
  details = true,
}: {
  project: Project;
  details?: boolean;
}) {
  return (
    <div className={styles.projectLinks}>
      {project.liveUrl && (
        <a
          className={styles.primaryLink}
          href={project.previewUrl ?? project.liveUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${project.previewUrl ? "Preview design for" : "Visit"} ${project.title}`}
        >
          {project.previewUrl ? "View design" : "Visit website"}
          <ArrowUpRight size={17} />
        </a>
      )}
      {details && (
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`Explore ${project.title}`}
        >
          Project details
          <ArrowRight size={16} />
        </Link>
      )}
      {!details && project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${project.repositoryPrivate ? "Private repository for" : "View source for"} ${project.title}`}
        >
          <GithubLogo size={18} />
          {project.repositoryPrivate ? "Private repository" : "Source"}
          <ArrowUpRight size={14} />
        </a>
      )}
      {!details && project.previewUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer">
          Current website
          <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}
