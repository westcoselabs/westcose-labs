import { describe, expect, it } from "vitest";

import {
  buildNoteLibrary,
  createLocalNote,
  filterNoteLibrary,
} from "../../src/lib/notes";
import { noteRegistry } from "../../src/registry/notes";
import { createInitialDiscoveryState } from "../../src/state/discoveries";
import { createInitialLocalNotesState } from "../../src/state/local-notes";

describe("Notes library", () => {
  it("merges curated notes, overrides, and local notes without mutating the registry", () => {
    const localNote = createLocalNote("local-one", "2026-08-06T12:00:00.000Z");
    const library = buildNoteLibrary(
      noteRegistry,
      createInitialLocalNotesState({
        localNotes: [{ ...localNote, pinned: true }],
        noteOverrides: [{ noteId: "readme", folderId: "build-logs" }],
      }),
      createInitialDiscoveryState(),
    );

    expect(library.find((note) => note.id === "local-one")).toMatchObject({
      source: "local",
      pinned: true,
    });
    expect(library.find((note) => note.id === "readme")?.folderId).toBe(
      "build-logs",
    );
    expect(noteRegistry[0].folderId).toBe("project-notes");
  });

  it("keeps hidden notes out of normal lists but reveals matching searches", () => {
    const library = buildNoteLibrary(
      noteRegistry,
      createInitialLocalNotesState(),
      createInitialDiscoveryState(),
    );

    expect(filterNoteLibrary(library).some((note) => note.hidden)).toBe(false);
    expect(
      filterNoteLibrary(library, { query: "passwords" }).map((note) => note.id),
    ).toContain("passwords-not-passwords");
  });

  it("mutates the configured title after five opens", () => {
    const discoveries = createInitialDiscoveryState({
      counters: {
        ...createInitialDiscoveryState().counters,
        noteOpens: { "do-not-redesign": 5 },
      },
    });
    const library = buildNoteLibrary(
      noteRegistry,
      createInitialLocalNotesState(),
      discoveries,
    );

    expect(library.find((note) => note.id === "do-not-redesign")?.title).toBe(
      "Do not redesign this again (seriously)",
    );
  });

  it("separates active and recently deleted notes", () => {
    const library = buildNoteLibrary(
      noteRegistry,
      createInitialLocalNotesState({
        noteOverrides: [
          { noteId: "readme", deletedAt: "2026-08-06T12:00:00.000Z" },
        ],
      }),
      createInitialDiscoveryState(),
    );

    expect(filterNoteLibrary(library).map((note) => note.id)).not.toContain(
      "readme",
    );
    expect(
      filterNoteLibrary(library, { folderId: "recently-deleted" }).map(
        (note) => note.id,
      ),
    ).toContain("readme");
  });
});
