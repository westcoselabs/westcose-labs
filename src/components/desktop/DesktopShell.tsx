"use client";

import {
  CaretUp,
  MagnifyingGlass,
  SpeakerHigh,
  SpeakerSlash,
  SquaresFour,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { AppGlyph } from "@/components/icons/AppGlyph";
import { Button, ButtonLink, IconButton } from "@/components/ui";
import {
  centerRectInWorkspace,
  createWorkspaceBounds,
  type WorkspaceBounds,
} from "@/lib";
import {
  appRegistry,
  desktopPlacement,
  getAppById,
  startMenuPlacement,
  type AppId,
  type OSApp,
} from "@/registry";
import {
  createInitialDesktopState,
  desktopReducer,
  ROUTE_WINDOW_ID,
  type DesktopUtilityId,
  type DesktopWindow as DesktopWindowModel,
} from "@/state";

import { DesktopWindow } from "./DesktopWindow";
import styles from "./DesktopShell.module.css";
import { TerminalUtility } from "./TerminalUtility";

type DesktopShellProps = {
  children?: ReactNode;
  normalViewHref: string;
  onReadmeShown: () => void;
  onSoundToggle: () => void;
  pathname: string;
  routeTitle: string;
  settingsPanel: ReactNode;
  showInitialReadme: boolean;
  soundEnabled: boolean;
};

const initialWorkspace: WorkspaceBounds = { x: 24, y: 24, width: 0, height: 0 };

function useDesktopClock() {
  const [clock, setClock] = useState({ date: "SYSTEM DATE", time: "--:--" });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        date: new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(now),
        time: new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(now),
      });
    };
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return clock;
}

export function DesktopShell({
  children,
  normalViewHref,
  onReadmeShown,
  onSoundToggle,
  pathname,
  routeTitle,
  settingsPanel,
  showInitialReadme,
  soundEnabled,
}: DesktopShellProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    desktopReducer,
    undefined,
    createInitialDesktopState,
  );
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [selectedAppId, setSelectedAppId] = useState<AppId | null>(null);
  const [search, setSearch] = useState("");
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const launchFocusRef = useRef(new Map<string, HTMLElement>());
  const clock = useDesktopClock();

  const rememberLaunchFocus = useCallback((windowId: string) => {
    if (document.activeElement instanceof HTMLElement) {
      launchFocusRef.current.set(windowId, document.activeElement);
    }
  }, []);

  const routeRect = useCallback(
    () =>
      centerRectInWorkspace(
        {
          width: Math.min(940, workspace.width * 0.8),
          height: Math.min(720, workspace.height * 0.86),
        },
        workspace,
      ),
    [workspace],
  );

  const utilityRect = useCallback(
    (utility: DesktopUtilityId) => {
      const dimensions =
        utility === "terminal"
          ? { width: Math.min(640, workspace.width * 0.62), height: 420 }
          : utility === "settings"
            ? { width: Math.min(680, workspace.width * 0.68), height: 560 }
            : { width: Math.min(460, workspace.width * 0.5), height: 340 };
      return centerRectInWorkspace(dimensions, workspace);
    },
    [workspace],
  );

  const openUtility = useCallback(
    (utility: DesktopUtilityId) => {
      const titles = {
        readme: "README.txt",
        settings: "Settings",
        terminal: "Terminal",
      } as const;
      rememberLaunchFocus(`utility-${utility}`);
      dispatch({
        type: "utility/open",
        utility,
        title: titles[utility],
        rect: utilityRect(utility),
      });
    },
    [rememberLaunchFocus, utilityRect],
  );

  const launchApp = useCallback(
    (app: OSApp) => {
      if (app.id === "terminal" || app.id === "settings") {
        openUtility(app.id);
        return;
      }

      if (app.target.kind === "route") {
        rememberLaunchFocus(ROUTE_WINDOW_ID);
        router.push(app.target.href);
        return;
      }

      if (app.target.kind === "external") {
        window.open(app.target.href, "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = app.target.href;
    },
    [openUtility, rememberLaunchFocus, router],
  );

  useEffect(() => {
    const recover = () => {
      const nextWorkspace = createWorkspaceBounds(
        window.innerWidth,
        window.innerHeight,
      );
      setWorkspace(nextWorkspace);
      dispatch({ type: "viewport/recover", workspace: nextWorkspace });
    };
    recover();
    window.addEventListener("resize", recover);
    return () => window.removeEventListener("resize", recover);
  }, []);

  const routeWindowStatus = state.windows.find(
    (desktopWindow) => desktopWindow.kind === "route",
  )?.status;

  useEffect(() => {
    if (workspace.width === 0 || pathname === "/") return;

    dispatch({
      type: "route/open",
      route: pathname,
      title: routeTitle,
      rect: routeRect(),
    });
  }, [
    pathname,
    routeRect,
    routeTitle,
    workspace.width,
  ]);

  useEffect(() => {
    if (
      workspace.width === 0 ||
      pathname !== "/" ||
      !routeWindowStatus ||
      routeWindowStatus === "minimized"
    ) {
      return;
    }
    dispatch({ type: "window/close", id: ROUTE_WINDOW_ID });
  }, [pathname, routeWindowStatus, workspace.width]);

  useEffect(() => {
    if (!showInitialReadme || workspace.width === 0) return;
    openUtility("readme");
    onReadmeShown();
  }, [onReadmeShown, openUtility, showInitialReadme, workspace.width]);

  useEffect(() => {
    if (!state.menu) return;
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dispatch({ type: "menu/close" });
      if (state.menu?.kind === "start") startButtonRef.current?.focus();
      else desktopRef.current?.focus();
    };
    window.addEventListener("keydown", closeMenus);
    return () => window.removeEventListener("keydown", closeMenus);
  }, [state.menu]);

  const startApps = useMemo(
    () =>
      startMenuPlacement
        .map((id) => getAppById(id))
        .filter((app) =>
          `${app.name} ${app.description}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
    [search],
  );
  const selectedApp = selectedAppId ? getAppById(selectedAppId) : null;
  const closeWindow = (desktopWindow: DesktopWindowModel) => {
    const returnTarget = launchFocusRef.current.get(desktopWindow.id);
    dispatch({ type: "window/close", id: desktopWindow.id });
    if (desktopWindow.kind === "route") router.push("/");
    window.requestAnimationFrame(() => {
      if (returnTarget?.isConnected) returnTarget.focus();
      else startButtonRef.current?.focus();
    });
  };

  const minimizeWindow = (desktopWindow: DesktopWindowModel) => {
    dispatch({ type: "window/minimize", id: desktopWindow.id });
    if (desktopWindow.kind === "route") router.push("/");
  };

  const restoreWindow = (desktopWindow: DesktopWindowModel) => {
    if (desktopWindow.kind === "route") {
      router.push(desktopWindow.route);
    }
    dispatch({ type: "window/restore", id: desktopWindow.id });
  };

  const utilityContent = (desktopWindow: DesktopWindowModel) => {
    if (desktopWindow.kind === "route") return children;
    if (desktopWindow.utility === "terminal") return <TerminalUtility />;
    if (desktopWindow.utility === "settings") return settingsPanel;
    return (
      <div className={styles.readme}>
        <p className={styles.readmeEyebrow}>WELCOME / DUSK BUILD</p>
        <h2>WestCose Labs OS</h2>
        <p>
          Double-click an icon or select one and use Open. Every app is also a
          real browser route, and Normal View is always available.
        </p>
        <div className={styles.readmeActions}>
          <Button onClick={() => router.push("/projects")} tone="primary">
            Open Projects
          </Button>
          <Button onClick={() => router.push("/notes")}>Read full README</Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.desktop}
      onContextMenu={(event) => {
        if ((event.target as Element).closest("[data-desktop-window]")) return;
        event.preventDefault();
        dispatch({
          type: "menu/open",
          menu: {
            kind: "desktop-context",
            triggerId: "desktop",
            x: event.clientX,
            y: event.clientY,
          },
        });
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          dispatch({ type: "menu/close" });
          setSelectedAppId(null);
        }
      }}
      ref={desktopRef}
      tabIndex={-1}
    >
      <div aria-hidden="true" className={styles.wallpaperShade} />

      <section aria-label="Desktop shortcuts" className={styles.iconGrid}>
        {desktopPlacement.map((appId) => {
          const app = getAppById(appId);
          const selected = selectedAppId === app.id;
          return (
            <button
              aria-label={`${app.accessibilityLabel}. ${selected ? "Selected." : ""}`}
              aria-pressed={selected}
              className={styles.desktopIcon}
              data-selected={selected || undefined}
              key={app.id}
              onClick={() => setSelectedAppId(app.id)}
              onDoubleClick={() => launchApp(app)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  launchApp(app);
                }
                if (event.key === "F10" && event.shiftKey) {
                  event.preventDefault();
                  setSelectedAppId(app.id);
                  const rect = event.currentTarget.getBoundingClientRect();
                  dispatch({
                    type: "menu/open",
                    menu: {
                      kind: "desktop-context",
                      triggerId: app.id,
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    },
                  });
                }
              }}
              type="button"
            >
              <span className={styles.iconWell}>
                <AppGlyph iconKey={app.iconKey} size={34} variant="desktop" />
              </span>
              <span>{app.desktopLabel}</span>
            </button>
          );
        })}
      </section>

      {selectedApp ? (
        <div className={styles.selectionBar}>
          <div role="status">
            <span>Selected</span>
            <strong>{selectedApp.desktopLabel}</strong>
          </div>
          <Button onClick={() => launchApp(selectedApp)} tone="primary">
            Open
          </Button>
        </div>
      ) : null}

      <aside aria-label="Clock and date" className={styles.clockWidget}>
        <span className={styles.clockLabel}>LOCAL SYSTEM</span>
        <strong>{clock.time}</strong>
        <span>{clock.date}</span>
      </aside>

      <main aria-label="Desktop workspace" className={styles.windowLayer}>
        {pathname === "/" ? (
          <h1 className="sr-only">WestCose Labs OS Desktop</h1>
        ) : null}
        {state.windows.map((desktopWindow) => (
          <div data-desktop-window key={desktopWindow.id}>
            <DesktopWindow
              active={desktopWindow.id === state.activeWindowId}
              dispatch={dispatch}
              onClose={() => closeWindow(desktopWindow)}
              onMinimize={() => minimizeWindow(desktopWindow)}
              window={desktopWindow}
              workspace={workspace}
            >
              {utilityContent(desktopWindow)}
            </DesktopWindow>
          </div>
        ))}
      </main>

      {state.menu?.kind === "start" ? (
        <section aria-label="Start menu" className={styles.startMenu}>
          <header>
            <p>WestCose Labs</p>
            <span>DUSK / V1</span>
          </header>
          <label className={styles.search}>
            <MagnifyingGlass aria-hidden="true" />
            <span className="sr-only">Search applications</span>
            <input
              autoFocus
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search apps"
              type="search"
              value={search}
            />
          </label>
          <div className={styles.startResults}>
            {startApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  launchApp(app);
                  dispatch({ type: "menu/close" });
                }}
                type="button"
              >
                <AppGlyph iconKey={app.iconKey} size={24} />
                <span>
                  <strong>{app.name}</strong>
                  <small>{app.description}</small>
                </span>
              </button>
            ))}
          </div>
          <footer>
            <ButtonLink href={normalViewHref}>Normal View</ButtonLink>
            <Button onClick={() => openUtility("settings")}>Settings</Button>
          </footer>
        </section>
      ) : null}

      {state.menu?.kind === "desktop-context" ? (
        <div
          className={styles.contextMenu}
          role="menu"
          style={
            {
              "--context-x": `${Math.min(state.menu.x, window.innerWidth - 220)}px`,
              "--context-y": `${Math.min(state.menu.y, window.innerHeight - 220)}px`,
            } as CSSProperties
          }
        >
          <button autoFocus onClick={() => router.push("/projects")} role="menuitem" type="button">
            Open Projects
          </button>
          <button onClick={() => openUtility("settings")} role="menuitem" type="button">
            Open Settings
          </button>
          <a href={normalViewHref} role="menuitem">
            Switch to Normal View
          </a>
          <button onClick={() => router.refresh()} role="menuitem" type="button">
            Refresh route
          </button>
        </div>
      ) : null}

      <nav aria-label="Desktop taskbar" className={styles.taskbar}>
        <button
          aria-expanded={state.menu?.kind === "start"}
          className={styles.startButton}
          onClick={() =>
            dispatch(
              state.menu?.kind === "start"
                ? { type: "menu/close" }
                : {
                    type: "menu/open",
                    menu: { kind: "start", triggerId: "start-button" },
                  },
            )
          }
          ref={startButtonRef}
          type="button"
        >
          <SquaresFour aria-hidden="true" weight="fill" />
          <span>Start</span>
        </button>
        <div className={styles.pinnedApps}>
          {appRegistry.slice(0, 4).map((app) => (
            <IconButton
              key={app.id}
              label={`Open ${app.name}`}
              onClick={() => launchApp(app)}
            >
              <AppGlyph iconKey={app.iconKey} size={22} />
            </IconButton>
          ))}
          {state.windows.map((desktopWindow) => (
            <button
              aria-current={desktopWindow.id === state.activeWindowId ? "true" : undefined}
              className={styles.runningApp}
              key={desktopWindow.id}
              onClick={() =>
                desktopWindow.status === "minimized"
                  ? restoreWindow(desktopWindow)
                  : dispatch({ type: "window/focus", id: desktopWindow.id })
              }
              type="button"
            >
              <span>{desktopWindow.title}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className={styles.systemTray}>
          <IconButton
            label={soundEnabled ? "Turn sound off" : "Turn sound on"}
            onClick={onSoundToggle}
          >
            {soundEnabled ? (
              <SpeakerHigh aria-hidden="true" />
            ) : (
              <SpeakerSlash aria-hidden="true" />
            )}
          </IconButton>
          <ButtonLink className={styles.normalButton} href={normalViewHref}>
            Normal
          </ButtonLink>
          <div className={styles.trayClock}>
            <span>{clock.time}</span>
            <small>{clock.date}</small>
          </div>
          <CaretUp aria-hidden="true" />
        </div>
      </nav>
    </div>
  );
}
