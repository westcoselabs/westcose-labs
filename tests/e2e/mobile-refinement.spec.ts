import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { seedAppearance } from "./appearance-helpers";

async function dragHandle(page: Page, delta: number) {
  const handle = page.getByRole("button", { name: /customization sheet/ });
  await page.getByRole("dialog", { name: "Customize" }).evaluate(async el => {
    el.getBoundingClientRect();
    await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {})));
  });
  await handle.click({ trial: true });
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + delta, { steps: 12 });
  await page.mouse.up();
}

for (const theme of ["dusk", "liquid-glass"]) {
  test(`${theme}: mobile wallpaper, featured build, shortcuts and working sheet`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedAppearance(page, theme, theme === "dusk" ? "dusk-cliffs" : theme);
    await page.goto("/?view=os");
    const home = page.getByRole("main", { name: "Pocket OS Home" });
    await expect(home).toBeVisible();
    await expect(home.getByText("WestCose Labs", { exact: true })).toBeVisible();
    expect(await home.evaluate(el => getComputedStyle(el).backgroundImage)).toContain("url(");
    const featured = page.getByRole("link", { name: "Open featured project: WestCose World" });
    await expect(featured).toHaveAttribute("href", "/projects/westcose-world");
    expect((await featured.boundingBox())!.x).toBeLessThan(40);
    await expect(page.getByRole("region", { name: "Home Page One" }).getByRole("button", { name: "Open DON'T OPEN", exact: true })).toBeVisible();
    await expect.poll(() => featured.locator("img").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: info.outputPath(`${theme}-home.png`) });
    await page.getByRole("button", { name: "Open Themes", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Customize" });
    await expect(sheet).toHaveAttribute("data-detent", "medium");
    if (theme === "liquid-glass") {
      expect(await sheet.evaluate(el => getComputedStyle(el).backdropFilter || getComputedStyle(el).getPropertyValue("-webkit-backdrop-filter"))).toContain("blur(");
    }
    await expect(page.getByRole("tab", { name: "Theme", exact: true })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("button", { name: "Expand customization sheet" }).click();
    await expect(sheet).toHaveAttribute("data-detent", "large");
    await dragHandle(page, 100);
    await expect(sheet).toHaveAttribute("data-detent", "medium");
    await dragHandle(page, -100);
    await expect(sheet).toHaveAttribute("data-detent", "large");
    const panel = page.getByRole("tabpanel");
    await page.setViewportSize({ width: 320, height: 568 });
    await expect.poll(() => sheet.evaluate(el => el.getBoundingClientRect().bottom <= window.innerHeight)).toBe(true);
    await sheet.evaluate(async el => {
      el.getBoundingClientRect();
      await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {})));
    });
    const panelBox = (await panel.boundingBox())!;
    await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + panelBox.height / 2);
    expect(await panel.evaluate(el => getComputedStyle(el).touchAction)).toBe("pan-y");
    if (info.project.name.includes("webkit")) {
      // Playwright does not expose native touch scrolling in iOS WebKit.
      await panel.evaluate(el => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }));
    } else {
      const cdp = await page.context().newCDPSession(page);
      const x = panelBox.x + panelBox.width / 2;
      const startY = panelBox.y + panelBox.height - 20;
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: startY }] });
      for (let i = 1; i <= 12; i++) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: startY - i * (panelBox.height - 40) / 12 }] });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
    }
    await expect.poll(() => panel.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    const bounds = await sheet.boundingBox();
    const last = await page.getByRole("radio", { name: /^WestCose XP/ }).boundingBox();
    expect(last!.y + last!.height).toBeLessThan(bounds!.y + bounds!.height);
    await expect(page.getByRole("button", { name: "Done", exact: true })).toBeInViewport();
    await page.screenshot({ path: info.outputPath(`${theme}-sheet-small.png`) });
    const result = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(result.violations).toEqual([]);
    await page.getByRole("button", { name: "Close customization" }).click();
    await expect(sheet).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Open Themes", exact: true })).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open Themes", exact: true }).click();
    await dragHandle(page, 150);
    await expect(sheet).not.toBeVisible();
    await featured.click();
    await expect(page).toHaveURL(/projects\/westcose-world/);
  });

  test(`${theme}: modern lock supports reduced motion and tap unlock`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAppearance(page, theme, theme === "dusk" ? "dusk-cliffs" : theme);
    await page.addInitScript(() => {
      const session = JSON.parse(sessionStorage.getItem("wcl.session.v2")!);
      session.data.unlocked = false;
      sessionStorage.setItem("wcl.session.v2", JSON.stringify(session));
    });
    await page.goto("/?view=os");
    await expect(page.getByRole("main", { name: "Pocket lock screen" })).toBeVisible();
    await expect(page.locator("#lock-time")).not.toContainText(/AM|PM/);
    await page.screenshot({ path: info.outputPath(`${theme}-lock.png`) });
    await page.getByRole("button", { name: "Tap to unlock", exact: true }).click();
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
  });

  test(`${theme}: high contrast retains wallpaper; lock supports drag`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedAppearance(page, theme, theme === "dusk" ? "dusk-cliffs" : theme);
    await page.addInitScript(() => {
      const session = JSON.parse(sessionStorage.getItem("wcl.session.v2")!);
      session.data.unlocked = false;
      sessionStorage.setItem("wcl.session.v2", JSON.stringify(session));
      const prefs = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
      prefs.data.highContrast = true;
      localStorage.setItem("wcl.preferences.v2", JSON.stringify(prefs));
    });
    await page.goto("/?view=os");
    const lock = page.getByRole("main", { name: "Pocket lock screen" });
    await expect(lock).toBeVisible();
    expect(await lock.evaluate(el => getComputedStyle(el).backgroundImage)).toContain("url(");
    await page.screenshot({ path: info.outputPath(`${theme}-lock-contrast.png`) });
    const thumb = page.getByRole("button", { name: "Slide to unlock, or press Enter" });
    const box = (await thumb.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 270, box.y + box.height / 2, { steps: 15 });
    await page.mouse.up();
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
    expect(await page.getByRole("main", { name: "Pocket OS Home" }).evaluate(el => getComputedStyle(el).backgroundImage)).toContain("url(");
  });
}

test("desktop exposes the featured world and Themes shortcut", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.goto("/?view=os");
  const featured = page.getByRole("link", { name: "Open featured project: WestCose World" });
  await expect(page.getByText("BUILD MODE", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("link")).toHaveCount(0);
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    const box = (await featured.boundingBox())!;
    expect(box.x).toBeGreaterThan(width - 300);
    expect(box.y).toBeLessThan(50);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect.poll(() => featured.locator("img").evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: info.outputPath("desktop-home.png") });
  const shortcut = page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button", { name: /^Open Themes/ });
  await shortcut.press("Enter");
  await expect(page).toHaveURL(/settings\/appearance/);
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toBeVisible();
});
