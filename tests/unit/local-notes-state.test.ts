import { describe, expect, it } from "vitest";

import {
  createInitialLocalNotesState,
  localNotesReducer,
  type LocalPocketNote,
} from "../../src/state/local-notes";

const note: LocalPocketNote = {
  id: "local-1",
  title: "Untitled Idea That Will Become a SaaS",
  body: "First draft",
  folderId: "ideas",
  createdAt: "2026-08-06T12:00:00.000Z",
  updatedAt: "2026-08-06T12:00:00.000Z",
  pinned: false,
};

describe("local note state", () => {
  it("creates and updates a local note without mutating its identity fields", () => {
    const initial = createInitialLocalNotesState();
    const created = localNotesReducer(initial, { type: "note/create", note });
    const updated = localNotesReducer(created, {
      type: "note/update",
      noteId: note.id,
      changes: {
        title: "A more responsible title",
        pinned: true,
        updatedAt: "2026-08-06T13:00:00.000Z",
      },
    });

    expect(initial.localNotes).toEqual([]);
    expect(updated.localNotes[0]).toMatchObject({
      id: note.id,
      createdAt: note.createdAt,
      title: "A more responsible title",
      pinned: true,
    });
  });

  it("moves a local note to deleted state and restores it", () => {
    let state = localNotesReducer(createInitialLocalNotesState(), {
      type: "note/create",
      note,
    });
    state = localNotesReducer(state, {
      type: "note/delete",
      noteId: note.id,
      deletedAt: "2026-08-06T14:00:00.000Z",
    });
    expect(state.localNotes[0]?.deletedAt).toBe(
      "2026-08-06T14:00:00.000Z",
    );

    state = localNotesReducer(state, { type: "note/restore", noteId: note.id });
    expect(state.localNotes[0]).not.toHaveProperty("deletedAt");
  });

  it("permanently deletes only the requested local note", () => {
    let state = localNotesReducer(createInitialLocalNotesState(), {
      type: "note/create",
      note,
    });
    const unchanged = localNotesReducer(state, {
      type: "note/permanent-delete",
      noteId: "missing-note",
    });
    expect(unchanged).toBe(state);

    state = localNotesReducer(state, {
      type: "note/permanent-delete",
      noteId: note.id,
    });
    expect(state.localNotes).toEqual([]);
  });

  it("stores curated overrides separately from repository notes", () => {
    let state = createInitialLocalNotesState();
    state = localNotesReducer(state, {
      type: "override/set",
      noteId: "readme",
      changes: { pinned: true, customTitle: "My README" },
    });
    state = localNotesReducer(state, {
      type: "override/set",
      noteId: "readme",
      changes: { folderId: "project-notes" },
    });

    expect(state.localNotes).toEqual([]);
    expect(state.noteOverrides).toEqual([
      {
        noteId: "readme",
        pinned: true,
        customTitle: "My README",
        folderId: "project-notes",
      },
    ]);
  });

  it("ignores duplicate note creation and resets both local stores", () => {
    let state = localNotesReducer(createInitialLocalNotesState(), {
      type: "note/create",
      note,
    });
    const duplicate = localNotesReducer(state, { type: "note/create", note });
    expect(duplicate).toBe(state);

    state = localNotesReducer(state, {
      type: "override/set",
      noteId: "readme",
      changes: { pinned: true },
    });
    expect(localNotesReducer(state, { type: "reset" })).toEqual({
      localNotes: [],
      noteOverrides: [],
    });
  });
});
