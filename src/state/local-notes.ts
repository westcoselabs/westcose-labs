export type LocalPocketNote = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly folderId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pinned: boolean;
  readonly deletedAt?: string;
};

export type CuratedNoteOverride = {
  readonly noteId: string;
  readonly pinned?: boolean;
  readonly deletedAt?: string;
  readonly customTitle?: string;
  readonly folderId?: string;
};

export type LocalNotesState = {
  readonly localNotes: readonly LocalPocketNote[];
  readonly noteOverrides: readonly CuratedNoteOverride[];
};

type LocalNoteChanges = Partial<
  Omit<LocalPocketNote, "id" | "createdAt">
>;

export type LocalNotesAction =
  | { readonly type: "hydrate"; readonly state: LocalNotesState }
  | { readonly type: "note/create"; readonly note: LocalPocketNote }
  | {
      readonly type: "note/update";
      readonly noteId: string;
      readonly changes: LocalNoteChanges;
    }
  | {
      readonly type: "note/delete";
      readonly noteId: string;
      readonly deletedAt: string;
    }
  | { readonly type: "note/restore"; readonly noteId: string }
  | { readonly type: "note/permanent-delete"; readonly noteId: string }
  | {
      readonly type: "override/set";
      readonly noteId: string;
      readonly changes: Omit<CuratedNoteOverride, "noteId">;
    }
  | { readonly type: "override/remove"; readonly noteId: string }
  | { readonly type: "reset" };

export const DEFAULT_LOCAL_NOTES_STATE: LocalNotesState = Object.freeze({
  localNotes: Object.freeze([]) as readonly LocalPocketNote[],
  noteOverrides: Object.freeze([]) as readonly CuratedNoteOverride[],
});

export function createInitialLocalNotesState(
  state: Partial<LocalNotesState> | null = null,
): LocalNotesState {
  return {
    localNotes: (state?.localNotes ?? []).map((note) => ({ ...note })),
    noteOverrides: (state?.noteOverrides ?? []).map((override) => ({
      ...override,
    })),
  };
}

export function localNotesReducer(
  state: LocalNotesState,
  action: LocalNotesAction,
): LocalNotesState {
  switch (action.type) {
    case "hydrate":
      return createInitialLocalNotesState(action.state);
    case "note/create":
      return state.localNotes.some((note) => note.id === action.note.id)
        ? state
        : { ...state, localNotes: [...state.localNotes, { ...action.note }] };
    case "note/update": {
      let changed = false;
      const localNotes = state.localNotes.map((note) => {
        if (note.id !== action.noteId) return note;
        changed = true;
        return { ...note, ...action.changes, id: note.id, createdAt: note.createdAt };
      });
      return changed ? { ...state, localNotes } : state;
    }
    case "note/delete":
      return localNotesReducer(state, {
        type: "note/update",
        noteId: action.noteId,
        changes: { deletedAt: action.deletedAt, updatedAt: action.deletedAt },
      });
    case "note/restore":
      if (!state.localNotes.some((note) => note.id === action.noteId)) {
        return state;
      }
      return {
        ...state,
        localNotes: state.localNotes.map((note) => {
          if (note.id !== action.noteId || note.deletedAt === undefined) {
            return note;
          }
          return {
            id: note.id,
            title: note.title,
            body: note.body,
            folderId: note.folderId,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            pinned: note.pinned,
          };
        }),
      };
    case "note/permanent-delete": {
      const localNotes = state.localNotes.filter(
        (note) => note.id !== action.noteId,
      );
      return localNotes.length === state.localNotes.length
        ? state
        : { ...state, localNotes };
    }
    case "override/set": {
      const existing = state.noteOverrides.find(
        (override) => override.noteId === action.noteId,
      );
      const nextOverride = existing
        ? { ...existing, ...action.changes, noteId: action.noteId }
        : { noteId: action.noteId, ...action.changes };
      return {
        ...state,
        noteOverrides: existing
          ? state.noteOverrides.map((override) =>
              override.noteId === action.noteId ? nextOverride : override,
            )
          : [...state.noteOverrides, nextOverride],
      };
    }
    case "override/remove": {
      const noteOverrides = state.noteOverrides.filter(
        (override) => override.noteId !== action.noteId,
      );
      return noteOverrides.length === state.noteOverrides.length
        ? state
        : { ...state, noteOverrides };
    }
    case "reset":
      return createInitialLocalNotesState();
  }
}
