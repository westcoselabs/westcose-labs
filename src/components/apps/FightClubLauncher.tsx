"use client";

import {
  ArrowSquareOut,
  CornersOut,
  DoorOpen,
  GameController,
  Trophy,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui";
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

import styles from "./InteractiveApps.module.css";

type LauncherPanel = "overview" | "controls" | "about";

export function FightClubLauncher() {
  const game = fightClubRegistry[0];
  const discoveryService = useDiscoveryService();
  const discoveryState = useDiscoveryState();
  const playerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const [activePanel, setActivePanel] = useState<LauncherPanel>("overview");
  const [frameStatus, setFrameStatus] = useState("");
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);

  const earnedAchievementIds = new Set(
    discoveryState?.fightClubAchievementIds ?? [],
  );
  const achievements = achievementRegistry.filter((achievement) =>
    game.achievementIds.includes(achievement.id),
  );
  const earnedAchievementCount = achievements.filter((achievement) =>
    earnedAchievementIds.has(achievement.id),
  ).length;

  const recordLaunch = () => {
    const count = recordFightClubLaunch(discoveryService);
    setMessage(
      count > 0
        ? `Hosted launch ${count} recorded by WestCose Labs OS.`
        : "Opening the hosted build.",
    );
  };

  const play = () => {
    recordLaunch();
    setFrameStatus("Loading the hosted build from Higgsfield…");
    setPlaying(true);
  };

  const exitPlayer = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
    setPlaying(false);
    setFrameStatus("");
    setMessage("Returned to the local FightClub launcher.");
    recordFightClubReturnToOs(discoveryService);
    window.setTimeout(() => playButtonRef.current?.focus(), 0);
  };

  const enterFullScreen = async () => {
    if (!playerRef.current?.requestFullscreen) {
      setFrameStatus("Full screen is not available in this browser.");
      return;
    }

    try {
      await playerRef.current.requestFullscreen();
      recordFightClubFullscreen(discoveryService);
      setFrameStatus("Full screen entered. Use Exit to return to the launcher.");
    } catch {
      setFrameStatus("The browser declined full screen. The game remains playable here.");
    }
  };

  if (playing) {
    return (
      <section
        aria-label="FightClub hosted player"
        className={styles.playerShell}
        data-fightclub-player
      >
        <div className={styles.player} ref={playerRef}>
          <header className={styles.playerToolbar}>
            <span>
              <GameController aria-hidden="true" weight="fill" />
              <strong>FightClub</strong>
              <small>{game.hostedBuild.provider} hosted build</small>
            </span>
            <div role="toolbar" aria-label="FightClub player controls">
              <Button aria-label="Full Screen" onClick={enterFullScreen} tone="secondary">
                <CornersOut aria-hidden="true" />
                <span>Full Screen</span>
              </Button>
              <Button onClick={exitPlayer} tone="danger">
                <DoorOpen aria-hidden="true" />
                Exit
              </Button>
            </div>
          </header>
          <div className={styles.frameBoundary}>
            <iframe
              allow="autoplay; fullscreen; gamepad; clipboard-write"
              allowFullScreen
              onError={() =>
                setFrameStatus(
                  "The embedded build did not load. Use Open hosted build instead.",
                )
              }
              onLoad={() => setFrameStatus("Hosted build loaded.")}
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox"
              src={game.hostedBuild.embedUrl}
              title="Citryn Fight Club hosted game"
            />
          </div>
          <footer className={styles.playerFallback}>
            <p aria-live="polite">{frameStatus}</p>
            <a
              href={game.hostedBuild.launchUrl}
              onClick={recordLaunch}
              rel="noreferrer"
              target="_blank"
            >
              Open hosted build
              <span className="sr-only"> in a new tab</span>
            </a>
          </footer>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="FightClub launcher" className={styles.launcher}>
      <div className={styles.launcherArt}>
        <Image
          alt={game.artwork.alt}
          fill
          priority
          sizes="(max-width: 44rem) 100vw, 55vw"
          src={game.artwork.src}
        />
        <span>Concept cover art</span>
      </div>
      <div className={styles.launcherPanel}>
        <p className="route-card__index">Remote build available</p>
        <div className={styles.launcherTabs} aria-label="FightClub information">
          {(["overview", "controls", "about"] as const).map((panel) => (
            <button
              aria-pressed={activePanel === panel}
              key={panel}
              onClick={() => setActivePanel(panel)}
              type="button"
            >
              {panel === "overview"
                ? "Launcher"
                : panel[0].toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>

        {activePanel === "overview" ? (
          <div className={styles.launcherCopy}>
            <h2>Hosted build ready</h2>
            <p>
              The game stays off the network until Play is selected. It then
              opens inside an OS-controlled frame with visible Full Screen and
              Exit controls.
            </p>
            <dl className={styles.buildDetails}>
              <div><dt>Host</dt><dd>{game.hostedBuild.provider}</dd></div>
              <div><dt>Build</dt><dd>{game.hostedBuild.buildLabel}</dd></div>
              <div><dt>Embed</dt><dd>Verified {game.hostedBuild.embedVerifiedAt}</dd></div>
              <div><dt>Messages</dt><dd>No remote contract</dd></div>
            </dl>
          </div>
        ) : null}

        {activePanel === "controls" ? (
          <div className={styles.launcherCopy}>
            <h2>Controls</h2>
            <dl className={styles.controlList}>
              <div><dt>Player 1</dt><dd>{game.controls.desktopPlayerOne}</dd></div>
              <div><dt>Player 2</dt><dd>{game.controls.desktopPlayerTwo}</dd></div>
              <div><dt>Pocket</dt><dd>{game.controls.pocket}</dd></div>
            </dl>
          </div>
        ) : null}

        {activePanel === "about" ? (
          <div className={styles.launcherCopy}>
            <h2>About</h2>
            <p>
              Citryn Fight Club is a remotely hosted arcade-style 2D fighter.
              The current build advertises four playable modes:
            </p>
            <ul>{game.modes.map((mode) => <li key={mode}>{mode}</li>)}</ul>
          </div>
        ) : null}

        <div className={styles.launcherActions}>
          <Button buttonRef={playButtonRef} onClick={play} tone="primary">
            <GameController aria-hidden="true" />
            Play
          </Button>
          <ButtonLink
            href={game.hostedBuild.launchUrl}
            onClick={recordLaunch}
            rel="noreferrer"
            target="_blank"
          >
            <ArrowSquareOut aria-hidden="true" />
            Open hosted build
            <span className="sr-only"> in a new tab</span>
          </ButtonLink>
          <Button
            onClick={() => {
              setMessage(personalityRegistry.discoveries.fightclubUninstall);
              discoveryService?.recordDiscovery(
                "fightclub.uninstall-attempt",
              );
            }}
            tone="danger"
          >
            Uninstall
          </Button>
        </div>

        <section className={styles.achievements} aria-labelledby="fightclub-achievements">
          <div>
            <Trophy aria-hidden="true" weight="fill" />
            <h3 id="fightclub-achievements">OS achievements</h3>
            <span>{earnedAchievementCount} / {achievements.length}</span>
          </div>
          <ul>
            {achievements.map((achievement) => {
              const earned = earnedAchievementIds.has(achievement.id);
              return (
                <li data-earned={earned} key={achievement.id}>
                  <strong>{earned ? achievement.title : "Locked"}</strong>
                  <small>{earned ? achievement.description : "Keep exploring the launcher."}</small>
                </li>
              );
            })}
          </ul>
        </section>

        <p aria-live="polite" className={styles.feedback}>{message}</p>
      </div>
    </section>
  );
}
