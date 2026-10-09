"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowLeft, CaretDown } from "@phosphor-icons/react";
import { projectRegistry } from "@/registry/projects";
import { ServicesAction, ServicesCapabilities, ServicesProject, ServicesStart, type Service } from "./ServicesContent";
import styles from "./ServicesShowcase.module.css";

export function ServicePage({ service }: { service: Service }) {
  const detailGroup = useId();
  const overviewHeadingId = `${detailGroup}-overview`;
  const detailsHeadingId = `${detailGroup}-details`;
  const workHeadingId = `${detailGroup}-work`;
  const projects = projectRegistry.filter((project) => (service.projectSlugs as readonly string[]).includes(project.slug));
  const featured = projects.find((project) => project.cover)!;
  return (
    <article className={styles.showcase} data-route-content data-services-showcase data-presentation="services">
      <nav className={styles.breadcrumb} aria-label="Service breadcrumb"><Link href="/services"><ArrowLeft size={17} aria-hidden="true" />Services</Link><span aria-current="page">{service.name}</span></nav>
      <header className={`${styles.hero} ${styles.detailHero}`}>
        <h1 tabIndex={-1}>{service.heading}</h1>
        <p>{service.summary}</p>
        <ServicesAction href="/contact" primary>Discuss your website</ServicesAction>
      </header>
      <section className={styles.detailOverview} aria-labelledby={overviewHeadingId}>
        <ServicesProject project={featured} featured />
        <div className={styles.serviceCopy}><h2 id={overviewHeadingId}>{service.slug === "website-design" ? "Designed around your business." : "Built around the work it needs to do."}</h2><p>{service.introduction}</p><ServicesCapabilities service={service} /></div>
      </section>
      <section className={styles.serviceDetails} aria-labelledby={detailsHeadingId}>
        <div className={styles.sectionIntro}><h2 id={detailsHeadingId}>The right approach for your website.</h2><p>Explore the scope, process, and practical details.</p></div>
        <div className={styles.processList}>{service.sections.map((section, index) => (
          <details className={`${styles.disclosure} ${styles.proseDisclosure}`} key={section.heading} name={detailGroup} open={index === 0}>
            <summary><span>{section.heading}</span><CaretDown className={styles.disclosureCaret} size={20} aria-hidden="true" /></summary>
            <div className={styles.disclosureContent}>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </details>
        ))}</div>
      </section>
      <section className={styles.work} aria-labelledby={workHeadingId}><div className={styles.sectionIntro}><h2 id={workHeadingId}>See the approach in practice.</h2><p>Related projects, each labeled by its actual status.</p></div><div className={styles.projectRow}>{projects.filter((entry) => entry.slug !== featured.slug).map((project) => <ServicesProject key={project.slug} project={project} />)}</div></section>
      <ServicesStart service={service} />
    </article>
  );
}
