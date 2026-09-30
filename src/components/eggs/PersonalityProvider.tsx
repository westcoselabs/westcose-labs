"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useDiscoveryService } from "@/components/os/DiscoveryServiceContext";
import { useSettings } from "@/components/os/SettingsContext";
import {
  chooseOutbreakAlerts,
  FINAL_FILES,
  FINAL_MARKERS,
  finalRevision,
  MEETING_LINES,
  terminalSecretResponse,
  type EggPanelKind,
} from "@/lib/personality-eggs";
import { PersonalityHost } from "./PersonalityHost";

export type Outbreak = {
  id: number;
  phase: "active" | "escaping" | "restored";
  origin: { x: number; y: number };
  alerts: number[];
  shown: number;
  dismissed: number[];
  cleanupReady: boolean;
};
export type EggPanelState = { id: number; kind: EggPanelKind; step: number };
type PersonalityContextValue = {
  outbreak: Outbreak | null;
  panel: EggPanelState | null;
  toast: string;
  reducedMotion: boolean;
  startOutbreak: (origin: { x: number; y: number }) => void;
  contain: () => void;
  dismissAlert: (id: number) => void;
  dismissToast: () => void;
  closePanel: () => void;
  restoreFile: (id: string) => string;
  runSecret: (command: string) => string | null;
};
const PersonalityContext = createContext<PersonalityContextValue | null>(null);
export const usePersonality = () => useContext(PersonalityContext);

function focusShellFallback(preferQuarantine = false) {
  const shellRoot = document.querySelector<HTMLElement>(
    "[data-shell-panel]:not([hidden])",
  );
  const target =
    (preferQuarantine
      ? shellRoot?.querySelector<HTMLElement>("[data-quarantine-trigger]")
      : null) ??
    shellRoot?.querySelector<HTMLElement>("[data-route-content] h1[tabindex]") ??
    shellRoot?.querySelector<HTMLElement>("main[tabindex]") ??
    shellRoot?.querySelector<HTMLElement>("button:not([disabled])");
  target?.focus({ preventScroll: true });
}

export function PersonalityProvider({
  children,
  shell,
  suspended = false,
}: {
  children: ReactNode;
  shell: "desktop" | "pocket" | "normal";
  suspended?: boolean;
}) {
  const discovery = useDiscoveryService();
  const settings = useSettings();
  const router = useRouter();
  const reducedMotion = settings?.effectiveAccessibility.reducedMotion ?? false;
  const [outbreak, setOutbreak] = useState<Outbreak | null>(null);
  const [panel, setPanel] = useState<EggPanelState | null>(null);
  const [toast, setToast] = useState("");
  const active = useRef(false);
  const sequence = useRef(0);
  const quarantineAttempts = useRef(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const restoreOutbreakFocus = useRef(false);

  const notify = useCallback((message: string) => setToast(message), []);
  const startOutbreak = useCallback(
    (origin: { x: number; y: number }) => {
      if (active.current) return;
      active.current = true;
      setToast("");
      setOutbreak({
        id: ++sequence.current,
        phase: "active",
        origin,
        alerts: chooseOutbreakAlerts(),
        shown: 0,
        dismissed: [],
        cleanupReady: false,
      });
      discovery?.recordDiscovery("egg.quarantine-outbreak");
    },
    [discovery],
  );

  const contain = useCallback(() => {
    restoreOutbreakFocus.current = Boolean(
      document.activeElement?.closest("[data-outbreak-control], #quarantine"),
    );
    setOutbreak((current) =>
      current?.phase === "active"
        ? { ...current, phase: "escaping", shown: 0 }
        : current,
    );
  }, []);
  const dismissAlert = useCallback(
    (id: number) =>
      setOutbreak((current) =>
        current
          ? { ...current, dismissed: [...new Set([...current.dismissed, id])] }
          : current,
      ),
    [],
  );
  const dismissToast = useCallback(() => setToast(""), []);

  const closePanel = useCallback(() => {
    if (panel?.kind === "weekend")
      notify("Process minimized to your subconscious.");
    setPanel(null);
    const target = returnFocus.current;
    if (target?.isConnected && !target.closest("[hidden], [inert]")) target.focus();
    else focusShellFallback();
  }, [notify, panel?.kind]);
  const openPanel = useCallback(
    (kind: EggPanelKind) => {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPanel({ id: ++sequence.current, kind, step: 0 });
      discovery?.recordDiscovery(
        kind === "weekend"
          ? "egg.weekend-process"
          : kind === "meeting"
            ? "egg.readme-meeting"
            : "egg.fake-update",
      );
    },
    [discovery],
  );

  const restoreFile = useCallback(
    (id: string) => {
      let message = "Restored. The idea remains questionable.";
      if (id === "final-final") {
        const stage = finalRevision(
          discovery?.getState().recycleRestorationIds,
        );
        discovery?.recordDiscovery("egg.final-final");
        if (stage < FINAL_MARKERS.length) {
          discovery?.recordRecycleRestoration(FINAL_MARKERS[stage]);
          message =
            stage === 0
              ? "Restored. One tiny revision came in."
              : stage === 1
                ? "Restored. They only changed the entire brief."
                : "Restored. Use this one. Apparently.";
        } else message = "Version control has requested medical leave.";
        notify(message);
      } else if (id === "weekend-project") {
        openPanel("weekend");
        message = "Restored. Still basically done.";
      } else if (id === "readme-meeting") {
        openPanel("meeting");
        message = "Joining a quick sync. Allegedly.";
      }
      discovery?.recordRecycleRestoration(id);
      discovery?.incrementCounter("recycleRestorations");
      discovery?.recordDiscovery("recycle.first-restoration");
      return message;
    },
    [discovery, notify, openPanel],
  );

  const runSecret = useCallback(
    (command: string) => {
      if (command === "open quarantine") {
        quarantineAttempts.current++;
        if (quarantineAttempts.current === 1) return "absolutely not";
        if (quarantineAttempts.current === 2) return "seriously.";
        router.push("/recycle#quarantine");
        return "Fine. Recycle → Quarantine → quarantine.zip.\nThe label was the risk assessment.";
      }
      if (command === "sudo update") {
        openPanel("update");
        return "Installing one small change…\nEstimated time: don't start anything.";
      }
      return terminalSecretResponse(
        command,
        active.current,
        discovery?.hasDiscovery("egg.quarantine-outbreak") ?? false,
      );
    },
    [discovery, openPanel, router],
  );

  const phase = outbreak?.phase;
  const outbreakId = outbreak?.id;
  const alertCount = outbreak?.alerts.length ?? 0;
  useEffect(() => {
    if (suspended || phase !== "active") return;
    const timers = Array.from({ length: alertCount }, (_, i) =>
      window.setTimeout(
        () => {
          setOutbreak((current) =>
            current?.phase === "active"
              ? { ...current, shown: Math.max(current.shown, i + 1) }
              : current,
          );
        },
        2200 + i * 2300,
      ),
    );
    timers.push(
      window.setTimeout(
        () =>
          setOutbreak((current) =>
            current ? { ...current, cleanupReady: true } : current,
          ),
        25_000,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [phase, outbreakId, alertCount, suspended]);

  useEffect(() => {
    if (phase !== "escaping") return;
    const timer = window.setTimeout(
      () => {
        active.current = false;
        setOutbreak((current) =>
          current
            ? { ...current, phase: "restored", alerts: [], dismissed: [] }
            : current,
        );
        notify("Quarantine restored.");
      },
      reducedMotion ? 0 : 1500,
    );
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion, notify]);

  useEffect(() => {
    if (phase !== "restored") return;
    // The cleanup action disappears. Return keyboard users to the archive (or
    // the current shell) without stealing focus if they navigated during escape.
    if (restoreOutbreakFocus.current && document.activeElement === document.body) {
      focusShellFallback(true);
    }
    restoreOutbreakFocus.current = false;
    const timer = window.setTimeout(
      () => notify("Quarantine restored.\nProbably."),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [phase, notify]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 6500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!panel || suspended) return;
    if (panel.kind === "meeting" && panel.step >= MEETING_LINES.length - 1)
      return;
    if (panel.kind === "update" && panel.step >= 9) return;
    const timer = window.setTimeout(
      () =>
        setPanel((current) =>
          current?.id === panel.id
            ? {
                ...current,
                step:
                  current.kind === "weekend"
                    ? (current.step + 1) % 5
                    : current.step + 1,
              }
            : current,
        ),
      panel.kind === "weekend" ? 2900 : 1450,
    );
    return () => window.clearTimeout(timer);
  }, [panel, suspended]);

  return (
    <PersonalityContext.Provider
      value={{
        outbreak,
        panel,
        toast,
        reducedMotion,
        startOutbreak,
        contain,
        dismissAlert,
        dismissToast,
        closePanel,
        restoreFile,
        runSecret,
      }}
    >
      {children}
      {!suspended && <PersonalityHost shell={shell} />}
    </PersonalityContext.Provider>
  );
}

export { FINAL_FILES, finalRevision };
