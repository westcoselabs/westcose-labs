import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openCustomize, seedAppearance, selectDesktopTheme } from "./appearance-helpers";

async function audit(page: Page) {
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
    .map((animation) => animation.finished.catch(() => undefined))));
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

test("XP switches with the keyboard, preserves utility state and wallpaper, and persists across shells", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.goto("/?view=os");
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button", { name: /Terminal/ }).press("Enter");
  const terminal = page.getByRole("textbox", { name: "Command", exact: true });
  await terminal.fill("theme pass in progress");
  await selectDesktopTheme(page, "WestCose XP");
  await page.keyboard.press("Escape");
  await expect(terminal).toHaveValue("theme pass in progress");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
  await page.goto("/settings/appearance?view=os");
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveValue("westcose-xp");
  await page.getByRole("button", { name: "Use recommended wallpaper" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "westcose-xp");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "coastal-hills");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  const sheet = await openCustomize(page);
  await sheet.getByRole("tab", { name: "Theme", exact: true }).click();
  await expect(sheet.getByRole("radio", { name: /^WestCose XP/ })).toHaveAttribute("aria-checked", "true");
  await sheet.getByRole("radio", { name: /^Liquid Glass/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "liquid-glass");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "coastal-hills");
});

test("XP launcher, windows, menus and settings remain operable and legible", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedAppearance(page, "westcose-xp", "coastal-hills");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=os");
  await expect(page.locator("html")).toHaveAttribute("data-theme-icons", "rendered-object");
  await page.screenshot({ path: info.outputPath("xp-desktop.png") });
  await audit(page);
  await page.getByRole("button", { name: "start", exact: true }).click();
  const launcher = page.getByRole("region", { name: "Start menu" });
  await expect(launcher).toHaveAttribute("data-launcher-layout", "two-column");
  await expect(launcher.getByRole("button", { name: /^FightClub/ })).toBeVisible();
  await page.screenshot({ path: info.outputPath("xp-launcher.png") });
  await audit(page);
  await launcher.getByRole("searchbox").fill("recycle");
  await expect(launcher.getByRole("button", { name: /^Recycle / })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/projects?view=os");
  await expect(page.getByRole("button", { name: "Maximize Projects", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Maximize Projects", exact: true }).click();
  await page.getByRole("button", { name: "Restore Projects", exact: true }).click();
  await page.screenshot({ path: info.outputPath("xp-projects.png") });
  await audit(page);
  await page.goto("/settings/appearance?view=os");
  await page.screenshot({ path: info.outputPath("xp-settings.png") });
  await audit(page);
  for (const route of ["/notes/readme", "/games", "/recycle", "/terminal"]) {
    await page.goto(`${route}?view=os`);
    await audit(page);
  }
  await page.goto("/?view=os");
  await page.mouse.click(700, 320, { button: "right" });
  await page.getByRole("menuitem", { name: "Theme", exact: true }).click();
  await expect(page.getByRole("menuitemradio", { name: /^WestCose XP/ })).toHaveAttribute("aria-checked", "true");
  await page.screenshot({ path: info.outputPath("xp-context.png") });
  await audit(page);
});

for (const width of [320, 390]) {
  test(`XP pocket ${width}px customization and reading surfaces`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await seedAppearance(page, "westcose-xp", "coastal-hills");
    for (const route of ["/", "/projects", "/settings/appearance", "/notes/readme", "/games"]) {
      await page.goto(`${route}?view=os`);
      await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`xp-pocket-${route.replaceAll("/", "-") || "home"}.png`) });
      await audit(page);
    }
    await page.goto("/?view=os");
    const sheet = await openCustomize(page);
    await sheet.getByRole("tab", { name: "Theme", exact: true }).click();
    await expect(sheet.getByRole("radio", { name: /^WestCose XP/ })).toHaveAttribute("aria-checked", "true");
    await audit(page);
  });
}

test("XP honors high contrast, forced colors, and reduced motion", async ({ page }) => {
  await seedAppearance(page, "westcose-xp", "coastal-hills");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/settings/appearance?view=os");
  await page.getByRole("checkbox", { name: "High contrast", exact: true }).locator("..").click();
  await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
  await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  await audit(page);
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "start", exact: true }).press("Enter");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await audit(page);
});
