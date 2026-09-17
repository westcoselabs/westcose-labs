"use client";

import { ArrowLeft, DotsThree, ShareNetwork } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/ui";
import type { AppTone } from "@/registry";

import { PocketAppGlyph } from "./PocketAppGlyph";
import styles from "./PocketAppFrame.module.css";

interface PocketAppFrameProps {
  readonly appId: string;
  readonly backLabel?: string;
  readonly children?: ReactNode;
  readonly iconKey: string;
  readonly onBack: () => void;
  readonly shareHref?: string;
  readonly subtitle?: string;
  readonly title: string;
  readonly tone: AppTone;
}

export function PocketAppFrame({
  appId,
  backLabel = "Back",
  children,
  iconKey,
  onBack,
  shareHref,
  subtitle,
  title,
  tone,
}: PocketAppFrameProps) {
  const contentRef = useRef<HTMLElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    contentRef.current?.querySelector<HTMLElement>("[data-route-content] h1")?.focus();
  }, [title]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const share = async () => {
    const url = new URL(shareHref ?? window.location.pathname, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setShareMessage("Share sheet opened.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Link copied.");
      }
    } catch {
      setShareMessage("Share canceled.");
    }
  };

  return (
    <section aria-label={`${title} app`} className={styles.frame} data-app-id={appId} data-tone={tone}>
      <header className={styles.header}>
        <button className={styles.back} onClick={onBack} type="button">
          <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          <span>{backLabel}</span>
        </button>
        <div className={styles.identity}>
          <span className={styles.appIcon} aria-hidden="true"><PocketAppGlyph iconKey={iconKey} size="dock" /></span>
          <span>
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </span>
        </div>
        <div className={styles.actions}>
          {shareHref ? (
            <IconButton label={`Share ${title}`} onClick={share}>
              <ShareNetwork aria-hidden="true" />
            </IconButton>
          ) : null}
          <IconButton
            label={`More actions for ${title}`}
            onClick={() => setMenuOpen((open) => !open)}
            buttonRef={moreButtonRef}
          >
            <DotsThree aria-hidden="true" weight="bold" />
          </IconButton>
        </div>
        {menuOpen ? (
          <div className={styles.menu} role="menu">
            <button
              autoFocus
              onClick={() => {
                setMenuOpen(false);
                moreButtonRef.current?.focus();
              }}
              role="menuitem"
              type="button"
            >
              Close menu
            </button>
          </div>
        ) : null}
      </header>
      <p aria-live="polite" className="sr-only">{shareMessage}</p>
      <main className={styles.content} id="pocket-app-content" ref={contentRef} tabIndex={-1}>
        {children}
      </main>
    </section>
  );
}
