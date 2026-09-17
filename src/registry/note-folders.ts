import type { NoteFolderDefinition } from "./types";

export const noteFolderRegistry = [
  {
    id: "all-notes",
    name: "All Notes",
    description: "A smart collection of every note that is not deleted.",
    kind: "smart",
  },
  {
    id: "project-notes",
    name: "Project Notes",
    description: "Orientation and project-system notes.",
    kind: "collection",
  },
  {
    id: "build-logs",
    name: "Build Logs",
    description: "Process notes captured while the system evolves.",
    kind: "collection",
  },
  {
    id: "questionable-ideas",
    name: "Questionable Ideas",
    description: "Useful side quests and intentionally questionable concepts.",
    kind: "collection",
  },
  {
    id: "client-translations",
    name: "Client Translations",
    description: "Plain-language translations of familiar project phrases.",
    kind: "collection",
  },
  {
    id: "recently-deleted",
    name: "Recently Deleted",
    description: "A smart collection reserved for recoverable notes.",
    kind: "smart",
  },
] as const satisfies readonly NoteFolderDefinition[];

export type RegisteredNoteFolder = (typeof noteFolderRegistry)[number];
export type NoteFolderId = RegisteredNoteFolder["id"];

export function getNoteFolder(id: string): RegisteredNoteFolder | undefined {
  return noteFolderRegistry.find((folder) => folder.id === id);
}
