import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

test("launch, hangar and flight report fit the coastal cabinet", async ({ page, isMobile }, info) => {
  test.setTimeout(90_000);
  const sizes = isMobile
    ? [{ width: 390, height: 760 }, { width: 375, height: 620 }, { width: 320, height: 568 }]
    : [{ width: 1440, height: 900 }, { width: 1024, height: 600 }];
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Keep test viewport"));
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.setViewportSize(sizes[0]);
  await page.goto("/games/shitbird");
  test.skip(!(await page.evaluate(() => Boolean(window.AudioContext))), "This runtime lacks Web Audio.");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const start = page.getByRole("button", { name: "Start game", exact: true });
  await expect(start).toBeEnabled();
  for (const size of sizes) {
    await page.setViewportSize(size);
    await expect(start).toBeInViewport({ ratio: 1 });
    for (const control of [start, page.getByRole("button", { name: "Free flight", exact: true }), page.getByRole("button", { name: /Birds & missions/ })]) {
      await expect(control).toBeInViewport({ ratio: 1 });
      const bounds = (await control.boundingBox())!;
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(await control.evaluate(el => {
        const b = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2));
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`launch-${size.width}x${size.height}.png`) });
  }
  const launchA11y = await new AxeBuilder({ page }).include('[data-game="shitbird"]').analyze();
  expect(launchA11y.violations).toEqual([]);
  await page.getByRole("button", { name: /Birds & missions/ }).click();
  const hangar = page.getByRole("dialog", { name: "Birds and flight plan" });
  await expect(hangar).toBeFocused();
  await hangar.getByText("Peak bullshit · Poles", { exact: true }).scrollIntoViewIfNeeded();
  await expect(hangar.getByText("Peak bullshit · Poles", { exact: true })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Birds & missions/ })).toBeFocused();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
  await start.click();
  await page.clock.runFor(1800);
  await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute("data-phase", "dead", { timeout: 6000 });
  const retry = page.getByRole("button", { name: "Play again", exact: true });
  await expect(retry).toBeInViewport({ ratio: 1 });
  await expect(retry).toBeFocused();
  await page.screenshot({ path: info.outputPath("report.png") });
  await page.clock.resume();
  const reportA11y = await new AxeBuilder({ page }).include('[data-game="shitbird"]').analyze();
  expect(reportA11y.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("timber supports render during a real flight without changing the corridor", async ({ page, isMobile }, info) => {
  test.setTimeout(60_000);
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.setViewportSize(isMobile ? { width: 390, height: 760 } : { width: 1440, height: 900 });
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Keep test viewport"));
  });
  await page.clock.install();
  await page.goto("/games/shitbird?daily=2026-10-06");
  test.skip(!(await page.evaluate(() => Boolean(window.AudioContext))), "This runtime lacks Web Audio.");
  await expect(page.getByRole("button", { name: "Start game" })).toBeEnabled();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
  await page.getByRole("button", { name: "Start game" }).click();
  await page.clock.runFor(48);
  const canvas = page.locator("canvas");
  // Normal flap inputs hold altitude while the first support pair enters the screen.
  for (let i = 0; i < 3; i++) {
    await page.clock.runFor(560);
    await canvas.press("Space");
  }
  await page.clock.runFor(200);
  await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute("data-phase", "playing");
  const bounds = (await canvas.boundingBox())!;
  expect(bounds.width / bounds.height).toBeCloseTo(2 / 3, 2);
  await page.screenshot({ path: info.outputPath("timber-flight.png") });
  await page.getByRole("button", { name: "Pause SHITBIRD" }).click();
  await page.clock.resume();
  await page.screenshot({ path: info.outputPath("paused.png") });
  const frames = await page.evaluate(() => new Promise<{ mean: number; p95: number }>(resolve => {
    const deltas: number[] = []; let previous = 0;
    function sample(t: number) {
      if (previous) deltas.push(t - previous);
      previous = t;
      if (deltas.length < 90) requestAnimationFrame(sample);
      else { const sorted = [...deltas].sort((a, b) => a - b); resolve({ mean: deltas.reduce((a, b) => a + b, 0) / deltas.length, p95: sorted[Math.floor(sorted.length * .95)] }); }
    }
    requestAnimationFrame(sample);
  }));
  await info.attach("cabinet-frame-sample", { body: JSON.stringify(frames), contentType: "application/json" });
  await page.getByRole("button", { name: "Resume flight" }).click();
  await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute("data-phase", "playing");
});
