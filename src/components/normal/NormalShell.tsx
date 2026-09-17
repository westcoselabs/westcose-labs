"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { ButtonLink } from "@/components/ui";

import styles from "./NormalShell.module.css";

const navigation = [
  ["/projects", "Projects"],
  ["/games", "Games"],
  ["/experiments", "Experiments"],
  ["/services", "Services"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

type SemanticShellProps = {
  children?: ReactNode;
  osViewHref: string;
  pathname: string;
  preserveNormalQuery: boolean;
  routeFallback: boolean;
};

export function SemanticShell({
  children,
  osViewHref,
  pathname,
  preserveNormalQuery,
  routeFallback,
}: SemanticShellProps) {
  const router = useRouter();

  const preservePresentation = (event: MouseEvent<HTMLDivElement>) => {
    if (!preserveNormalQuery || event.defaultPrevented || event.button !== 0) {
      return;
    }

    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (
      !anchor ||
      anchor.target ||
      anchor.download ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      url.pathname === "/normal" ||
      url.searchParams.get("view") === "os"
    ) {
      return;
    }

    event.preventDefault();
    url.searchParams.set("view", "normal");
    router.push(`${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <div className={styles.shell} onClickCapture={preservePresentation}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true">
            WCL
          </span>
          <span>
            <strong>WestCose Labs</strong>
            <small>Accessible document</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigation.map(([href, label]) => (
            <Link
              aria-current={pathname === href ? "page" : undefined}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <ButtonLink className={styles.osLink} href={osViewHref} tone="primary">
          Open OS view
        </ButtonLink>
      </header>

      {routeFallback ? (
        <p className={styles.fallbackNotice} role="status">
          This destination uses the accessible document layout on Pocket devices
          so every control remains conventional and accessible.
        </p>
      ) : null}

      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div>
          <strong>WestCose Labs OS</strong>
          <p>One content model. Accessible at every route.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/notes">README</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
