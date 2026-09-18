import { expect, test, type Page } from "@playwright/test";

const UNLOCKED_SESSION = {
  version: 2,
  data: {
    readmeShown: true,
    startupPlayed: true,
    unlocked: true,
    page: 0,
    originPage: null,
    dismissedNotificationIds: [],
  },
};

// Seeds once per context. Init scripts run on every navigation, so clearing
// unconditionally would wipe the very preference these tests assert persists.
const seedSession = (page: Page) =>
  page.addInitScript((session) => {
    if (sessionStorage.getItem("appearance-seeded")) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("appearance-seeded", "true");
    sessionStorage.setItem("wcl.session.v2", JSON.stringify(session));
  }, UNLOCKED_SESSION);

/**
 * The Customize control is revealed on focus, so it is driven the way a
 * keyboard user reaches it rather than by a synthetic click.
 */
const openPocketCustomize = async (page: Page) => {
  const trigger = page.getByRole("button", { name: "Customize Home Screen" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  return page.getByRole("dialog", { name: "Customize" });
};

const appearance = (page: Page) =>
  page.evaluate(() => {
    const root = document.documentElement;
    return {
      theme: root.dataset.theme,
      wallpaper: root.dataset.wallpaper,
      desktopImage: root.style.getPropertyValue("--wallpaper-desktop-image"),
      pocketImage: root.style.getPropertyValue("--wallpaper-pocket-image"),
      surface: root.dataset.themeSurface,
      chrome: root.dataset.themeChrome,
    };
  });

const storedAppearance = (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem("wcl.preferences.v2");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed
      ? { themeId: parsed.data.themeId, wallpaperId: parsed.data.wallpaperId }
      : null;
  });

async function openDesktopContextMenu(page: Page) {
  // Empty desktop space, clear of the icon column and the taskbar.
  await page.mouse.click(900, 420, { button: "right" });
  return page.getByRole("menu", { name: "Desktop personalization" });
}

test.describe("Desktop personalization", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused appearance coverage runs once");
    await seedSession(page);
  });

  test("switches the wallpaper from empty desktop space and persists it", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    expect(await appearance(page)).toMatchObject({
      theme: "dusk",
      wallpaper: "dusk-cliffs",
    });

    const menu = await openDesktopContextMenu(page);
    await expect(menu.getByRole("menuitem", { name: "Theme" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Wallpaper" })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Refresh" })).toBeVisible();
    await expect(
      menu.getByRole("menuitem", { name: "Display / Appearance Settings" }),
    ).toBeVisible();

    await menu.getByRole("menuitem", { name: "Wallpaper" }).click();
    await page
      .getByRole("menu", { name: "Wallpaper" })
      .getByRole("menuitemradio", { name: /Graphite Field/ })
      .click();

    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
    expect((await appearance(page)).desktopImage).toContain("radial-gradient");
    expect(await storedAppearance(page)).toMatchObject({
      wallpaperId: "graphite-field",
    });

    await page.reload();
    expect(await appearance(page)).toMatchObject({ wallpaper: "graphite-field" });
  });

  test("opens the same personalization from the keyboard", async ({ page }) => {
    await page.goto("/?view=os");
    await page
      .getByRole("region", { name: "Desktop shortcuts" })
      .getByRole("button", { name: /Open Projects/ })
      .focus();
    await page.keyboard.press("Shift+F10");

    const menu = page.getByRole("menu", { name: "Desktop personalization" });
    await expect(menu).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    const submenu = page.getByRole("menu", { name: "Wallpaper" });
    await expect(submenu).toBeVisible();
    await submenu
      .getByRole("menuitemradio", { name: /Graphite Field/ })
      .press("Enter");

    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
  });

  test("keeps personalization off application window menus", async ({ page }) => {
    await page.goto("/projects?view=os");
    const projects = page.getByRole("region", { name: "Projects" });
    await projects.getByRole("button", { name: "Window menu for Projects" }).click();

    const windowMenu = page.getByRole("menu").first();
    await expect(windowMenu.getByRole("menuitem", { name: "Center" })).toBeVisible();
    await expect(
      page.getByRole("menu", { name: "Desktop personalization" }),
    ).toHaveCount(0);
  });
});

test.describe("Pocket personalization", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused appearance coverage runs once");
    await seedSession(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("opens Customize from a long press on either home page", async ({ page }) => {
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();

    await page
      .getByRole("region", { name: "Home Page One" })
      .dispatchEvent("pointerdown", {
        button: 0,
        clientX: 40,
        clientY: 400,
        pointerId: 1,
        pointerType: "touch",
      });

    const sheet = page.getByRole("dialog", { name: "Customize" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("tab", { name: "Theme" })).toBeVisible();
    await expect(sheet.getByRole("tab", { name: "Wallpaper" })).toBeVisible();
    await expect(
      sheet.getByRole("button", { name: "Appearance Settings" }),
    ).toBeVisible();
    // Pocket keeps its own presentation rather than the desktop menu.
    await expect(sheet.getByRole("menuitem")).toHaveCount(0);
  });

  test("switches the wallpaper from the Customize sheet and persists it", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    const sheet = await openPocketCustomize(page);
    await sheet
      .getByRole("radiogroup", { name: "Wallpaper" })
      .getByRole("radio", { name: /Graphite Field/ })
      .click();

    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
    expect((await appearance(page)).pocketImage).toContain("radial-gradient");
    expect(await storedAppearance(page)).toMatchObject({
      wallpaperId: "graphite-field",
    });
  });

  test("reaches the same controls through Settings without a long press", async ({
    page,
  }) => {
    await page.goto("/settings/appearance?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");

    await page
      .getByRole("radiogroup", { name: "Wallpaper" })
      .getByRole("radio", { name: /Graphite Field/ })
      .click();

    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
  });
});

test.describe("Shared appearance state", () => {
  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused appearance coverage runs once");
    await seedSession(page);
  });

  test("carries a Desktop choice into Pocket and back", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?view=os");
    const menu = await openDesktopContextMenu(page);
    await menu.getByRole("menuitem", { name: "Wallpaper" }).click();
    await page
      .getByRole("menu", { name: "Wallpaper" })
      .getByRole("menuitemradio", { name: /Graphite Field/ })
      .click();
    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    expect(await appearance(page)).toMatchObject({ wallpaper: "graphite-field" });

    await openPocketCustomize(page);
    await page
      .getByRole("radiogroup", { name: "Wallpaper" })
      .getByRole("radio", { name: /Dusk Cliffs/ })
      .click();
    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("dusk-cliffs");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?view=os");
    expect(await appearance(page)).toMatchObject({ wallpaper: "dusk-cliffs" });
  });

  test("unlocks a hidden theme and wallpaper for both presentations at once", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings/personality?view=os");
    await page
      .getByRole("slider", { name: "Tolerance for bad ideas" })
      .fill("100");

    const persisted = await page.evaluate(() => {
      const raw = localStorage.getItem("wcl.discoveries.v1");
      return raw ? JSON.parse(raw).data : null;
    });
    expect(persisted.unlockedThemeIds).toContain("corporate-beige");
    expect(persisted.unlockedWallpaperIds).toContain("standard-issue");

    // Available on the desktop, from the desktop surface itself.
    await page.goto("/?view=os");
    const menu = await openDesktopContextMenu(page);
    await menu.getByRole("menuitem", { name: "Theme" }).click();
    await page
      .getByRole("menu", { name: "Theme" })
      .getByRole("menuitemradio", { name: /Corporate Beige/ })
      .click();
    await expect
      .poll(async () => (await appearance(page)).theme)
      .toBe("corporate-beige");

    // And available in Pocket without a second unlock.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    expect(await appearance(page)).toMatchObject({ theme: "corporate-beige" });

    await openPocketCustomize(page);
    await page
      .getByRole("radiogroup", { name: "Wallpaper" })
      .getByRole("radio", { name: /Standard Issue/ })
      .click();
    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("standard-issue");
  });

  test("recovers from a persisted theme and wallpaper that no longer exist", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "wcl.preferences.v2",
        JSON.stringify({
          version: 2,
          data: {
            themeId: "removed-theme",
            wallpaperId: "vapor-beach",
            soundEnabled: false,
            extraReducedMotion: false,
            highContrast: false,
            displayPreference: "auto",
          },
        }),
      );
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?view=os");

    // Recovered before first paint, so nothing renders without an appearance.
    expect(await appearance(page)).toMatchObject({
      theme: "dusk",
      wallpaper: "dusk-cliffs",
      surface: "neumorphic",
      chrome: "modern-flat",
    });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  });

  test("recovers a hidden selection after discoveries are reset", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/settings/personality?view=os");
    await page.getByRole("slider", { name: "Tolerance for bad ideas" }).fill("100");

    await page.goto("/settings/appearance?view=os");
    await page
      .getByRole("combobox", { name: "Theme" })
      .selectOption("corporate-beige");
    await expect
      .poll(async () => (await appearance(page)).theme)
      .toBe("corporate-beige");

    await page.goto("/settings/system?view=os");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset Discoveries" }).click();

    await expect.poll(async () => (await appearance(page)).theme).toBe("dusk");
  });
});

test.describe("Appearance and accessibility", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused appearance coverage runs once");
    await seedSession(page);
  });

  test("keeps high contrast authoritative over the wallpaper scrim", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    const shade = page.locator('[data-shell-panel="desktop"] div[aria-hidden="true"]').first();
    const decorative = await shade.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );

    await page.goto("/settings/appearance?view=os");
    await page
      .locator('[data-app-presenter="desktop-settings"]')
      .getByRole("checkbox", { name: "High contrast" })
      .locator("..")
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");

    await page.goto("/?view=os");
    const enforced = await shade.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(enforced).not.toBe(decorative);

    // Changing the wallpaper does not weaken the accessibility override.
    const menu = await openDesktopContextMenu(page);
    await menu.getByRole("menuitem", { name: "Wallpaper" }).click();
    await page
      .getByRole("menu", { name: "Wallpaper" })
      .getByRole("menuitemradio", { name: /Graphite Field/ })
      .click();
    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
    expect(
      await shade.evaluate((element) => getComputedStyle(element).backgroundImage),
    ).toBe(enforced);
  });

  test("keeps reduced motion authoritative while personalizing", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");

    const menu = await openDesktopContextMenu(page);
    await menu.getByRole("menuitem", { name: "Wallpaper" }).click();
    await page
      .getByRole("menu", { name: "Wallpaper" })
      .getByRole("menuitemradio", { name: /Graphite Field/ })
      .click();

    await expect
      .poll(async () => (await appearance(page)).wallpaper)
      .toBe("graphite-field");
    await expect(page.locator("html")).toHaveAttribute("data-reduced-motion", "true");
  });

  test("personalization surfaces have no automated WCAG A/AA violations", async ({
    page,
  }) => {
    const AxeBuilder = (await import("@axe-core/playwright")).default;
    await page.goto("/?view=os");
    await openDesktopContextMenu(page);
    await page.getByRole("menuitem", { name: "Wallpaper" }).click();
    await expect(page.getByRole("menu", { name: "Wallpaper" })).toBeVisible();

    const desktopResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(desktopResults.violations.map((violation) => violation.id)).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await expect(await openPocketCustomize(page)).toBeVisible();

    const pocketResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(pocketResults.violations.map((violation) => violation.id)).toEqual([]);
  });
});
