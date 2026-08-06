import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ActiveSurface,
  PressableSurface,
  SurfaceRaised,
  SurfaceRecessed,
} from "@/components/ui";

describe("material surfaces", () => {
  it("exposes semantic material states", () => {
    render(
      <>
        <SurfaceRaised data-testid="raised">Raised</SurfaceRaised>
        <SurfaceRecessed data-testid="recessed">Recessed</SurfaceRecessed>
        <ActiveSurface data-testid="active">Active</ActiveSurface>
      </>,
    );

    expect(screen.getByTestId("raised")).toHaveAttribute("data-surface", "raised");
    expect(screen.getByTestId("recessed")).toHaveAttribute(
      "data-surface",
      "recessed",
    );
    expect(screen.getByTestId("active")).toHaveAttribute("data-selected", "true");
  });

  it("keeps a pressable surface keyboard-native", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <PressableSurface onClick={onClick} selected>
        Open
      </PressableSurface>,
    );

    const button = screen.getByRole("button", { name: "Open" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
});
