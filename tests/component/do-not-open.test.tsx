import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DoNotOpen } from "@/components/apps/DoNotOpen";

describe("DoNotOpen", () => {
  it("reveals and dismisses the harmless Recycle item", async () => {
    const user = userEvent.setup();
    render(<DoNotOpen />);

    await user.click(
      screen.getByRole("button", {
        name: "Do not open definitely-not-a-theme.zip",
      }),
    );
    expect(screen.getByText("Nothing escaped.")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Return it to Recycle" }),
    );
    expect(screen.queryByText("Nothing escaped.")).not.toBeInTheDocument();
  });
});
