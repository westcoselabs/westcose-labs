"use client";

import Link from "next/link";
import { ArrowUpRight, Code, Cube, GameController, PencilSimple, Shapes, Wrench } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { getProject, projectStatusLabel } from "@/registry/projects";
import { projectTypes, serviceCapabilities } from "@/registry/services";
import { ServicesAction, ServicesCapabilities, ServicesProcess, ServicesProject, ServicesStart } from "./ServicesContent";
import styles from "./ServicesShowcase.module.css";

const capabilityIcons = {
  "website-design": PencilSimple,
  "web-development": Code,
  tools: Wrench,
  interactive: Cube,
  games: GameController,
  "design-systems": Shapes,
};

const relatedWork = ["first-medical-associates", "estate-sales-bakersfield", "doopify", "westcose-world"]
  .map(getProject)
  .filter((project) => project !== undefined);

export function ServicesShowcase() {
  const instanceId = useId();
  const panelId = `${instanceId}-service`;
  const workHeadingId = `${instanceId}-work`;
  const scopeHeadingId = `${instanceId}-scope`;
  const [selected, setSelected] = useState(0);
  const capability = serviceCapabilities[selected];
  const [featured, ...examples] = capability.projectSlugs.map(getProject).filter((project) => project !== undefined);

  return (
    <article className={styles.showcase} data-route-content data-services-showcase data-presentation="services">
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Installed capabilities</p>
        <h1 tabIndex={-1}>Websites, software, and the stuff in between.</h1>
        <p>I design and build custom websites, web apps, and tools. I also work on interactive experiences and games when the project calls for something less ordinary.</p>
        <p>Some people need a better website. Others have a workflow that shouldn&apos;t take twelve tabs and three spreadsheets. Either way, the job is to figure out what needs to happen, make it look right, and build it so it actually works.</p>
        <div className={styles.heroActions}>
          <ServicesAction href="/contact" primary>Tell me what you&apos;re building</ServicesAction>
          <ServicesAction href="/projects">See the work</ServicesAction>
        </div>
      </header>

      <section className={styles.chooser} aria-label="Explore capabilities">
        <div className={styles.serviceControl} role="group" aria-label="Choose a service">
          {serviceCapabilities.map((entry, index) => {
            const Icon = capabilityIcons[entry.id];
            return (
              <button key={entry.id} type="button" aria-pressed={selected === index} aria-controls={panelId} onClick={() => setSelected(index)}>
                <Icon size={25} aria-hidden="true" />
                <span><strong>{entry.title}</strong><small>{entry.scope}</small></span>
                <ArrowUpRight size={20} className={styles.selectionArrow} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div id={panelId} className={styles.selectedService} key={capability.id}>
          {featured ? <ServicesProject project={featured} featured /> : null}
          <div className={styles.serviceCopy}>
            <h2>{capability.title}</h2>
            {capability.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <ServicesCapabilities items={capability.includes} />
            <ServicesAction href={capability.action.href}>{capability.action.label}</ServicesAction>
            {examples.length ? (
              <ul className={styles.examples} aria-label="More examples">
                {examples.map((project) => (
                  <li key={project.slug}>
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    <small>{projectStatusLabel(project)}</small>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.work} aria-labelledby={scopeHeadingId}>
        <div className={styles.sectionIntro}>
          <h2 id={scopeHeadingId}>New build, rebuild, or something in between.</h2>
          <p>You don&apos;t need a perfect brief. Tell me what exists, what&apos;s giving you trouble, and what you&apos;re trying to do. We can figure out the right size of project from there.</p>
        </div>
        <dl className={styles.scopeList}>
          {projectTypes.map(({ title, description }) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ServicesProcess />

      <section className={styles.work} aria-labelledby={workHeadingId}>
        <div className={styles.sectionIntro}>
          <h2 id={workHeadingId}>Here&apos;s what that looks like in real projects.</h2>
          <p>Different problems, different builds. Open a project to see the decisions behind the screenshots.</p>
        </div>
        <div className={styles.projectRow}>{relatedWork.map((project) => <ServicesProject key={project.slug} project={project} />)}</div>
        <Link className={styles.textLink} href="/projects">Explore the portfolio<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
      <ServicesStart />
    </article>
  );
}
