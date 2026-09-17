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
import { SemanticShell } from "@/components/normal";
import {
  PocketShell,
  type PocketAppItem,
  type PocketPageIndex,
} from "@/components/pocket";
import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import {
  DEFAULT_SESSION,
  createDiscoveryService,
  readLocalNotesState,
  readPreferences,
  readSession,
  resetLocalNotesStorage,
  resetPreferencesStorage,
  resetSessionStorage,
  resolvePocketBackTarget,
  resolveShell,
  safeResolveStorage,
  writeLocalNotesState,
  writePreferences,
  writeSession,
} from "@/lib";
import {
  appRegistry,
  getAppById,
  getAppByPath,
  getParentPath,
  getProject,
  getRouteDescriptor,
  getTheme,
  pocketDockPlacement,
  pocketNotifications,
  pocketPageOnePlacement,
  pocketPageTwoPlacement,
  personalityRegistry,
  projectRegistry,
  routeSupportsShell,
  type OSApp,
} from "@/registry";
import {
  createInitialLocalNotesState,
  createInitialPocketState,
  createInitialPreferences,
  localNotesReducer,
  pocketReducer,
  preferencesReducer,
  resolveEffectiveAccessibility,
  toPocketSessionValues,
} from "@/state";

import { DiscoveryServiceProvider } from "./DiscoveryServiceContext";
import { LocalNotesProvider } from "./LocalNotesContext";
import { SettingsProvider } from "./SettingsContext";
import { ShellPresentationProvider } from "./ShellPresentationContext";
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
  tone: app.tone,
  statusLabel:
    app.status === "needs-configuration" ? "Needs configuration" : undefined,
});

function buildOsViewHref(pathname: string, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);
  params.set("view", "os");
  return `${pathname}?${params.toString()}`;
}

export function OSRoot({ children }: OSRootProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storage] = useState(() => ({
    local:
      typeof window === "undefined"
        ? null
        : safeResolveStorage(() => window.localStorage),
    session:
      typeof window === "undefined"
        ? null
        : safeResolveStorage(() => window.sessionStorage),
  }));
  const initialPathnameRef = useRef(pathname);
  const [hydrated, setHydrated] = useState(false);
  const [readmeShown, setReadmeShown] = useState(
    () => readSession(storage.session).readmeShown,
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
  const [localNotes, localNotesDispatch] = useReducer(
    localNotesReducer,
    undefined,
    createInitialLocalNotesState,
  );
  const [discoveryService] = useState(() =>
    createDiscoveryService(storage.local),
  );

  useEffect(() => {
    const storedPreferences = readPreferences(storage.local);
    const storedSession = readSession(storage.session);
    const storedLocalNotes = readLocalNotesState(storage.local);
    preferencesDispatch({ type: "hydrate", preferences: storedPreferences });
    localNotesDispatch({ type: "hydrate", state: storedLocalNotes });
    discoveryService.hydrate();
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
  }, [discoveryService, storage]);

  useEffect(() => {
    if (!hydrated) return;
    writePreferences(storage.local, preferences);
  }, [hydrated, preferences, storage]);

  useEffect(() => {
    if (!hydrated) return;
    writeSession(storage.session, {
      ...toPocketSessionValues(pocket),
      readmeShown,
    });
  }, [hydrated, pocket, readmeShown, storage]);

  useEffect(() => {
    if (!hydrated) return;
    writeLocalNotesState(storage.local, localNotes);
  }, [hydrated, localNotes, storage]);

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
    root.dataset.iconLighting = preferences.iconLighting ? "on" : "off";
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
  }, [
    activeShell,
    effectiveAccessibility,
    preferences.iconLighting,
    preferences.themeId,
  ]);

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

  const osViewHref = buildOsViewHref(pathname, searchParams);
  const activeTheme = getTheme(preferences.themeId) ?? getTheme("dusk");
  const routeDescriptor = getRouteDescriptor(pathname);
  const activeApp = getAppByPath(pathname);
  const activeProject = pathname.startsWith("/projects/")
    ? getProject(pathname.slice("/projects/".length))
    : undefined;
  const routeTitle =
    activeProject?.title ??
    routeDescriptor?.title ??
    activeApp?.name ??
    "WestCose Labs";
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
      const app = appRegistry.find(
        (candidate) => candidate.id === item.id,
      ) as OSApp | undefined;
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
    resetPreferencesStorage(storage.local);
    preferencesDispatch({ type: "reset" });
  };
  const resetSession = () => {
    resetSessionStorage(storage.session);
    setReadmeShown(DEFAULT_SESSION.readmeShown);
    pocketDispatch({ type: "session/reset", pathname: "/" });
    router.push("/");
  };
  const resetDiscoveries = () => discoveryService.reset();
  const resetLocalNotes = () => {
    resetLocalNotesStorage(storage.local);
    localNotesDispatch({ type: "reset" });
  };

  const showPocketSystem = (
    action: "system/lock" | "system/preview-lock" | "system/replay-startup",
  ) => {
    pocketDispatch({ type: action });
    router.push("/");
  };

  const settingsPanel = (
    <ShellPresentationProvider shell="desktop">
      <SettingsRoute />
    </ShellPresentationProvider>
  );
  const routeContent = children;

  const panelProps = (shell: typeof activeShell) => ({
    "aria-hidden": hydrated && activeShell !== shell ? true : undefined,
    "data-shell-panel": shell,
    hidden: hydrated && activeShell !== shell,
    inert: hydrated && activeShell !== shell ? true : undefined,
  });

  return (
    <DiscoveryServiceProvider service={discoveryService}>
      <LocalNotesProvider dispatch={localNotesDispatch} state={localNotes}>
        <SettingsProvider
          value={{
            dispatch: preferencesDispatch,
            effectiveAccessibility,
            lockPocket: () => showPocketSystem("system/lock"),
            preferences,
            previewLock: () => showPocketSystem("system/preview-lock"),
            replayStartup: () => showPocketSystem("system/replay-startup"),
            resetAllLocalState: () => {
              resetPreferences();
              resetSession();
              resetDiscoveries();
              resetLocalNotes();
            },
            resetDiscoveries,
            resetLocalNotes,
            resetPreferences,
            resetSession,
          }}
        >
        <div className={styles.root}>
      <p aria-live="polite" className="sr-only">
        {routeTitle} opened in{" "}
        {activeShell === "normal" ? "semantic document" : `${activeShell} view`}.
      </p>

      <div className={styles.desktopPanel} {...panelProps("desktop")}>
        {!hydrated || activeShell === "desktop" ? (
          <DesktopShell
            onReadmeShown={() => setReadmeShown(true)}
            onSoundToggle={() =>
              preferencesDispatch({
                type: "sound/set",
                enabled: !preferences.soundEnabled,
              })
            }
            pathname={pathname}
            routeTitle={routeTitle}
            settingsPanel={settingsPanel}
            showInitialReadme={
              hydrated && activeShell === "desktop" && !readmeShown
            }
            soundEnabled={preferences.soundEnabled}
          >
            {hydrated && activeShell === "desktop" ? (
              <ShellPresentationProvider shell="desktop">
                {routeContent}
              </ShellPresentationProvider>
            ) : null}
          </DesktopShell>
        ) : null}
      </div>

      <div className={styles.pocketPanel} {...panelProps("pocket")}>
        {!hydrated || activeShell === "pocket" ? (
          <PocketShell
          activeApp={
            pathname === "/"
              ? undefined
              : {
                  id: activeApp?.id ?? "projects",
                  title: activeProject?.title ?? activeApp?.name ?? routeTitle,
                  backLabel: getParentPath(pathname) === "/" ? "Home" : "Back",
                  iconKey: activeApp?.iconKey ?? "projects",
                  subtitle:
                    activeProject?.status === "development-fixture"
                      ? "Development fixture"
                      : undefined,
                  tone: activeProject?.accentTone ?? activeApp?.tone ?? "blue",
                }
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
            label: personalityRegistry.statusMessages[0],
            detail: personalityRegistry.conditionMessages[0],
          }}
          menuTargetId={pocket.menuTarget?.id}
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
          previewingLock={pocket.previewingLock}
          reducedMotion={effectiveAccessibility.reducedMotion}
          startupPlayed={pocket.startupPlayed}
          unlocked={pocket.unlocked}
            wallpaperUrl={
              activeTheme?.pocketWallpaper ??
              "/images/wallpapers/dusk-pocket.webp"
            }
          >
            {hydrated && activeShell === "pocket" ? (
              <ShellPresentationProvider shell="pocket">
                {routeContent}
              </ShellPresentationProvider>
            ) : null}
          </PocketShell>
        ) : null}
      </div>

      <div className={styles.normalPanel} {...panelProps("normal")}>
        {!hydrated || activeShell === "normal" ? (
          <SemanticShell
            osViewHref={osViewHref}
            pathname={pathname}
            preserveNormalQuery={searchParams.get("view") === "normal"}
            routeFallback={resolution.routeFallback}
          >
            {!hydrated || activeShell === "normal" ? (
              <ShellPresentationProvider shell="normal">
                {routeContent}
              </ShellPresentationProvider>
            ) : null}
          </SemanticShell>
        ) : null}
      </div>
        </div>
        </SettingsProvider>
      </LocalNotesProvider>
    </DiscoveryServiceProvider>
  );
}
