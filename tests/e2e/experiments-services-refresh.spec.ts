import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

async function expectContentFits(page: Page, content: Locator) {
  expect(await content.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [375, 390, 1440]) {
  test(`experiment filters and isolated controls work at ${width}px`, async ({ page }) => {
    // Touch WebKit at desktop dimensions renders at the device's pixel density.
    test.setTimeout(90_000);
    await seedAppearance(page, "dusk", "dusk");
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/experiments?view=os");
    const catalog = page.locator("[data-experiments-showcase]:visible");
    await expect(catalog).toBeVisible();
    await expect(catalog.locator("[data-experiment]")).toHaveCount(4);
    const filters = catalog.getByRole("group", { name: "Filter experiments" });
    await filters.getByRole("button", { name: "3D worlds", exact: true }).click();
    await expect(catalog.locator("[data-experiment]")).toHaveCount(0);
    await expect(catalog.getByRole("link", { name: "Explore the worlds" })).toHaveAttribute("href", "/experiments/westcose-world");
    await filters.getByRole("button", { name: "Interfaces", exact: true }).click();
    await expect(catalog.locator("[data-experiment]")).toHaveCount(4);
    await expect(catalog.getByRole("link", { name: "Explore the worlds" })).toHaveCount(0);

    const actualShell = await page.locator("html").getAttribute("data-shell");
    const presentation = catalog.getByRole("region", { name: "Route presentation demonstration" });
    await presentation.getByRole("button", { name: "Pocket", exact: true }).click();
    await expect(presentation.locator('[data-shell="pocket"]')).toBeVisible();
    await presentation.getByRole("button", { name: "Document", exact: true }).click();
    await expect(presentation.getByText("Same content. Document presentation.")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-shell", actualShell!);

    const viewport = catalog.getByRole("region", { name: "Mobile viewport simulation" });
    const height = viewport.getByRole("slider", { name: "Simulated screen height" });
    await height.press("End");
    await expect(height).toHaveAttribute("aria-valuetext", "880 pixels, 772 pixels usable");
    await viewport.getByRole("checkbox", { name: "Show browser chrome" }).uncheck();
    await expect(height).toHaveAttribute("aria-valuetext", "880 pixels, 860 pixels usable");

    const unlock = catalog.getByRole("region", { name: "Accessible unlock demonstration" });
    const slider = unlock.getByRole("slider", { name: "Slide to unlock" });
    await slider.press("End");
    await expect(unlock.locator('[role="status"]')).toHaveText("You're in.");
    await expect(slider).toBeDisabled();
    await unlock.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(slider).toHaveValue("0");
    await unlock.getByRole("button", { name: "Unlock", exact: true }).press("Enter");
    await expect(unlock.locator('[role="status"]')).toHaveText("You're in.");

    const geometry = catalog.getByRole("region", { name: "Window snapping demonstration" });
    await geometry.getByRole("button", { name: "Snap window right", exact: true }).click();
    await expect(geometry.getByText("Snapped right", { exact: true })).toBeVisible();
    const window = geometry.locator("article");
    const stage = window.locator("..");
    const snapped = (await window.boundingBox())!;
    const workspace = (await stage.boundingBox())!;
    expect(snapped.x).toBeGreaterThan(workspace.x + workspace.width * 0.45);
    expect(snapped.x + snapped.width).toBeCloseTo(workspace.x + workspace.width, -1);
    await geometry.getByRole("button", { name: "Maximize window", exact: true }).click();
    await expect(geometry.getByText("Maximized", { exact: true })).toBeVisible();
    expect((await window.boundingBox())!.width).toBeGreaterThan(workspace.width * 0.95);
    await geometry.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(geometry.getByText("Centered", { exact: true })).toBeVisible();
    await expectContentFits(page, catalog);

    await presentation.getByRole("button", { name: "Desktop", exact: true }).click();
    await catalog.getByRole("link", { name: "Route presentation router", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Route presentation router", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Route presentation demonstration" })).toBeVisible();
  });

  test(`service selection and native disclosures work at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await seedAppearance(page, "dusk", "dusk");
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto("/services?view=os");
    const services = page.locator("[data-services-showcase]:visible");
    await expect(services).toBeVisible();
    const chooser = services.getByRole("group", { name: "Choose a service" });
    await expect(chooser.getByRole("button", { name: /^Website design/ })).toHaveAttribute("aria-pressed", "true");
    const capabilities = services.getByRole("region", { name: "Explore capabilities" });
    for (const [title, label, href] of [
      ["Website design and redesign", "Website design details", "/services/website-design"],
      ["Tools, integrations, and automation", "See GitPress Forms", "/projects/gitpress-forms"],
      ["Interactive websites and 3D experiences", "Explore WestCose World", "/projects/westcose-world"],
      ["Games and prototypes", "See game projects", "/games"],
      ["Digital design systems", "View the design work", "/projects/westcose-designs"],
      ["Custom web development and apps", "Web development details", "/services/web-development"],
    ]) {
      const button = chooser.getByRole("button", { name: new RegExp(`^${title}`) });
      await button.press("Enter");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(capabilities.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(capabilities.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
      await expectContentFits(page, services);
    }
    await expect(capabilities.getByRole("link", { name: /Estate Sales Bakersfield.*Public beta/ })).toHaveAttribute("href", "/projects/estate-sales-bakersfield");
    await expect(capabilities.getByText("Private beta", { exact: true })).toBeVisible();
    const process = services.getByRole("region", { name: "How a project usually goes" });
    await process.locator("summary").filter({ hasText: "Figure out the scope" }).click();
    await expect(process.getByText(/Then we can decide what the project actually needs/)).toBeVisible();
    await expect(process.getByText(/I want the real problem before I start making screens/)).toBeHidden();
    await expectContentFits(page, services);
    await capabilities.getByRole("link", { name: "Web development details", exact: true }).click();
    await expect(page).toHaveURL(/\/services\/web-development(?:\?|$)/);
    await expect(page.getByRole("heading", { level: 1, name: "Custom web development for ideas that need more than pages.", exact: true })).toBeVisible();
    const detail = page.locator("[data-route-content]:visible");
    await detail.locator("summary").filter({ hasText: "Websites, apps, and the systems behind them" }).click();
    await expect(detail.getByText(/I work with Next.js, React, TypeScript, WordPress/)).toBeVisible();
    await expectContentFits(page, detail);
  });
}

test("catalogs reflow inside a narrow desktop window", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop window resizing uses a pointer.");
  await seedAppearance(page, "dusk", "dusk");
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, title] of [["experiments", "Experiments"], ["services", "Services"]]) {
    await page.goto(`/${route}?view=os`);
    const frame = page.getByRole("region", { name: title, exact: true });
    const content = frame.locator("[data-route-content]");
    await expect(content).toBeVisible();
    const bounds = (await frame.boundingBox())!;
    const handle = (await frame.locator('[data-corner="se"]').boundingBox())!;
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 450 - bounds.width, y, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => (await frame.boundingBox())!.width).toBeLessThan(460);
    await expectContentFits(page, content);
  }
});

for (const theme of ["dusk", "liquid-glass", "westcose-95"]) {
  for (const width of [390, 1440]) {
    test(`${theme} refreshed routes remain accessible at ${width}px`, async ({ page }) => {
      test.setTimeout(90_000);
      await seedAppearance(page, theme, theme);
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      const runtimeErrors: string[] = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      page.on("console", (message) => {
        if (/hydration|hydrating|did not match|server.?rendered|text content does not match/i.test(message.text())) {
          runtimeErrors.push(message.text());
        }
      });

      for (const route of ["/experiments", "/experiments/accessible-unlock", "/services", "/services/website-design"]) {
        await page.goto(`${route}?view=os`);
        const content = page.locator("[data-route-content]:visible");
        await expect(content).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.evaluate(() => document.fonts.ready);
        expect.soft(await content.evaluate((element) => element.scrollWidth <= element.clientWidth), `${route} content fits`).toBe(true);
        expect.soft(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} viewport fits`).toBe(true);
        const accessibility = await new AxeBuilder({ page }).include("[data-route-content]").analyze();
        expect.soft(accessibility.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
        })), `${route} accessibility`).toEqual([]);
      }
      expect(runtimeErrors).toEqual([]);
    });
  }
}

test("default catalogs keep conventional routes and disclosures without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  try {
    await page.goto(new URL("/experiments", baseURL).toString());
    await page.getByRole("link", { name: "Route presentation router", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Route presentation router", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "All experiments", exact: true })).toBeVisible();
    await page.goto(new URL("/services", baseURL).toString());
    const services = page.locator("[data-services-showcase]:visible");
    await services.locator("summary").filter({ hasText: "Figure out the scope" }).click();
    await expect(services.getByText(/Then we can decide what the project actually needs/)).toBeVisible();
    await services.getByRole("navigation", { name: "Explore services", exact: true }).getByRole("link", { name: "Web development", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Custom web development for ideas that need more than pages.", exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
