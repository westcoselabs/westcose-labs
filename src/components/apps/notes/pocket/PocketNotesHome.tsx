"use client";

import {
  ArrowUUpLeft,
  CaretRight,
  FolderSimple,
  MagnifyingGlass,
  NotePencil,
  Paperclip,
  Plus,
  PushPin,
  ShareNetwork,
  Trash,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { formatNoteDate, type NoteLibraryItem } from "@/lib/notes";
import { noteFolderRegistry } from "@/registry";

import type { NotesController } from "../useNotesController";
import styles from "./PocketNotes.module.css";

function DiscoveryNotice({ controller }: { readonly controller: NotesController }) {
  if (!controller.notification) return null;
  return (
    <aside className={styles.discovery} role="status">
      <span>
        <strong>{controller.notification.title}</strong>
        <small>{controller.notification.copy}</small>
      </span>
      <button
        aria-label="Dismiss discovery"
        onClick={controller.dismissNotification}
        type="button"
      >
        <X aria-hidden="true" />
      </button>
    </aside>
  );
}

function NoteRow({
  controller,
  note,
  recycled = false,
}: {
  readonly controller: NotesController;
  readonly note: NoteLibraryItem;
  readonly recycled?: boolean;
}) {
  return (
    <li className={styles.noteRow}>
      <button onClick={() => controller.openNote(note.id)} type="button">
        <span className={styles.noteCopy}>
          <strong>{note.title}</strong>
          <span>{note.preview}</span>
          <small>
            {formatNoteDate(note.updatedAt)} · {note.tag}
            {note.attachmentCount ? (
              <span className={styles.attachment}>
                <Paperclip aria-hidden="true" /> {note.attachmentCount}
              </span>
            ) : null}
          </small>
        </span>
        {note.pinned ? <PushPin aria-label="Pinned" weight="fill" /> : null}
        <CaretRight aria-hidden="true" />
      </button>
      {recycled ? (
        <span className={styles.restoreActions}>
          <button onClick={() => controller.restoreNote(note)} type="button">
            Restore
          </button>
          {note.source === "local" ? (
            <button
              onClick={() => {
                if (window.confirm("Delete this local note permanently?")) {
                  controller.permanentlyDeleteNote(note);
                }
              }}
              type="button"
            >
              Delete Forever
            </button>
          ) : null}
        </span>
      ) : null}
    </li>
  );
}

function SearchField({
  query,
  setQuery,
}: {
  readonly query: string;
  readonly setQuery: (value: string) => void;
}) {
  return (
    <label className={styles.search}>
      <MagnifyingGlass aria-hidden="true" />
      <span className="sr-only">Search notes</span>
      <input
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder="Search notes"
        type="search"
        value={query}
      />
    </label>
  );
}

function NotesHome({ controller }: { readonly controller: NotesController }) {
  const [query, setQuery] = useState("");
  const searched = controller.filterNotes(undefined, query);
  const pinned = searched.filter((note) => note.pinned).slice(0, 4);
  const recent = searched.slice(0, 6);

  return (
    <div className={styles.page}>
      <header className={styles.largeHeader}>
        <small>ON MY POCKET</small>
        <h1 data-route-content tabIndex={-1}>Notes</h1>
        <SearchField query={query} setQuery={setQuery} />
      </header>
      <DiscoveryNotice controller={controller} />
      {!query ? (
        <section aria-labelledby="folders-heading" className={styles.section}>
          <h2 id="folders-heading">Folders</h2>
          <ul className={styles.folderList}>
            {noteFolderRegistry.map((folder) => {
              const count = controller.filterNotes(folder.id).length;
              return (
                <li key={folder.id}>
                  <button
                    onClick={() => controller.openFolder(folder.id)}
                    type="button"
                  >
                    <span className={styles.folderIcon}>
                      <FolderSimple aria-hidden="true" weight="fill" />
                    </span>
                    <span>{folder.name}</span>
                    <small>{count}</small>
                    <CaretRight aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {pinned.length ? (
        <section aria-labelledby="pinned-heading" className={styles.section}>
          <h2 id="pinned-heading">Pinned Notes</h2>
          <ul className={styles.noteList}>
            {pinned.map((note) => (
              <NoteRow controller={controller} key={note.id} note={note} />
            ))}
          </ul>
        </section>
      ) : null}
      <section aria-labelledby="recent-heading" className={styles.section}>
        <h2 id="recent-heading">{query ? "Search Results" : "Recent Notes"}</h2>
        {recent.length ? (
          <ul className={styles.noteList}>
            {recent.map((note) => (
              <NoteRow controller={controller} key={note.id} note={note} />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No notes match that search.</p>
        )}
      </section>
      <button
        aria-label="Create new note"
        className={styles.compose}
        onClick={controller.compose}
        type="button"
      >
        <NotePencil aria-hidden="true" weight="bold" />
      </button>
    </div>
  );
}

function NotesFolder({ controller }: { readonly controller: NotesController }) {
  const [query, setQuery] = useState("");
  const folderId =
    controller.view.kind === "folder" ? controller.view.folderId : "all-notes";
  const folder = noteFolderRegistry.find((candidate) => candidate.id === folderId);
  const notes = controller.filterNotes(folderId, query);
  const recycled = folderId === "recently-deleted";

  return (
    <div className={styles.page}>
      <header className={styles.largeHeader}>
        <small>ON MY POCKET</small>
        <h1 data-route-content tabIndex={-1}>{folder?.name ?? "Notes"}</h1>
        <SearchField query={query} setQuery={setQuery} />
      </header>
      <DiscoveryNotice controller={controller} />
      <section aria-label={folder?.name ?? "Notes folder"} className={styles.section}>
        {notes.length ? (
          <ul className={styles.noteList}>
            {notes.map((note) => (
              <NoteRow
                controller={controller}
                key={note.id}
                note={note}
                recycled={recycled}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            {recycled ? "Recently Deleted is empty." : "No notes in this folder."}
          </p>
        )}
      </section>
      {!recycled ? (
        <button
          aria-label="Create new note"
          className={styles.compose}
          onClick={controller.compose}
          type="button"
        >
          <NotePencil aria-hidden="true" weight="bold" />
        </button>
      ) : null}
    </div>
  );
}

function NoteDetail({ controller }: { readonly controller: NotesController }) {
  const note = controller.selectedNote;
  const [shareMessage, setShareMessage] = useState("");

  if (!note) {
    return (
      <div className={styles.missing}>
        <h1 data-route-content tabIndex={-1}>Note not found</h1>
        <p>This note may belong to another browser.</p>
        <Link href="/notes">Return to Notes</Link>
      </div>
    );
  }

  if (note.deletedAt) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.detailBack}>
          <Link href="/notes/folder/recently-deleted">‹ Recently Deleted</Link>
        </div>
        <article className={styles.noteArticle}>
          <small>RECYCLED NOTE</small>
          <h1 data-route-content tabIndex={-1}>{note.title}</h1>
          <p>{note.preview}</p>
          <div className={styles.recycledDetailActions}>
            <button onClick={() => controller.restoreNote(note)} type="button">
              <ArrowUUpLeft aria-hidden="true" /> Restore
            </button>
            {note.source === "local" ? (
              <button
                onClick={() => {
                  if (window.confirm("Delete this local note permanently?")) {
                    controller.permanentlyDeleteNote(note);
                  }
                }}
                type="button"
              >
                <Trash aria-hidden="true" /> Delete Forever
              </button>
            ) : null}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailBack}>
        <Link href="/notes">‹ Notes</Link>
      </div>
      <DiscoveryNotice controller={controller} />
      <article className={styles.noteArticle}>
        {note.source === "local" ? (
          <input
            aria-label="Note title"
            className={styles.titleInput}
            onChange={(event) =>
              controller.updateLocalNote(note, { title: event.currentTarget.value })
            }
            value={note.title}
          />
        ) : (
          <h1 data-route-content tabIndex={-1}>{note.title}</h1>
        )}
        <p className={styles.metadata}>
          {formatNoteDate(note.updatedAt)} · {note.tag}
          {note.pinned ? " · Pinned" : ""}
        </p>
        {note.source === "local" ? (
          <textarea
            aria-label="Note body"
            className={styles.noteEditor}
            onChange={(event) =>
              controller.updateLocalNote(note, { body: event.currentTarget.value })
            }
            placeholder="Start typing..."
            value={note.body}
          />
        ) : (
          <div className={styles.noteBody}>
            {note.body.split(/\n{2,}/u).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </article>
      <p aria-live="polite" className={styles.shareMessage}>{shareMessage}</p>
      <footer aria-label="Note actions" className={styles.toolbar}>
        <button
          aria-label="Share note"
          onClick={async () => setShareMessage(await controller.shareNote(note))}
          type="button"
        >
          <ShareNetwork aria-hidden="true" />
        </button>
        <button
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          onClick={() => controller.togglePin(note)}
          type="button"
        >
          <PushPin aria-hidden="true" weight={note.pinned ? "fill" : "regular"} />
        </button>
        <label>
          <span className="sr-only">Move note to folder</span>
          <select
            aria-label="Move note to folder"
            onChange={(event) => controller.moveNote(note, event.currentTarget.value)}
            value={note.folderId}
          >
            {noteFolderRegistry
              .filter((folder) => folder.kind === "collection")
              .map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
          </select>
        </label>
        <button
          aria-label="Move note to Recycle"
          onClick={() => controller.deleteNote(note)}
          type="button"
        >
          <Trash aria-hidden="true" />
        </button>
        <button aria-label="Create new note" onClick={controller.compose} type="button">
          <Plus aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}

export function PocketNotesHome({
  controller,
}: {
  readonly controller: NotesController;
}) {
  return (
    <div data-app-presenter="pocket-notes" data-route-content className={styles.app}>
      {controller.view.kind === "home" ? <NotesHome controller={controller} /> : null}
      {controller.view.kind === "folder" ? <NotesFolder controller={controller} /> : null}
      {controller.view.kind === "note" ? <NoteDetail controller={controller} /> : null}
    </div>
  );
}
