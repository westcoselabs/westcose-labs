"use client";

import Link from "next/link";
import { ArrowUpRight, Code, PencilSimple } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { projectRegistry } from "@/registry/projects";
import { serviceRegistry } from "@/registry/services";
import { ServicesAction, ServicesCapabilities, ServicesProcess, ServicesProject, ServicesStart } from "./ServicesContent";
import styles from "./ServicesShowcase.module.css";

export function ServicesShowcase() {
  const instanceId = useId();
  const panelId = `${instanceId}-service`;
  const workHeadingId = `${instanceId}-work`;
  const [selected, setSelected] = useState(0);
  const service = serviceRegistry[selected];
  const project = projectRegistry.find((entry) => entry.slug === service.projectSlugs[0])!;
  const relatedWork = projectRegistry.filter((entry) => ["first-medical-associates", "simply-decorated"].includes(entry.slug));

  return (
    <article className={styles.showcase} data-route-content data-services-showcase data-presentation="services">
      <header className={styles.hero}>
        <h1 tabIndex={-1}>Website design and web development services</h1>
        <p>New websites, thoughtful redesigns, and custom tools. A distinct identity and useful experience on every screen.</p>
        <ServicesAction href="/contact" primary>Discuss your website</ServicesAction>
      </header>

      <section className={styles.chooser} aria-label="Explore website services">
        <div className={styles.serviceControl} role="group" aria-label="Choose a service">
          {serviceRegistry.map((entry, index) => {
            const Icon = index === 0 ? PencilSimple : Code;
            return <button key={entry.slug} type="button" aria-pressed={selected === index} aria-controls={panelId} onClick={() => setSelected(index)}><Icon size={25} aria-hidden="true" /><span><strong>{entry.name}</strong><small>{index === 0 ? "A distinct identity" : "A useful experience"}</small></span><ArrowUpRight size={20} className={styles.selectionArrow} aria-hidden="true" /></button>;
          })}
        </div>
        <div id={panelId} className={styles.selectedService} key={service.slug}>
          <ServicesProject project={project} featured />
          <div className={styles.serviceCopy}>
            <h2>{selected === 0 ? "Make the right first impression." : "Make your website work harder."}</h2>
            <p>{service.summary}</p>
            <ServicesCapabilities service={service} />
            <ServicesAction href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()}</ServicesAction>
          </div>
        </div>
      </section>

      <ServicesProcess />

      <section className={styles.work} aria-labelledby={workHeadingId}>
        <div className={styles.sectionIntro}><h2 id={workHeadingId}>Different businesses. Distinct websites.</h2><p>Real project work, shaped around the people using it.</p></div>
        <div className={styles.projectRow}>{relatedWork.map((entry) => <ServicesProject key={entry.slug} project={entry} />)}</div>
        <Link className={styles.textLink} href="/projects">Explore the portfolio<ArrowUpRight size={18} aria-hidden="true" /></Link>
      </section>
      <ServicesStart />
    </article>
  );
}
