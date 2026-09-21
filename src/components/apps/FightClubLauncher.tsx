"use client";
import {
  ArrowSquareOut,
  ArrowClockwise,
  GameController,
  Trophy,
  Play,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  useDiscoveryService,
  useDiscoveryState,
} from "@/components/os/DiscoveryServiceContext";
import {
  recordFightClubFullscreen,
  recordFightClubLaunch,
  recordFightClubReturnToOs,
} from "@/lib";
import {
  achievementRegistry,
  fightClubRegistry,
  personalityRegistry,
} from "@/registry";
import { GameExit, useGamePresentation } from "./games/GameHost";
import styles from "./FightClubLauncher.module.css";

type Panel = "overview" | "controls" | "about";
export function FightClubLauncher() {
  const game = fightClubRegistry[0];
  const service = useDiscoveryService();
  const discovery = useDiscoveryState();
  const { enterFullscreen } = useGamePresentation();
  const [panel, setPanel] = useState<Panel>("overview");
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("");
  const playButton = useRef<HTMLButtonElement>(null);
  const earned = new Set(discovery?.fightClubAchievementIds ?? []);
  const achievements = achievementRegistry.filter((a) =>
    (game.achievementIds as readonly string[]).includes(a.id),
  );
  useEffect(() => {
    if (!playing || status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("error"), 20000);
    return () => window.clearTimeout(timer);
  }, [playing, status, attempt]);
  const fullscreen = async () => {
    if (await enterFullscreen()) recordFightClubFullscreen(service);
  };
  const play = () => {
    void fullscreen();
    recordFightClubLaunch(service);
    setStatus("loading");
    setPlaying(true);
  };
  const back = () => {
    setPlaying(false);
    recordFightClubReturnToOs(service);
    requestAnimationFrame(() => playButton.current?.focus());
  };
  const retry = () => {
    setStatus("loading");
    setAttempt((a) => a + 1);
  };
  return (
    <section
      className={styles.game}
      data-route-content
      data-game="fightclub"
      aria-label={playing ? "FightClub hosted player" : "FightClub launcher"}
      data-fightclub-player={playing || undefined}
    >
      <header className={styles.toolbar}>
        <GameExit
          onExit={() => {
            if (playing) recordFightClubReturnToOs(service);
          }}
        />
        <span>FightClub</span>
        <div>
          {playing ? (
            <>
              <button onClick={() => void fullscreen()}>Full Screen</button>
              <button onClick={back}>Back to menu</button>
            </>
          ) : (
            <GameController size={24} weight="duotone" />
          )}
        </div>
      </header>
      {playing ? (
        <div className={styles.player}>
          <div className={styles.frameBoundary}>
            <iframe
              key={attempt}
              allow="autoplay; fullscreen; gamepad; clipboard-write"
              allowFullScreen
              onError={() => setStatus("error")}
              onLoad={() => setStatus("loaded")}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox"
              src={game.hostedBuild.embedUrl}
              title="Citryn Fight Club hosted game"
            />
            {status !== "loaded" ? (
              <div className={styles.loading} role="status">
                <GameController size={48} weight="duotone" />
                <h2>
                  {status === "loading"
                    ? "Stepping into the ring…"
                    : "The ring is taking a while."}
                </h2>
                <p>
                  {status === "loading"
                    ? "Loading the hosted build from Higgsfield…"
                    : "Retry the connection or open the hosted build directly."}
                </p>
                {status === "error" ? (
                  <button className={styles.primary} onClick={retry}>
                    <ArrowClockwise size={20} /> Retry
                  </button>
                ) : (
                  <div className={styles.loadingBar} />
                )}
              </div>
            ) : null}
          </div>
          <footer className={styles.playerFooter}>
            <span role="status">
              {status === "loaded"
                ? "Hosted build loaded."
                : "Connecting to the hosted build"}
            </span>
            <a
              href={game.hostedBuild.launchUrl}
              onClick={() => recordFightClubLaunch(service)}
              target="_blank"
              rel="noreferrer"
            >
              Open hosted build <ArrowSquareOut size={16} />
            </a>
          </footer>
        </div>
      ) : (
        <div className={styles.titleScreen}>
          <div className={styles.art}>
            <Image
              src={game.artwork.src}
              alt={game.artwork.alt}
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className={styles.titleContent}>
            <p className={styles.eyebrow}>
              WESTCOSE AMUSEMENTS · HOSTED ARCADE
            </p>
            <h1 tabIndex={-1}>
              FightClub<span>Pick a fight.</span>
            </h1>
            <nav className={styles.tabs} aria-label="FightClub information">
              {(["overview", "controls", "about"] as const).map((id) => (
                <button
                  key={id}
                  aria-pressed={panel === id}
                  onClick={() => setPanel(id)}
                >
                  {id === "overview"
                    ? "Game"
                    : id === "controls"
                      ? "Controls"
                      : "About"}
                </button>
              ))}
            </nav>
            <div className={styles.copy}>
              {panel === "overview" ? (
                <p>
                  A few rounds. A few questionable choices.
                  <br />
                  Enter the remotely hosted arcade fighter.
                </p>
              ) : panel === "controls" ? (
                <dl>
                  <dt>Player 1</dt>
                  <dd>{game.controls.desktopPlayerOne}</dd>
                  <dt>Player 2</dt>
                  <dd>{game.controls.desktopPlayerTwo}</dd>
                  <dt>Mobile</dt>
                  <dd>{game.controls.pocket}</dd>
                </dl>
              ) : (
                <>
                  <p>Citryn Fight Club · {game.hostedBuild.provider}</p>
                  <p>{game.modes.join(" · ")}</p>
                  <button
                    className={styles.textButton}
                    onClick={() => {
                      setMessage(
                        personalityRegistry.discoveries.fightclubUninstall,
                      );
                      service?.recordDiscovery("fightclub.uninstall-attempt");
                    }}
                  >
                    Uninstall
                  </button>
                </>
              )}
            </div>
            <button ref={playButton} className={styles.primary} onClick={play}>
              <Play size={21} weight="fill" /> Start game
            </button>
            <p className={styles.note}>Loads the hosted game when you start.</p>
            <details className={styles.achievements}>
              <summary>
                <Trophy size={18} /> Achievements{" "}
                <span>
                  {achievements.filter((a) => earned.has(a.id)).length} /{" "}
                  {achievements.length}
                </span>
              </summary>
              <ul>
                {achievements.map((a) => (
                  <li key={a.id} data-earned={earned.has(a.id)}>
                    <b>{earned.has(a.id) ? a.title : "Locked"}</b>
                    <small>
                      {earned.has(a.id)
                        ? a.description
                        : "Keep exploring the launcher."}
                    </small>
                  </li>
                ))}
              </ul>
            </details>
            <p role="status" className={styles.note}>
              {message}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
