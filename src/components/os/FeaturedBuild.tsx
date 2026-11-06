import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { getProject } from "@/registry/projects";
import styles from "./FeaturedBuild.module.css";

/** One destination and artwork for the featured build in both OS shells. */
export function FeaturedBuild({ className = "" }: { readonly className?: string }) {
  const project = getProject("westcose-world");
  if (!project?.cover) return null;
  return (
    <Link className={`${styles.card} ${className}`} href={`/projects/${project.slug}`} aria-label={`Open featured project: ${project.title}`}>
      <Image className={styles.art} src={project.cover.src} alt="" fill sizes="(max-width: 767px) 50vw, 240px" />
      <span className={styles.copy}>
        <span className={styles.eyebrow}>Featured build</span>
        <strong>{project.title}</strong>
        <span className={styles.detail}>Explore the coast <ArrowUpRight aria-hidden="true" size={16} /></span>
      </span>
    </Link>
  );
}
