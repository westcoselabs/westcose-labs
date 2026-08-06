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
    mask: [page.getByRole("complementary", { name: "Desktop build status" })],
    maxDiffPixelRatio: 0.01,
  });
});

test("desktop Projects window visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "wcl.session.v1",
      JSON.stringify({
        version: 1,
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
  await page.goto("/projects?view=os");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("desktop-projects.png", {
    animations: "disabled",
    mask: [page.getByRole("complementary", { name: "Desktop build status" })],
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

test("Pocket Home Page One visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Tap to unlock" }).click();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("pocket-home-one.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});

test("Pocket Home Page Two visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Tap to unlock" }).click();
  await page.getByRole("button", { name: "Go to Home Page 2" }).click();
  await expect
    .poll(() =>
      page
        .locator('[aria-label="Home pages"]')
        .evaluate((element) => element.scrollLeft),
    )
    .toBeGreaterThan(300);
  await expect(page).toHaveScreenshot("pocket-home-two.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});

test("Pocket Projects app visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects?view=os");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("pocket-projects.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
  });
});

test("Normal View home visual baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?view=normal");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("normal-home.png", {
    animations: "disabled",
    fullPage: true,
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
