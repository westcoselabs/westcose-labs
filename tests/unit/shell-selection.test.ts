import { describe, expect, it } from "vitest";

import {
  NO_JAVASCRIPT_SHELL,
  resolveShell,
  selectAutomaticShell,
} from "../../src/lib/shell-selection";

describe("shell selection precedence", () => {
  it("defines Normal as the no-JavaScript shell", () => {
    expect(NO_JAVASCRIPT_SHELL).toBe("normal");
  });

  it("selects Pocket below 768px regardless of pointer", () => {
    expect(selectAutomaticShell(767, false)).toBe("pocket");
    expect(selectAutomaticShell(768, false)).toBe("desktop");
  });

  it("selects Pocket below 1024px for a coarse primary pointer", () => {
    expect(selectAutomaticShell(1023, true)).toBe("pocket");
    expect(selectAutomaticShell(1024, true)).toBe("desktop");
  });

  it("lets view=normal override every stored preference", () => {
    expect(
      resolveShell({
        view: "normal",
        storedPreference: "desktop",
        viewportWidth: 1440,
        coarsePointer: false,
      }),
    ).toMatchObject({ shell: "normal", source: "query" });
  });

  it("lets view=os force automatic OS selection and ignore a stored shell", () => {
    expect(
      resolveShell({
        view: "os",
        storedPreference: "desktop",
        viewportWidth: 390,
        coarsePointer: true,
      }),
    ).toMatchObject({ shell: "pocket", source: "query" });
  });

  it("applies a stored display preference when there is no valid override", () => {
    expect(
      resolveShell({
        view: "unexpected",
        storedPreference: "desktop",
        viewportWidth: 390,
        coarsePointer: true,
      }),
    ).toMatchObject({ shell: "desktop", source: "preference" });
  });

  it("uses a route-scoped Normal fallback without changing the request", () => {
    expect(
      resolveShell({
        storedPreference: "pocket",
        viewportWidth: 390,
        coarsePointer: true,
        availability: { desktop: true, pocket: false, normal: true },
      }),
    ).toEqual({
      shell: "normal",
      requestedShell: "pocket",
      source: "route-fallback",
      routeFallback: true,
    });
  });
});

