import type { Note } from "@/registry";
import type { DiscoveryState } from "@/state/discoveries";
import type {
  LocalNotesState,
  LocalPocketNote,
} from "@/state/local-notes";

export const DEFAULT_LOCAL_NOTE_TITLE =
  "Untitled Idea That Will Become a SaaS";

export type NoteLibraryItem = {
  readonly attachmentCount: number;
  readonly body: string;
  readonly deletedAt?: string;
  readonly desktopFileName: string;
  readonly discoveryId?: string;
  readonly folderId: string;
  readonly hidden: boolean;
  readonly id: string;
  readonly pinned: boolean;
  readonly preview: string;
  readonly source: "curated" | "local";
  readonly summary: string;
  readonly tag: string;
  readonly tags: readonly string[];
  readonly title: string;
  readonly titleMutation?: Note["titleMutation"];
  readonly updatedAt: string;
};

const trimPreview = (value: string, fallback: string): string => {
  const normalized = value.replace(/\s+/gu, " ").trim() || fallback;
  return normalized.length > 132
    ? `${normalized.slice(0, 129).trimEnd()}...`
    : normalized;
};

export function buildNoteLibrary(
  curatedNotes: readonly Note[],
  localState: LocalNotesState,
  discoveryState: DiscoveryState | null,
): NoteLibraryItem[] {
  const overrides = new Map(
    localState.noteOverrides.map((override) => [override.noteId, override]),
  );
  const openCounts = discoveryState?.counters.noteOpens ?? {};

  const curated = curatedNotes.map<NoteLibraryItem>((note) => {
    const override = overrides.get(note.id);
    const mutates =
      note.titleMutation !== undefined &&
      (openCounts[note.id] ?? 0) >= note.titleMutation.afterOpenCount;
    const title = mutates
      ? note.titleMutation?.alternateTitle ?? note.title
      : (override?.customTitle ?? note.title);

    return {
      attachmentCount: note.attachmentCount ?? 0,
      body: note.body.join("\n\n"),
      deletedAt: override?.deletedAt,
      desktopFileName:
        note.desktopFileName ?? `${title.replace(/[\\/:*?"<>|]/gu, "-")}.txt`,
      discoveryId: note.discoveryId,
      folderId: override?.folderId ?? note.folderId,
      hidden: note.hidden ?? false,
      id: note.id,
      pinned: override?.pinned ?? note.pinned ?? false,
      preview: note.preview,
      source: "curated",
      summary: note.summary,
      tag: note.tag,
      tags: note.tags ?? [note.tag],
      title,
      titleMutation: note.titleMutation,
      updatedAt: note.updatedAt,
    };
  });

  const local = localState.localNotes.map<NoteLibraryItem>((note) => ({
    attachmentCount: 0,
    body: note.body,
    deletedAt: note.deletedAt,
    desktopFileName: `${note.title.replace(/[\\/:*?"<>|]/gu, "-")}.txt`,
    folderId: note.folderId,
    hidden: false,
    id: note.id,
    pinned: note.pinned,
    preview: trimPreview(note.body, "Empty local note"),
    source: "local",
    summary: "Editable note stored on this device.",
    tag: "Local",
    tags: ["Local"],
    title: note.title,
    updatedAt: note.updatedAt,
  }));

  return [...curated, ...local].sort((left, right) => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function filterNoteLibrary(
  notes: readonly NoteLibraryItem[],
  options: {
    readonly discoveredIds?: readonly string[];
    readonly folderId?: string;
    readonly query?: string;
  } = {},
): NoteLibraryItem[] {
  const query = options.query?.trim().toLocaleLowerCase() ?? "";
  const discovered = new Set(options.discoveredIds ?? []);
  const recentlyDeleted = options.folderId === "recently-deleted";

  return notes.filter((note) => {
    if (recentlyDeleted ? note.deletedAt === undefined : note.deletedAt !== undefined) {
      return false;
    }
    if (
      options.folderId &&
      options.folderId !== "all-notes" &&
      options.folderId !== "recently-deleted" &&
      note.folderId !== options.folderId
    ) {
      return false;
    }

    const haystack = `${note.title} ${note.preview} ${note.tags.join(" ")}`.toLocaleLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const hiddenAvailable =
      !note.hidden ||
      (note.discoveryId !== undefined && discovered.has(note.discoveryId)) ||
      (query.length >= 8 && matchesQuery);

    return hiddenAvailable && matchesQuery;
  });
}

export function createLocalNote(id: string, now: string): LocalPocketNote {
  return {
    id,
    title: DEFAULT_LOCAL_NOTE_TITLE,
    body: "",
    folderId: "project-notes",
    createdAt: now,
    updatedAt: now,
    pinned: false,
  };
}

export function formatNoteDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}
