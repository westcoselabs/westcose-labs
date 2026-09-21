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
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CornersOut } from "@phosphor-icons/react";
import styles from "./GameHost.module.css";

type GamePresentation = {
  enterFullscreen: () => Promise<boolean>;
  exit: () => void;
  fullscreen: boolean;
};
const GameContext = createContext<GamePresentation>({
  enterFullscreen: async () => false,
  exit: () => undefined,
  fullscreen: false,
});
export const useGamePresentation = () => useContext(GameContext);

/** This node stays outside responsive shell branches, so rotation never remounts a game. */
export function GameHost({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useSearchParams();
  const [fullscreen, setFullscreen] = useState(false);
  const exit = useCallback(() => {
    if (
      document.fullscreenElement &&
      root.current?.contains(document.fullscreenElement)
    )
      void document.exitFullscreen().catch(() => undefined);
    router.push(
      params.get("view") === "normal" ? "/games?view=normal" : "/games",
    );
  }, [params, router]);
  const enterFullscreen = useCallback(async () => {
    const node = root.current;
    if (!node?.requestFullscreen) return false;
    if (document.fullscreenElement === node) return true;
    try {
      await node.requestFullscreen({ navigationUI: "hide" });
      return true;
    } catch {
      return false;
    }
  }, []);
  useEffect(() => {
    const node = root.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const change = () => setFullscreen(document.fullscreenElement === node);
    document.addEventListener("fullscreenchange", change);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("fullscreenchange", change);
      if (
        node &&
        document.fullscreenElement &&
        node.contains(document.fullscreenElement)
      )
        void document.exitFullscreen().catch(() => undefined);
    };
  }, []);
  return (
    <GameContext.Provider value={{ enterFullscreen, exit, fullscreen }}>
      <div ref={root} className={styles.host} data-game-host>
        {children}
      </div>
    </GameContext.Provider>
  );
}

export function GameExit({ onExit }: { onExit?: () => void }) {
  const { exit } = useGamePresentation();
  return (
    <button
      type="button"
      aria-label="Exit to Games"
      onClick={() => {
        onExit?.();
        exit();
      }}
    >
      <ArrowLeft size={19} aria-hidden="true" />
      <span>Games</span>
    </button>
  );
}
export function GameFullscreen() {
  const { enterFullscreen, fullscreen } = useGamePresentation();
  return (
    <button
      type="button"
      aria-label="Full screen"
      disabled={fullscreen}
      onClick={() => void enterFullscreen()}
    >
      <CornersOut size={20} aria-hidden="true" />
    </button>
  );
}

export function useFullscreenPause(pause: () => void) {
  const handler = useRef(pause);
  useEffect(() => {
    handler.current = pause;
  });
  useEffect(() => {
    let wasFullscreen = Boolean(document.fullscreenElement);
    const change = () => {
      const now = Boolean(document.fullscreenElement);
      if (wasFullscreen && !now) handler.current();
      wasFullscreen = now;
    };
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);
}
