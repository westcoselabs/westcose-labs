import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReducer, useState, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: pushMock }),
}));

import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { LocalNotesProvider } from "@/components/os/LocalNotesContext";
import { ShellPresentationProvider } from "@/components/os/ShellPresentationContext";
import { createDiscoveryService } from "@/lib/discovery-service";
import { createLocalNote } from "@/lib/notes";
import { noteRegistry } from "@/registry";
import {
  createInitialLocalNotesState,
  localNotesReducer,
  type LocalNotesState,
} from "@/state/local-notes";
import type { Shell } from "@/lib/shell-selection";
import type { NotesRouteView } from "@/components/apps/notes/useNotesController";

afterEach(() => {
  cleanup();
  pushMock.mockReset();
});

function Harness({
  children,
  initialState,
  shell,
}: {
  readonly children: ReactNode;
  readonly initialState?: LocalNotesState;
  readonly shell: Shell;
}) {
  const [state, dispatch] = useReducer(
    localNotesReducer,
    initialState ?? createInitialLocalNotesState(),
  );
  const [service] = useState(() => createDiscoveryService(null));
  return (
    <DiscoveryServiceProvider service={service}>
      <LocalNotesProvider dispatch={dispatch} state={state}>
        <ShellPresentationProvider shell={shell}>
          {children}
        </ShellPresentationProvider>
      </LocalNotesProvider>
    </DiscoveryServiceProvider>
  );
}

function renderNotes(
  shell: Shell,
  view: NotesRouteView = { kind: "home" },
  initialState?: LocalNotesState,
) {
  return render(
    <Harness initialState={initialState} shell={shell}>
      <NotesRoute notes={noteRegistry} view={view} />
    </Harness>,
  );
}

describe("Notes applications", () => {
  it("renders the Pocket folder hierarchy and composes a local note", async () => {
    const user = userEvent.setup();
    renderNotes("pocket");

    expect(screen.getByRole("heading", { level: 1, name: "Notes" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Folders" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Project Notes/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Create new note" }));
    expect(pushMock).toHaveBeenCalledWith(expect.stringMatching(/^\/notes\/local-/));
  });

  it("reveals the hidden note through an intentional search", async () => {
    const user = userEvent.setup();
    renderNotes("pocket");

    expect(screen.queryByText("Passwords that are definitely not passwords")).not.toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search notes" }), "passwords");
    expect(screen.getByText("Passwords that are definitely not passwords")).toBeVisible();
  });

  it("edits local note title and body in Pocket without making curated notes editable", async () => {
    const user = userEvent.setup();
    const local = createLocalNote("local-edit", "2026-08-06T12:00:00.000Z");
    renderNotes(
      "pocket",
      { kind: "note", noteId: local.id },
      createInitialLocalNotesState({ localNotes: [local] }),
    );

    const title = screen.getByRole("textbox", { name: "Note title" });
    const body = screen.getByRole("textbox", { name: "Note body" });
    await user.clear(title);
    await user.type(title, "A local draft");
    await user.type(body, "Stored on this device");

    expect(title).toHaveValue("A local draft");
    expect(body).toHaveValue("Stored on this device");
  });

  it("renders desktop PC menus and refuses to rename Final_FINAL_v8", async () => {
    const user = userEvent.setup();
    renderNotes("desktop", { kind: "note", noteId: "final-final-v8" });

    expect(screen.getByRole("menubar", { name: "Pocket Notepad menu" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Folders" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(screen.getAllByText("This file is already final.").length).toBeGreaterThan(0);
  });
});
