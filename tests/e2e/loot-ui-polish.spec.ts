import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";
import { createRun, hookPosition, lootRadius, lootWeight, segmentHit, stepRun, PHYSICS, WORLD } from "../../src/components/apps/games/low-tide-loot/model";

const route = "/games/arcade/low-tide-loot?view=os";

async function startPausedClock(page: Page) {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.addInitScript(() => {
    Math.random = () => 1 / 4294967296;
    HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Test browser viewport"));
  });
  await page.clock.install();
  await page.goto(route);
  test.skip(!(await page.evaluate(() => Boolean(window.AudioContext))), "Windows WebKit lacks the Web Audio game runtime.");
  await expect(page.getByRole("button", { name: "Start game", exact: true })).toBeVisible();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await page.clock.runFor(48);
  await expect(page.locator('[data-game="low-tide-loot"]')).toHaveAttribute("data-phase", "playing");
}

async function expectStocked(button: Locator) {
  await expect(button).toHaveText("×1");
  await expect(button).toHaveCSS("opacity", "1");
  const channels = await button.evaluate(el => getComputedStyle(el).backgroundColor.match(/[\d.]+/g)!.map(Number));
  expect(channels[0]).toBeGreaterThan(channels[1] * 2);
  expect(channels[0]).toBeGreaterThan(channels[2] * 2);
}

test("refined HUD preserves readable controls, safe spacing and accessible pause menus", async ({ page, isMobile }, info) => {
  test.setTimeout(90_000);
  const sizes = isMobile
    ? [{ width: 844, height: 280 }, { width: 844, height: 390 }, { width: 667, height: 240 }]
    : [{ width: 1440, height: 900 }, { width: 1024, height: 600 }];
  await page.setViewportSize(sizes[0]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startPausedClock(page);
  const game = page.locator('[data-game="low-tide-loot"]');
  for (const [index, size] of sizes.entries()) {
    if (index) {
      await page.setViewportSize(size);
      await expect(game).toHaveAttribute("data-phase", "paused");
      await page.getByRole("button", { name: "Resume salvaging", exact: true }).click();
      await page.clock.runFor(32);
    }
    const stock = page.getByRole("button", { name: "Use bomb, 1 remaining", exact: true });
    await expect(stock).toBeDisabled(); // Stock stays red before a haul is attached.
    await expectStocked(stock);
    const drop = page.getByRole("button", { name: "Drop", exact: true });
    await expect(drop.locator("span").first()).toHaveText("Drop");
    for (const button of [stock, drop, page.getByRole("button", { name: "Move left", exact: true }), page.getByRole("button", { name: "Move right", exact: true })]) {
      await expect(button).toBeInViewport({ ratio: 1 });
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(await button.evaluate(el => {
        const box = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
      })).toBe(true);
    }
    if (await page.locator('[data-loot-stage]').getAttribute("data-layout") === "compact") {
      const stats = (await page.locator('[aria-label="Salvage progress"]').boundingBox())!;
      const movement = (await page.getByRole("group", { name: "Move salvage rig" }).boundingBox())!;
      expect(stats.y + stats.height).toBeLessThanOrEqual(movement.y);
      const pause = (await page.getByRole("button", { name: "Pause LOW TIDE LOOT" }).boundingBox())!;
      const bomb = (await stock.boundingBox())!;
      expect(pause.y + pause.height).toBeLessThanOrEqual(bomb.y);
    }
    await page.screenshot({ path: info.outputPath(`premium-${size.width}x${size.height}.png`) });
  }
  await page.getByRole("button", { name: "Pause LOW TIDE LOOT" }).click();
  await page.clock.resume();
  await expect(page.getByRole("button", { name: "Turn sound on", exact: true })).toBeVisible();
  for (const name of ["Resume salvaging", "Restart run", "Controls"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeInViewport({ ratio: 1 });
  }
  expect((await new AxeBuilder({ page }).include('[data-game="low-tide-loot"]').withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("premium-pause.png") });
});

test("bomb stock stays solid red until the last bomb is used, then fades and resets on restart", async ({ page, isMobile }, info) => {
  test.setTimeout(90_000);
  // Find a normal input timing that catches heavy loot; never inject game state.
  const run = createRun(1);
  run.phase = "playing";
  let shootAt = -1;
  for (let frame = 0; frame < 1200; frame++) {
    const end = hookPosition({ ...run.claw, length: 850 });
    const hit = run.loot.map(object => ({ object, distance: segmentHit(WORLD.originX, WORLD.originY, end.x, end.y, object.x, object.y, lootRadius(object)) }))
      .filter(item => item.distance !== null).sort((a, b) => a.distance! - b.distance!)[0];
    if (hit && lootWeight(hit.object) >= 5) { shootAt = run.elapsed * 1000; break; }
    stepRun(run, PHYSICS.step);
  }
  expect(shootAt).toBeGreaterThanOrEqual(0);
  await page.setViewportSize(isMobile ? { width: 844, height: 280 } : { width: 1280, height: 800 });
  await startPausedClock(page);
  const stock = page.getByRole("button", { name: /^Use bomb,/ });
  await expectStocked(stock);
  await page.clock.runFor(shootAt);
  await page.getByRole("button", { name: "Drop", exact: true }).click();
  for (let frame = 0; frame < 20 && !(await stock.isEnabled()); frame++) await page.clock.runFor(80);
  await expect(stock).toBeEnabled();
  await expectStocked(stock);
  await stock.click();
  await expect(stock).toHaveAccessibleName("Use bomb, 0 remaining");
  await expect(stock).toHaveText("×0");
  await expect(stock).toBeDisabled();
  await page.clock.runFor(180); // Let the short opacity transition settle.
  await expect(stock).toHaveCSS("opacity", "0.4");
  await page.screenshot({ path: info.outputPath("premium-empty-bombs.png") });
  await page.getByRole("button", { name: "Pause LOW TIDE LOOT" }).click();
  await page.getByRole("button", { name: "Restart run", exact: true }).click();
  await page.clock.runFor(48);
  await expectStocked(stock);
});
