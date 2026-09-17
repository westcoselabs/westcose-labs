import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

import { NotesRoute } from "@/components/apps/notes/NotesRoute";
import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import { ShellPresentationProvider } from "@/components/os/ShellPresentationContext";
import { noteRegistry } from "@/registry";
import type { Shell } from "@/lib/shell-selection";

afterEach(cleanup);

function renderRoutes(shell: Shell) {
  return render(
    <ShellPresentationProvider shell={shell}>
      <NotesRoute notes={noteRegistry} />
      <SettingsRoute />
    </ShellPresentationProvider>,
  );
}

describe("shell-specific route presenters", () => {
  it.each([
    ["desktop", "desktop-notepad", "desktop-settings"],
    ["pocket", "pocket-notes", "pocket-settings"],
    ["normal", "semantic-notes", "semantic-settings"],
  ] as const)(
    "selects distinct %s presenters over shared route data",
    (shell, notesPresenter, settingsPresenter) => {
      renderRoutes(shell);

      expect(
        document.querySelector(`[data-app-presenter="${notesPresenter}"]`),
      ).toBeInTheDocument();
      expect(
        document.querySelector(`[data-app-presenter="${settingsPresenter}"]`),
      ).toBeInTheDocument();
      expect(screen.getAllByText(noteRegistry[0].title).length).toBeGreaterThan(
        0,
      );
    },
  );
});
