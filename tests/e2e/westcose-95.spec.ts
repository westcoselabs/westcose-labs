import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectClassicAttributes, openCustomize, seedAppearance, selectDesktopTheme } from "./appearance-helpers";

async function audit(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name.startsWith("mobile-"), "Explicit Desktop and Pocket viewports below cover both shells on each engine");
  await page.setViewportSize({ width: 1440, height: 900 });
});

test("Dusk → WestCose 95 → Pocket → Dusk preserves independent preferences and mounted shell", async ({ page }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.goto("/?view=os");
  const shortcuts = await page.getByRole("region", { name: "Desktop shortcuts" }).elementHandle();
  await selectDesktopTheme(page, "WestCose 95");
  await expectClassicAttributes(page, "desktop");
  expect(await shortcuts!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(page).toHaveURL("/?view=os");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");

  await page.goto("/settings/appearance?view=os");
  await expect(page.getByText(/Recommended for WestCose 95/)).toBeVisible();
  await page.getByRole("button", { name: "Use recommended wallpaper" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "westcose-95");
  await page.reload();
  await expectClassicAttributes(page, "desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await expectClassicAttributes(page, "pocket");
  await openCustomize(page);
  await page.getByRole("radio", { name: /^Dusk Cliffs/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "westcose-95");
  await page.getByRole("tab", { name: "Theme", exact: true }).click();
  await page.getByRole("radio", { name: /^Dusk / }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
  await expect(page.locator("html")).toHaveAttribute("data-theme-chrome", "modern-flat");
});

test("theme and wallpaper bootstrap apply before hydration, including invalid-id fallback", async ({ page }) => {
  await seedAppearance(page);
  // Suppress React's external chunks; the inline pre-paint bootstrap still runs.
  await page.route("**/_next/**/*.js*", (route) => route.abort());
  await page.goto("/?view=os", { waitUntil: "domcontentloaded" });
  await expectClassicAttributes(page, "desktop");
  // The Suspense fallback is semantic content; shell markup mounts on hydration.
  // The theme's palette/type still apply to that server-rendered content.
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(211, 209, 197)");
  await expect(page.locator("body")).toHaveCSS("font-family", /Tahoma/);
  expect(await page.locator("html").evaluate((root) => root.style.getPropertyValue("--wallpaper-desktop-image"))).toContain("repeating-linear-gradient");
  await page.evaluate(() => localStorage.setItem("wcl.preferences.v2", JSON.stringify({ version: 2, data: { themeId: "removed-theme", wallpaperId: "removed-wallpaper" } })));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
});

test("WestCose wallpaper keeps its teal colors under Dusk", async ({ page }) => {
  await seedAppearance(page);
  await page.goto("/?view=os");
  const desktop = page.locator('[data-shell-panel="desktop"]').locator("div").first();
  const before = await desktop.evaluate((node) => getComputedStyle(node).backgroundImage);
  await selectDesktopTheme(page, "Dusk");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "westcose-95");
  expect(await desktop.evaluate((node) => getComputedStyle(node).backgroundImage)).toBe(before);
});

test("Pocket also resolves saved appearance before hydration", async ({ page }) => {
  await seedAppearance(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/_next/**/*.js*", (route) => route.abort());
  await page.goto("/?view=os", { waitUntil: "domcontentloaded" });
  await expectClassicAttributes(page, "pocket");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(211, 209, 197)");
  expect(await page.locator("html").evaluate((root) => root.style.getPropertyValue("--wallpaper-pocket-image"))).toContain("87.5%");
});

test("all Desktop applications inherit chrome, including the live Terminal utility", async ({ page }) => {
  await seedAppearance(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/projects", "/notes/readme", "/settings/appearance", "/recycle", "/games", "/games/fightclub", "/about", "/contact"]) {
    await page.goto(`${route}?view=os`);
    await expectClassicAttributes(page, "desktop");
    const active = page.locator('[data-desktop-window] > [data-active="true"]');
    await expect(active).toHaveCSS("border-radius", "0px");
    await expect(active.locator("header").first()).toHaveCSS("background-color", "rgb(32, 60, 122)");
    await audit(page);
  }
  await page.goto("/?view=os");
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button", { name: /Open Terminal/ }).dblclick();
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });
  await terminal.getByRole("textbox", { name: "Command" }).fill("theme");
  await terminal.getByRole("button", { name: "Run", exact: true }).click();
  await expect(terminal.getByRole("log")).toContainText("WestCose 95 is active.");
  await audit(page);
  const command = await terminal.getByRole("textbox").elementHandle();
  await terminal.getByRole("textbox").fill("history");
  await page.getByRole("group", { name: "Pinned apps" }).getByRole("button", { name: "Open Projects", exact: true }).click();
  await expect(terminal.locator("header").first()).toHaveCSS("background-color", "rgb(102, 108, 110)");
  await expect(page.getByRole("region", { name: "Projects", exact: true }).locator("header").first()).toHaveCSS("background-color", "rgb(32, 60, 122)");
  await selectDesktopTheme(page, "Dusk");
  expect(await command!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(terminal.getByRole("textbox")).toHaveValue("history");
  expect(errors).toEqual([]);
});

test("Notepad's menu toolbar is keyboard reachable and has valid open-menu semantics", async ({ page }) => {
  await seedAppearance(page);
  await page.goto("/notes/readme?view=os");
  // The shell moves initial route focus to the heading after two frames.
  // Let that handoff complete before testing the toolbar's keyboard sequence.
  await expect(page.locator('[data-app-presenter="desktop-notepad"] h1')).toBeFocused();
  const toolbar = page.getByRole("toolbar", { name: "Pocket Notepad menu" });
  await toolbar.getByRole("button", { name: "File", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Rename", exact: true })).toBeVisible();
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(toolbar.getByRole("button", { name: "Edit", exact: true })).toBeFocused();
});

test("Pocket apps and customization have accessible classic presentation", async ({ page }) => {
  await seedAppearance(page);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/projects", "/notes/readme", "/settings/appearance", "/recycle", "/games/fightclub"]) {
    await page.goto(`${route}?view=os`);
    await expectClassicAttributes(page, "pocket");
    await audit(page);
  }
  await page.goto("/?view=os");
  const sheet = await openCustomize(page);
  await audit(page);
  await sheet.getByRole("tab", { name: "Theme", exact: true }).click();
  await audit(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Customize Home Screen" })).toBeFocused();
});

test("accessible keyboard menus keep sibling ownership and visible focus", async ({ page }) => {
  await seedAppearance(page);
  await page.goto("/?view=os");
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button").first().focus();
  await page.keyboard.press("Shift+F10");
  await page.keyboard.press("ArrowRight");
  const menu = page.getByRole("menu", { name: "Theme", exact: true });
  await expect(menu.getByRole("menuitemradio", { name: /^WestCose 95/ })).toBeFocused();
  await expect(menu.getByRole("menuitemradio", { name: /^WestCose 95/ })).toHaveCSS("outline-style", "dotted");
  await expect(page.getByRole("menu", { name: "Desktop personalization" }).getByRole("menu")).toHaveCount(0);
  await audit(page);
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: "Theme", exact: true })).toBeFocused();
});

test("WestCose launcher keeps its footer inside the menu while programs scroll", async ({ page }) => {
  await seedAppearance(page);
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "WESTCOSE", exact: true }).click();
  const menu = page.getByRole("region", { name: "Start menu", exact: true });
  const bounds = await menu.boundingBox();
  const footer = await menu.locator("footer").boundingBox();
  expect(footer!.y + footer!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height);
  await audit(page);
});

test("high contrast and reduced motion remain authoritative across wallpaper and theme switches", async ({ page }) => {
  await seedAppearance(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/settings/appearance?view=os");
  await page.getByRole("checkbox", { name: "High contrast", exact: true }).locator("..").click();
  await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
  const rootValues = () => page.locator("html").evaluate((node) => ({
    shadow: getComputedStyle(node).getPropertyValue("--neu-shadow-floating"),
    bevel: getComputedStyle(node).getPropertyValue("--classic-outset"),
  }));
  expect((await rootValues()).bevel).not.toContain("2px 2px");
  for (const theme of ["dusk", "westcose-95"]) {
    await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption(theme);
    await page.getByRole("radio", { name: /^Graphite Field/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
    await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  }
  await page.goto("/?view=os");
  const shade = page.locator('[data-shell-panel="desktop"] div[aria-hidden="true"]').first();
  const background = await shade.evaluate((node) => getComputedStyle(node).backgroundImage);
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button").first().focus();
  await page.keyboard.press("Shift+F10");
  await page.getByRole("menuitem", { name: "Wallpaper", exact: true }).click();
  await page.getByRole("menuitemradio", { name: /^WestCose 95/ }).click();
  expect(await shade.evaluate((node) => getComputedStyle(node).backgroundImage)).toBe(background);
  await expect(page.getByRole("button", { name: "WESTCOSE", exact: true })).toHaveCSS("transition-duration", "0.001s");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await expect(page.getByRole("main", { name: "Pocket OS Home" })).toHaveCSS("background-image", "none");
  await audit(page);
});

test("forced colors preserves boundaries and keyboard focus", async ({ page }) => {
  await seedAppearance(page);
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/settings/appearance?view=os");
  await expect(page.locator('[data-app-presenter="desktop-settings"] h1')).toBeFocused();
  const theme = page.getByRole("combobox", { name: "Theme", exact: true });
  await theme.focus();
  await expect(theme).toHaveCSS("outline-style", "dotted");
  const window = page.locator('[data-desktop-window] > section').first();
  await expect(window).toHaveCSS("box-shadow", "none");
  await expect(window).toHaveCSS("border-top-width", "1px");
});

test("Corporate Beige still unlocks from WestCose 95 and resets independently", async ({ page }) => {
  await seedAppearance(page);
  await page.goto("/settings/personality?view=os");
  await page.getByRole("slider", { name: "Tolerance for bad ideas" }).fill("100");
  const dismiss = page.getByRole("button", { name: "Dismiss discovery", exact: true });
  await expect(dismiss).toBeVisible();
  await expect(dismiss).not.toHaveCSS("box-shadow", "none");
  const dismissBounds = await dismiss.boundingBox();
  expect(dismissBounds!.width).toBeGreaterThanOrEqual(44);
  expect(dismissBounds!.height).toBeGreaterThanOrEqual(44);
  await audit(page);
  await page.goto("/settings/appearance?view=os");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("corporate-beige");
  await page.getByRole("radio", { name: /^Standard Issue/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "corporate-beige");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("westcose-95");
  await page.goto("/settings/system?view=os");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Discoveries", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "westcose-95");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
});

for (const viewport of [{ width: 1024, height: 768 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  test(`Desktop remains usable at ${viewport.width}×${viewport.height} and with resized windows`, async ({ page }) => {
    await seedAppearance(page);
    await page.setViewportSize(viewport);
    await page.goto("/settings/appearance?view=os");
    const settings = page.getByRole("region", { name: "Settings category", exact: true });
    await settings.getByRole("button", { name: "Window menu for Settings category" }).click();
    await settings.getByRole("menuitem", { name: "Snap left" }).click();
    await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toBeVisible();
    expect(await settings.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("dusk");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  });
}

test.describe("Pocket touch", () => {
  test.use({ hasTouch: true });
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 844, height: 390 }]) {
    test(`handheld at ${viewport.width}×${viewport.height} keeps touch targets and customization`, async ({ page }) => {
      await seedAppearance(page);
      await page.setViewportSize(viewport);
      // Landscape is a deliberate Pocket preference, since width alone selects Desktop.
      await page.addInitScript(() => {
        const saved = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
        saved.data.displayPreference = "pocket";
        localStorage.setItem("wcl.preferences.v2", JSON.stringify(saved));
      });
      await page.goto("/?view=os");
      await expectClassicAttributes(page, "pocket");
      const home = page.getByRole("main", { name: "Pocket OS Home" });
      expect(await home.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      const softKeys = page.getByRole("navigation", { name: "Pocket Dock", exact: true }).getByRole("button");
      await expect(softKeys).toHaveCount(4);
      for (const button of await softKeys.all()) {
        const box = await button.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.width).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole("region", { name: "Home Page One" }).dispatchEvent("pointerdown", { button: 0, clientX: 30, clientY: 330, pointerId: 1, pointerType: "touch" });
      const sheet = page.getByRole("dialog", { name: "Customize" });
      await expect(sheet).toBeVisible();
      await page.getByRole("region", { name: "Home Page One", includeHidden: true }).dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch" });
      await sheet.getByRole("tab", { name: "Theme", exact: true }).tap();
      await sheet.getByRole("radio", { name: /^Dusk / }).tap();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
    });
  }
});
