import { expect, test } from "@playwright/test";

test.describe("Phase 2 Settings", () => {
  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused Settings coverage runs once");
    await page.addInitScript(() => {
      if (sessionStorage.getItem("phase2-settings-seeded")) return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("phase2-settings-seeded", "true");
      sessionStorage.setItem(
        "wcl.session.v2",
        JSON.stringify({
          version: 2,
          data: {
            readmeShown: true,
            startupPlayed: true,
            unlocked: true,
            page: 0,
            originPage: null,
            dismissedNotificationIds: [],
          },
        }),
      );
    });
  });

  test("uses the Pocket hierarchy and keeps maximum-tolerance discoveries earned", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/settings?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByText("WestCose Pocket")).toBeVisible();
    await expect(page.getByText(/Normal View/iu)).toHaveCount(0);

    await page.getByRole("button", { name: /Personality/ }).click();
    await expect(page).toHaveURL("/settings/personality");
    const tolerance = page.getByRole("slider", { name: "Tolerance for bad ideas" });
    await tolerance.fill("100");
    await expect(page.getByText("Tolerance maximized. Corporate Beige is now available for consequences.")).toBeVisible();
    await tolerance.fill("20");

    const persisted = await page.evaluate(() => {
      const raw = localStorage.getItem("wcl.discoveries.v1");
      return raw ? JSON.parse(raw).data : null;
    });
    expect(persisted.discoveredSecretIds).toContain("settings.bad-ideas-max");
    expect(persisted.unlockedThemeIds).toContain("corporate-beige");

    await page.goto("/settings/appearance?view=os");
    await expect(page.getByRole("combobox", { name: "Theme" }).getByRole("option", { name: "Corporate Beige" })).toHaveCount(1);
  });

  test("shows grouped discovery hints without revealing exact instructions", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/settings/discoveries?view=os");

    await expect(page.getByRole("heading", { level: 1, name: "Discoveries" })).toBeVisible();
    for (const group of ["System", "Notes", "Terminal", "Recycle", "FightClub", "Themes"]) {
      await expect(page.getByRole("heading", { name: group })).toBeVisible();
    }
    await expect(page.getByText("Something is hidden in Notes.").first()).toBeVisible();
    await expect(page.getByText(/five opens/iu)).toHaveCount(0);
  });

  test("renders Desktop Control Panel conventions and persists accessibility choices", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings/appearance?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    const settings = page.locator('[data-app-presenter="desktop-settings"]');
    await expect(settings.getByRole("searchbox", { name: "Search settings" })).toBeVisible();
    await expect(settings.getByRole("navigation", { name: "Settings categories" })).toBeVisible();
    await expect(settings.getByText("WestCose Labs Workstation")).toBeVisible();
    await expect(settings.getByText("WestCose Pocket")).toHaveCount(0);

    await settings
      .getByRole("checkbox", { name: "High contrast" })
      .locator("..")
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
  });

  test("requires confirmation before clearing local notes", async ({ page }) => {
    await page.addInitScript(() => {
      if (localStorage.getItem("wcl.local-notes.v1")) return;
      localStorage.setItem(
        "wcl.local-notes.v1",
        JSON.stringify({
          version: 1,
          data: [
            {
              id: "reset-proof",
              title: "Reset proof",
              body: "Keep until confirmed",
              folderId: "project-notes",
              createdAt: "2026-08-06T12:00:00.000Z",
              updatedAt: "2026-08-06T12:00:00.000Z",
              pinned: false,
            },
          ],
        }),
      );
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings/system?view=os");
    const settings = page.locator('[data-app-presenter="desktop-settings"]');

    page.once("dialog", (dialog) => dialog.dismiss());
    await settings.getByRole("button", { name: "Clear Local Notes" }).click();
    expect(await page.evaluate(() => localStorage.getItem("wcl.local-notes.v1"))).toContain("reset-proof");

    page.once("dialog", (dialog) => dialog.accept());
    await settings.getByRole("button", { name: "Clear Local Notes" }).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = localStorage.getItem("wcl.local-notes.v1");
          return raw ? JSON.parse(raw).data : null;
        }),
      )
      .toEqual([]);
  });
});
