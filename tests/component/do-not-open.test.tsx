import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DoNotOpen } from "@/components/apps/DoNotOpen";
import { RecycleExplorer } from "@/components/apps/RecycleExplorer";
import {
  PersonalityProvider,
  usePersonality,
} from "@/components/eggs/PersonalityProvider";
import { DiscoveryServiceProvider } from "@/components/os/DiscoveryServiceContext";
import { createDiscoveryService } from "@/lib/discovery-service";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/dynamic", () => ({
  default: () => () => <div data-testid="creature-field" />,
}));

function Commands() {
  const eggs = usePersonality();
  return (
    <>
      <button onClick={() => eggs?.runSecret("sudo update")}>Update</button>
      <button onClick={() => eggs?.runSecret("open quarantine")}>
        Quarantine command
      </button>
    </>
  );
}
function setup() {
  const discovery = createDiscoveryService(localStorage);
  const view = render(
    <DiscoveryServiceProvider service={discovery}>
      <PersonalityProvider shell="pocket">
        <div data-shell-panel="pocket">
          <DoNotOpen />
          <RecycleExplorer />
          <Commands />
        </div>
      </PersonalityProvider>
    </DiscoveryServiceProvider>,
  );
  return { ...view, discovery };
}

describe("Recycle personality lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    push.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("contains and repeats an outbreak without leftover alerts or timers", () => {
    const { unmount, discovery } = setup();
    fireEvent.click(screen.getByRole("button", { name: "DO NOT PRESS" }));
    expect(screen.getByText("WELL, FUCK.")).toBeVisible();
    expect(discovery.hasDiscovery("egg.quarantine-outbreak")).toBe(true);
    act(() => vi.advanceTimersByTime(25_000));
    expect(screen.getAllByTestId("creature-field")).toHaveLength(1);
    expect(screen.getByLabelText("WestCose system alerts")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "GET THESE FUCKERS OUT" }),
    );
    expect(screen.queryByLabelText("WestCose system alerts")).toBeNull();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.queryByTestId("creature-field")).toBeNull();
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByRole("status")).toHaveTextContent("Probably.");
    fireEvent.click(screen.getByRole("button", { name: "DO NOT PRESS" }));
    expect(screen.getAllByTestId("creature-field")).toHaveLength(1);
    // jsdom queues selectionchange at zero delay when focus moves to cleanup.
    // Flush that DOM event before checking that unmount cancels the egg timers.
    act(() => vi.advanceTimersByTime(0));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("persists and caps the final-final joke through remounts", () => {
    let view = setup();
    fireEvent.click(
      screen.getByRole("button", { name: "Restore final-final file" }),
    );
    expect(
      screen.getByText("final-final-v8-client-really-final.fig"),
    ).toBeVisible();
    view.unmount();
    view = setup();
    expect(
      screen.getByText("final-final-v8-client-really-final.fig"),
    ).toBeVisible();
    for (let i = 0; i < 5; i++)
      fireEvent.click(
        screen.getByRole("button", { name: "Restore final-final file" }),
      );
    expect(
      screen.getByText("final-final-v10-FINAL-final-use-this-one.fig"),
    ).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Version control has requested medical leave.",
    );
    expect(
      view.discovery
        .getState()
        .recycleRestorationIds.filter((id) =>
          id.startsWith("egg.final-final."),
        ),
    ).toHaveLength(3);
  });

  it("keeps keyboard focus on pest control as it upgrades and returns it after cleanup", () => {
    setup();
    const trigger = screen.getByRole("button", { name: "DO NOT PRESS" });
    trigger.focus();
    fireEvent.click(trigger);
    const cleanupButton = document.querySelector("[data-outbreak-control]");
    expect(cleanupButton).toHaveFocus();
    act(() => vi.advanceTimersByTime(25_000));
    expect(screen.getByRole("button", { name: "GET THESE FUCKERS OUT" })).toBe(cleanupButton);
    expect(cleanupButton).toHaveFocus();
    fireEvent.click(cleanupButton!);
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("button", { name: "DO NOT PRESS" })).toHaveFocus();
  });

  it("never completes the process and cancels its ticker on close", () => {
    setup();
    fireEvent.click(
      screen.getByRole("button", { name: /Restore weekend-project/ }),
    );
    for (let i = 0; i < 12; i++) {
      expect(screen.getByRole("progressbar")).not.toHaveAttribute(
        "value",
        "100",
      );
      act(() => vi.advanceTimersByTime(2900));
    }
    fireEvent.click(
      screen.getByRole("button", { name: "Close WestCose Process Monitor" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Process minimized to your subconscious.",
    );
    act(() => vi.advanceTimersByTime(7000));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("finishes the meeting, permits an early exit, and completes a cancellable fake update", () => {
    const { discovery } = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /Restore meeting-that/ }),
    );
    for (let i = 0; i < 8; i++) act(() => vi.advanceTimersByTime(1450));
    expect(screen.getByText("Meeting ended.")).toBeVisible();
    expect(screen.getByText("Nothing was decided.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Leave meeting" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Restore meeting-that/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Close Quick sync" }));
    act(() => vi.advanceTimersByTime(1));
    expect(vi.getTimerCount()).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    const values: string[] = [];
    for (let i = 0; i < 9; i++) {
      values.push(screen.getByRole("progressbar").getAttribute("value")!);
      act(() => vi.advanceTimersByTime(1450));
    }
    expect(values).toEqual([
      "3",
      "17",
      "84",
      "97",
      "31",
      "99",
      "99",
      "99",
      "100",
    ]);
    expect(
      screen.getByText("Client requested another revision."),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "OF COURSE" }));
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(discovery.hasDiscovery("egg.fake-update")).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(vi.getTimerCount()).toBe(0);
  });

  it("only directs persistent Terminal requests to quarantine on the third attempt", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Quarantine command" }));
    fireEvent.click(screen.getByRole("button", { name: "Quarantine command" }));
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Quarantine command" }));
    expect(push).toHaveBeenCalledWith("/recycle#quarantine");
  });
});
