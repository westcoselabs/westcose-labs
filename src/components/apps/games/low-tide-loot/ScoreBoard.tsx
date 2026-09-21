import type { SalvageScore } from "../storage";
import styles from "./LowTideLoot.module.css";

export const money = (amount: number) => `$${amount.toLocaleString("en-US")}`;

export function ScoreBoard({ scores }: { scores: SalvageScore[] }) {
  return (
    <div className={styles.scoreboard}>
      <h2>Local legends.</h2>
      <p>Top 10 runs on this browser. No witnesses required.</p>
      {scores.length ? (
        <ol>
          {scores.map((score, i) => (
            <li key={`${score.timestamp}-${i}`}>
              <span>
                {String(i + 1).padStart(2, "0")} <b>{money(score.score)}</b>
              </span>
              <span>
                {score.days} days <small>{score.bestItem}</small>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No salvage on record. Set the bar suspiciously low.</p>
      )}
    </div>
  );
}
