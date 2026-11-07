"use client";

import { FeaturedBuild } from "@/components/os/FeaturedBuild";

import { LiquidGlass } from "@/components/ui/LiquidGlass";

import { ArrowLeft, ArrowRight, CloudSun } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { SurfaceRaised } from "@/components/ui";
import { useDiscoveryService } from "@/components/os/DiscoveryServiceContext";
import { useLongPress } from "@/hooks/useLongPress";
import { personalityRegistry } from "@/registry";

import { PocketAppGlyph } from "./PocketAppGlyph";
import { PocketAppMenu } from "./PocketAppMenu";
import { PocketAppTile } from "./PocketAppTile";
import { PocketCustomizeSheet } from "./PocketCustomizeSheet";
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
  readonly onCloseAppMenu: () => void;
  readonly onLaunchApp: (app: PocketAppItem) => void;
  readonly onOpenAppearanceSettings?: () => void;
  readonly onOpenAppMenu: (app: PocketAppItem) => void;
  readonly onPageChange: (page: PocketPageIndex) => void;
  readonly page: PocketPageIndex;
  readonly pageOneApps: readonly PocketAppItem[];
  readonly pageTwoApps: readonly PocketAppItem[];
  readonly reducedMotion: boolean;
}

function usePocketClock() {
  const [clock, setClock] = useState({ date: "LOCAL SYSTEM", time: "--:--" });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        date: new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(now),
        time: new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).formatToParts(now).filter((part) => part.type !== "dayPeriod").map((part) => part.value).join("").trim(),
      });
    };
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return clock;
}

export function PocketHome({
  dockApps,
  labsStatus,
  menuTargetId,
  onCloseAppMenu,
  onLaunchApp,
  onOpenAppearanceSettings,
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
  const customizeTriggerRef = useRef<HTMLButtonElement>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState<"theme" | "wallpaper">("wallpaper");
  const [statusTaps, setStatusTaps] = useState(0);
  const discoveryService = useDiscoveryService();
  const clock = usePocketClock();
  const verifiedPageTwoApps = useMemo(
    () => pageTwoApps.filter((app) => app.kind !== "social" || app.verified === true),
    [pageTwoApps],
  );
  const allApps = useMemo(
    () => [...pageOneApps, ...verifiedPageTwoApps, ...dockApps],
    [dockApps, pageOneApps, verifiedPageTwoApps],
  );
  const menuApp = allApps.find((app) => app.id === menuTargetId);
  const condition = personalityRegistry.conditionMessages[0];
  const discovery = statusTaps >= 5 ? personalityRegistry.discoveries.labsStatus : "";

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
      left: target,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [page, reducedMotion]);

  useEffect(
    () => () => {
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
    },
    [],
  );

  // Long press on empty home-screen space. Both pages share these handlers, and
  // the visible Customize control below opens the same sheet.
  const longPress = useLongPress({
    onLongPress: () => { setCustomizeTab("wallpaper"); setCustomizeOpen(true); },
  });

  const renderApps = (apps: readonly PocketAppItem[]) =>
    apps.map((app) => (
      <PocketAppTile
        app={app}
        key={app.id}
        onLaunch={(item, trigger) => {
          if (item.id === "themes") {
            customizeTriggerRef.current = trigger;
            setCustomizeTab("theme");
            setCustomizeOpen(true);
          } else onLaunchApp(item);
        }}
        onOpenMenu={onOpenAppMenu}
        onRememberMenuTrigger={(trigger) => {
          menuTriggerRef.current = trigger;
        }}
      />
    ));

  return (
    <main aria-label="Pocket OS Home" className={styles.home}>
      <div
        aria-hidden={menuApp || customizeOpen ? true : undefined}
        className={styles.homeContent}
        inert={menuApp || customizeOpen ? true : undefined}
      >
        <h1 className="sr-only">WestCose Labs Home</h1>
        <button
          className={styles.customizeAffordance}
          onClick={() => { setCustomizeTab("wallpaper"); setCustomizeOpen(true); }}
          ref={customizeTriggerRef}
          type="button"
        >
          Customize Home Screen
        </button>

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
            {...longPress}
          >
            <div className={styles.widgets}>
              <FeaturedBuild />
              <SurfaceRaised className={styles.todayWidget}>
                <div className={styles.todayTopline}>
                  <span>Bakersfield</span>
                  <CloudSun aria-hidden="true" size={24} weight="duotone" />
                </div>
                <div>
                  <strong className={styles.time}>{clock.time}</strong>
                  <span className={styles.date}>{clock.date}</span>
                </div>
                <p className={styles.condition}>{condition}</p>
                <button
                  className={styles.statusComplication}
                  onClick={() =>
                    setStatusTaps((count) => {
                      const nextCount = count + 1;
                      if (nextCount === 5) {
                        discoveryService?.recordDiscovery(
                          "desktop.labs-status",
                        );
                      }
                      return nextCount;
                    })
                  }
                  type="button"
                >
                  <span aria-hidden="true" className={styles.statusMark} />
                  <span>{labsStatus.label}</span>
                </button>
                <p aria-live="polite" className={styles.discovery}>{discovery}</p>
              </SurfaceRaised>

            </div>
            <div className={styles.appGrid}>{renderApps(pageOneApps)}</div>
          </section>

          <section
            aria-label="Home Page Two"
            aria-roledescription="slide"
            className={[styles.page, styles.pageTwo].join(" ")}
            {...longPress}
          >
            <div className={styles.pageHeading}>
              <h2 className="type-headline-sm">Games and archive</h2>
              <p>Verified apps</p>
            </div>
            <div className={styles.appGrid}>
              {renderApps(verifiedPageTwoApps)}
              {verifiedPageTwoApps.length === 0 ? <p className={styles.emptyPageTwo}>No verified apps yet.</p> : null}
            </div>
          </section>
        </div>

        <div className={styles.pagination}>
        <span className={styles.swipeHint} aria-hidden="true">
          {page === 0 ? <>Swipe for more <ArrowRight size={13} /></> : <><ArrowLeft size={13} /> Swipe for home</>}
        </span>
        <nav aria-label="Home page selector" className={styles.indicators}>
          {([0, 1] as const).map((pageNumber) => (
            <button
              aria-current={page === pageNumber ? "page" : undefined}
              aria-label={`Go to Home Page ${pageNumber + 1}`}
              className={styles.indicator}
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              type="button"
            />
          ))}
        </nav>
        </div>

        <nav aria-label="Pocket Dock" className={styles.dock}>
          <LiquidGlass tone="clear" />
          {dockApps.map((app) => (
            <button
              aria-label={app.accessibilityLabel}
              className={styles.dockButton}
              data-tone={app.tone}
              key={app.id}
              onClick={() => onLaunchApp(app)}
              type="button"
            >
              <span className={styles.dockIcon}><PocketAppGlyph iconKey={app.iconKey} size="dock" /></span>
              <span>{app.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {menuApp ? (
        <PocketAppMenu app={menuApp} onClose={onCloseAppMenu} onLaunch={onLaunchApp} returnFocusRef={menuTriggerRef} />
      ) : null}

      {customizeOpen ? (
        <PocketCustomizeSheet
          initialTab={customizeTab}
          onClose={() => setCustomizeOpen(false)}
          onOpenAppearanceSettings={() => onOpenAppearanceSettings?.()}
          returnFocusRef={customizeTriggerRef}
        />
      ) : null}
    </main>
  );
}
