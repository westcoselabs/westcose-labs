"use client";

import { ArrowRight, DotsThree } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";

import {
  ButtonLink,
  IconButton,
  PressableSurface,
  SurfaceRaised,
} from "@/components/ui";

import { PocketAppGlyph } from "./PocketAppGlyph";
import { PocketAppMenu } from "./PocketAppMenu";
import { PocketAppTile } from "./PocketAppTile";
import styles from "./PocketHome.module.css";
import type {
  FeaturedProjectItem,
  LabsStatusItem,
  PocketAppItem,
  PocketPageIndex,
} from "./types";

interface PocketHomeProps {
  readonly dockApps: readonly PocketAppItem[];
  readonly featuredProject: FeaturedProjectItem;
  readonly labsStatus: LabsStatusItem;
  readonly menuTargetId?: string | null;
  readonly normalViewHref?: string;
  readonly onCloseAppMenu: () => void;
  readonly onLaunchApp: (app: PocketAppItem) => void;
  readonly onOpenAppMenu: (app: PocketAppItem) => void;
  readonly onPageChange: (page: PocketPageIndex) => void;
  readonly page: PocketPageIndex;
  readonly pageOneApps: readonly PocketAppItem[];
  readonly pageTwoApps: readonly PocketAppItem[];
  readonly reducedMotion: boolean;
}

export function PocketHome({
  dockApps,
  featuredProject,
  labsStatus,
  menuTargetId,
  normalViewHref,
  onCloseAppMenu,
  onLaunchApp,
  onOpenAppMenu,
  onPageChange,
  page,
  pageOneApps,
  pageTwoApps,
  reducedMotion,
}: PocketHomeProps) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef(0);
  const currentPageRef = useRef(page);
  const programmaticPageRef = useRef<PocketPageIndex | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const verifiedPageTwoApps = useMemo(
    () =>
      pageTwoApps.filter(
        (app) => app.kind !== "social" || app.verified === true,
      ),
    [pageTwoApps],
  );
  const allApps = useMemo(
    () => [...pageOneApps, ...verifiedPageTwoApps, ...dockApps],
    [dockApps, pageOneApps, verifiedPageTwoApps],
  );
  const menuApp = allApps.find((app) => app.id === menuTargetId);
  const projectsApp = allApps.find((app) => app.id === featuredProject.appId);

  useEffect(() => {
    currentPageRef.current = page;
    const viewport = pagesRef.current;
    if (!viewport) return;

    const target = viewport.clientWidth * page;
    if (Math.abs(viewport.scrollLeft - target) <= 2) {
      programmaticPageRef.current = null;
      return;
    }
    programmaticPageRef.current = page;
    viewport.scrollTo({
      left: viewport.clientWidth * page,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [page, reducedMotion]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    [],
  );

  const renderApps = (apps: readonly PocketAppItem[]) =>
    apps.map((app) => (
      <PocketAppTile
        app={app}
        key={app.id}
        onLaunch={onLaunchApp}
        onOpenMenu={onOpenAppMenu}
        onRememberMenuTrigger={(trigger) => {
          menuTriggerRef.current = trigger;
        }}
      />
    ));

  const goToPage = (nextPage: PocketPageIndex) => {
    currentPageRef.current = nextPage;
    onPageChange(nextPage);
  };

  return (
    <main aria-label="Pocket OS Home" className={styles.home}>
      <h1 className="sr-only">WestCose Pocket OS Home</h1>
      <div
        aria-hidden={menuApp ? true : undefined}
        className={styles.homeContent}
        inert={menuApp ? true : undefined}
      >
      <header className={styles.homeHeader}>
        <div className={styles.brand}>
          <strong>WestCose Labs</strong>
          <span>POCKET / DUSK</span>
        </div>
        <div className={styles.headerActions}>
          {normalViewHref ? (
            <ButtonLink className={styles.normalLink} href={normalViewHref}>
              Normal View
            </ButtonLink>
          ) : null}
          <IconButton
            label="Open Settings"
            onClick={() => {
              const settings = allApps.find((app) => app.id === "settings");
              if (settings) onLaunchApp(settings);
            }}
          >
            <DotsThree aria-hidden="true" weight="bold" />
          </IconButton>
        </div>
      </header>

      <div
        aria-label="Home pages"
        className={styles.pages}
        onScroll={() => {
          if (scrollFrameRef.current) return;
          scrollFrameRef.current = window.requestAnimationFrame(() => {
            scrollFrameRef.current = 0;
            const viewport = pagesRef.current;
            if (!viewport || viewport.clientWidth === 0) return;
            const programmedPage = programmaticPageRef.current;
            if (programmedPage !== null) {
              const target = viewport.clientWidth * programmedPage;
              if (Math.abs(viewport.scrollLeft - target) <= 2) {
                programmaticPageRef.current = null;
              } else {
                return;
              }
            }
            const nextPage = Math.min(
              1,
              Math.max(0, Math.round(viewport.scrollLeft / viewport.clientWidth)),
            ) as PocketPageIndex;
            if (nextPage !== currentPageRef.current) {
              currentPageRef.current = nextPage;
              onPageChange(nextPage);
            }
          });
        }}
        ref={pagesRef}
      >
        <section
          aria-label="Home Page One"
          aria-roledescription="slide"
          className={styles.page}
        >
          <div className={styles.widgets}>
            <PressableSurface
              aria-label={`Open featured project: ${featuredProject.title}`}
              className={styles.projectWidget}
              disabled={!projectsApp}
              onClick={() => {
                if (projectsApp) onLaunchApp(projectsApp);
              }}
            >
              <span className={styles.widgetLabel}>Featured Project</span>
              <strong className={styles.widgetTitle}>
                {featuredProject.title}
              </strong>
              <span className={styles.widgetDescription}>
                {featuredProject.description}
              </span>
              <ArrowRight aria-hidden="true" size={20} weight="bold" />
            </PressableSurface>
            <SurfaceRaised className={styles.widget}>
              <span className={styles.widgetLabel}>Labs Status</span>
              <span className={styles.statusLine}>
                <span aria-hidden="true" className={styles.statusMark} />
                {labsStatus.label}
              </span>
              <span className={styles.widgetDescription}>
                {labsStatus.detail}
              </span>
            </SurfaceRaised>
          </div>
          <div className={styles.appGrid}>{renderApps(pageOneApps)}</div>
        </section>

        <section
          aria-label="Home Page Two"
          aria-roledescription="slide"
          className={[styles.page, styles.pageTwo].join(" ")}
        >
          <div className={styles.pageHeading}>
            <h2 className="type-headline-sm">Games &amp; archive</h2>
            <p>Verified shortcuts only</p>
          </div>
          <div className={styles.appGrid}>
            {renderApps(verifiedPageTwoApps)}
            {verifiedPageTwoApps.length === 0 ? (
              <p className={styles.emptyPageTwo}>No verified shortcuts yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      <nav aria-label="Home page selector" className={styles.indicators}>
        {([0, 1] as const).map((pageNumber) => (
          <button
            aria-current={page === pageNumber ? "page" : undefined}
            aria-label={`Go to Home Page ${pageNumber + 1}`}
            className={styles.indicator}
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            type="button"
          />
        ))}
      </nav>

      <nav aria-label="Pocket Dock" className={styles.dock}>
        {dockApps.map((app) => (
          <button
            aria-label={app.accessibilityLabel}
            className={styles.dockButton}
            key={app.id}
            onClick={() => onLaunchApp(app)}
            type="button"
          >
            <PocketAppGlyph iconKey={app.iconKey} size="dock" />
            <span>{app.label}</span>
          </button>
        ))}
      </nav>
      </div>

      {menuApp ? (
        <PocketAppMenu
          app={menuApp}
          onClose={onCloseAppMenu}
          onLaunch={onLaunchApp}
          returnFocusRef={menuTriggerRef}
        />
      ) : null}
    </main>
  );
}
