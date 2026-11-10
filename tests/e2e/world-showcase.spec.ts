import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

test.setTimeout(60_000);

test.beforeEach(async ({ page }, info) => {
  const theme = ["westcose-95", "liquid-glass", "westcose-xp"].find(theme => info.title.endsWith(`in ${theme}`)) ?? "dusk";
  await seedAppearance(page, theme, "dusk-cliffs");
});

test("world.exe and the project page launch the hosted game", async ({ page, context }) => {
  const destination = "https://world.westcose.com/";
  await context.route(`${destination}**`, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>WestCose World</title>" }));

  await page.goto("/?view=os");
  const shortcut = page.getByRole("button", { name: /^Play WestCose World in a new tab/ });
  await expect(shortcut).toContainText("world.exe");
  const shortcutPopupPromise = page.waitForEvent("popup");
  await shortcut.press("Enter");
  const shortcutPopup = await shortcutPopupPromise;
  await expect(shortcutPopup).toHaveURL(destination);
  await shortcutPopup.close();

  await page.goto("/projects/westcose-world?view=normal");
  const playLink = page.locator("[data-world-case-study]").getByRole("link", { name: "Play game" });
  await expect(playLink).toHaveAttribute("href", destination);
  await expect(playLink).toHaveAttribute("target", "_blank");
  const pagePopupPromise = page.waitForEvent("popup");
  await playLink.click();
  const pagePopup = await pagePopupPromise;
  await expect(pagePopup).toHaveURL(destination);
  await pagePopup.close();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Go to Home Page 2" }).click();
  const mobileShortcut = page.getByRole("button", { name: "Play WestCose World in a new tab" });
  const mobileArt = page.locator('[data-app-id="world"] img');
  await expect(mobileArt).toBeVisible();
  await expect.poll(() => mobileArt.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const mobilePopupPromise = page.waitForEvent("popup");
  await mobileShortcut.click();
  const mobilePopup = await mobilePopupPromise;
  await expect(mobilePopup).toHaveURL(destination);
  await mobilePopup.close();
});

test("flagship counts once, filters normally, and opens its case study directly", async ({ page }) => {
  await page.goto("/projects?view=os");
  const projects = page.locator("[data-project-showcase]");
  await expect(projects.locator("[data-project-card]")).toHaveCount(14);
  await expect(projects.locator("[data-world-flagship]")).toBeVisible();
  await expect(page.getByRole("region", { name: "Client work spotlight" })).toHaveCount(0);
  await projects.getByRole("button", { name: "List view", exact: true }).click();
  await expect(projects.locator("[data-project-card]").first()).toHaveAttribute("data-project-card", "westcose-world");
  await expect(projects.locator("[data-world-flagship]")).toHaveCount(0);
  await projects.getByRole("searchbox").fill("World Builder");
  await expect(projects.locator("[data-project-card]")).toHaveCount(1);
  await projects.getByRole("link", { name: "Explore WestCose World from the project artwork" }).click();
  await expect(page.locator("[data-world-case-study]")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(projects).toBeVisible();
  await projects.getByRole("searchbox").fill("");
  await projects.getByRole("button", { name: "Gallery view", exact: true }).click();
  await projects.getByRole("group", { name: "Filter projects" }).getByRole("button", { name: "Client sites", exact: true }).click();
  await expect(page.getByRole("region", { name: "Client work spotlight" })).toBeVisible();
  await expect(projects.locator("[data-project-card]")).toHaveCount(4);
});

test("apparel and deck previews preserve category and support front/back", async ({ page }) => {
  await page.goto("/projects/westcose-world?view=os#loadout");
  const loadout = page.locator("[data-world-loadout]");
  await loadout.getByRole("button", { name: "Front", exact: true }).click();
  await expect(loadout.getByRole("img", { name: /front view/ })).toBeVisible();
  await loadout.getByRole("button", { name: "Perks", exact: true }).click();
  await loadout.getByRole("radio").last().check();
  await expect(loadout.getByRole("radio").last()).toBeChecked();
  await loadout.getByRole("button", { name: "Back", exact: true }).click();
  await expect(loadout.getByRole("img", { name: /back view/ })).toBeVisible();
  const deckCollection = page.locator("[data-world-decks]");
  await expect(deckCollection.getByRole("radio")).toHaveCount(12);
  await deckCollection.getByRole("button", { name: "Dead Coast", exact: true }).click();
  await deckCollection.getByRole("radio", { name: "High Tide", exact: true }).check();
  await expect(deckCollection.getByRole("img", { name: "High Tide deck artwork" })).toBeVisible();
  await expect(loadout.getByRole("button", { name: "Perks", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(loadout.getByRole("radio").last()).toBeChecked();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("westcose-world:")))).toEqual([]);
  expect((await new AxeBuilder({ page }).include("[data-world-loadout]").analyze()).violations).toEqual([]);
  expect((await new AxeBuilder({ page }).include("[data-world-decks]").analyze()).violations).toEqual([]);
});

test("decks have a dedicated visible rack with keyboard selection and artwork inspection", async ({ page }) => {
  await page.goto("/projects/westcose-world?view=os#loadout");
  const collection = page.locator("[data-world-decks]");
  await expect(collection.getByRole("heading", { name: "Art under your feet." })).toBeVisible();
  await expect(collection.getByRole("radio")).toHaveCount(12);
  await collection.getByRole("button", { name: "Next deck", exact: true }).click();
  const radio = collection.getByRole("radio");
  await radio.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(radio.nth(1)).toBeChecked();
  await collection.getByRole("button", { name: "All", exact: true }).click();
  await collection.getByRole("radio", { name: "Lighthouse Wave", exact: true }).check();
  const opener = collection.getByRole("button", { name: "Enlarge Lighthouse Wave deck", exact: true }).first();
  await opener.click();
  await expect(page.getByRole("dialog").getByRole("img", { name: "Lighthouse Wave deck artwork" })).toBeVisible();
  await page.getByRole("button", { name: "Close exhibit", exact: true }).click();
  await expect(opener).toBeFocused();
});

test("media dialog traps focus and restores its opener", async ({ page }) => {
  await page.goto("/projects/westcose-world?view=os#art");
  const gallery = page.locator('[data-world-gallery="Artwork transformation"]');
  await gallery.getByRole("button", { name: "Prepared asset", exact: true }).click();
  const opener = gallery.getByRole("button", { name: "Enlarge Prepared asset", exact: true }).first();
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close exhibit" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Close exhibit" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("shop connects its views to the collection and weapons present models without the retired recording", async ({ page }) => {
  await page.goto("/projects/westcose-world?view=os#shop");
  const shop = page.locator("[data-world-shop]");
  await shop.getByRole("button", { name: "Storefront", exact: true }).click();
  await expect(shop.getByRole("img", { name: /current exterior and courtyard/ })).toBeVisible();
  await shop.getByRole("button", { name: "In-game interior", exact: true }).click();
  await expect(shop.getByRole("img", { name: /current WestCose Shop black feature wall/ })).toBeVisible();
  await shop.getByRole("link", { name: /Pick your deck/ }).click();
  await expect(page).toHaveURL(/#deck-collection$/);
  await expect(page.locator("[data-world-decks]").getByRole("heading", { name: "Art under your feet." })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Watch the weapon-handling test" })).toHaveCount(0);
  const arsenal = page.locator("[data-world-weapons]");
  for (const name of ["AK-47", "MP5", "Riptide", "The Blowhole"]) {
    await expect(arsenal.getByRole("heading", { name, exact: true })).toBeVisible();
    await arsenal.getByRole("button", { name: `Enlarge ${name} model`, exact: true }).first().click();
    await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
    await page.getByRole("button", { name: "Close exhibit", exact: true }).click();
  }
  expect((await new AxeBuilder({ page }).include("[data-world-shop]").include("[data-world-weapons]").analyze()).violations).toEqual([]);
});

test("a failed apparel preview can be retried without losing the selection", async ({ page }) => {
  const preview = /.*_next\/image\?.*westcose-social-club-back.*/;
  await page.route(preview, route => route.abort());
  await page.goto("/projects/westcose-world?view=normal#loadout");
  const loadout = page.locator("[data-world-loadout]");
  // Shell hydration can replace the document fallback on a mobile viewport.
  await expect(async () => { await loadout.scrollIntoViewIfNeeded(); }).toPass({ timeout: 10_000 });
  await expect(loadout.getByRole("button", { name: "Retry preview", exact: true })).toBeVisible();
  await page.unroute(preview);
  await loadout.getByRole("button", { name: "Retry preview", exact: true }).click();
  const image = loadout.getByRole("img", { name: /Social Club, back view/ });
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await expect(loadout.getByRole("radio", { name: "Dead Coast Social Club", exact: true })).toBeChecked();
});

test("recordings load on demand, play only on request, and stop when closed", async ({ page, browserName }, info) => {
  const windowsWebKit = browserName === "webkit" && process.platform === "win32";
  if (windowsWebKit) info.annotations.push({ type: "coverage", description: "Windows WebKit checks controls and cleanup; native video decoding needs WebKit on macOS. https://playwright.dev/docs/browsers#webkit" });
  // Exercise the actual MP4 fallbacks on mobile Chromium; desktop/Firefox use WebM.
  if (info.project.name === "mobile-chromium") await page.route("**/media/westcose-world/*.webm", route => route.abort());
  const requests: string[] = [];
  page.on("request", request => { if (/\.(webm|mp4)$/.test(request.url())) requests.push(request.url()); });
  await page.goto("/projects/westcose-world?view=normal");
  await expect(page.locator("[data-world-case-study]")).toBeVisible();
  expect(requests).toEqual([]);
  for (const label of ["Watch the world walkthrough", "Watch the opening film"]) {
    const opener = page.getByRole("button", { name: label, exact: true });
    await opener.click();
    const video = page.getByRole("dialog").locator("video");
    if (!windowsWebKit) await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    if (windowsWebKit) await video.evaluate((element: HTMLVideoElement) => { void element.play().catch(() => {}); });
    else await video.evaluate((element: HTMLVideoElement) => element.play());
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
    if (info.project.name === "mobile-chromium") expect(await video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toMatch(/\.mp4$/);
    const playback = await video.elementHandle();
    await page.getByRole("button", { name: "Close exhibit", exact: true }).click();
    expect(await playback!.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
    await expect(opener).toBeFocused();
  }
});

test("models load only on demand and failed loads offer a static fallback and retry", async ({ page }) => {
  const models: string[] = [];
  page.on("request", request => { if (request.url().endsWith(".glb")) models.push(request.url()); });
  await page.route("**/models/projects/westcose-world/*.glb", route => route.abort());
  await page.goto("/projects/westcose-world?view=normal#art");
  await expect(page.locator("[data-world-case-study]")).toBeVisible();
  expect(models).toEqual([]);
  await page.getByRole("button", { name: "Inspect Dead Coast Pier sign in 3D" }).click();
  await expect(page.getByRole("button", { name: "Retry 3D view" })).toBeVisible({ timeout: 20000 });
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("img")).toBeVisible();
  await dialog.getByRole("button", { name: "Retry 3D view" }).click();
  await expect(dialog.getByRole("button", { name: "Retry 3D view" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog canvas")).toHaveCount(0);
});

test("chapters, technical detail, and navigation are readable without JavaScript", async ({ browser, baseURL }) => {
  test.setTimeout(60000);
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", baseURL });
  const page = await context.newPage();
  await page.goto("/projects/westcose-world?view=normal#tools");
  await expect(page.getByRole("heading", { name: "Development labs and World Builder", exact: true })).toBeInViewport();
  await page.getByText("Publication safeguards and recovery", { exact: true }).press("Enter");
  await expect(page.getByText(/Applying a layout updates the local game/)).toBeVisible();
  await expect(page.locator('[data-world-case-study]').getByRole('heading', { level: 2 })).toHaveCount(8);
  await expect(page.locator('[data-world-shop] noscript img')).toHaveCount(2);
  await context.close();
});

test("document chapter links clear the header at 200% zoom with and without JavaScript", async ({ browser, baseURL }) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ baseURL, viewport: { width: 720, height: 500 }, deviceScaleFactor: 2, javaScriptEnabled, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/projects/westcose-world?view=normal#loadout");
    const heading = page.getByRole("heading", { name: "Clothing and decks", exact: true });
    await expect(heading).toBeInViewport();
    const banner = page.getByRole("banner");
    await expect.poll(async () => {
      const title = await heading.boundingBox(), header = await banner.boundingBox();
      return title && header ? title.y - (header.y + header.height) : -1;
    }).toBeGreaterThanOrEqual(0);
    expect(await page.locator("[data-world-case-study]").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await context.close();
  }
});

test("the model inspector supports keyboard rotation, materials, reset, and replacement", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Exercise live rendering on Chromium; fallback coverage runs in every engine.");
  await page.goto("/projects/westcose-world?view=normal#art");
  await page.getByRole("button", { name: "Inspect Dead Coast Pier sign in 3D" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Reset view" })).toBeVisible({ timeout: 20000 });
  const stage = dialog.getByRole("group", { name: /interactive model/ });
  await stage.focus();
  const before = await dialog.locator("canvas").screenshot();
  await page.keyboard.press("ArrowRight");
  const after = await dialog.locator("canvas").screenshot();
  expect(before.equals(after)).toBe(false);
  await dialog.getByRole("button", { name: "Wireframe", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Wireframe", exact: true })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Reset view" }).click();
  await expect(dialog.getByRole("button", { name: "Wireframe", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Inspect WestCose Shop in 3D" }).click();
  await expect(dialog.getByRole("button", { name: "Reset view" })).toBeVisible();
  await expect(page.locator("dialog canvas")).toHaveCount(1);
});

test("unsupported WebGL retains the static exhibit", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args) {
      if (String(args[0]).includes("webgl")) return null;
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  await page.goto("/projects/westcose-world?view=normal#art");
  await page.getByRole("button", { name: "Inspect WestCose Shop in 3D" }).click();
  await expect(page.getByRole("button", { name: "Retry 3D view" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
});

for (const theme of ["dusk", "westcose-95", "liquid-glass", "westcose-xp"]) {
  test(`case study layout, anchors, and accessibility in ${theme}`, async ({ page }, info) => {
    await page.goto("/projects/westcose-world?view=os");
    await expect(page.locator("[data-world-case-study]")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const article = page.locator("[data-world-case-study]");
    expect(await article.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    const contents = article.locator("details").filter({ has: page.locator("summary", { hasText: "Contents" }) });
    if (await contents.isVisible()) await contents.locator("summary").click();
    const chapterLink = article.getByRole("link", { name: /07.*Labs & Builder/ }).filter({ visible: true });
    await chapterLink.click();
    await expect(page).toHaveURL(/#tools$/);
    await expect(page.locator("#tools-title")).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect((await new AxeBuilder({ page }).include("[data-world-case-study]").analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath(`world-${theme}.png`) });
  });
}
