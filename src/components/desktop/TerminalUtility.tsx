"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import styles from "./TerminalUtility.module.css";

const INTRO = [
  "WestCose Navigation Terminal v1",
  "Type help. This utility cannot execute system commands.",
] as const;

export function TerminalUtility() {
  const router = useRouter();
  const [lines, setLines] = useState<readonly string[]>(INTRO);

  const runCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const command = String(data.get("command") ?? "").trim().toLowerCase();
    form.reset();

    if (!command) return;
    if (command === "clear") {
      setLines([]);
      return;
    }
    if (command === "projects" || command === "about") {
      setLines((current) => [...current, `> ${command}`, `Opening /${command}`]);
      router.push(`/${command}`);
      return;
    }

    const response =
      command === "help"
        ? "help · projects · about · clear"
        : command === "westcose"
          ? "Hidden command found: good software should still work when the costume comes off."
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
