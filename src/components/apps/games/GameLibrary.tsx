"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Play,
  GameController,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { gamePresentations } from "./catalog";
import { useShellPresentation } from "@/components/os/ShellPresentationContext";
import styles from "./GameLibrary.module.css";

export function GameLibrary() {
  const shell = useShellPresentation();
  return (
    <section className={styles.library} data-route-content data-game-library>
      <header className={styles.header}>
        <div>
          <p>WESTCOSE AMUSEMENTS</p>
          <h1 tabIndex={-1}>
            Games<span>03</span>
          </h1>
        </div>
        <GameController size={32} weight="duotone" aria-hidden="true" />
      </header>
      <p className={styles.intro}>Small games. Questionable decisions.</p>
      <div className={styles.grid}>
        {gamePresentations.map((game) => (
          <Link
            prefetch={false}
            href={`${game.href}${shell === "normal" ? "?view=normal" : ""}`}
            key={game.id}
            className={styles.tile}
            data-color={game.color}
            aria-label={`Play ${game.title}`}
          >
            <div className={styles.art}>
              <Image
                src={game.cover}
                alt={game.alt}
                fill
                sizes="(max-width: 600px) 120px, 300px"
              />
              <span className={styles.playIcon}>
                <Play size={20} weight="fill" aria-hidden="true" />
              </span>
            </div>
            <div className={styles.copy}>
              <h2>{game.title}</h2>
              <p>{game.genre}</p>
              <span className={styles.play}>
                Play <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <footer className={styles.footer}>
        <span>Made to be played.</span>
        <span>No quarters required.</span>
      </footer>
    </section>
  );
}
