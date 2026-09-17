import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FightClubLauncher } from "@/components/apps/FightClubLauncher";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { createDiscoveryService } from "@/lib/discovery-service";
import { fightClubRegistry } from "@/registry";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
});

describe("FightClubLauncher", () => {
  it("does not create the remote frame until Play, then exits to the launcher", async () => {
    const user = userEvent.setup();
    const service = createDiscoveryService(null);
    render(
      <DiscoveryServiceProvider service={service}>
        <FightClubLauncher />
      </DiscoveryServiceProvider>,
    );

    expect(screen.queryByTitle("Citryn Fight Club hosted game")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Controls" }));
    expect(screen.getByText(/A\/D move/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Play" }));
    const frame = screen.getByTitle("Citryn Fight Club hosted game");
    expect(frame).toHaveAttribute("src", fightClubRegistry[0].hostedBuild.embedUrl);
    expect(frame).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox",
    );
    expect(service.getState().counters.fightClubLaunches).toBe(1);
    expect(service.getState().fightClubAchievementIds).toContain(
      "fightclub.first-launch",
    );

    fireEvent.load(frame);
    expect(screen.getByText("Hosted build loaded.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Exit" }));
    await waitFor(() =>
      expect(screen.queryByTitle("Citryn Fight Club hosted game")).not.toBeInTheDocument(),
    );
    expect(service.getState().fightClubAchievementIds).toContain(
      "fightclub.returned-to-os",
    );
    expect(screen.getByRole("button", { name: "Play" })).toHaveFocus();
  });

  it("records full screen only after the OS control succeeds", async () => {
    const user = userEvent.setup();
    const service = createDiscoveryService(null);
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });

    render(
      <DiscoveryServiceProvider service={service}>
        <FightClubLauncher />
      </DiscoveryServiceProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByRole("button", { name: "Full Screen" }));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(service.getState().fightClubAchievementIds).toContain(
      "fightclub.fullscreen",
    );
  });
});
