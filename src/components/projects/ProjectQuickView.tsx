"use client";

import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/registry";
import { projectStatusLabel } from "@/registry/projects";
import { ProjectPreview } from "./ProjectPreview";
import { ProjectLinks } from "./ProjectLinks";
import styles from "./ProjectShowcase.module.css";

export function ProjectQuickView({
  project,
  projects,
  onSelect,
  onClose,
}: {
  project: Project;
  projects: readonly Project[];
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const index = projects.findIndex((item) => item.slug === project.slug);
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  function navigate(direction: number) {
    onSelect(
      projects[(index + direction + projects.length) % projects.length].slug,
    );
    dialog.current?.querySelector("[data-preview-body]")?.scrollTo({ top: 0 });
  }
  return createPortal(
    <dialog
      ref={dialog}
      className={styles.quickView}
      aria-labelledby="quick-view-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <header className={styles.dialogHeader}>
        <span>Project preview</span>
        <div className={styles.dialogPaging}>
          <button
            type="button"
            aria-label="Previous project"
            disabled={projects.length < 2}
            onClick={() => navigate(-1)}
          >
            <CaretLeft size={19} />
          </button>
          <span aria-live="polite">
            {index + 1} / {projects.length}
          </span>
          <button
            type="button"
            aria-label="Next project"
            disabled={projects.length < 2}
            onClick={() => navigate(1)}
          >
            <CaretRight size={19} />
          </button>
        </div>
        <button
          type="button"
          autoFocus
          aria-label="Close preview"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </header>
      <div className={styles.dialogBody} data-preview-body>
        <ProjectPreview key={project.slug} project={project} />
        <div className={styles.dialogCopy}>
          <span className={styles.dialogCategory}>
            {project.category} · {projectStatusLabel(project)}
          </span>
          <h2 id="quick-view-title" aria-live="polite">
            {project.title}
          </h2>
          <p>{project.objective ?? project.shortDescription}</p>
          {project.highlights?.length ? (
            <ul>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          ) : null}
          {project.technologies.length > 0 && (
            <p className={styles.stack}>{project.technologies.join(" / ")}</p>
          )}
          <ProjectLinks project={project} details={false} />
          <Link
            className={styles.fullProject}
            href={`/projects/${project.slug}`}
            onClick={onClose}
          >
            Open full project
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
