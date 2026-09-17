import type { Metadata } from "next";

import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import { createRouteMetadata, getNote, noteRegistry } from "@/registry";

type NotePageProps = {
  readonly params: Promise<{ noteId: string }>;
};

export function generateStaticParams() {
  return noteRegistry.map((note) => ({ noteId: note.id }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { noteId } = await params;
  const note = getNote(noteId);
  return createRouteMetadata({
    title: note?.title ?? "Local note",
    description: note?.summary ?? "A local note stored in this browser.",
    path: `/notes/${encodeURIComponent(noteId)}`,
  });
}

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;
  return (
    <NotesRoute
      notes={noteRegistry}
      view={{ kind: "note", noteId }}
    />
  );
}
