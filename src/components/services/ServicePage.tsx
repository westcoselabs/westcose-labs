"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowLeft, CaretDown } from "@phosphor-icons/react";
import { getProject } from "@/registry/projects";
import { serviceCapabilities, type Service } from "@/registry/services";
import { ServicesAction, ServicesCapabilities, ServicesProject, ServicesStart } from "./ServicesContent";
import styles from "./ServicesShowcase.module.css";

export function ServicePage({ service }: { service: Service }) {
  const detailGroup = useId();
  const overviewHeadingId = `${detailGroup}-overview`;
  const detailsHeadingId = `${detailGroup}-details`;
  const workHeadingId = `${detailGroup}-work`;
  const projects = service.projectSlugs.map(getProject).filter((project) => project !== undefined);
  const [featured, ...examples] = projects;
  const capability = serviceCapabilities.find((entry) => entry.id === service.slug);

  return (
    <article className={styles.showcase} data-route-content data-services-showcase data-presentation="services">
      <nav className={styles.breadcrumb} aria-label="Service breadcrumb">
        <Link href="/services"><ArrowLeft size={17} aria-hidden="true" />Services</Link>
        <span aria-current="page">{service.name}</span>
      </nav>
      <header className={`${styles.hero} ${styles.detailHero}`}>
        <h1 tabIndex={-1}>{service.heading}</h1>
        {service.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <ServicesAction href="/contact" primary>{service.contactLabel}</ServicesAction>
      </header>
      {featured && capability ? (
        <section className={styles.detailOverview} aria-labelledby={overviewHeadingId}>
          <ServicesProject project={featured} featured />
          <div className={styles.serviceCopy}>
            <h2 id={overviewHeadingId}>What I can build</h2>
            <ServicesCapabilities items={capability.includes} />
          </div>
        </section>
      ) : null}
      <section className={styles.serviceDetails} aria-labelledby={detailsHeadingId}>
        <div className={styles.sectionIntro}><h2 id={detailsHeadingId}>How I approach the work</h2></div>
        <div className={styles.processList}>{service.sections.map((section, index) => (
          <details className={`${styles.disclosure} ${styles.proseDisclosure}`} key={section.heading} name={detailGroup} open={index === 0}>
            <summary><span>{section.heading}</span><CaretDown className={styles.disclosureCaret} size={20} aria-hidden="true" /></summary>
            <div className={styles.disclosureContent}>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </details>
        ))}</div>
      </section>
      {examples.length ? (
        <section className={styles.work} aria-labelledby={workHeadingId}>
          <div className={styles.sectionIntro}><h2 id={workHeadingId}>More projects to look at</h2></div>
          <div className={styles.projectRow}>{examples.map((project) => <ServicesProject key={project.slug} project={project} />)}</div>
        </section>
      ) : null}
      <ServicesStart service={service} />
    </article>
  );
}
