import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ContactComposer } from "@/components/apps/ContactComposer";

afterEach(cleanup);

describe("ContactComposer", () => {
  it("is honest when no production recipient is configured", () => {
    render(<ContactComposer recipient={null} />);

    expect(
      screen.getByRole("button", { name: "Open email draft" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Nothing is sent or stored");
  });

  it("validates the native handoff before opening mail", async () => {
    const user = userEvent.setup();
    render(<ContactComposer recipient="owner@example.com" />);

    await user.click(
      screen.getByRole("button", { name: "Open email draft" }),
    );
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "Your email" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "A few details need a second look",
    );
  });
});
