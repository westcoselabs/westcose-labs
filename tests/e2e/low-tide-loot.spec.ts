import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";
import {
  createRun,
  stepRun,
  fire,
  bomb,
  hookPosition,
  segmentHit,
  lootRadius,
  lootWeight,
  lootValue,
  WORLD,
  PHYSICS,
} from "../../src/components/apps/games/low-tide-loot/model";
import { LOOT } from "../../src/components/apps/games/low-tide-loot/data";
const route = "/games/arcade/low-tide-loot";
async function runtimeAvailable(page: Page) {
  test.skip(
    !(await page.evaluate(() => Boolean(window.AudioContext))),
    "Windows Playwright WebKit lacks Web Audio; fallback is tested separately.",
  );
}
async function launch(page: Page, view = "os") {
  await page.goto(`${route}?view=${view}`);
  await runtimeAvailable(page);
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(page.locator('[data-game="low-tide-loot"]')).toHaveAttribute(
    "data-phase",
    "playing",
  );
}
test.describe("LOW TIDE LOOT", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await seedAppearance(page, "dusk", "dusk-cliffs");
    if (isMobile) await page.setViewportSize({ width: 844, height: 390 });
    // These scenarios verify viewport fallback; browser fullscreen has its own test.
    await page.addInitScript(() => {
      HTMLElement.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Fullscreen unavailable in fallback test"));
    });
  });
  test("keeps engines out of the library, loads after selection, exits and relaunches", async ({
    page,
  }, info) => {
    const requests: string[] = [],
      errors: string[] = [];
    page.on("request", (r) => requests.push(r.url()));
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of ["/", "/games", "/games/arcade"])
      await page.goto(`${path}?view=os`);
    expect(
      requests.filter((url) =>
        /low-tide-loot\/(scavenger|beach-wide)\.webp/.test(url),
      ),
    ).toEqual([]);
    await page
      .getByRole("link", { name: "Play LOW TIDE LOOT", exact: true })
      .click();
    await runtimeAvailable(page);
    await expect(
      page.getByRole("button", { name: "Start game" }),
    ).toBeVisible();
    await page.screenshot({ path: info.outputPath("loot-title.png") });
    for (let cycle = 0; cycle < 3; cycle++) {
      await page.getByRole("button", { name: "Start game" }).click();
      await expect(page.locator('[data-game="low-tide-loot"]')).toHaveAttribute(
        "data-phase",
        "playing",
      );
      await expect(page.locator("canvas")).toHaveCount(1);
      await page.getByRole("button", { name: "Exit to Games" }).click();
      await expect(page).toHaveURL(/\/games(?:\?.*)?$/);
      await expect(page.locator("canvas")).toHaveCount(0);
      await page
        .getByRole("link", { name: "Play LOW TIDE LOOT", exact: true })
        .click();
    }
    expect(requests.some((url) => url.includes("beach-wide.webp"))).toBe(true);
    expect(errors).toEqual([]);
  });
  test("landscape HUD, input, sound, pause and reduced motion", async ({
    page,
    isMobile,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await launch(page);
    const game = page.locator('[data-game="low-tide-loot"]'),
      canvas = game.locator("canvas");
    const bounds = await canvas.boundingBox();
    expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 2);
    await expect(game).toHaveAttribute("data-reduced-motion", "true");
    await expect(
      page.getByRole("button", { name: "Drop claw" }),
    ).toBeInViewport();
    await canvas.press("ArrowDown");
    await expect(game).not.toHaveAttribute("data-claw", "swinging");
    await page.getByRole("button", { name: "Pause LOW TIDE LOOT" }).click();
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.getByRole("button", { name: "Turn sound on" }).click();
    await expect(
      page.getByRole("button", { name: "Turn sound off" }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-game="low-tide-loot"]')
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.getByRole("button", { name: "Restart run" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    if (isMobile) await canvas.tap({ position: { x: 180, y: 140 } });
    else await canvas.click({ position: { x: 180, y: 140 } });
    await expect(game).not.toHaveAttribute("data-claw", "swinging");
    await page.screenshot({ path: info.outputPath("loot-gameplay.png") });
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(game).toHaveAttribute("data-phase", "paused");
  });
  test("rotation preserves the canvas and paused run across shell breakpoints", async ({
    page,
  }, info) => {
    await launch(page);
    const game = page.locator('[data-game="low-tide-loot"]');
    await page.getByRole("button", { name: "Pause LOW TIDE LOOT" }).click();
    const canvas = await game.locator("canvas").elementHandle();
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(
      page.getByText("Turn your phone sideways to play."),
    ).toBeVisible();
    await expect(game).toHaveAttribute("data-phase", "paused");
    expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
    await page.screenshot({ path: info.outputPath("loot-rotate.png") });
    await page.setViewportSize({ width: 1180, height: 720 });
    await expect(
      page.getByText("Turn your phone sideways to play."),
    ).toHaveCount(0);
    expect(await canvas!.evaluate((node) => node.isConnected)).toBe(true);
    await page.getByRole("button", { name: "Resume salvaging" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    await page.getByRole("button", { name: "Exit to Games" }).click();
    await expect(page).toHaveURL(/\/games(?:\?.*)?$/);
    await page.goBack();
    await expect(game).toHaveAttribute("data-phase", "ready");
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Start game" }),
    ).toBeVisible();
  });
  test("Normal View uses the same immersive host and restores navigation", async ({
    page,
  }) => {
    await launch(page, "normal");
    await expect(page.locator("[data-game-host]")).toBeVisible();
    await page.getByRole("button", { name: "Exit to Games" }).click();
    await expect(page).toHaveURL(/\/games\?view=normal$/);
    await expect(page.locator("[data-game-host]")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Play LOW TIDE LOOT", exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
  });
  test("failed artwork is recoverable with an always available exit", async ({
    page,
  }) => {
    await page.route("**/games/low-tide-loot/beach-wide.webp", (r) =>
      r.abort(),
    );
    await page.goto(route);
    await runtimeAvailable(page);
    await expect(
      page.locator('[data-game="low-tide-loot"]').getByRole("alert"),
    ).toContainText("artwork could not load");
    await expect(
      page.getByRole("button", { name: "Exit to Games" }),
    ).toBeVisible();
    await page.unroute("**/games/low-tide-loot/beach-wide.webp");
    await page.getByRole("button", { name: "Reload game" }).click();
    await expect(
      page.getByRole("button", { name: "Start game" }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(1);
  });
  test("unsupported runtimes retain usable navigation", async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(window, "AudioContext", {
        configurable: true,
        value: undefined,
      }),
    );
    await page.goto(route);
    await expect(
      page.locator('[data-game="low-tide-loot"]').getByRole("alert"),
    ).toContainText("Web Audio");
    await page.getByRole("button", { name: "Exit to Games" }).click();
    await expect(page).toHaveURL(/\/games$/);
  });
  test.describe("full timed run", () => {
    test.use({ deviceScaleFactor: 1 });
    test("completes a day, shops, carries cash, saves a failed run and retries", async ({
      page,
    }, info) => {
      test.setTimeout(480000); // Two complete rounds on software-rendered WebGL.
      // Derive an ordinary keyboard-input schedule from the deterministic simulation.
      // No browser-side mutation API, injected score or debug controls are used.
      const run = createRun(1);
      run.phase = "playing";
      const inputs: [number, string][] = [];
      let lastShot = 0;
      for (let frame = 0; frame < 7200 && run.phase === "playing"; frame++) {
        if (frame % 8 === 0 && run.claw.state === "swinging") {
          const end = hookPosition({ ...run.claw, length: 850 });
          const hits = run.loot
            .filter((o) => !o.removed)
            .map((o) => ({
              o,
              t: segmentHit(
                WORLD.originX,
                WORLD.originY,
                end.x,
                end.y,
                o.x,
                o.y,
                lootRadius(o),
              ),
            }))
            .filter((h) => h.t !== null)
            .sort((a, b) => a.t! - b.t!);
          if (
            hits[0] &&
            (lootValue(LOOT[hits[0].o.id], run.boosts) >= 150 ||
              LOOT[hits[0].o.id].mystery ||
              (run.elapsed - lastShot > 5 &&
                hits.slice(1).some((h) => LOOT[h.o.id].value >= 150)))
          ) {
            fire(run);
            lastShot = run.elapsed;
            inputs.push([Math.round(frame * PHYSICS.step * 1000), "ArrowDown"]);
          }
        }
        const caught = run.loot.find((o) => o.uid === run.claw.attached);
        if (
          caught &&
          LOOT[caught.id].category === "scrap" &&
          lootWeight(caught) >= 5 &&
          bomb(run)
        )
          inputs.push([Math.round(frame * PHYSICS.step * 1000), "ArrowUp"]);
        stepRun(run, PHYSICS.step);
      }
      expect(run.cash).toBeGreaterThanOrEqual(1000);
      await page.addInitScript(() => {
        Math.random = () => 1 / 4294967296;
      });
      const epoch = new Date("2026-09-21T12:00:00Z");
      await page.clock.install({ time: epoch });
      await page.goto(route);
      await runtimeAvailable(page);
      await expect(
        page.getByRole("button", { name: "Start game" }),
      ).toBeVisible();
      await page.clock.pauseAt(new Date(epoch.getTime() + 60000));
      await page.getByRole("button", { name: "Start game" }).click();
      await page.clock.runFor(48);
      const game = page.locator('[data-game="low-tide-loot"]');
      let elapsed = 0;
      for (const [at, key] of inputs) {
        await page.clock.runFor(Math.max(0, at - elapsed));
        elapsed = Math.max(at, elapsed);
        await page.keyboard.press(key);
      }
      await page.clock.runFor(60200 - elapsed);
      await expect(game).toHaveAttribute("data-phase", "complete");
      await page.screenshot({ path: info.outputPath("loot-results.png") });
      await page.getByRole("button", { name: "Continue to Surf Shop" }).click();
      await expect(game).toHaveAttribute("data-phase", "shop");
      const cashBefore = await game.getByTestId("shop-cash").textContent();
      const purchase = game.getByRole("button", { name: /^Buy / }).first();
      await purchase.click();
      await expect(purchase).toBeDisabled();
      await expect(purchase).toContainText("Purchased");
      expect(await game.getByTestId("shop-cash").textContent()).not.toBe(
        cashBefore,
      );
      await page.screenshot({ path: info.outputPath("surf-shop.png") });
      // Axe schedules browser timers; unfreeze them while the shop is safely idle.
      await page.clock.resume();
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-game="low-tide-loot"]')
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.clock.pauseAt(
        new Date((await page.evaluate(() => Date.now())) + 1000),
      );
      await page.getByRole("button", { name: "Next level" }).click();
      await expect(game).toHaveAttribute("data-phase", "playing");
      await expect(game.getByTestId("loot-earnings")).toContainText("$2,150");
      await page.clock.runFor(60200);
      await expect(game).toHaveAttribute("data-phase", "over");
      const saved = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("wcl.games.v1")!).data.lowTideLoot
            .scores,
      );
      expect(saved[0].days).toBe(1);
      expect(saved[0].score).toBeGreaterThanOrEqual(1000);
      await page.getByRole("button", { name: "Play again" }).click();
      await page.clock.runFor(48);
      await expect(game).toHaveAttribute("data-phase", "playing");
    });
  });
});
