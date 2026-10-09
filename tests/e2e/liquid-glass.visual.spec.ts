import { expect, test, type Page } from "@playwright/test";
import { openCustomize, seedAppearance } from "./appearance-helpers";

async function waitForGlass(page: Page) {
  // The optical engine is lazy-loaded; capture the material, not its CSS fallback.
  await expect(page.locator("[data-liquid-glass]").first()).toBeVisible();
  for (const lens of await page.locator("[data-liquid-glass]").all()) {
    await expect(lens.locator("feImage").first()).toHaveAttribute("href", /^data:image/);
    await expect(lens).toHaveCSS("backdrop-filter", /url\(.*lg-mat-/);
  }
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "chromium", "Windows Chromium visual baselines");
  await seedAppearance(page, "liquid-glass", "liquid-glass");
  await page.clock.setFixedTime(new Date("2009-09-09T16:09:00.000Z"));
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const [name, route] of [
  ["desktop-home", "/"], ["desktop-projects", "/projects"],
  ["desktop-notepad", "/notes/readme"], ["desktop-settings", "/settings/appearance"],
  ["desktop-context-menu", "/"], ["desktop-start-menu", "/"],
] as const) {
  test(`Liquid Glass ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${route}?view=os`);
    await page.evaluate(() => document.fonts.ready);
    if (name === "desktop-context-menu") {
      await page.mouse.click(700, 320, { button: "right" });
      await page.getByRole("menuitem", { name: "Theme", exact: true }).click();
    }
    if (name === "desktop-start-menu") await page.getByRole("button", { name: "WestCose", exact: true }).click();
    await waitForGlass(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { animations: "disabled", maxDiffPixelRatio: 0.005 });
  });
}

for (const [name, route] of [
  ["pocket-home", "/"], ["pocket-projects", "/projects"],
  ["pocket-notes", "/notes/readme"], ["pocket-customize", "/"],
  ["pocket-settings", "/settings/appearance"], ["pocket-lock", "/"],
] as const) {
  test(`Liquid Glass ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${route}?view=os`);
    await page.evaluate(() => document.fonts.ready);
    if (name === "pocket-customize") await openCustomize(page);
    if (name === "pocket-lock") {
      await page.evaluate(() => {
        const saved = JSON.parse(sessionStorage.getItem("wcl.session.v2")!);
        saved.data.unlocked = false;
        sessionStorage.setItem("wcl.session.v2", JSON.stringify(saved));
      });
      await page.reload();
      await expect(page.getByRole("button", { name: "Tap to unlock" })).toBeVisible();
    }
    await waitForGlass(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { animations: "disabled", maxDiffPixelRatio: 0.005 });
  });
}
