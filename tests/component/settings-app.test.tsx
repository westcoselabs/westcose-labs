import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useReducer, useState, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: pushMock }),
}));

import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { SettingsProvider } from "@/components/os/SettingsContext";
import { ShellPresentationProvider } from "@/components/os/ShellPresentationContext";
import { createDiscoveryService, type DiscoveryService } from "@/lib/discovery-service";
import {
  createInitialPreferences,
  preferencesReducer,
} from "@/state/preferences";
import type { Shell } from "@/lib/shell-selection";
import type { SettingsRouteView } from "@/components/apps/settings/useSettingsController";

afterEach(() => {
  cleanup();
  pushMock.mockReset();
});

function Harness({
  children,
  service: providedService,
}: {
  readonly children: ReactNode;
  readonly service?: DiscoveryService;
}) {
  const [preferences, dispatch] = useReducer(
    preferencesReducer,
    undefined,
    createInitialPreferences,
  );
  const [service] = useState(
    () => providedService ?? createDiscoveryService(null),
  );
  const noop = vi.fn();

  return (
    <DiscoveryServiceProvider service={service}>
      <SettingsProvider
        value={{
          dispatch,
          effectiveAccessibility: {
            highContrast: preferences.highContrast,
            reducedMotion: preferences.extraReducedMotion,
          },
          lockPocket: noop,
          preferences,
          previewLock: noop,
          replayStartup: noop,
          resetAllLocalState: noop,
          resetDiscoveries: noop,
          resetLocalNotes: noop,
          resetPreferences: noop,
          resetSession: noop,
        }}
      >
        {children}
      </SettingsProvider>
    </DiscoveryServiceProvider>
  );
}

function Presenter({
  shell,
  view,
}: {
  readonly shell: Shell;
  readonly view?: SettingsRouteView;
}) {
  return (
    <ShellPresentationProvider shell={shell}>
      <SettingsRoute view={view} />
    </ShellPresentationProvider>
  );
}

describe("Settings applications", () => {
  it("renders a Pocket device hierarchy without a Normal View control", async () => {
    const user = userEvent.setup();
    render(<Harness><Presenter shell="pocket" /></Harness>);

    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    expect(screen.getByText("WestCose Pocket")).toBeVisible();
    expect(screen.queryByText(/Normal View/iu)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Personality/ }));
    expect(pushMock).toHaveBeenCalledWith("/settings/personality");
  });

  it("unlocks Corporate Beige at maximum tolerance and keeps the discovery earned", () => {
    const service = createDiscoveryService(null);
    render(
      <Harness service={service}>
        <Presenter
          shell="pocket"
          view={{ kind: "category", categoryId: "personality" }}
        />
      </Harness>,
    );

    const slider = screen.getByRole("slider", { name: "Tolerance for bad ideas" });
    fireEvent.change(slider, { target: { value: "100" } });
    expect(screen.getByText("Tolerance maximized. Corporate Beige is now available for consequences.")).toBeVisible();
    expect(service.getState().discoveredSecretIds).toContain("settings.bad-ideas-max");
    expect(service.getState().unlockedThemeIds).toContain("corporate-beige");

    fireEvent.change(slider, { target: { value: "20" } });
    expect(service.getState().discoveredSecretIds).toContain("settings.bad-ideas-max");
  });

  it("uses the approved automatic-update description in Pocket System", () => {
    render(
      <Harness>
        <Presenter
          shell="pocket"
          view={{ kind: "category", categoryId: "system" }}
        />
      </Harness>,
    );

    expect(screen.getByText("Installs redesigns while you sleep")).toBeVisible();
  });

  it("renders a desktop control panel with search, sidebar, and system summary", () => {
    render(<Harness><Presenter shell="desktop" /></Harness>);

    const desktop = document.querySelector('[data-app-presenter="desktop-settings"]');
    expect(desktop).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search settings" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Settings categories" })).toBeVisible();
    expect(screen.getAllByText("WestCose Labs Workstation").length).toBeGreaterThan(0);
    expect(document.querySelector('[data-app-presenter="pocket-settings"]')).not.toBeInTheDocument();
  });

  it("shows grouped undiscovered entries without revealing exact instructions", () => {
    render(
      <Harness>
        <Presenter
          shell="desktop"
          view={{ kind: "category", categoryId: "discoveries" }}
        />
      </Harness>,
    );

    expect(screen.getByRole("heading", { name: /^Notes$/u })).toBeVisible();
    expect(screen.getAllByText("???").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Something is hidden in Notes.").length).toBeGreaterThan(0);
    expect(screen.queryByText(/five opens/iu)).not.toBeInTheDocument();
  });
});
