import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameHost } from "@/components/apps/games/GameHost";
import { FightClubLauncher } from "@/components/apps/FightClubLauncher";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { createDiscoveryService } from "@/lib/discovery-service";
import { fightClubRegistry } from "@/registry";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete (HTMLElement.prototype as Partial<HTMLElement>).requestFullscreen;
});

describe("FightClubLauncher", () => {
  it("keeps viewport play and achievements honest when fullscreen is declined", async () => {
    const service = createDiscoveryService(null);
    const requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error("User declined fullscreen"));
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    render(
      <DiscoveryServiceProvider service={service}>
        <GameHost>
          <FightClubLauncher />
        </GameHost>
      </DiscoveryServiceProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Start game" }));
    expect(
      screen.getByTitle("Citryn Fight Club hosted game"),
    ).toBeInTheDocument();
    expect(service.getState().fightClubAchievementIds).not.toContain(
      "fightclub.fullscreen",
    );
    expect(screen.getByRole("button", { name: "Exit to Games" })).toBeVisible();
  });

  it("offers retry and external launch after a stalled iframe and recovers on load", () => {
    vi.useFakeTimers();
    render(
      <GameHost>
        <FightClubLauncher />
      </GameHost>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    const firstFrame = screen.getByTitle("Citryn Fight Club hosted game");
    expect(screen.getByText("Stepping into the ring…")).toBeVisible();
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByText("The ring is taking a while.")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Open hosted build/ }),
    ).toHaveAttribute("href", fightClubRegistry[0].hostedBuild.launchUrl);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    const nextFrame = screen.getByTitle("Citryn Fight Club hosted game");
    expect(nextFrame).not.toBe(firstFrame);
    fireEvent.load(nextFrame);
    expect(screen.getByText("Hosted build loaded.")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("does not create the remote frame until Play, then exits to the launcher", async () => {
    const user = userEvent.setup();
    const service = createDiscoveryService(null);
    render(
      <DiscoveryServiceProvider service={service}>
        <GameHost>
          <FightClubLauncher />
        </GameHost>
      </DiscoveryServiceProvider>,
    );

    expect(
      screen.queryByTitle("Citryn Fight Club hosted game"),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Controls" }));
    expect(screen.getByText(/A\/D move/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Start game" }));
    const frame = screen.getByTitle("Citryn Fight Club hosted game");
    expect(frame).toHaveAttribute(
      "src",
      fightClubRegistry[0].hostedBuild.embedUrl,
    );
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
    await user.click(screen.getByRole("button", { name: "Back to menu" }));
    await waitFor(() =>
      expect(
        screen.queryByTitle("Citryn Fight Club hosted game"),
      ).not.toBeInTheDocument(),
    );
    expect(service.getState().fightClubAchievementIds).toContain(
      "fightclub.returned-to-os",
    );
    expect(screen.getByRole("button", { name: "Start game" })).toHaveFocus();
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
        <GameHost>
          <FightClubLauncher />
        </GameHost>
      </DiscoveryServiceProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Start game" }));
    await waitFor(() => expect(requestFullscreen).toHaveBeenCalledTimes(1));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(service.getState().fightClubAchievementIds).toContain(
      "fightclub.fullscreen",
    );
  });
});
