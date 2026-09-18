import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openCustomize, seedAppearance, selectDesktopTheme } from "./appearance-helpers";

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

async function glassAttributes(page: Page, shell: "desktop" | "pocket" | "normal") {
  const root = page.locator("html");
  for (const [name, value] of Object.entries({ shell, theme: "liquid-glass", "theme-surface": "translucent", "theme-chrome": "translucent", "theme-depth": "drop-shadow", "theme-icons": "filled", "theme-effects": "backdrop-blur" })) {
    await expect(root).toHaveAttribute(`data-${name}`, value);
  }
}

async function blurSurfaces(page: Page) {
  return page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")].filter((node) => {
    const box = node.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth && getComputedStyle(node).backdropFilter !== "none";
  }).map((node) => {
    const box = node.getBoundingClientRect();
    return { tag: node.tagName, area: box.width * box.height, filter: getComputedStyle(node).backdropFilter };
  }));
}

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name.startsWith("mobile-"), "Explicit touch contexts and viewports cover both shells on every engine");
  await page.setViewportSize({ width: 1440, height: 900 });
});

test("keyboard personalization preserves live utilities and independent wallpaper across shells", async ({ page }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.goto("/?view=os");
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button", { name: /Open Terminal/ }).dblclick();
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });
  const command = terminal.getByRole("textbox", { name: "Command" });
  await command.fill("history");
  const instance = await command.elementHandle();
  await selectDesktopTheme(page, "Liquid Glass");
  await glassAttributes(page, "desktop");
  expect(await instance!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(command).toHaveValue("history");
  await audit(page);
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
  await page.goto("/settings/appearance?view=os");
  await page.getByRole("button", { name: "Use recommended wallpaper" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "liquid-glass");
  await page.reload();
  await glassAttributes(page, "desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await glassAttributes(page, "pocket");
  const sheet = await openCustomize(page);
  await sheet.getByRole("radio", { name: /^Dusk Cliffs/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "liquid-glass");
  await sheet.getByRole("tab", { name: "Theme", exact: true }).click();
  await sheet.getByRole("radio", { name: /^Dusk / }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
});

for (const shell of ["desktop", "pocket"] as const) {
  test(`${shell} bootstrap resolves Liquid Glass before hydration and recovers invalid ids`, async ({ page }) => {
    await seedAppearance(page, "liquid-glass", "liquid-glass");
    if (shell === "pocket") await page.setViewportSize({ width: 390, height: 844 });
    await page.route("**/_next/**/*.js*", (route) => route.abort());
    await page.goto("/?view=os", { waitUntil: "domcontentloaded" });
    await glassAttributes(page, shell);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(231, 239, 242)");
    expect(await page.locator("html").evaluate((root, surface) => root.style.getPropertyValue(`--wallpaper-${surface}-image`), shell)).toContain(`liquid-glass-${shell}.svg`);
    await page.evaluate(() => localStorage.setItem("wcl.preferences.v2", JSON.stringify({ version: 2, data: { themeId: "missing-skin", wallpaperId: "missing-art" } })));
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  });

  test(`${shell} application content stays opaque and passes automated accessibility checks`, async ({ page }) => {
    await seedAppearance(page, "liquid-glass", "liquid-glass");
    if (shell === "pocket") await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/", "/projects", "/notes/readme", "/settings/appearance", "/settings/system", "/settings/personality", "/recycle", "/games/fightclub", "/about", "/contact"]) {
      await page.goto(`${route}?view=os`);
      // Contact intentionally retains its semantic document fallback on Pocket.
      await glassAttributes(page, shell === "pocket" && route === "/contact" ? "normal" : shell);
      if (shell === "pocket" && route !== "/" && route !== "/contact") {
        await expect(page.locator("#pocket-app-content")).toHaveCSS("background-color", "rgb(244, 248, 250)");
        await expect(page.locator("#pocket-app-content")).toHaveCSS("backdrop-filter", "none");
      }
      await audit(page);
    }
    expect(errors).toEqual([]);
  });

  test(`${shell} keeps blur bounded, wallpaper independent, and high contrast authoritative`, async ({ page }) => {
    await seedAppearance(page, "liquid-glass", "liquid-glass");
    if (shell === "pocket") await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?view=os");
    await glassAttributes(page, shell);
    const surfaces = await blurSurfaces(page);
    expect(surfaces.length).toBeGreaterThan(0);
    expect(surfaces.length).toBeLessThanOrEqual(shell === "desktop" ? 1 : 2);
    const viewport = page.viewportSize()!;
    expect(surfaces.reduce((sum, surface) => sum + surface.area, 0)).toBeLessThan(viewport.width * viewport.height * 0.25);
    await page.goto("/settings/appearance?view=os");
    await page.getByRole("radio", { name: /^WestCose 95/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "liquid-glass");
    await page.getByRole("checkbox", { name: "High contrast", exact: true }).locator("..").click();
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-high-contrast", "true");
    expect(await blurSurfaces(page)).toEqual([]);
    await audit(page);
  });

  test(`${shell} reading surfaces reflow with enlarged text`, async ({ page }) => {
    await seedAppearance(page, "liquid-glass", "liquid-glass");
    if (shell === "pocket") await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/projects", "/settings/appearance"]) {
      await page.goto(`${route}?view=os`);
      await glassAttributes(page, shell);
      await page.locator("html").evaluate((root) => root.style.fontSize = "200%");
      const content = page.locator(shell === "pocket" ? "#pocket-app-content" : "[data-route-content]");
      expect(await content.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      if (shell === "pocket") {
        const buttons = page.locator("[data-app-id] > header").getByRole("button");
        const bounds = await buttons.evaluateAll((nodes) => nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }));
        for (const bound of bounds) {
          expect(bound.left).toBeGreaterThanOrEqual(0);
          expect(bound.right).toBeLessThanOrEqual(390);
        }
      }
    }
  });
}

test("regular glass remains legible on dark, light, and saturated wallpaper", async ({ page }) => {
  await seedAppearance(page, "liquid-glass", "dusk-cliffs");
  for (const wallpaper of ["Dusk Cliffs", "Graphite Field", "WestCose 95", "Tidal Light"]) {
    await page.goto("/settings/appearance?view=os");
    await page.getByRole("radio", { name: new RegExp(`^${wallpaper}`) }).click();
    await page.goto("/?view=os");
    await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button").first().focus();
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("ArrowRight");
    const submenu = page.getByRole("menu", { name: "Theme", exact: true });
    await expect(submenu.getByRole("menuitemradio", { name: /^Liquid Glass/ })).toBeFocused();
    await expect(page.getByRole("menu", { name: "Desktop personalization" }).getByRole("menu")).toHaveCount(0);
    await audit(page);
  }
});

test("Tidal Light supplies a legibility scrim for the existing skins", async ({ page }, info) => {
  await seedAppearance(page, "dusk", "liquid-glass");
  for (const theme of ["dusk", "westcose-95"]) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/settings/appearance?view=os");
      await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption(theme);
      await page.goto("/?view=os");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "liquid-glass");
      const scrim = await page.locator("html").evaluate((root) => root.style.getPropertyValue("--wallpaper-desktop-scrim"));
      expect(scrim).toContain("--wallpaper-light-art-shade, 72%");
      await audit(page);
      await page.screenshot({ path: info.outputPath(`${theme}-${width}-tidal-light.png`) });
    }
  }
});

test("opaque feature fallback retains controls when backdrop filtering is unsupported", async ({ page }) => {
  await seedAppearance(page, "liquid-glass", "liquid-glass");
  let disabledQueries = 0;
  await page.route("**/*.css*", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/@supports[^{}]*backdrop-filter[^{}]*\{/g, () => {
      disabledQueries++;
      return "@supports (display: unsupported-glass-test) {";
    });
    await route.fulfill({ response, body });
  });
  await page.goto("/?view=os");
  await glassAttributes(page, "desktop");
  expect(disabledQueries).toBeGreaterThan(0);
  expect(await blurSurfaces(page)).toEqual([]);
  await audit(page);
});

test("reduced transparency and reduced motion flatten decoration without changing preferences", async ({ page, browserName }) => {
  await seedAppearance(page, "liquid-glass", "liquid-glass");
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  if (browserName === "chromium") {
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }, { name: "prefers-reduced-motion", value: "reduce" }] });
  } else {
    // Playwright has no cross-engine reduced-transparency emulator. Exercise
    // the same CSS branch without inventing an application preference.
    await page.route("**/*.css*", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/\(prefers-reduced-transparency:\s*reduce\)/g, "(min-width: 0px)");
      await route.fulfill({ response, body });
    });
  }
  await page.goto("/?view=os");
  await glassAttributes(page, "desktop");
  expect(await blurSurfaces(page)).toEqual([]);
  await expect(page.getByRole("button", { name: "WestCose", exact: true })).toHaveCSS("transition-duration", "0.001s");
  await audit(page);
});

test("forced colors preserves window boundaries and keyboard focus", async ({ page }) => {
  await seedAppearance(page, "liquid-glass", "liquid-glass");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/settings/appearance?view=os");
  await expect(page.locator('[data-app-presenter="desktop-settings"] h1')).toBeFocused();
  const select = page.getByRole("combobox", { name: "Theme", exact: true });
  await select.focus();
  await expect(select).toHaveCSS("outline-style", "solid");
  expect(await blurSurfaces(page)).toEqual([]);
});

test("Corporate Beige remains unlockable from Liquid Glass", async ({ page }) => {
  await seedAppearance(page, "liquid-glass", "liquid-glass");
  await page.goto("/settings/personality?view=os");
  await page.getByRole("slider", { name: "Tolerance for bad ideas" }).fill("100");
  await page.goto("/settings/appearance?view=os");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("corporate-beige");
  await page.getByRole("radio", { name: /^Standard Issue/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "corporate-beige");
  await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("liquid-glass");
  await page.goto("/settings/system?view=os");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset Discoveries", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "liquid-glass");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "dusk-cliffs");
});

for (const width of [1024, 1366, 1920]) {
  test(`Desktop glass fits ${width}px and snapped application windows`, async ({ page }) => {
    await seedAppearance(page, "liquid-glass", "liquid-glass");
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 768 });
    await page.goto("/settings/appearance?view=os");
    const settings = page.getByRole("region", { name: "Settings category", exact: true });
    await settings.getByRole("button", { name: "Window menu for Settings category" }).click();
    await settings.getByRole("menuitem", { name: "Snap left" }).click();
    expect(await settings.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("dusk");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dusk");
  });
}

test.describe("Pocket touch and type", () => {
  test.use({ hasTouch: true });
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 844, height: 390 }]) {
    test(`Pocket glass fits ${viewport.width}×${viewport.height} and retains touch customization`, async ({ page }) => {
      await seedAppearance(page, "liquid-glass", "liquid-glass");
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        const saved = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
        saved.data.displayPreference = "pocket";
        localStorage.setItem("wcl.preferences.v2", JSON.stringify(saved));
      });
      await page.goto("/?view=os");
      await glassAttributes(page, "pocket");
      const home = page.getByRole("main", { name: "Pocket OS Home" });
      expect(await home.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      for (const key of await page.getByRole("navigation", { name: "Pocket Dock", exact: true }).getByRole("button").all()) {
        const bounds = await key.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole("region", { name: "Home Page One" }).dispatchEvent("pointerdown", { button: 0, clientX: 30, clientY: 330, pointerId: 1, pointerType: "touch" });
      const sheet = page.getByRole("dialog", { name: "Customize" });
      await expect(sheet).toBeVisible();
      const optionBounds = await sheet.getByRole("radio").evaluateAll((nodes) => nodes.map((node) => {
        const box = node.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, height: box.height, scrollHeight: node.scrollHeight };
      }));
      for (let index = 0; index < optionBounds.length; index++) {
        expect(optionBounds[index].height).toBeGreaterThanOrEqual(optionBounds[index].scrollHeight);
        if (index > 0) expect(optionBounds[index].top).toBeGreaterThanOrEqual(optionBounds[index - 1].bottom);
      }
      await page.getByRole("region", { name: "Home Page One", includeHidden: true }).dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch" });
      await sheet.getByRole("tab", { name: "Theme", exact: true }).tap();
      await audit(page);
      await sheet.getByRole("radio", { name: /^WestCose 95/ }).tap();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "westcose-95");
    });
  }
});
