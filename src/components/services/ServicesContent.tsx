"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowRight, ArrowUpRight, CaretDown, Check, ChatCircle, Code, PencilSimple, Shapes } from "@phosphor-icons/react";
import type { Project } from "@/registry";
import { ProjectArtwork } from "@/components/projects/ProjectPreview";
import { projectStatusLabel } from "@/registry/projects";
import { serviceRegistry } from "@/registry/services";
import styles from "./ServicesShowcase.module.css";

export type Service = (typeof serviceRegistry)[number];

const serviceCapabilities = {
  "website-design": ["Page planning & clear navigation", "Visual direction & reusable patterns", "Responsive layouts for every screen"],
  "web-development": ["Custom React & Next.js interfaces", "WordPress & content publishing", "Business tools & scoped integrations"],
} as const;

export function ServicesAction({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return <Link className={`${styles.action} ${primary ? styles.primaryAction : ""}`} href={href}>{children}<ArrowRight size={19} aria-hidden="true" /></Link>;
}

export function ServicesCapabilities({ service }: { service: Service }) {
  return <ul className={styles.capabilities}>{serviceCapabilities[service.slug].map((item) => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
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
  { title: "Understand the brief", icon: ChatCircle, copy: "Discuss your audience, current website, business priorities, and required functionality." },
  { title: "Define the scope", icon: Shapes, copy: "Agree on the pages, content, design direction, integrations, and responsibilities." },
  { title: "Design and build", icon: PencilSimple, copy: "Develop the experience around real content and review the important journeys together." },
  { title: "Review and hand off", icon: Code, copy: "Check the agreed functionality, mobile layouts, and launch requirements, then clarify ongoing ownership." },
] as const;

export function ServicesProcess() {
  const processGroup = useId();
  const headingId = `${processGroup}-heading`;
  return (
    <section className={styles.process} aria-labelledby={headingId}>
      <div className={styles.sectionIntro}><h2 id={headingId}>A clear path from brief to build.</h2><p>We shape the work together, with room for feedback at every stage.</p></div>
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
      <div><h2 id={headingId}>Bring your ideas.<br />We’ll shape the next step.</h2><p>Share your current site, what needs to improve, and any timing or budget constraints. Branding, photography, and draft content help too.</p><ServicesAction href="/contact" primary>Discuss your website</ServicesAction></div>
      <div className={styles.startAside}><h3>Made around your scope</h3><p>Pricing, schedules, hosting, third-party costs, and maintenance depend on the work involved. We’ll discuss those details for your project.</p>{related ? <ServicesAction href={`/services/${related.slug}`}>Explore {related.name.toLowerCase()}</ServicesAction> : <nav className={styles.serviceLinks} aria-label="Explore services">{serviceRegistry.map((entry) => <Link key={entry.slug} href={`/services/${entry.slug}`}>{entry.name}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}</nav>}</div>
    </section>
  );
}
