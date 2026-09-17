import type { Metadata } from "next";

import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import {
  createRouteMetadata,
  getNoteFolder,
  noteFolderRegistry,
  noteRegistry,
} from "@/registry";

type NoteFolderPageProps = {
  readonly params: Promise<{ folderId: string }>;
};

export function generateStaticParams() {
  return noteFolderRegistry.map((folder) => ({ folderId: folder.id }));
}

export async function generateMetadata({
  params,
}: NoteFolderPageProps): Promise<Metadata> {
  const { folderId } = await params;
  const folder = getNoteFolder(folderId);
  return createRouteMetadata({
    title: folder?.name ?? "Notes folder",
    description: folder?.description ?? "A Notes folder.",
    path: `/notes/folder/${encodeURIComponent(folderId)}`,
  });
}

export default async function NoteFolderPage({ params }: NoteFolderPageProps) {
  const { folderId } = await params;
  return (
    <NotesRoute
      notes={noteRegistry}
      view={{ kind: "folder", folderId }}
    />
  );
}
