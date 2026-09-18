"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useDiscoveryService } from "@/components/os/DiscoveryServiceContext";
import { useAppearance } from "@/components/os/AppearanceContext";
import { getTerminalCommand } from "@/registry";

import styles from "./TerminalUtility.module.css";

const INTRO = [
  "WestCose Navigation Terminal v2",
  "Type help. This utility cannot execute system commands.",
] as const;

const ROUTE_COMMANDS = {
  about: "/about",
  contact: "/contact",
  experiments: "/experiments",
  games: "/games",
  github: "/github",
  projects: "/projects",
  services: "/services",
} as const;

const HELP = [
  "about | projects | games | experiments | services | contact | github",
  "open fightclub | theme | history | secret | clear",
].join("\n");

export function TerminalUtility() {
  const { theme } = useAppearance();
  const router = useRouter();
  const discoveryService = useDiscoveryService();
  const [history, setHistory] = useState<readonly string[]>([]);
  const [lines, setLines] = useState<readonly string[]>(INTRO);

  const runCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const command = String(data.get("command") ?? "").trim().toLowerCase();
    form.reset();

    if (!command) return;
    const nextHistory = [...history, command];
    const registeredCommand = getTerminalCommand(command);
    setHistory(nextHistory);
    discoveryService?.incrementCounter("terminalCommandsRun");
    if (registeredCommand) {
      discoveryService?.recordTerminalCommand(registeredCommand.id);
      if ("discoveryId" in registeredCommand) {
        discoveryService?.recordDiscovery(registeredCommand.discoveryId);
      }
    }

    if (command === "clear") {
      setLines([]);
      return;
    }

    const route = ROUTE_COMMANDS[command as keyof typeof ROUTE_COMMANDS];
    if (route) {
      setLines((current) => [...current, `> ${command}`, `Opening ${route}`]);
      router.push(route);
      return;
    }

    if (command === "open fightclub") {
      setLines((current) => [
        ...current,
        `> ${command}`,
        "Opening /games/fightclub without loading a game engine.",
      ]);
      router.push("/games/fightclub");
      return;
    }

    const response =
      command === "help"
        ? HELP
        : command === "history"
          ? nextHistory.map((entry, index) => `${index + 1}  ${entry}`).join("\n")
          : command === "theme"
            ? `${theme.name} is active. Open Settings for display and accessibility preferences.`
            : command === "secret" || command === "westcose"
              ? "Hidden command found: good software should still work when the costume comes off."
              : command === "sudo impress-client"
                ? "Permission denied. Try showing the work instead."
                : `Unknown command: ${command}. Try help.`;
    setLines((current) => [...current, `> ${command}`, response]);
  };

  return (
    <div className={styles.terminal}>
      <div aria-live="polite" className={styles.output} role="log">
        {lines.map((line, index) => (
          <p key={`${index}-${line}`}>{line}</p>
        ))}
      </div>
      <form className={styles.form} onSubmit={runCommand}>
        <label htmlFor="terminal-command">Command</label>
        <div className={styles.prompt}>
          <span aria-hidden="true">wcl&gt;</span>
          <input
            autoComplete="off"
            id="terminal-command"
            name="command"
            spellCheck={false}
          />
          <button type="submit">Run</button>
        </div>
      </form>
    </div>
  );
}
