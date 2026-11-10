import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

for (const viewport of [{ width: 375, height: 812 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
  for (const theme of ["dusk", "westcose-95"]) {
    test(`contact form works at ${viewport.width}px in ${theme}`, async ({ page }, info) => {
      await seedAppearance(page, theme, theme === "dusk" ? "dusk-cliffs" : theme);
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/contact?view=normal");
      const form = page.getByRole("form", { name: "Project email" });
      await expect(form).toBeVisible();
      await form.getByRole("button", { name: "Open email draft" }).click();
      await expect(page.getByRole("textbox", { name: "Your name", exact: true })).toBeFocused();
      await expect(form.getByRole("alert")).toContainText("second look");
      await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Test visitor");
      await page.getByRole("textbox", { name: "Your email", exact: true }).fill("invalid");
      await page.getByRole("textbox", { name: "Subject", exact: true }).focus();
      await expect(page.getByText("Use an email address like name@example.com.")).toBeVisible();
      await page.getByRole("textbox", { name: "Your email", exact: true }).fill("visitor@example.com");
      await page.getByRole("textbox", { name: "Subject", exact: true }).fill("A project idea");
      await page.getByRole("textbox", { name: "Message", exact: true }).fill("I have a website project in mind.");
      await page.getByText("A redesign", { exact: true }).click();
      await expect(page.getByRole("radio", { name: "A redesign", exact: true })).toBeChecked();
      await expect(page.locator('a[href="mailto:westcose.co@gmail.com"]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).include('[data-presentation="contact"]').analyze();
      expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
      await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); window.scrollTo(0, 0); });
      await page.screenshot({ path: info.outputPath(`contact-${theme}-${viewport.width}.png`), fullPage: true });
    });
  }
}

test("build logs have evidence and no pretend playground", async ({ page }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  for (const slug of ["concept-to-glb", "world-builder-lab", "combat-feel-lab", "theme-workshop"]) {
    await page.goto(`/experiments/${slug}?view=normal`);
    await expect(page.locator('[data-study-presentation="build-log"]')).toBeVisible();
    await expect(page.locator("[data-experiment]")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "See the related project" })).toHaveAttribute("href", /^\/projects\//);
    await page.getByRole("link", { name: "All experiments", exact: true }).click();
    await expect(page).toHaveURL(/\/experiments(?:\?view=normal)?$/);
  }
});

test("desktop selection has no floating Open button and Pocket tiles use covers without dots", async ({ page }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?view=os");
  const shortcut = page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button", { name: /^Open Projects/ });
  await shortcut.click();
  await expect(shortcut).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Open", exact: true })).toHaveCount(0);
  await shortcut.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Go to Home Page 2" }).click();
  const home = page.getByRole("main", { name: "Pocket OS Home" });
  await expect(home.getByRole("button", { name: /^More actions/ })).toHaveCount(0);
  for (const id of ["world", "fightclub", "shitbird", "low-tide-loot"]) await expect(home.locator(`[data-app-id="${id}"] img`)).toBeVisible();
  const tile = home.getByRole("button", { name: /^Open FightClub/ });
  await tile.press("Shift+F10");
  await expect(page.getByRole("dialog", { name: "FightClub", exact: true })).toBeVisible();
});

test("Google verification, external destinations, and crawl discovery are connected", async ({ page, request }) => {
  await page.goto("/github?view=normal");
  await expect(page.getByRole("link", { name: /^Open profile/ })).toHaveAttribute("href", "https://github.com/westcoselabs");
  await expect(page.getByRole("heading", { name: "WordPress workspace" })).toHaveCount(0);
  await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute("content", "XfjiFKGii47m_ZaujAiHDBw46zu4gmpRWtc2c7g-18M");
  for (const [slug, href] of [["barber-refinery", "https://barberrefinery.com/"], ["trends-collision", "https://trendsautocollision.com/"], ["first-medical-associates", "https://drsfirst.com/"], ["westcose-designs", "https://westcosedesigns.com/"], ["estate-sales-bakersfield", "https://estatesalesbakersfield.com/"]]) {
    await page.goto(`/projects/${slug}?view=normal`);
    await expect(page.getByRole("link", { name: /^Visit live site/ }).first()).toHaveAttribute("href", href);
  }
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("https://westcoselabs.com/sitemap.xml");
  const map = await request.get("/sitemap.xml");
  const xml = await map.text();
  expect(map.status()).toBe(200);
  expect(xml).toContain("/experiments/world-builder-lab</loc>");
  expect(xml).not.toContain("/projects/public</loc>");
  expect(xml).not.toContain("/games/fightclub</loc>");
});
