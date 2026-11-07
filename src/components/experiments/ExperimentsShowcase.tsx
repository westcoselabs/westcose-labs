"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { experimentRegistry, experimentCategories, experimentPresentations } from "@/registry/portfolio";
import type { Experiment } from "@/registry/types";
import { ExperimentPlayground } from "./ExperimentPlayground";
import styles from "./ExperimentsShowcase.module.css";

export function ExperimentsShowcase() {
  const [filter, setFilter] = useState<Experiment["category"] | "all">("all");
  const categories = Object.entries(experimentCategories).filter(([id]) => experimentRegistry.some(study => study.category === id));
  const selected = experimentRegistry.filter(study => filter === "all" || study.category === filter);
  const demos = selected.filter(study => study.presentation === "live-demo");
  const logs = selected.filter(study => study.presentation !== "live-demo");

  function card(study: Experiment) {
    const interactive = study.presentation === "live-demo";
    return <article className={styles.study} key={study.slug} data-study-slug={study.slug}>
      {study.art && <Link className={styles.cardArt} href={`/experiments/${study.slug}`} tabIndex={-1} aria-hidden="true"><Image src={study.art.src} alt="" fill sizes="(max-width: 760px) 90vw, 450px" /></Link>}
      <div className={styles.studyHeading}><h3><Link href={`/experiments/${study.slug}`}>{study.title}</Link></h3><span className={styles.studyStatus}>{experimentPresentations[study.presentation]}</span></div>
      <p className={styles.studyDescription}>{study.purpose}</p>
      {interactive && study.demoKey && study.demoKey !== "westcose-world" && <ExperimentPlayground slug={study.demoKey} compact />}
      {!interactive && <p className={styles.question}>{study.question}</p>}
      <Link className={styles.studyLink} href={`/experiments/${study.slug}`}>{interactive ? study.actionLabel ?? "Open demo" : study.presentation === "build-log" ? "Read build log" : study.presentation === "research" ? "Read research" : "View concept"}<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </article>;
  }

  return <article className={styles.showcase} data-route-content data-presentation="experiments" data-experiments-showcase>
    <header className={styles.header}>
      <p className={styles.eyebrow}>THE LAB / OPEN BENCH</p>
      <h1 tabIndex={-1}>I had to see if it would work.</h1>
      <p>This is the part of WestCose where I test things. Small interactions, 3D assets, game mechanics, build tools, unfinished ideas, and the occasional rabbit hole that was supposed to take one afternoon.</p>
      <p>Some experiments have working demos. Some are build notes. I label them so you don’t click Play on a screenshot.</p>
    </header>
    <div className={styles.filterBar}>
      <div className={styles.filters} role="group" aria-label="Filter experiments">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All</button>
        {categories.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id as Experiment["category"])}>{label}</button>)}
      </div>
      <span className={styles.resultCount} role="status" aria-live="polite">{selected.length} {selected.length === 1 ? "experiment" : "experiments"}</span>
    </div>
    {logs.length > 0 && <section className={styles.studies} aria-labelledby="bench-title">
      <div className={styles.sectionHeading}><h2 id="bench-title">Things currently on the bench.</h2><p>The bigger tests. Some turned into actual tools. Others are still being worked out.</p></div>
      <div className={styles.studyGrid}>{logs.map(card)}</div>
    </section>}
    {demos.length > 0 && <section className={styles.studies} aria-labelledby="demo-title">
      <div className={styles.sectionHeading}><h2 id="demo-title">Open it. Break nothing important.</h2><p>These have real controls. You can actually try them.</p></div>
      <div className={styles.studyGrid}>{demos.map(card)}</div>
    </section>}
    <footer className={styles.footer}><p>Some of this becomes a project. Some of it stays here. Either way, I usually learn something useful.</p><Link href="/projects">See the projects <ArrowRight size={17} aria-hidden="true" /></Link><Link href="/notes">Read the notes <ArrowRight size={17} aria-hidden="true" /></Link></footer>
  </article>;
}
