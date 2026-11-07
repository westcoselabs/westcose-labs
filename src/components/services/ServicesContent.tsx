"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowRight, ArrowUpRight, CaretDown, Check, ChatCircle, Code, PencilSimple, Shapes } from "@phosphor-icons/react";
import type { Project } from "@/registry";
import { ProjectArtwork } from "@/components/projects/ProjectPreview";
import { projectStatusLabel } from "@/registry/projects";
import { serviceRegistry, type Service } from "@/registry/services";
import styles from "./ServicesShowcase.module.css";

export function ServicesAction({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return <Link className={`${styles.action} ${primary ? styles.primaryAction : ""}`} href={href}>{children}<ArrowRight size={19} aria-hidden="true" /></Link>;
}

export function ServicesCapabilities({ items }: { items: readonly string[] }) {
  return <ul className={styles.capabilities}>{items.map((item) => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
}

export function ServicesProject({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Link className={`${styles.project} ${featured ? styles.featuredProject : ""}`} href={`/projects/${project.slug}`}>
      <span className={styles.projectArt}><ProjectArtwork project={project} eager={featured} /></span>
      <span className={styles.projectCaption}>
        <span><strong>{project.title}</strong><small>{projectStatusLabel(project)}</small></span>
        <ArrowUpRight size={22} aria-hidden="true" />
      </span>
    </Link>
  );
}

const process = [
  { title: "Talk through it", icon: ChatCircle, copy: "What are you making? Who is it for? What's broken or missing? I want the real problem before I start making screens." },
  { title: "Figure out the scope", icon: Shapes, copy: "We'll work through the pages, features, content, integrations, and budget. Then we can decide what the project actually needs." },
  { title: "Design and build", icon: PencilSimple, copy: "I work on the interface and the code together. We review what matters as it comes together." },
  { title: "Test, fix, and hand off", icon: Code, copy: "Check the important flows, mobile behavior, and launch setup. Then make sure there's a clear plan for hosting, ownership, maintenance, and what happens next." },
] as const;

export function ServicesProcess() {
  const processGroup = useId();
  const headingId = `${processGroup}-heading`;
  return (
    <section className={styles.process} aria-labelledby={headingId}>
      <div className={styles.sectionIntro}><h2 id={headingId}>How a project usually goes</h2></div>
      <div className={styles.processList}>{process.map(({ title, icon: Icon, copy }, index) => (
        <details name={processGroup} className={styles.disclosure} key={title} open={index === 0}>
          <summary><span className={styles.processIcon}><Icon size={23} aria-hidden="true" /></span><span>{title}</span><CaretDown className={styles.disclosureCaret} size={20} aria-hidden="true" /></summary>
          <div className={styles.disclosureContent}><p>{copy}</p></div>
        </details>
      ))}</div>
    </section>
  );
}

export function ServicesStart({ service }: { service?: Service }) {
  const headingId = useId();
  const related = service ? serviceRegistry.find((entry) => entry.slug !== service.slug) : undefined;
  return (
    <section className={styles.start} aria-labelledby={headingId}>
      <div>
        <h2 id={headingId}>Got something you want to make?</h2>
        <p>{service?.closing ?? "Tell me what you're thinking. A website, an app, a weird interaction, or a problem you want off your plate. I'll be straight with you about what makes sense for the project."}</p>
        <ServicesAction href="/contact" primary>{service?.contactLabel ?? "Start a conversation"}</ServicesAction>
      </div>
      <div className={styles.startAside}>
        <h3>Before we start</h3>
        <p>Scope, timing, third-party costs, and ongoing support depend on the project. We&apos;ll talk those through before we agree on anything.</p>
        {related ? (
          <ServicesAction href={`/services/${related.slug}`}>Explore {related.name.toLowerCase()}</ServicesAction>
        ) : (
          <nav className={styles.serviceLinks} aria-label="Explore services">
            {serviceRegistry.map((entry) => <Link key={entry.slug} href={`/services/${entry.slug}`}>{entry.name}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}
          </nav>
        )}
      </div>
    </section>
  );
}
