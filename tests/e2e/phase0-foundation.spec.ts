import { expect, test } from "@playwright/test";

test.describe("Phase 0 local-state migration", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Focused storage coverage runs once");
  });

  test("migrates legacy preferences without reviving stored Normal View", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("phase0-preferences-seeded")) return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("phase0-preferences-seeded", "true");
      localStorage.setItem(
        "wcl.preferences.v1",
        JSON.stringify({
          version: 1,
          data: {
            displayPreference: "normal",
            extraReducedMotion: true,
            highContrast: true,
            soundEnabled: true,
            themeId: "dusk",
          },
        }),
      );
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    await expect(page.locator("html")).toHaveAttribute(
      "data-high-contrast",
      "true",
    );
    await expect(page.locator("html")).toHaveAttribute(
      "data-reduced-motion",
      "true",
    );

    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("wcl.preferences.v2");
          return raw ? JSON.parse(raw) : null;
        }),
      )
      .toMatchObject({
        version: 2,
        data: {
          displayPreference: "auto",
          extraReducedMotion: true,
          highContrast: true,
          soundEnabled: true,
          themeId: "dusk",
        },
      });

    expect(
      await page.evaluate(() => localStorage.getItem("wcl.preferences.v1")),
    ).not.toBeNull();
  });

  test("initializes isolated stores and preserves local notes across reload", async ({
    page,
  }) => {
    const note = {
      id: "local-phase-zero",
      title: "Phase 0 survives",
      body: "Local-only fixture",
      folderId: "all-notes",
      createdAt: "2026-08-06T00:00:00.000Z",
      updatedAt: "2026-08-06T00:00:00.000Z",
      pinned: false,
    };

    await page.addInitScript((localNote) => {
      if (sessionStorage.getItem("phase0-notes-seeded")) return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("phase0-notes-seeded", "true");
      localStorage.setItem(
        "wcl.local-notes.v1",
        JSON.stringify({ version: 1, data: [localNote] }),
      );
    }, note);

    await page.goto("/?view=os");
    await expect
      .poll(() =>
        page.evaluate(() => ({
          discoveries: localStorage.getItem("wcl.discoveries.v1"),
          notes: localStorage.getItem("wcl.local-notes.v1"),
          overrides: localStorage.getItem("wcl.note-overrides.v1"),
          preferences: localStorage.getItem("wcl.preferences.v2"),
          session: sessionStorage.getItem("wcl.session.v2"),
        })),
      )
      .toMatchObject({
        discoveries: expect.any(String),
        notes: expect.any(String),
        overrides: expect.any(String),
        preferences: expect.any(String),
        session: expect.any(String),
      });

    await page.reload();
    const storedNotes = await page.evaluate(() => {
      const raw = localStorage.getItem("wcl.local-notes.v1");
      return raw ? JSON.parse(raw) : null;
    });
    expect(storedNotes).toEqual({ version: 1, data: [note] });
  });

  test("persists an existing discovery moment across refresh", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("phase0-discovery-seeded")) return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("phase0-discovery-seeded", "true");
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await page.getByRole("button", { name: "Tap to unlock" }).click();

    const status = page.getByRole("button", { name: "Build stable enough" });
    for (let tap = 0; tap < 5; tap += 1) await status.click();

    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("wcl.discoveries.v1");
          if (!raw) return [];
          return JSON.parse(raw).data.discoveredSecretIds as string[];
        }),
      )
      .toContain("desktop.labs-status");

    await page.reload();
    expect(
      await page.evaluate(() => {
        const raw = localStorage.getItem("wcl.discoveries.v1");
        return raw
          ? (JSON.parse(raw).data.discoveredSecretIds as string[])
          : [];
      }),
    ).toContain("desktop.labs-status");
  });

  test("renders when browser storage areas are unavailable", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.addInitScript(() => {
      for (const key of ["localStorage", "sessionStorage"] as const) {
        Object.defineProperty(window, key, {
          configurable: true,
          get: () => {
            throw new DOMException("blocked", "SecurityError");
          },
        });
      }
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/projects?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    await expect(
      page.getByRole("heading", { level: 1, name: "Projects" }),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});

test("serves a complete semantic direct route without JavaScript", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Focused no-JavaScript coverage runs once");
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  try {
    await page.goto("/projects/estate-sales-bakersfield");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Estate Sales Bakersfield",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByText(/normal view/iu)).toHaveCount(0);
  } finally {
    await context.close();
  }
});
