import type { ReactNode } from "react";
import styles from "./ThemeGlyph.module.css";

const objects: Record<string, string> = {
  projects: "folder", games: "controller", experiments: "flask", services: "case",
  about: "computer", contact: "mail", fightclub: "swords", terminal: "terminal",
  github: "globe", recycle: "bin", notes: "document", settings: "computer",
  messages: "mail", phone: "phone", "low-tide-loot": "globe", shitbird: "bird",
};

/** CSS switches the artwork before hydration, with no duplicate accessible name. */
export function ThemeGlyph({ children, iconKey, size = 32 }: {
  readonly children: ReactNode;
  readonly iconKey: string;
  readonly size?: number;
}) {
  return <>
    <span className={styles.standard}>{children}</span>
    <svg aria-hidden="true" focusable="false" className={styles.rendered} width={size} height={size} viewBox="0 0 64 64">
      <use href={`/icons/xp-objects.svg#${objects[iconKey] ?? "globe"}`} />
    </svg>
  </>;
}
