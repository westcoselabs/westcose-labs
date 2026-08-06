import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PocketHome, type PocketAppItem } from "@/components/pocket";
import { personalityRegistry } from "@/registry";

const app = (id: string): PocketAppItem => ({
  accessibilityLabel: `Open ${id}`,
  iconKey: id,
  id,
  label: id,
  tone: "blue",
});

afterEach(() => vi.restoreAllMocks());

describe("PocketHome", () => {
  it("moves to Page Two without feeding the starting scroll position back", async () => {
    const scrollTo = vi.fn();
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.getAttribute("aria-label") === "Home pages" ? 390 : 0;
      },
    );
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo;

    function Harness() {
      const [page, setPage] = useState<0 | 1>(0);
      return (
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
          onOpenAppMenu={() => undefined}
          onPageChange={setPage}
          page={page}
          pageOneApps={[app("experiments")]}
          pageTwoApps={[app("fightclub"), app("recycle")]}
          reducedMotion={false}
        />
      );
    }

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(
      screen.getByRole("button", { name: "Go to Home Page 2" }),
    );

    expect(scrollTo).toHaveBeenLastCalledWith({
      behavior: "smooth",
      left: 390,
    });
    expect(
      screen.getByRole("button", { name: "Go to Home Page 2" }),
    ).toHaveAttribute("aria-current", "page");
    HTMLElement.prototype.scrollTo = originalScrollTo;
  });

  it("keeps time quiet and reveals the safe Labs Status discovery", async () => {
    const user = userEvent.setup();
    render(
      <PocketHome
        dockApps={[app("projects"), app("games"), app("messages"), app("phone")]}
        featuredProject={{
          appId: "projects",
          description: "Fixture",
          title: "WestCose Labs OS",
        }}
        labsStatus={{ detail: "Ready", label: "Build stable enough" }}
        onCloseAppMenu={() => undefined}
        onLaunchApp={() => undefined}
        onOpenAppMenu={() => undefined}
        onPageChange={() => undefined}
        page={0}
        pageOneApps={[app("settings")]}
        pageTwoApps={[app("fightclub"), app("recycle")]}
        reducedMotion
      />,
    );

    const status = screen.getByRole("button", { name: "Build stable enough" });
    const time = document.querySelector("strong");
    expect(time).not.toHaveAttribute("aria-live");
    expect(screen.queryByText("Normal View")).not.toBeInTheDocument();

    for (let tap = 0; tap < 5; tap += 1) await user.click(status);
    expect(
      screen.getByText(personalityRegistry.discoveries.labsStatus),
    ).toBeVisible();
  });
});
