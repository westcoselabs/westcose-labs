import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: pushMock }),
}));

import { SettingsRoute } from "@/components/apps/settings/SettingsRoute";
import { ShellPresentationProvider } from "@/components/os/ShellPresentationContext";
import { createDiscoveryService } from "@/lib/discovery-service";
import type { Shell } from "@/lib/shell-selection";

import { AppearanceHarness, appearanceState } from "./appearance-harness";

afterEach(() => {
  cleanup();
  pushMock.mockReset();
});

function renderAppearance(
  shell: Shell,
  service?: ReturnType<typeof createDiscoveryService>,
) {
  return render(
    <AppearanceHarness service={service}>
      <ShellPresentationProvider shell={shell}>
        <SettingsRoute view={{ kind: "category", categoryId: "appearance" }} />
      </ShellPresentationProvider>
    </AppearanceHarness>,
  );
}

describe("Settings appearance", () => {
  it.each(["desktop", "pocket"] as const)("selects Liquid Glass and its optional recommendation on %s", (shell) => {
    renderAppearance(shell);
    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), { target: { value: "liquid-glass" } });
    expect(appearanceState()).toBe("liquid-glass|dusk-cliffs");
    fireEvent.click(screen.getByRole("button", { name: "Use recommended wallpaper" }));
    expect(appearanceState()).toBe("liquid-glass|liquid-glass");
    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), { target: { value: "dusk" } });
    expect(appearanceState()).toBe("dusk|liquid-glass");
  });
  it("offers the same wallpaper choices on Desktop as the context menu", () => {
    renderAppearance("desktop");

    const group = screen.getByRole("radiogroup", { name: "Wallpaper" });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((option) => option.textContent),
    ).toEqual([
      "Dusk CliffsBundled landscape photograph",
      "Graphite FieldToken-built graphite gradient",
      "WestCose 95Teal workstation weave",
      "Tidal LightPacific light study",
    ]);

    fireEvent.click(within(group).getByRole("radio", { name: /Graphite Field/u }));
    expect(appearanceState()).toBe("dusk|graphite-field");
  });

  it("gives Pocket a visible Settings route to the same controls", () => {
    renderAppearance("pocket");

    expect(screen.getByRole("combobox", { name: "Theme" })).toBeVisible();
    const group = screen.getByRole("radiogroup", { name: "Wallpaper" });
    fireEvent.click(within(group).getByRole("radio", { name: /Graphite Field/u }));

    expect(appearanceState()).toBe("dusk|graphite-field");
    expect(
      within(group).getByRole("radio", { name: /Graphite Field/u }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("changes the theme from the shared Settings control", () => {
    const service = createDiscoveryService(null);
    renderAppearance("desktop", service);
    act(() => service.unlockTheme("corporate-beige"));

    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), {
      target: { value: "corporate-beige" },
    });
    expect(appearanceState()).toBe("corporate-beige|dusk-cliffs");
  });

  it("reveals hidden appearance entries only after the shared unlock", () => {
    const service = createDiscoveryService(null);
    renderAppearance("desktop", service);

    expect(
      within(screen.getByRole("combobox", { name: "Theme" })).queryAllByRole(
        "option",
      ),
    ).toHaveLength(3);
    expect(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getAllByRole(
        "radio",
      ),
    ).toHaveLength(4);

    act(() => {
      service.unlockTheme("corporate-beige");
      service.unlockWallpaper("standard-issue");
    });

    expect(
      within(screen.getByRole("combobox", { name: "Theme" })).getAllByRole(
        "option",
      ),
    ).toHaveLength(4);
    expect(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getAllByRole(
        "radio",
      ),
    ).toHaveLength(5);
  });

  it("recovers a persisted appearance the registry no longer offers", () => {
    const service = createDiscoveryService(null);
    renderAppearance("desktop", service);
    act(() => {
      service.unlockTheme("corporate-beige");
      service.unlockWallpaper("standard-issue");
    });

    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), {
      target: { value: "corporate-beige" },
    });
    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getByRole(
        "radio",
        { name: /Standard Issue/u },
      ),
    );
    expect(appearanceState()).toBe("corporate-beige|standard-issue");

    // Resetting discoveries re-locks both, and the controls fall back rather
    // than showing a selection that is no longer available.
    act(() => service.reset());
    expect(appearanceState()).toBe("dusk|dusk-cliffs");
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveValue("dusk");
    expect(
      within(screen.getByRole("radiogroup", { name: "Wallpaper" })).getByRole(
        "radio",
        { name: /Dusk Cliffs/u },
      ),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the accessibility controls beside the theme controls", () => {
    renderAppearance("desktop");

    expect(screen.getByRole("checkbox", { name: "High contrast" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Icon lighting" })).toBeVisible();
  });

  it.each(["desktop", "pocket"] as const)("offers the recommended wallpaper as an independent opt-in on %s", (shell) => {
    renderAppearance(shell);
    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), {
      target: { value: "westcose-95" },
    });
    expect(appearanceState()).toBe("westcose-95|dusk-cliffs");
    expect(screen.getByText(/Recommended for WestCose 95/u)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Use recommended wallpaper" }));
    expect(appearanceState()).toBe("westcose-95|westcose-95");
    fireEvent.change(screen.getByRole("combobox", { name: "Theme" }), {
      target: { value: "dusk" },
    });
    expect(appearanceState()).toBe("dusk|westcose-95");
  });
});
