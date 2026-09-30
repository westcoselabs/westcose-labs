import { expect, test } from "@playwright/test";

const origin = "https://westcoselabs.com";

test("homepage retains SEO metadata without adding a scrolling document to the OS", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-shell-ready", "true");
  await expect(page.locator("#website-services")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Website services ↓" })).toHaveCount(0);
  await expect(page.locator('[data-route-content][data-presentation="home"]')).toHaveCount(0);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/westcoselabs\.com\/?$/);
  await expect(page).toHaveTitle("Website Design & Web Development | WestCose Labs");
  const geometry = await page.evaluate(() => ({
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight + 1);
});

test("service routes and case studies expose descriptive metadata and customer paths", async ({ page }) => {
  for (const [path, heading] of [
    ["/services", "Website design and web development services"],
    ["/services/website-design", "Custom website design for your business"],
    ["/services/web-development", "Web development for custom websites and applications"],
    ["/projects/barber-refinery", "Barber Refinery website design"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading, exact: true })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${origin}${path}`);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    await expect(page.locator('[data-route-content] a[href="/contact"]').first()).toBeVisible();
  }
});

test("plain HTML and crawl discovery remain usable without JavaScript", async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:3100/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Custom websites built around your business");
    await expect(page.locator('a[href="/services/web-development"]').first()).toBeVisible();
  } finally {
    await context.close();
  }
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`${origin}/services/web-development`);
  expect(xml).not.toMatch(/localhost|<loc>[^<]*\/(settings|recycle|terminal|notes|github)/);
  for (const path of ["/settings", "/settings/appearance", "/notes/client-phrases", "/terminal", "/recycle"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(/name="robots" content="noindex, follow"/);
  }
});
