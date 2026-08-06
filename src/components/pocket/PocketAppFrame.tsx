"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { ButtonLink } from "@/components/ui";

import styles from "./PocketAppFrame.module.css";

interface PocketAppFrameProps {
  readonly backLabel?: string;
  readonly children?: ReactNode;
  readonly normalViewHref?: string;
  readonly onBack: () => void;
  readonly title: string;
}

export function PocketAppFrame({
  backLabel = "Back",
  children,
  normalViewHref,
  onBack,
  title,
}: PocketAppFrameProps) {
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    contentRef.current
      ?.querySelector<HTMLElement>("[data-route-content] h1")
      ?.focus();
  }, [title]);

  return (
    <section aria-label={`${title} app`} className={styles.frame}>
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          <span>{backLabel}</span>
        </button>
        <p className={styles.title}>{title}</p>
        {normalViewHref ? (
          <ButtonLink className={styles.normalLink} href={normalViewHref}>
            Normal View
          </ButtonLink>
        ) : (
          <span aria-hidden="true" />
        )}
      </header>
      <main
        className={styles.content}
        id="pocket-app-content"
        ref={contentRef}
        tabIndex={-1}
      >
        {children}
      </main>
    </section>
  );
}
