import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ContactComposer } from "@/components/apps/ContactComposer";

describe("ContactComposer", () => {
  it("is honest when no production recipient is configured", () => {
    render(<ContactComposer recipient={null} />);

    expect(
      screen.getByRole("button", { name: "Email setup pending" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("has not supplied a production contact email");
  });

  it("validates the native handoff before opening mail", async () => {
    const user = userEvent.setup();
    render(<ContactComposer recipient="owner@example.com" />);

    await user.click(
      screen.getByRole("button", { name: "Open email application" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Complete every field",
    );
  });
});
