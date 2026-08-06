import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PocketAppFrame } from "@/components/pocket";

describe("PocketAppFrame", () => {
  it("attaches overflow actions to the app header and restores focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <PocketAppFrame
        appId="projects"
        iconKey="projects"
        normalViewHref="/projects?view=normal"
        onBack={vi.fn()}
        title="Projects"
        tone="blue"
      >
        <div data-route-content><h1 tabIndex={-1}>Projects</h1></div>
      </PocketAppFrame>,
    );

    const more = screen.getByRole("button", {
      name: "More actions for Projects",
    });
    await user.click(more);
    const menu = screen.getByRole("menu");
    expect(more.closest("header")).toContainElement(menu);
    expect(
      screen.getByRole("menuitem", { name: "Open Normal View" }),
    ).toHaveAttribute("href", "/projects?view=normal");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(more).toHaveFocus();
  });
});
