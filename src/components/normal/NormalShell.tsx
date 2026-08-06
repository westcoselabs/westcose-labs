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

type NormalShellProps = {
  children?: ReactNode;
  osViewHref: string;
  pathname: string;
  preserveNormalQuery: boolean;
  routeFallback: boolean;
};

export function NormalShell({
  children,
  osViewHref,
  pathname,
  preserveNormalQuery,
  routeFallback,
}: NormalShellProps) {
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
    if (url.origin !== window.location.origin || url.pathname === "/normal") {
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
        <Link className={styles.brand} href="/?view=normal">
          <span className={styles.brandMark} aria-hidden="true">
            WCL
          </span>
          <span>
            <strong>WestCose Labs</strong>
            <small>Normal View</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigation.map(([href, label]) => (
            <Link
              aria-current={pathname === href ? "page" : undefined}
              href={`${href}?view=normal`}
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
          This destination uses Normal View on Pocket devices so every control
          remains conventional and accessible.
        </p>
      ) : null}

      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div>
          <strong>WestCose Labs OS</strong>
          <p>One content model. Three presentation shells.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/notes?view=normal">README</Link>
          <Link href="/settings?view=normal">Settings</Link>
          <Link href="/contact?view=normal">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
