"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DesktopShell } from "@/components/desktop";
import { NormalShell } from "@/components/normal";
import {
  PocketShell,
  type PocketAppItem,
  type PocketPageIndex,
} from "@/components/pocket";
import {
  DEFAULT_SESSION,
  PREFERENCES_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  readPreferences,
  readSession,
  resolvePocketBackTarget,
  resolveShell,
  safeRemoveStorage,
  writePreferences,
  writeSession,
} from "@/lib";
import {
  appRegistry,
  getAppById,
  getAppByPath,
  getRouteDescriptor,
  pocketDockPlacement,
  pocketNotifications,
  pocketPageOnePlacement,
  pocketPageTwoPlacement,
  projectRegistry,
  routeSupportsShell,
  type OSApp,
} from "@/registry";
import {
  createInitialPocketState,
  createInitialPreferences,
  pocketReducer,
  preferencesReducer,
  resolveEffectiveAccessibility,
  toPocketSessionValues,
  type DisplayPreference,
} from "@/state";

import { PreferencePanel } from "./PreferencePanel";
import styles from "./OSRoot.module.css";

type OSRootProps = {
  children: ReactNode;
};

const toPocketApp = (app: OSApp): PocketAppItem => ({
  accessibilityLabel: app.accessibilityLabel,
  description: app.description,
  iconKey: app.iconKey,
  id: app.id,
  kind: "app",
  label: app.pocketLabel,
  statusLabel:
    app.status === "needs-configuration" ? "Needs configuration" : undefined,
});

function buildViewHref(
  pathname: string,
  searchParams: URLSearchParams,
  view: "normal" | "os",
) {
  const params = new URLSearchParams(searchParams);
  params.set("view", view);
  return `${pathname}?${params.toString()}`;
}

export function OSRoot({ children }: OSRootProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPathnameRef = useRef(pathname);
  const [hydrated, setHydrated] = useState(false);
  const [readmeShown, setReadmeShown] = useState(() =>
    typeof window === "undefined"
      ? false
      : readSession(window.sessionStorage).readmeShown,
  );
  const [environment, setEnvironment] = useState({
    coarsePointer: false,
    forcedColors: false,
    highContrast: false,
    reducedMotion: false,
    viewportWidth: Number.POSITIVE_INFINITY,
  });
  const [preferences, preferencesDispatch] = useReducer(
    preferencesReducer,
    undefined,
    createInitialPreferences,
  );
  const [pocket, pocketDispatch] = useReducer(
    pocketReducer,
    { pathname },
    createInitialPocketState,
  );

  useEffect(() => {
    const storedPreferences = readPreferences(window.localStorage);
    const storedSession = readSession(window.sessionStorage);
    preferencesDispatch({ type: "hydrate", preferences: storedPreferences });
    pocketDispatch({
      type: "session/hydrate",
      pathname: initialPathnameRef.current,
      session: storedSession,
    });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const highContrast = window.matchMedia("(prefers-contrast: more)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const update = () =>
      setEnvironment({
        coarsePointer: coarsePointer.matches,
        forcedColors: forcedColors.matches,
        highContrast: highContrast.matches,
        reducedMotion: reducedMotion.matches,
        viewportWidth: window.innerWidth,
      });

    let active = true;
    update();
    queueMicrotask(() => {
      if (active) setHydrated(true);
    });
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);
    highContrast.addEventListener("change", update);
    forcedColors.addEventListener("change", update);
    coarsePointer.addEventListener("change", update);
    return () => {
      active = false;
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
      highContrast.removeEventListener("change", update);
      forcedColors.removeEventListener("change", update);
      coarsePointer.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writePreferences(window.localStorage, preferences);
  }, [hydrated, preferences]);

  useEffect(() => {
    if (!hydrated) return;
    writeSession(window.sessionStorage, {
      ...toPocketSessionValues(pocket),
      readmeShown,
    });
  }, [hydrated, pocket, readmeShown]);

  const effectiveAccessibility = resolveEffectiveAccessibility(preferences, {
    reducedMotion: environment.reducedMotion,
    highContrast: environment.highContrast,
    forcedColors: environment.forcedColors,
  });
  const resolution = resolveShell({
    view: searchParams.get("view"),
    storedPreference: preferences.displayPreference,
    viewportWidth: environment.viewportWidth,
    coarsePointer: environment.coarsePointer,
    availability: {
      desktop: routeSupportsShell(pathname, "desktop"),
      pocket: routeSupportsShell(pathname, "pocket"),
      normal: true,
    },
  });
  const activeShell = resolution.shell;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.shell = activeShell;
    root.dataset.shellReady = "true";
    root.dataset.theme = preferences.themeId;
    if (effectiveAccessibility.highContrast) {
      root.dataset.highContrast = "true";
    } else {
      delete root.dataset.highContrast;
    }
    if (effectiveAccessibility.reducedMotion) {
      root.dataset.reducedMotion = "true";
    } else {
      delete root.dataset.reducedMotion;
    }
  }, [activeShell, effectiveAccessibility, preferences.themeId]);

  useEffect(() => {
    if (!hydrated) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(
            "[data-shell-panel]:not([hidden]) [data-route-content] h1",
          )
          ?.focus();
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [activeShell, hydrated, pathname]);

  const normalViewHref = buildViewHref(pathname, searchParams, "normal");
  const osViewHref = buildViewHref(pathname, searchParams, "os");
  const routeDescriptor = getRouteDescriptor(pathname);
  const activeApp = getAppByPath(pathname);
  const routeTitle = routeDescriptor?.title ?? activeApp?.name ?? "WestCose Labs";
  const defaultPocketPage =
    activeApp && "defaultPocketPage" in activeApp
      ? (activeApp.defaultPocketPage ?? 0)
      : 0;

  const pocketPageOneApps = useMemo(
    () => pocketPageOnePlacement.map((id) => toPocketApp(getAppById(id))),
    [],
  );
  const pocketPageTwoApps = useMemo(
    () => pocketPageTwoPlacement.map((id) => toPocketApp(getAppById(id))),
    [],
  );
  const pocketDockApps = useMemo(
    () => pocketDockPlacement.map((id) => toPocketApp(getAppById(id))),
    [],
  );

  const launchPocketApp = useCallback(
    (item: PocketAppItem) => {
      const app = appRegistry.find((candidate) => candidate.id === item.id);
      if (!app) return;
      if (app.target.kind === "route") {
        pocketDispatch({ type: "launch/record-origin", page: pocket.page });
        router.push(app.target.href);
        return;
      }
      if (app.target.kind === "external") {
        window.open(app.target.href, "_blank", "noopener,noreferrer");
        return;
      }
      window.location.href = app.target.href;
    },
    [pocket.page, router],
  );

  const backFromPocketApp = useCallback(() => {
    const target = resolvePocketBackTarget({
      pathname,
      originPage: pocket.originPage,
      defaultPage: defaultPocketPage,
    });
    if (target.kind === "home") {
      pocketDispatch({ type: "home/return", defaultPage: target.homePage ?? 0 });
    }
    router.push(target.pathname);
  }, [defaultPocketPage, pathname, pocket.originPage, router]);

  const resetPreferences = () => {
    safeRemoveStorage(window.localStorage, PREFERENCES_STORAGE_KEY);
    preferencesDispatch({ type: "reset" });
  };
  const resetSession = () => {
    safeRemoveStorage(window.sessionStorage, SESSION_STORAGE_KEY);
    setReadmeShown(DEFAULT_SESSION.readmeShown);
    pocketDispatch({ type: "session/reset", pathname });
  };

  const preferencePanel = (
    <PreferencePanel
      effectiveReducedMotion={effectiveAccessibility.reducedMotion}
      onDisplayPreference={(preference: DisplayPreference) =>
        preferencesDispatch({ type: "display-preference/set", preference })
      }
      onHighContrast={(enabled) =>
        preferencesDispatch({ type: "high-contrast/set", enabled })
      }
      onReducedMotion={(enabled) =>
        preferencesDispatch({ type: "reduced-motion/set", enabled })
      }
      onResetPreferences={resetPreferences}
      onResetSession={resetSession}
      onSound={(enabled) =>
        preferencesDispatch({ type: "sound/set", enabled })
      }
      preferences={preferences}
    />
  );
  const routeContent = (
    <>
      {children}
      {pathname === "/settings" ? preferencePanel : null}
    </>
  );

  const panelProps = (shell: typeof activeShell) => ({
    "aria-hidden": hydrated && activeShell !== shell ? true : undefined,
    "data-shell-panel": shell,
    hidden: hydrated && activeShell !== shell,
    inert: hydrated && activeShell !== shell ? true : undefined,
  });

  return (
    <div className={styles.root}>
      <p aria-live="polite" className="sr-only">
        {routeTitle} opened in {activeShell} view.
      </p>

      <div className={styles.desktopPanel} {...panelProps("desktop")}>
        {!hydrated || activeShell === "desktop" ? (
          <DesktopShell
            normalViewHref={normalViewHref}
            onReadmeShown={() => setReadmeShown(true)}
            onSoundToggle={() =>
              preferencesDispatch({
                type: "sound/set",
                enabled: !preferences.soundEnabled,
              })
            }
            pathname={pathname}
            routeTitle={routeTitle}
            settingsPanel={preferencePanel}
            showInitialReadme={
              hydrated && activeShell === "desktop" && !readmeShown
            }
            soundEnabled={preferences.soundEnabled}
          >
            {hydrated && activeShell === "desktop" ? routeContent : null}
          </DesktopShell>
        ) : null}
      </div>

      <div className={styles.pocketPanel} {...panelProps("pocket")}>
        {!hydrated || activeShell === "pocket" ? (
          <PocketShell
          activeApp={
            pathname === "/"
              ? undefined
              : { title: activeApp?.name ?? routeTitle, backLabel: "Back" }
          }
          dismissedNotificationIds={pocket.dismissedNotificationIds}
          dockApps={pocketDockApps}
          featuredProject={{
            appId: "projects",
            title: projectRegistry[0]?.title ?? "Projects",
            description:
              projectRegistry[0]?.shortDescription ?? "Selected product work.",
          }}
          labsStatus={{
            label: "Routes online",
            detail: "Development fixtures are clearly marked.",
          }}
          menuTargetId={pocket.menuTarget?.id}
          normalViewHref={normalViewHref}
          notifications={pocketNotifications}
          onBack={backFromPocketApp}
          onCloseAppMenu={() => pocketDispatch({ type: "menu/close" })}
          onDismissNotification={(notificationId) =>
            pocketDispatch({ type: "notification/dismiss", notificationId })
          }
          onLaunchApp={launchPocketApp}
          onOpenAppMenu={(app) =>
            pocketDispatch({
              type: "menu/open",
              target: { id: app.id, kind: app.kind === "social" ? "shortcut" : "app" },
            })
          }
          onPageChange={(page: PocketPageIndex) =>
            pocketDispatch({ type: "page/set", page })
          }
          onStartupComplete={() => pocketDispatch({ type: "startup/complete" })}
          onUnlock={() => pocketDispatch({ type: "unlock" })}
          page={pocket.page}
          pageOneApps={pocketPageOneApps}
          pageTwoApps={pocketPageTwoApps}
          pathname={pathname}
          reducedMotion={effectiveAccessibility.reducedMotion}
          startupPlayed={pocket.startupPlayed}
          unlocked={pocket.unlocked}
            wallpaperUrl="/images/wallpapers/dusk-pocket.webp"
          >
            {hydrated && activeShell === "pocket" ? routeContent : null}
          </PocketShell>
        ) : null}
      </div>

      <div className={styles.normalPanel} {...panelProps("normal")}>
        {!hydrated || activeShell === "normal" ? (
          <NormalShell
            osViewHref={osViewHref}
            pathname={pathname}
            preserveNormalQuery={searchParams.get("view") === "normal"}
            routeFallback={resolution.routeFallback}
          >
            {!hydrated || activeShell === "normal" ? routeContent : null}
          </NormalShell>
        ) : null}
      </div>
    </div>
  );
}
