import Link from "next/link";
import type { ReactNode } from "react";

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

export function ServerSemanticShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell} data-server-normal-fallback>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span aria-hidden="true" className={styles.brandMark}>
            WCL
          </span>
          <span>
            <strong>WestCose Labs</strong>
            <small>Accessible document</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className={styles.navigation}>
          {navigation.map(([href, label]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <ButtonLink className={styles.osLink} href="?view=os" tone="primary">
          Open OS view
        </ButtonLink>
      </header>

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
