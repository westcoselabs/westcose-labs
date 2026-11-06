"use client";

import { useEffect, useRef, useState } from "react";
import { findScrollContainer, scrollWithinContainer } from "@/lib/scroll-container";
import type { WorldChapter } from "./content";
import styles from "./WorldShowcase.module.css";

export function ChapterNavigation({ chapters }: { chapters: readonly WorldChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(chapters[0].id);
  useEffect(() => {
    const article = ref.current?.closest<HTMLElement>("[data-world-case-study]");
    if (!article) return;
    const root = findScrollContainer(article);
    const sections = chapters.map(chapter => article?.querySelector<HTMLElement>(`#${chapter.id}`)).filter((element): element is HTMLElement => !!element);
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.isIntersecting);
      if (entry) setActive(entry.target.id);
    }, { root, rootMargin: "-5% 0px -65% 0px", threshold: 0 });
    sections.forEach(section => observer.observe(section));
    const targetFor = (hash: string) => Array.from(article.querySelectorAll<HTMLElement>("[id]")).find(item => `#${item.id}` === hash);
    const chapterFor = (target: HTMLElement) => sections.find(section => section === target || section.contains(target));
    const followHash = () => {
      const target = targetFor(location.hash);
      if (target) { scrollWithinContainer(target); const chapter = chapterFor(target); if (chapter) setActive(chapter.id); }
    };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
      const section = targetFor(link?.getAttribute("href") ?? "");
      if (!link || !section) return;
      event.preventDefault();
      const disclosure = link.closest("details");
      if (disclosure) disclosure.open = false;
      history.pushState(history.state, "", `#${section.id}`);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reducedMotion === "true";
      scrollWithinContainer(section, reduced ? "instant" : "smooth");
      const heading = section.matches("h2,h3,h4") ? section : section.querySelector<HTMLElement>("h2,h3,h4");
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      const chapter = chapterFor(section);
      if (chapter) setActive(chapter.id);
    };
    article.addEventListener("click", navigate);
    const frame = requestAnimationFrame(followHash);
    window.addEventListener("hashchange", followHash);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("hashchange", followHash); article.removeEventListener("click", navigate); };
  }, [chapters]);
  const links = chapters.map((chapter, i) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={active === chapter.id ? "location" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{chapter.label}</a>);
  return <div ref={ref} className={styles.contents}>
    <nav className={styles.rail} aria-label="Project chapters"><p>Inside the project</p>{links}<span className={styles.railFoot}>Art. Code. A whole coast.</span></nav>
    <details className={styles.compactContents}><summary>Contents <span>8 chapters</span></summary><nav aria-label="Project contents">{links}</nav></details>
  </div>;
}
