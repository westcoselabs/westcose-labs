import type { ReactNode } from "react";

export type CaseStudyIndexItem = {
  readonly id: string;
  readonly label: string;
};

export type CaseStudyVisualItem = {
  readonly detail: string;
  readonly status?: string;
  readonly title: string;
};

export function CaseStudyIndex({
  items,
}: {
  readonly items: readonly CaseStudyIndexItem[];
}) {
  return (
    <nav className="case-study-index" aria-label="Case study sections">
      <p>Case file index</p>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CaseStudySection({
  children,
  id,
  number,
  title,
}: {
  readonly children: ReactNode;
  readonly id: string;
  readonly number: string;
  readonly title: string;
}) {
  return (
    <section className="case-study-section" aria-labelledby={`${id}-title`} id={id}>
      <header>
        <p>Chapter {number}</p>
        <h2 id={`${id}-title`}>{title}</h2>
      </header>
      <div className="case-study-section__body">{children}</div>
    </section>
  );
}

export function CaseStudyVisual({
  caption,
  items,
  title,
}: {
  readonly caption: string;
  readonly items: readonly CaseStudyVisualItem[];
  readonly title: string;
}) {
  return (
    <figure className="case-study-visual">
      <div className="case-study-visual__heading">
        <span aria-hidden="true">Process visual</span>
        <h3>{title}</h3>
      </div>
      <ol>
        {items.map((item) => (
          <li key={item.title}>
            {item.status ? <span>{item.status}</span> : null}
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </li>
        ))}
      </ol>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function CaseStudyComparison({
  caption,
  items,
  title,
}: {
  readonly caption: string;
  readonly items: readonly CaseStudyVisualItem[];
  readonly title: string;
}) {
  return (
    <figure className="case-study-comparison">
      <div className="case-study-visual__heading">
        <span aria-hidden="true">System comparison</span>
        <h3>{title}</h3>
      </div>
      <div>
        {items.map((item) => (
          <article key={item.title}>
            {item.status ? <span>{item.status}</span> : null}
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function CaseStudyNote({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  return (
    <aside className="case-study-note">
      <p>{label}</p>
      <div>{children}</div>
    </aside>
  );
}
