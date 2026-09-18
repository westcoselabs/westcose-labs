import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PocketHome, type PocketAppItem } from "@/components/pocket";
import { createDiscoveryService } from "@/lib/discovery-service";

import { AppearanceHarness, appearanceState } from "./appearance-harness";

const app = (id: string): PocketAppItem => ({
  accessibilityLabel: `Open ${id}`,
  iconKey: id,
  id,
  label: id,
  tone: "blue",
});

const openAppearanceSettings = vi.fn();

function renderHome(service?: ReturnType<typeof createDiscoveryService>) {
  return render(
    <AppearanceHarness service={service}>
      <PocketHome
        dockApps={[app("projects"), app("games"), app("messages"), app("phone")]}
        featuredProject={{
          appId: "projects",
          description: "Fixture",
          title: "Project",
        }}
        labsStatus={{ detail: "Ready", label: "Online" }}
        onCloseAppMenu={() => undefined}
        onLaunchApp={() => undefined}
        onOpenAppearanceSettings={openAppearanceSettings}
        onOpenAppMenu={() => undefined}
        onPageChange={() => undefined}
        page={0}
        pageOneApps={[app("experiments")]}
        pageTwoApps={[app("fightclub"), app("recycle")]}
        reducedMotion
      />
    </AppearanceHarness>,
  );
}

const longPress = (pageLabel: string) => {
  const page = screen.getByRole("region", { name: pageLabel });
  fireEvent.pointerDown(page, { clientX: 40, clientY: 320, button: 0 });
  act(() => {
    vi.advanceTimersByTime(600);
  });
  return page;
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  openAppearanceSettings.mockReset();
});

describe("Pocket customization", () => {
  it("opens Customize from a long press on either home page", () => {
    renderHome();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    longPress("Home Page One");
    expect(
      screen.getByRole("dialog", { name: "Customize" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    longPress("Home Page Two");
    expect(screen.getByRole("dialog", { name: "Customize" })).toBeVisible();
  });

  it("does not open from a tap or a swipe", () => {
    renderHome();
    const page = screen.getByRole("region", { name: "Home Page One" });

    fireEvent.pointerDown(page, { clientX: 40, clientY: 320, button: 0 });
    fireEvent.pointerUp(page, { clientX: 40, clientY: 320 });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.pointerDown(page, { clientX: 300, clientY: 320, button: 0 });
    fireEvent.pointerMove(page, { clientX: 80, clientY: 320 });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers Theme, Wallpaper, and Appearance Settings without a desktop menu", () => {
    renderHome();
    longPress("Home Page One");
    const dialog = screen.getByRole("dialog", { name: "Customize" });

    expect(within(dialog).getByRole("tab", { name: "Theme" })).toBeVisible();
    expect(within(dialog).getByRole("tab", { name: "Wallpaper" })).toBeVisible();
    expect(
      within(dialog).getByRole("button", { name: "Appearance Settings" }),
    ).toBeVisible();
    expect(within(dialog).queryAllByRole("menuitem")).toHaveLength(0);
  });

  it("switches the wallpaper immediately and shares the desktop selection", () => {
    renderHome();
    longPress("Home Page One");
    expect(appearanceState()).toBe("dusk|dusk-cliffs");

    const group = screen.getByRole("radiogroup", { name: "Wallpaper" });
    const options = within(group).getAllByRole("radio");
    expect(options.map((option) => option.textContent)).toEqual([
      "Dusk CliffsThe bundled WestCose landscape shipped with the Dusk system.",
      "Graphite FieldA quiet token-built gradient for people who would rather read the windows.",
      "WestCose 95Optimized for CRTs and bad financial decisions.",
      "Tidal LightPacific light, held in suspension. No oceanfront rent required.",
    ]);
    expect(options[0]).toHaveAttribute("aria-checked", "true");

    fireEvent.click(
      within(group).getByRole("radio", { name: /Graphite Field/u }),
    );
    expect(appearanceState()).toBe("dusk|graphite-field");
    expect(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getByRole(
        "radio",
        { name: /Graphite Field/u },
      ),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("only offers a hidden wallpaper once the shared discovery unlocks it", () => {
    const service = createDiscoveryService(null);
    renderHome(service);
    longPress("Home Page One");

    expect(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getAllByRole(
        "radio",
      ),
    ).toHaveLength(4);

    act(() => service.unlockWallpaper("standard-issue"));
    const options = within(
      screen.getByRole("radiogroup", { name: "Wallpaper" }),
    ).getAllByRole("radio");
    expect(options).toHaveLength(5);
    expect(options[4]?.textContent).toContain("Standard Issue");
  });

  it("switches the theme from the Theme tab", () => {
    const service = createDiscoveryService(null);
    renderHome(service);
    act(() => service.unlockTheme("corporate-beige"));
    longPress("Home Page One");

    fireEvent.click(screen.getByRole("tab", { name: "Theme" }));
    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: "Theme" })).getByRole(
        "radio",
        { name: /Corporate Beige/u },
      ),
    );
    expect(appearanceState()).toBe("corporate-beige|dusk-cliffs");
  });

  it("selects WestCose 95 after a long press and switches back to Dusk", () => {
    renderHome();
    longPress("Home Page One");
    fireEvent.click(screen.getByRole("tab", { name: "Theme" }));
    fireEvent.click(screen.getByRole("radio", { name: /WestCose 95/u }));
    expect(appearanceState()).toBe("westcose-95|dusk-cliffs");
    fireEvent.click(screen.getByRole("radio", { name: /^Dusk/u }));
    expect(appearanceState()).toBe("dusk|dusk-cliffs");
  });

  it("reaches Customize without a long press and routes to Appearance Settings", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderHome();

    await user.click(
      screen.getByRole("button", { name: "Customize Home Screen" }),
    );
    expect(screen.getByRole("dialog", { name: "Customize" })).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Appearance Settings" }),
    );
    expect(openAppearanceSettings).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the Customize control", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    renderHome();
    const trigger = screen.getByRole("button", { name: "Customize Home Screen" });

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Customize" })).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
