import Link from "next/link";
import type { Experiment } from "@/registry/types";
import { experimentRegistry } from "@/registry/portfolio";
import { ExperimentPlayground } from "./ExperimentPlayground";
import { PlanetExperiment } from "./planet/PlanetExperiment";
import styles from "./ExperimentStudy.module.css";

export function ExperimentStudy({ experiment }: { experiment: Experiment }) {
  const isWorld = experiment.slug === "westcose-world";
  const next = experimentRegistry[(experimentRegistry.findIndex((entry) => entry.slug === experiment.slug) + 1) % experimentRegistry.length];

  return (
    <article className={styles.study} data-route-content data-presentation="experiments">
      <Link className={styles.back} href="/experiments"><span aria-hidden="true">↖</span> All experiments</Link>
      <header className={styles.header}>
        <span className={styles.status}>{isWorld ? "Interactive 3D" : "Interactive study"} <span>{experiment.status}</span></span>
        <h1 tabIndex={-1}>{experiment.title}</h1>
        <p>{experiment.purpose}</p>
      </header>
      {isWorld ? <PlanetExperiment /> : (
        <section className={styles.live} aria-label={`${experiment.title} live preview`}>
          <div className={styles.liveHeading}><h2>Try it for yourself.</h2><p>A working preview. Your changes stay inside this study.</p></div>
          <ExperimentPlayground slug={experiment.slug} />
        </section>
      )}
      <section className={styles.notes} aria-label="About this experiment">
        <div><h2>How to explore</h2><p>{experiment.requirements}</p></div>
        <div><h2>What it proves</h2><p>{experiment.proof}</p></div>
      </section>
      <nav className={styles.next} aria-label="More experiments">
        <span>Keep exploring</span>
        <Link href={`/experiments/${next.slug}`}>{next.title}<span aria-hidden="true">↗</span></Link>
      </nav>
    </article>
  );
}
