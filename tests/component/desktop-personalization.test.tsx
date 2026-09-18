import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: pushMock, refresh: refreshMock }),
}));

import { DesktopShell } from "@/components/desktop";
import { createDiscoveryService } from "@/lib/discovery-service";

import { AppearanceHarness, appearanceState } from "./appearance-harness";

afterEach(() => {
  cleanup();
  pushMock.mockReset();
  refreshMock.mockReset();
});

function renderDesktop(service?: ReturnType<typeof createDiscoveryService>) {
  return render(
    <AppearanceHarness service={service}>
      <DesktopShell
        onReadmeShown={() => undefined}
        onSoundToggle={() => undefined}
        pathname="/"
        routeTitle="WestCose Labs"
        settingsPanel={<div />}
        showInitialReadme={false}
        soundEnabled={false}
      />
    </AppearanceHarness>,
  );
}

const openDesktopMenu = () => {
  fireEvent.contextMenu(
    screen.getByRole("region", { name: "Desktop shortcuts" }),
    { clientX: 120, clientY: 140 },
  );
  return screen.getByRole("menu", { name: "Desktop personalization" });
};

describe("Desktop personalization", () => {
  it("offers Theme, Wallpaper, Refresh, and Appearance Settings on empty space", () => {
    renderDesktop();
    const menu = openDesktopMenu();

    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Theme",
      "Wallpaper",
      "Refresh",
      "Display / Appearance Settings",
    ]);
  });

  it("changes the wallpaper immediately from an accessible submenu", async () => {
    const user = userEvent.setup();
    renderDesktop();
    openDesktopMenu();
    expect(appearanceState()).toBe("dusk|dusk-cliffs");

    const trigger = screen.getByRole("menuitem", { name: "Wallpaper" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const submenu = screen.getByRole("menu", { name: "Wallpaper" });
    const options = within(submenu).getAllByRole("menuitemradio");
    expect(options.map((option) => option.textContent)).toEqual([
      "Dusk CliffsBundled landscape photograph",
      "Graphite FieldToken-built graphite gradient",
      "WestCose 95Teal workstation weave",
      "Tidal LightPacific light study",
    ]);
    expect(options[0]).toHaveAttribute("aria-checked", "true");

    await user.click(
      within(submenu).getByRole("menuitemradio", { name: /Graphite Field/u }),
    );
    expect(appearanceState()).toBe("dusk|graphite-field");
  });

  it("changes the theme immediately and only offers unlocked themes", async () => {
    const user = userEvent.setup();
    const service = createDiscoveryService(null);
    renderDesktop(service);
    openDesktopMenu();

    await user.click(screen.getByRole("menuitem", { name: "Theme" }));
    expect(
      within(screen.getByRole("menu", { name: "Theme" }))
        .getAllByRole("menuitemradio")
        .map((option) => option.textContent),
    ).toHaveLength(3);

    service.unlockTheme("corporate-beige");
    const beige = await screen.findByRole("menuitemradio", {
      name: /Corporate Beige/u,
    });
    await user.click(beige);
    expect(appearanceState()).toBe("corporate-beige|dusk-cliffs");
  });

  it("keeps a keyboard equivalent for right-click", () => {
    renderDesktop();
    expect(
      screen.queryByRole("menu", { name: "Desktop personalization" }),
    ).not.toBeInTheDocument();

    const icon = within(
      screen.getByRole("region", { name: "Desktop shortcuts" }),
    ).getByRole("button", { name: /Open Projects/u });
    fireEvent.keyDown(icon, { key: "F10", shiftKey: true });

    const menu = screen.getByRole("menu", { name: "Desktop personalization" });
    expect(within(menu).getByRole("menuitem", { name: "Theme" })).toBeVisible();
    expect(
      within(menu).getByRole("menuitem", { name: "Wallpaper" }),
    ).toBeVisible();
  });

  it("selects WestCose 95 from the keyboard without changing the wallpaper", async () => {
    const user = userEvent.setup();
    renderDesktop();
    openDesktopMenu();
    const trigger = screen.getByRole("menuitem", { name: "Theme" });
    trigger.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("menuitemradio", { name: /^Dusk/u })).toHaveFocus());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(appearanceState()).toBe("westcose-95|dusk-cliffs");
    expect(screen.queryByRole("menu", { name: "Theme" })).not.toBeInTheDocument();
  });

  it("opens submenus with the arrow keys", () => {
    renderDesktop();
    openDesktopMenu();
    const trigger = screen.getByRole("menuitem", { name: "Theme" });
    trigger.focus();

    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    expect(screen.getByRole("menu", { name: "Theme" })).toBeVisible();

    fireEvent.keyDown(
      screen.getAllByRole("menuitemradio")[0] as HTMLElement,
      { key: "ArrowLeft" },
    );
    expect(screen.queryByRole("menu", { name: "Theme" })).not.toBeInTheDocument();
  });

  it("routes Refresh and Appearance Settings without touching window menus", async () => {
    const user = userEvent.setup();
    renderDesktop();

    openDesktopMenu();
    await user.click(screen.getByRole("menuitem", { name: "Refresh" }));
    expect(refreshMock).toHaveBeenCalledTimes(1);

    openDesktopMenu();
    await user.click(
      screen.getByRole("menuitem", { name: "Display / Appearance Settings" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/settings/appearance");
  });

  it("leaves application windows out of desktop personalization", () => {
    render(
      <AppearanceHarness>
        <DesktopShell
          onReadmeShown={() => undefined}
          onSoundToggle={() => undefined}
          pathname="/"
          routeTitle="WestCose Labs"
          settingsPanel={<div />}
          showInitialReadme
          soundEnabled={false}
        />
      </AppearanceHarness>,
    );

    const readme = screen.getByRole("region", { name: "README.txt" });
    fireEvent.contextMenu(readme, { clientX: 300, clientY: 300 });

    expect(
      screen.queryByRole("menu", { name: "Desktop personalization" }),
    ).not.toBeInTheDocument();
  });
});
