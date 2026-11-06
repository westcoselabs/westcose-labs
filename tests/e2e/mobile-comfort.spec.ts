import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";
import { BEACH_VIEW } from "../../src/components/apps/games/low-tide-loot/presentation";
import { WORLD } from "../../src/components/apps/games/low-tide-loot/model";

const route = "/games/arcade/low-tide-loot?view=os";

for (const theme of ["dusk", "liquid-glass"]) {
  test(`${theme}: larger mobile apps and compact accessible pagination`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedAppearance(page, theme, theme === "dusk" ? "dusk-cliffs" : theme);
    await page.goto("/?view=os");
    const home = page.getByRole("main", { name: "Pocket OS Home" });
    const tile = home.locator('[data-app-id="themes"] [data-tone]');
    await expect(tile).toBeVisible();
    const tileBox = (await tile.boundingBox())!;
    expect(tileBox.width).toBeGreaterThanOrEqual(74);
    const radius = await tile.evaluate(el => parseFloat(getComputedStyle(el).borderRadius));
    expect(radius / tileBox.width).toBeCloseTo(0.225, 2);
    await expect(home.getByText("Swipe for more", { exact: true })).toBeVisible();
    const dots = home.getByRole("navigation", { name: "Home page selector" });
    for (const dot of await dots.getByRole("button").all()) {
      const size = (await dot.boundingBox())!;
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
      expect(await dot.evaluate(el => parseFloat(getComputedStyle(el, "::after").width))).toBe(6);
    }
    await page.screenshot({ path: info.outputPath(`${theme}-larger-apps.png`) });
    await dots.getByRole("button", { name: "Go to Home Page 2" }).click();
    await expect(dots.getByRole("button", { name: "Go to Home Page 2" })).toHaveAttribute("aria-current", "page");
    await expect(home.getByText("Swipe for home", { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 320, height: 568 });
    await dots.getByRole("button", { name: "Go to Home Page 1" }).click();
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toBeInViewport();
    const dock = home.getByRole("navigation", { name: "Pocket Dock" });
    await expect(dock).toBeInViewport();
    expect(await home.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  });
}

test("portrait fullscreen fallback explains Home Screen play and remains dismissible", async ({ page, browserName }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: undefined });
  });
  await page.goto(route);
  const fullscreen = page.getByRole("button", { name: "Play full screen", exact: true });
  await fullscreen.click();
  const help = page.getByRole("dialog");
  await expect(help).toBeVisible();
  if (browserName === "webkit") {
    await expect(help.getByText("Add to Home Screen", { exact: true })).toBeVisible();
    await expect(help.getByText("Open as Web App", { exact: true })).toBeVisible();
  }
  expect((await new AxeBuilder({ page }).include("dialog").analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("fullscreen-help.png") });
  await help.getByRole("button", { name: "Keep playing in browser" }).click();
  await expect(help).not.toBeVisible();
  await fullscreen.click();
  await page.keyboard.press("Escape");
  await expect(help).not.toBeVisible();
  await expect(fullscreen).toBeFocused();
  await page.screenshot({ path: info.outputPath("rotate-fullscreen.png") });
  const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifest = await (await page.request.get(manifestUrl!)).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toContain("/games/arcade/low-tide-loot");
});

test("portrait fullscreen requests happen directly from a tap and succeed without starting the run", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = function () {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, value: this });
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
    document.exitFullscreen = async () => {
      Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });
      document.dispatchEvent(new Event("fullscreenchange"));
    };
  });
  await page.goto(route);
  await page.getByRole("button", { name: "Play full screen", exact: true }).click();
  await expect(page.getByRole("button", { name: "Full screen is on" })).toBeDisabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator('[data-game="low-tide-loot"]')).toHaveAttribute("data-phase", "ready");
});

test("short Safari-sized landscape enlarges the complete beach and keeps thumb controls reachable", async ({ page }, info) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 844, height: 280 });
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Browser bars remain visible"));
  });
  await page.goto(route);
  test.skip(!(await page.evaluate(() => Boolean(window.AudioContext))), "Windows WebKit has no Web Audio game runtime.");
  await page.getByRole("button", { name: "Start game" }).click();
  const game = page.locator('[data-game="low-tide-loot"]');
  await expect(game).toHaveAttribute("data-phase", "playing");
  const stage = page.locator("[data-loot-stage]");
  await expect(stage).toHaveAttribute("data-layout", "compact");
  const canvas = game.locator("canvas");
  const field = (await canvas.boundingBox())!;
  const beach = (await page.locator("[data-loot-beach]").boundingBox())!;
  expect(field.width).toBeGreaterThan(280 * 2 * 1.2);
  expect(field.width / field.height).toBeCloseTo(2, 2);
  expect(field.y + BEACH_VIEW.top / WORLD.height * field.height).toBeGreaterThanOrEqual(beach.y - 1);
  expect(field.y + BEACH_VIEW.bottom / WORLD.height * field.height).toBeLessThanOrEqual(beach.y + beach.height + 1);
  for (const name of ["Move left", "Move right", "Drop", "Pause LOW TIDE LOOT", "Full screen", "Exit to Games"]) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toBeInViewport({ ratio: 1 });
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(await button.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    })).toBe(true);
  }
  const move = (await page.getByRole("button", { name: "Move right", exact: true }).boundingBox())!;
  await page.mouse.move(move.x + move.width / 2, move.y + move.height / 2);
  await page.mouse.down();
  await expect.poll(async () => Number(await game.getAttribute("data-rig-x"))).toBeGreaterThan(680);
  await page.mouse.up();
  await page.getByRole("button", { name: "Drop", exact: true }).click();
  await expect(game).not.toHaveAttribute("data-claw", "swinging");
  const timing = await page.evaluate(() => new Promise<{ meanMs: number; p95Ms: number }>(resolve => {
    const samples: number[] = [];
    let last = performance.now();
    const sample = (now: number) => {
      samples.push(now - last);
      last = now;
      if (samples.length < 61) requestAnimationFrame(sample);
      else {
        samples.shift();
        samples.sort((a, b) => a - b);
        resolve({ meanMs: samples.reduce((a, b) => a + b, 0) / samples.length, p95Ms: samples[57] });
      }
    };
    requestAnimationFrame(sample);
  }));
  await info.attach("compact-landscape-frame-sample", { body: JSON.stringify(timing), contentType: "application/json" });
  await writeFile(info.outputPath("compact-frame-sample.json"), JSON.stringify(timing, null, 2));
  await page.screenshot({ path: info.outputPath("loot-short-landscape.png") });
  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await expect(game).toHaveAttribute("data-phase", "paused");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep playing in browser" }).click();
  await page.getByRole("button", { name: "Resume salvaging" }).click();
  await expect(game).toHaveAttribute("data-phase", "playing");
  const node = await canvas.elementHandle();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(game).toHaveAttribute("data-phase", "paused");
  expect(await node!.evaluate(el => el.isConnected)).toBe(true);
});
