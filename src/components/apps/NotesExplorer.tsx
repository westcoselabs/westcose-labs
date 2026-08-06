"use client";

import { useDeferredValue, useState } from "react";

import type { Note } from "@/registry";

import styles from "./InteractiveApps.module.css";

export function NotesExplorer({ notes }: { notes: readonly Note[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const deferredQuery = useDeferredValue(query);
  const visibleNotes = notes.filter((note) =>
    `${note.title} ${note.summary} ${note.tag}`
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );
  const selected =
    visibleNotes.find((note) => note.id === selectedId) ?? visibleNotes[0];

  return (
    <section aria-label="Notes browser" className={styles.explorer}>
      <div className={styles.sidebar}>
        <label>
          <span className="sr-only">Search notes</span>
          <input
            className={styles.search}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search notes"
            type="search"
            value={query}
          />
        </label>
        <ul className={styles.list}>
          {visibleNotes.map((note) => (
            <li key={note.id}>
              <button
                aria-current={selected?.id === note.id ? "true" : undefined}
                className={styles.listButton}
                onClick={() => setSelectedId(note.id)}
                type="button"
              >
                <strong>{note.title}</strong>
                <small>{note.tag}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <article className={styles.detail}>
        {selected ? (
          <>
            <small>{selected.pinned ? "Pinned note" : selected.tag}</small>
            <h2>{selected.title}</h2>
            {selected.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        ) : (
          <p>No notes match that search.</p>
        )}
      </article>
    </section>
  );
}
