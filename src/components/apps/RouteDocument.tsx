import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./RouteDocument.module.css";

export type RouteAction = {
  href: string;
  label: string;
  external?: boolean;
  variant?: "primary" | "secondary";
};

type RouteDocumentProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  status?: string;
  actions?: readonly RouteAction[];
  children: ReactNode;
  className?: string;
};

export function RouteDocument({
  eyebrow,
  title,
  description,
  status,
  actions = [],
  children,
  className,
}: RouteDocumentProps) {
  return (
    <article
      className={[styles.document, "route-document", className]
        .filter(Boolean)
        .join(" ")}
      data-route-content
    >
      <header className="route-document__header">
        <div className="route-document__heading-group">
          {eyebrow ? <p className="route-document__eyebrow">{eyebrow}</p> : null}
          <h1 className="route-document__title" tabIndex={-1}>
            {title}
          </h1>
          {description ? (
            <p className="route-document__lede">{description}</p>
          ) : null}
        </div>
        {status ? (
          <p className="route-document__status" role="status">
            {status}
          </p>
        ) : null}
        {actions.length ? (
          <nav className="route-document__actions" aria-label={`${title} actions`}>
            {actions.map((action) => {
              const className = `route-action route-action--${action.variant ?? "secondary"}`;
              return action.external ? (
                <a
                  className={className}
                  href={action.href}
                  key={`${action.href}-${action.label}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {action.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  className={className}
                  href={action.href}
                  key={`${action.href}-${action.label}`}
                >
                  {action.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </header>
      <div className="route-document__body">{children}</div>
    </article>
  );
}

export function RouteSection({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="route-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function RouteCardGrid({ children }: { children: ReactNode }) {
  return <div className="route-card-grid">{children}</div>;
}
