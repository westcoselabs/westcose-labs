import Image from "next/image";
import Link from "next/link";
import type { Experiment } from "@/registry/types";
import { experimentRegistry, experimentPresentations } from "@/registry/portfolio";
import { ExperimentPlayground } from "./ExperimentPlayground";
import { PlanetExperiment } from "./planet/PlanetExperiment";
import styles from "./ExperimentStudy.module.css";

export function ExperimentStudy({ experiment }: { experiment: Experiment }) {
  const isWorld = experiment.demoKey === "westcose-world";
  const interactive = experiment.presentation === "live-demo";
  const next = experimentRegistry[(experimentRegistry.findIndex(entry => entry.slug === experiment.slug) + 1) % experimentRegistry.length];
  return <article className={styles.study} data-route-content data-presentation="experiments" data-study-presentation={experiment.presentation}>
    <Link className={styles.back} href="/experiments"><span aria-hidden="true">↖</span> All experiments</Link>
    <header className={styles.header}>
      <span className={styles.status}>{experimentPresentations[experiment.presentation]} <span>{experiment.statusLabel ?? experiment.status}</span></span>
      <h1 tabIndex={-1}>{experiment.title}</h1><p>{experiment.purpose}</p>
    </header>
    {isWorld ? <PlanetExperiment /> : interactive && experiment.demoKey ? <section className={styles.live} aria-label={`${experiment.title} live preview`}>
      <div className={styles.liveHeading}><h2>Try it for yourself.</h2><p>A working preview. Your changes stay inside this study.</p></div><ExperimentPlayground slug={experiment.demoKey} />
    </section> : experiment.art ? <figure className={styles.evidence}><div><Image src={experiment.art.src} alt={experiment.art.alt} fill sizes="(max-width: 768px) 95vw, 960px" /></div><figcaption>{experiment.art.caption}</figcaption></figure> : null}
    <section className={styles.notes} aria-label="About this experiment">
      <div><h2>The question</h2><p>{experiment.question}</p></div>
      <div><h2>What I tried</h2><p>{experiment.approach}</p></div>
      <div><h2>What it proves</h2><p>{experiment.proof}</p></div>
      <div><h2>{interactive ? "How to explore" : "Where to go next"}</h2><p>{experiment.requirements}</p></div>
    </section>
    {experiment.sections?.map(section => <section key={section.title} className={styles.logSection}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <nav className={styles.related} aria-label="Related work">
      {experiment.actionHref && <Link href={experiment.actionHref}>{experiment.actionLabel} ↗</Link>}
      {experiment.projectSlug && <Link href={`/projects/${experiment.projectSlug}`}>See the related project ↗</Link>}
      {experiment.relatedNoteId && <Link href={`/notes/${experiment.relatedNoteId}`}>Read the deeper notes ↗</Link>}
    </nav>
    <nav className={styles.next} aria-label="More experiments"><span>Keep exploring</span><Link href={`/experiments/${next.slug}`}>{next.title}<span aria-hidden="true">↗</span></Link></nav>
  </article>;
}
