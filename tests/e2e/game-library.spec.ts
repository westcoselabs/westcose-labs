import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";
test.beforeEach(async ({ page }) =>
  seedAppearance(page, "dusk", "dusk-cliffs"),
);
test("all three banners fit the library on desktop and a small phone", async ({
  page,
}, info) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 667 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/games?view=os");
    const library = page.locator("[data-game-library]");
    await expect(library).toBeVisible();
    for (const title of ["SHITBIRD", "LOW TIDE LOOT", "FightClub"])
      await expect(
        library.getByRole("link", { name: `Play ${title}`, exact: true }),
      ).toBeInViewport({ ratio: 1 });
    expect(
      await library.evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`library-${viewport.width}.png`),
    });
    expect(
      (await new AxeBuilder({ page }).include("[data-game-library]").analyze())
        .violations,
    ).toEqual([]);
  }
});
test("LOW TIDE LOOT sits beside SHITBIRD on the second Pocket page", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Go to Home Page 2" }).click();
  const home = page.getByRole("region", { name: "Home Page Two" });
  const bird = home.getByRole("button", { name: "Open SHITBIRD", exact: true }),
    loot = home.getByRole("button", {
      name: "Open LOW TIDE LOOT",
      exact: true,
    });
  await expect(bird).toBeInViewport();
  await expect(loot).toBeInViewport();
  const a = await bird.boundingBox(),
    b = await loot.boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
  expect(b!.x).toBeGreaterThan(a!.x);
  await page.screenshot({ path: info.outputPath("pocket-games.png") });
  await loot.click();
  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
});
test("native fullscreen starts from the user gesture and exit pauses the original", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === "webkit",
    "Windows WebKit has no Web Audio runtime",
  );
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/games/arcade/low-tide-loot");
  await page.getByRole("button", { name: "Start game" }).click();
  const game = page.locator('[data-game="low-tide-loot"]');
  await expect(game).toHaveAttribute("data-phase", "playing");
  const native = await page.evaluate(() => Boolean(document.fullscreenElement));
  if (native) {
    await page.evaluate(() => document.exitFullscreen());
    await expect(game).toHaveAttribute("data-phase", "paused");
  }
  await expect(page.locator("[data-game-host]")).toBeInViewport({ ratio: 1 });
  await page.getByRole("button", { name: "Exit to Games" }).click();
  await expect(page).toHaveURL(/\/games$/);
  await expect(
    page.getByRole("link", { name: "Play LOW TIDE LOOT", exact: true }),
  ).toBeFocused();
});

test("light-theme library retains contrast and Normal View on launch and exit", async ({
  page,
}) => {
  await page.goto("/games?view=normal");
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
    saved.data.themeId = "westcose-95";
    saved.data.wallpaperId = "westcose-95";
    localStorage.setItem("wcl.preferences.v2", JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "westcose-95",
  );
  const link = page.getByRole("link", { name: "Play FightClub", exact: true });
  expect(
    (await new AxeBuilder({ page }).include("[data-game-library]").analyze())
      .violations,
  ).toEqual([]);
  await link.click();
  await expect(page).toHaveURL(/fightclub\?view=normal$/);
  await page.getByRole("button", { name: "Exit to Games" }).click();
  await expect(page).toHaveURL(/games\?view=normal$/);
  await expect(link).toBeFocused();
});

test("original title screens and smallest landscape controls fit without distortion", async ({
  page,
  browserName,
}, info) => {
  test.skip(
    browserName === "webkit",
    "Windows WebKit has no Web Audio runtime",
  );
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Viewport fallback visual check"));
  });
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 375, height: 667 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/games/shitbird");
    const start = page.getByRole("button", { name: "Start game" });
    await expect(start).toBeEnabled();
    await expect(start).toBeInViewport({ ratio: 1 });
    await page.screenshot({
      path: info.outputPath(`shitbird-title-${viewport.width}.png`),
    });
  }
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto("/games/arcade/low-tide-loot");
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(page.locator('[data-game="low-tide-loot"]')).toHaveAttribute(
    "data-phase",
    "playing",
  );
  for (const name of [
    "Drop claw",
    "Turn sound on",
    "Pause LOW TIDE LOOT",
    "Exit to Games",
  ]) {
    const button = page.getByRole("button", { name, exact: true });
    await expect(button).toBeInViewport({ ratio: 1 });
    const bounds = await button.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
  const bounds = await page.locator("canvas").boundingBox();
  expect(bounds!.width / bounds!.height).toBeCloseTo(16 / 9, 2);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("loot-small-landscape.png") });
});
