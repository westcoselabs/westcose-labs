"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Cube, Cursor, Sparkle } from "@phosphor-icons/react";
import { experimentRegistry } from "@/registry/portfolio";
import { ExperimentPlayground } from "./ExperimentPlayground";
import styles from "./ExperimentsShowcase.module.css";

const filters = ["All studies", "Interfaces", "3D worlds"] as const;
const studyDescriptions: Record<string, string> = {
  "three-shell-router": "One route. Three ways to experience it. Switch the presentation and watch the content adapt.",
  "pocket-viewport": "Give the browser less room. See how a pocket interface holds its shape.",
  "accessible-unlock": "A small interaction with more than one way in. Slide, tap, or use your keyboard.",
  "window-geometry": "A little space to rearrange. Snap the window and explore how the layout responds.",
};

export function ExperimentsShowcase() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All studies");
  const studies = experimentRegistry.filter((study) => study.slug !== "westcose-world");
  const showWorld = filter !== "Interfaces";
  const showInterfaces = filter !== "3D worlds";
  const count = filter === "Interfaces" ? studies.length : filter === "3D worlds" ? 1 : experimentRegistry.length;

  return (
    <article className={styles.showcase} data-route-content data-presentation="experiments" data-experiments-showcase>
      <header className={styles.header}>
        <span className={styles.introIcon} aria-hidden="true"><Sparkle size={25} weight="duotone" /></span>
        <h1 tabIndex={-1}>Experiments<span aria-hidden="true">.</span></h1>
        <p>A hands-on collection of interfaces, interactions, and little worlds.</p>
      </header>
      <div className={styles.filterBar}>
        <div className={styles.filters} role="group" aria-label="Filter experiments">
          {filters.map((item) => (
            <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <span className={styles.resultCount} role="status" aria-live="polite">{count} {count === 1 ? "study" : "studies"}</span>
      </div>
      {showWorld && (
        <section className={styles.world} aria-labelledby="world-title">
          <Link href="/experiments/westcose-world" className={styles.worldArt} aria-label="Explore WestCose World in 3D">
            <Image src="/images/projects/westcose-world.webp" alt="The original WestCose World, a small coastal planet with streets, buildings, and a pier" fill sizes="(max-width: 768px) 100vw, 600px" loading="eager" fetchPriority="high" />
            <span className={styles.artAction} aria-hidden="true"><ArrowUpRight size={23} /></span>
          </Link>
          <div className={styles.worldCopy}>
            <span className={styles.worldType}><Cube size={17} /> Interactive 3D</span>
            <h2 id="world-title">Small worlds.<br />Big curiosity.</h2>
            <p>Three original planets. Rotate, zoom, and look a little closer.</p>
            <Link className={styles.primaryLink} href="/experiments/westcose-world">Explore the worlds <ArrowUpRight size={18} /></Link>
          </div>
        </section>
      )}
      {showInterfaces && (
        <section className={styles.studies} aria-labelledby="interface-title">
          <div className={styles.sectionHeading}>
            <h2 id="interface-title">Touch. Tweak. Try again.</h2>
            <p>These are live previews. The controls are yours.</p>
          </div>
          <div className={styles.studyGrid}>
            {studies.map((study) => (
              <article className={styles.study} key={study.slug}>
                <div className={styles.studyHeading}>
                  <h3><Link href={`/experiments/${study.slug}`}>{study.title}</Link></h3>
                  <span className={styles.studyStatus}>{study.status === "stable" ? "Stable" : "Beta"}</span>
                </div>
                <p className={styles.studyDescription}>{studyDescriptions[study.slug]}</p>
                <ExperimentPlayground slug={study.slug} compact />
                <Link className={styles.studyLink} href={`/experiments/${study.slug}`}>Open study <ArrowRight size={17} /></Link>
              </article>
            ))}
          </div>
        </section>
      )}
      <footer className={styles.footer}>
        <Cursor size={21} weight="duotone" aria-hidden="true" />
        <p>Good ideas get better when you play with them.</p>
        <Link href="/projects">See what we build <ArrowRight size={17} /></Link>
      </footer>
    </article>
  );
}
