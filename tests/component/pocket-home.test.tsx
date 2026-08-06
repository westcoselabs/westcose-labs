import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PocketHome, type PocketAppItem } from "@/components/pocket";

const app = (id: string): PocketAppItem => ({
  accessibilityLabel: `Open ${id}`,
  iconKey: id,
  id,
  label: id,
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
          normalViewHref="/?view=normal"
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
});
