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
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Visit ${project.title}`}
        >
          Visit website
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
        <a href={project.previewUrl} target="_blank" rel="noreferrer">
          Design preview
          <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}
