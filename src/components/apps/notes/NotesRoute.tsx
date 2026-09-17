"use client";

import Link from "next/link";

import { RouteDocument } from "@/components/apps/RouteDocument";
import { useShellPresentation } from "@/components/os/ShellPresentationContext";
import type { Note } from "@/registry";

import { DesktopNotepad } from "./desktop/DesktopNotepad";
import { PocketNotesHome } from "./pocket/PocketNotesHome";
import {
  useNotesController,
  type NotesController,
  type NotesRouteView,
} from "./useNotesController";

function SemanticNotes({ controller }: { readonly controller: NotesController }) {
  const { selectedNote, view } = controller;
  const notes = controller.filterNotes(
    view.kind === "folder" ? view.folderId : undefined,
  );

  return (
    <div data-app-presenter="semantic-notes">
      <RouteDocument
        description="Professional process notes, system orientation, and a few clearly labeled jokes."
        eyebrow="Notes"
        presentation="notes"
        status={`${notes.length} notes`}
        title={selectedNote?.title ?? "Working notes"}
      >
        {view.kind === "note" ? (
          selectedNote ? (
            <article aria-labelledby="semantic-note-title">
              <p>
                <Link href="/notes">Back to Notes</Link>
              </p>
              <h2 id="semantic-note-title">{selectedNote.title}</h2>
              <p>{selectedNote.summary}</p>
              {selectedNote.body.split(/\n{2,}/u).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ) : (
            <p>
              This local note is not available in this browser. <Link href="/notes">Back to Notes</Link>
            </p>
          )
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <Link href={`/notes/${encodeURIComponent(note.id)}`}>
                  {note.title}
                </Link>{" "}
                <span>{note.preview}</span>
              </li>
            ))}
          </ul>
        )}
      </RouteDocument>
    </div>
  );
}

export function NotesRoute({
  notes,
  view = { kind: "home" },
}: {
  readonly notes: readonly Note[];
  readonly view?: NotesRouteView;
}) {
  const shell = useShellPresentation();
  const controller = useNotesController(notes, view);

  if (shell === "desktop") return <DesktopNotepad controller={controller} />;
  if (shell === "pocket") return <PocketNotesHome controller={controller} />;
  return <SemanticNotes controller={controller} />;
}
