import { expect, test } from "@playwright/test";

test.beforeEach(async ({ browserName, page }, testInfo) => {
  test.skip(
    browserName !== "chromium" || testInfo.project.name !== "chromium",
    "Desktop Chromium baselines",
  );
  await page.clock.setFixedTime(new Date("2009-09-09T16:09:00.000Z"));
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("desktop root visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?view=os");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("desktop-root.png", {
    animations: "disabled",
    mask: [page.getByRole("complementary", { name: "Clock and date" })],
    maxDiffPixelRatio: 0.01,
  });
});

test("Pocket lock visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=os");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("pocket-lock.png", {
    animations: "disabled",
    mask: [page.locator("#lock-time")],
    maxDiffPixelRatio: 0.01,
  });
});

test("Normal project visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/projects/estate-sales-bakersfield?view=normal");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("normal-project.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  });
});
