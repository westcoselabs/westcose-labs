"use client";

import Image from "next/image";
import {
  ArrowRight,
  Code,
  Desktop,
  GithubLogo,
  ImageBroken,
  DeviceMobile,
  Article,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { Project } from "@/registry";
import styles from "./ProjectShowcase.module.css";

export function ProjectArtwork({ project }: { project: Project }) {
  if (project.cover)
    return (
      <Image
        src={project.cover.src}
        alt=""
        fill
        sizes="(max-width: 600px) 92vw, 540px"
        className={styles.artImage}
        data-artwork={project.slug}
      />
    );
  if (project.slug === "gitpress")
    return (
      <span className={styles.publishArtwork} aria-hidden="true">
        <span className={styles.publishIcons}>
          <GithubLogo weight="fill" />
          <ArrowRight />
          <Article weight="fill" />
        </span>
        <span>
          From commit
          <br />
          to content.
        </span>
        <small>GitHub → WordPress</small>
      </span>
    );
  return (
    <span className={styles.codeArtwork} aria-hidden="true">
      <Code weight="duotone" />
    </span>
  );
}

export function ProjectPreview({ project }: { project: Project }) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = project.preview?.[mode];
  return (
    <div className={styles.preview}>
      <div className={styles.previewToolbar}>
        <span>
          {project.preview
            ? "Website preview"
            : project.cover
              ? "Project artwork"
              : project.slug === "gitpress"
                ? "Publishing toolkit"
                : "Project overview"}
        </span>
        {project.preview && (
          <div
            className={styles.viewControl}
            role="group"
            aria-label="Preview device"
          >
            <button
              type="button"
              aria-label="Desktop preview"
              aria-pressed={mode === "desktop"}
              onClick={() => setMode("desktop")}
            >
              <Desktop size={19} />
            </button>
            <button
              type="button"
              aria-label="Mobile preview"
              aria-pressed={mode === "mobile"}
              onClick={() => setMode("mobile")}
            >
              <DeviceMobile size={19} />
            </button>
          </div>
        )}
      </div>
      <div
        className={styles.previewStage}
        data-preview-mode={image ? mode : "artwork"}
        data-brand={project.slug}
      >
        {image ? (
          failedSource === image.src ? (
            <div className={styles.imageError}>
              <ImageBroken size={30} />
              <p>Preview unavailable</p>
            </div>
          ) : (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes={
                mode === "mobile" ? "190px" : "(max-width: 600px) 92vw, 750px"
              }
              onError={() => setFailedSource(image.src)}
              loading="eager"
            />
          )
        ) : (
          <ProjectArtwork project={project} />
        )}
      </div>
      <p className={styles.previewCaption}>
        {project.preview?.caption ??
          project.coverCaption ??
          (project.slug === "gitpress"
            ? "GitHub content, rendered through WordPress."
            : project.shortDescription)}
      </p>
    </div>
  );
}
