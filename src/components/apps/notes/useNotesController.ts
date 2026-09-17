"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import {
  useDiscoveryService,
  useDiscoveryState,
} from "@/components/os/DiscoveryServiceContext";
import { useLocalNotes } from "@/components/os/LocalNotesContext";
import {
  buildNoteLibrary,
  createLocalNote,
  filterNoteLibrary,
  type NoteLibraryItem,
} from "@/lib/notes";
import { getDiscovery, type Note } from "@/registry";
import { createInitialLocalNotesState } from "@/state/local-notes";

export type NotesRouteView =
  | { readonly kind: "home" }
  | { readonly kind: "folder"; readonly folderId: string }
  | { readonly kind: "note"; readonly noteId: string };

export type NotesController = {
  readonly allNotes: readonly NoteLibraryItem[];
  readonly closeNotes: () => void;
  readonly compose: () => void;
  readonly deleteNote: (note: NoteLibraryItem, redirect?: boolean) => void;
  readonly dismissNotification: () => void;
  readonly filterNotes: (
    folderId?: string,
    query?: string,
  ) => NoteLibraryItem[];
  readonly moveNote: (note: NoteLibraryItem, folderId: string) => void;
  readonly notification: {
    readonly copy: string;
    readonly id: string;
    readonly title: string;
  } | null;
  readonly openFolder: (folderId: string) => void;
  readonly openNote: (noteId: string) => void;
  readonly permanentlyDeleteNote: (note: NoteLibraryItem) => void;
  readonly restoreNote: (note: NoteLibraryItem) => void;
  readonly recordFinalRenameRefusal: () => void;
  readonly selectedNote: NoteLibraryItem | undefined;
  readonly shareNote: (note: NoteLibraryItem) => Promise<string>;
  readonly togglePin: (note: NoteLibraryItem) => void;
  readonly updateLocalNote: (
    note: NoteLibraryItem,
    changes: { readonly body?: string; readonly title?: string },
  ) => void;
  readonly view: NotesRouteView;
};

const fallbackLocalState = createInitialLocalNotesState();

const createId = () => {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `local-${suffix}`;
};

export function useNotesController(
  curatedNotes: readonly Note[],
  view: NotesRouteView,
): NotesController {
  const router = useRouter();
  const localNotes = useLocalNotes();
  const discoveryService = useDiscoveryService();
  const discoveryState = useDiscoveryState();
  const allNotes = useMemo(
    () =>
      buildNoteLibrary(
        curatedNotes,
        localNotes?.state ?? fallbackLocalState,
        discoveryState,
      ),
    [curatedNotes, discoveryState, localNotes?.state],
  );
  const selectedNote =
    view.kind === "note"
      ? allNotes.find((note) => note.id === view.noteId)
      : undefined;
  const selectedId = selectedNote?.id;
  const selectedHidden = selectedNote?.hidden ?? false;
  const selectedDiscoveryId = selectedNote?.discoveryId;
  const selectedMutationCount = selectedNote?.titleMutation?.afterOpenCount;
  const selectedMutationDiscoveryId =
    selectedNote?.titleMutation?.discoveryId;

  const recordDiscovery = useCallback(
    (discoveryId: string) => {
      discoveryService?.recordDiscovery(discoveryId);
    },
    [discoveryService],
  );

  useEffect(() => {
    if (view.kind !== "note" || !selectedId || !discoveryService) return;

    const currentCount =
      discoveryService.getState().counters.noteOpens[selectedId] ?? 0;
    const nextCount = currentCount + 1;
    discoveryService.incrementCounter("noteOpens", selectedId);

    if (selectedHidden && selectedDiscoveryId) {
      discoveryService.recordViewedHiddenFile(selectedId);
      recordDiscovery(selectedDiscoveryId);
    }

    if (
      selectedMutationDiscoveryId &&
      nextCount === selectedMutationCount
    ) {
      recordDiscovery(selectedMutationDiscoveryId);
    }
  }, [
    discoveryService,
    recordDiscovery,
    selectedDiscoveryId,
    selectedHidden,
    selectedId,
    selectedMutationCount,
    selectedMutationDiscoveryId,
    view.kind,
  ]);

  const filterNotes = useCallback(
    (folderId?: string, query?: string) =>
      filterNoteLibrary(allNotes, {
        discoveredIds: discoveryState?.discoveredSecretIds,
        folderId,
        query,
      }),
    [allNotes, discoveryState?.discoveredSecretIds],
  );

  const openNote = useCallback(
    (noteId: string) => router.push(`/notes/${encodeURIComponent(noteId)}`),
    [router],
  );
  const openFolder = useCallback(
    (folderId: string) =>
      router.push(`/notes/folder/${encodeURIComponent(folderId)}`),
    [router],
  );

  const compose = useCallback(() => {
    if (!localNotes) return;
    const note = createLocalNote(createId(), new Date().toISOString());
    localNotes.dispatch({ type: "note/create", note });
    recordDiscovery("notes.first-compose");
    router.push(`/notes/${encodeURIComponent(note.id)}`);
  }, [localNotes, recordDiscovery, router]);

  const updateLocalNote = useCallback(
    (
      note: NoteLibraryItem,
      changes: { readonly body?: string; readonly title?: string },
    ) => {
      if (!localNotes || note.source !== "local") return;
      localNotes.dispatch({
        type: "note/update",
        noteId: note.id,
        changes: { ...changes, updatedAt: new Date().toISOString() },
      });
    },
    [localNotes],
  );

  const togglePin = useCallback(
    (note: NoteLibraryItem) => {
      if (!localNotes) return;
      if (note.source === "local") {
        localNotes.dispatch({
          type: "note/update",
          noteId: note.id,
          changes: {
            pinned: !note.pinned,
            updatedAt: new Date().toISOString(),
          },
        });
        return;
      }
      localNotes.dispatch({
        type: "override/set",
        noteId: note.id,
        changes: { pinned: !note.pinned },
      });
    },
    [localNotes],
  );

  const moveNote = useCallback(
    (note: NoteLibraryItem, folderId: string) => {
      if (!localNotes) return;
      if (note.source === "local") {
        localNotes.dispatch({
          type: "note/update",
          noteId: note.id,
          changes: { folderId, updatedAt: new Date().toISOString() },
        });
        return;
      }
      localNotes.dispatch({
        type: "override/set",
        noteId: note.id,
        changes: { folderId },
      });
    },
    [localNotes],
  );

  const deleteNote = useCallback(
    (note: NoteLibraryItem, redirect = true) => {
      if (!localNotes) return;
      const deletedAt = new Date().toISOString();
      localNotes.dispatch(
        note.source === "local"
          ? { type: "note/delete", noteId: note.id, deletedAt }
          : {
              type: "override/set",
              noteId: note.id,
              changes: { deletedAt },
            },
      );
      recordDiscovery("notes.note-recycled");
      if (redirect) router.push("/notes/folder/recently-deleted");
    },
    [localNotes, recordDiscovery, router],
  );

  const restoreNote = useCallback(
    (note: NoteLibraryItem) => {
      if (!localNotes) return;
      localNotes.dispatch(
        note.source === "local"
          ? { type: "note/restore", noteId: note.id }
          : {
              type: "override/set",
              noteId: note.id,
              changes: { deletedAt: undefined },
            },
      );
      discoveryService?.recordRecycleRestoration(note.id);
      recordDiscovery("notes.note-restored");
    },
    [discoveryService, localNotes, recordDiscovery],
  );

  const permanentlyDeleteNote = useCallback(
    (note: NoteLibraryItem) => {
      if (!localNotes || note.source !== "local" || !note.deletedAt) return;
      localNotes.dispatch({ type: "note/permanent-delete", noteId: note.id });
      router.push("/notes/folder/recently-deleted");
    },
    [localNotes, router],
  );

  const shareNote = useCallback(async (note: NoteLibraryItem) => {
    const url = new URL(
      `/notes/${encodeURIComponent(note.id)}`,
      window.location.origin,
    ).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: note.title, text: note.preview, url });
        return "Share sheet opened.";
      }
      await navigator.clipboard.writeText(url);
      return "Note link copied.";
    } catch {
      return "Share canceled.";
    }
  }, []);

  const notificationDefinition = discoveryState?.discoveredSecretIds
    .slice()
    .reverse()
    .map((id) => getDiscovery(id))
    .find(
      (definition) =>
        definition !== undefined &&
        "notificationCopy" in definition &&
        !discoveryState.dismissedDiscoveryIds.includes(definition.id),
    );
  const notification =
    notificationDefinition &&
    "notificationCopy" in notificationDefinition &&
    notificationDefinition.notificationCopy &&
    !discoveryState?.dismissedDiscoveryIds.includes(notificationDefinition.id)
      ? {
          copy: notificationDefinition.notificationCopy,
          id: notificationDefinition.id,
          title: notificationDefinition.title,
        }
      : null;

  return {
    allNotes,
    closeNotes: () => router.push("/"),
    compose,
    deleteNote,
    dismissNotification: () => {
      if (notification) discoveryService?.dismissDiscovery(notification.id);
    },
    filterNotes,
    moveNote,
    notification,
    openFolder,
    openNote,
    permanentlyDeleteNote,
    recordFinalRenameRefusal: () =>
      recordDiscovery("notes.final-rename-refused"),
    restoreNote,
    selectedNote,
    shareNote,
    togglePin,
    updateLocalNote,
    view,
  };
}
