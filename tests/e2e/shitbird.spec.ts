import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

async function requireAudioRuntime(page: Page) {
  const available = await page.evaluate(() =>
    Boolean(
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext,
    ),
  );
  test.skip(
    !available,
    "This browser runtime has no Web Audio (Windows Playwright WebKit). The fallback is tested separately; real Safari gameplay needs a device check.",
  );
}

test.describe("SHITBIRD in Games", () => {
  test.beforeEach(async ({ page }) => {
    await seedAppearance(page, "dusk", "dusk-cliffs");
  });

  test("hits a rendered SHIT target and earns a playable cosmetic", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Canvas-pixel steering is covered on desktop and mobile Chromium.");
    await page.goto("/games/shitbird?daily=2026-10-06");
    await requireAudioRuntime(page);
    await expect(page.getByRole("button", { name: "Start game" })).toBeEnabled();
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas")!;
      const probe = document.createElement("canvas"); probe.width = 26; probe.height = 70;
      const ctx = probe.getContext("2d", { willReadFrequently: true })!;
      let lastFlap = 0, birdY = 253;
      // Observe the saturated orange beak, excluding the softer copper target badge.
      // Send normal input, without engine state or score injection.
      const pilot = (time: number) => {
        const phase = document.querySelector<HTMLElement>('[data-game="shitbird"]')?.dataset.phase;
        const bonus = Number(document.querySelector('[data-testid="shitbird-bonus"]')?.textContent ?? 0);
        // The game safely pauses after a long browser stall. Resume through its real control.
        if (phase === "paused" && bonus === 0) {
          Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.trim() === "Resume flight")?.click();
        }
        if (phase === "playing" && bonus === 0) {
          const low = Math.max(40, Math.floor(birdY - 35));
          // Crop on the GPU before reading pixels, avoiding a full-frame readback on phones.
          ctx.drawImage(canvas, 86 * canvas.width / 360, low * canvas.height / 540,
            26 * canvas.width / 360, 70 * canvas.height / 540, 0, 0, 26, 70);
          const data = ctx.getImageData(0, 0, 26, 70).data;
          let sum = 0, count = 0;
          for (let y = 0; y < 70; y++) for (let x = 0; x < 26; x++) {
            const i = (y * 26 + x) * 4;
            if (data[i] > 180 && data[i + 1] > 70 && data[i + 1] < 170 && data[i + 2] < 35) { sum += low + y; count++; }
          }
          if (count > 2) {
            birdY = sum / count;
            const score = Number(document.querySelector('[data-testid="shitbird-score"]')?.textContent ?? 0);
            if (birdY > (score >= 1 ? 326 : 311) && time - lastFlap > 140) {
              lastFlap = time;
              canvas.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }));
            }
          }
        }
        if (bonus > 0) { canvas.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP", key: "p", bubbles: true })); return; }
        if (phase !== "dead") requestAnimationFrame(pilot);
      };
      requestAnimationFrame(pilot);
    });
    await page.getByRole("button", { name: "Start game" }).click();
    await expect(page.getByTestId("shitbird-bonus")).toHaveText("25", { timeout: 12000 });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wcl.games.v1")!).data.shitbird);
    expect(saved).toMatchObject({ bestHits: 1, bestBonus: 25, bestCars: 1 });
    await page.getByRole("button", { name: "Resume flight" }).click();
    await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute("data-phase", "dead", { timeout: 6000 });
    await expect(page.getByText(/Unlocked: Chip thief/)).toBeVisible();
    await page.getByRole("button", { name: "Birds & flight plan" }).click();
    const thief = page.getByRole("button", { name: /^Chip thief/ });
    await expect(thief).toBeEnabled();
    await thief.click();
    await expect(thief).toHaveAttribute("aria-pressed", "true");
  });

  test("loads a shared daily coast, equips earned birds, copies a result and retries", async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem("wcl.games.v1", JSON.stringify({ version: 1, data: { shitbird: {
        best: 12, hasFlown: true, bestHits: 3, bestCombo: 3, bestBonus: 150,
        daily: { "2026-10-06": { score: 5, bonus: 75 } },
      } } }));
      // Exercise the visible copy fallback without a browser permission prompt.
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("unavailable")) } });
    });
    await page.goto("/games/shitbird?daily=2026-10-06");
    await requireAudioRuntime(page);
    await expect(page.getByRole("button", { name: "Start game" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Daily coast", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/Same course for everyone/)).toContainText("5 poles / 75 mischief");
    await page.screenshot({ path: testInfo.outputPath("daily-ready.png") });
    await page.getByRole("button", { name: /Birds & missions/ }).click();
    const hangar = page.getByRole("dialog", { name: "Birds and flight plan" });
    await expect(hangar).toBeFocused();
    const punk = hangar.getByRole("button", { name: /Public nuisance/ });
    await punk.click();
    await expect(punk).toHaveAttribute("aria-pressed", "true");
    const accessibility = await new AxeBuilder({ page }).include('[data-game="shitbird"]').analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath("flock.png") });
    await hangar.getByRole("button", { name: "Done", exact: true }).click();
    await expect(page.getByRole("button", { name: /Birds & missions/ })).toBeFocused();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("wcl.games.v1")!).data.shitbird.skin)).toBe("punk");
    await page.getByRole("button", { name: "Start game" }).click();
    const game = page.locator('[data-game="shitbird"]');
    await expect(game).toHaveAttribute("data-phase", "dead", { timeout: 6000 });
    await expect(page.getByTestId("shitbird-best")).toHaveText("05");
    await page.getByRole("button", { name: "Copy result" }).click();
    await expect(page.getByRole("textbox", { name: "Shareable flight result" })).toHaveValue(/daily=2026-10-06/);
    await page.screenshot({ path: testInfo.outputPath("flight-report.png") });
    await page.getByRole("button", { name: "Birds & flight plan" }).click();
    await hangar.getByRole("button", { name: "Free flight", exact: true }).click();
    await hangar.getByRole("button", { name: "Done", exact: true }).click();
    await page.getByRole("button", { name: "Play again" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    await expect(page.getByTestId("shitbird-bonus")).toHaveText("0");
    await expect(page.getByTestId("shitbird-best")).toHaveText("12");
  });

  test("waits for artwork and recovers from a failed sprite download", async ({
    page,
  }) => {
    await page.route("**/games/shitbird/gull.webp", (route) => route.abort());
    await page.goto("/games/shitbird?view=os");
    await requireAudioRuntime(page);
    await expect(
      page
        .getByRole("region", { name: "SHITBIRD arcade game" })
        .getByRole("alert"),
    ).toContainText("The game artwork could not load");
    await expect(
      page.getByRole("button", { name: "Exit to Games" }),
    ).toBeVisible();
    await page.unroute("**/games/shitbird/gull.webp");
    await page.getByRole("button", { name: "Reload game" }).click();
    await expect(
      page.getByRole("button", { name: "Start game" }),
    ).toBeEnabled();
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.getByRole("button", { name: "Start game" }).click();
    await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute(
      "data-phase",
      "playing",
    );
  });

  test("launches from Games, flies, pauses, retries, persists and exits cleanly", async ({
    page,
    isMobile,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/games?view=os");
    const shell = isMobile
      ? page.getByRole("region", { name: "Games app" })
      : page.getByRole("main", { name: "Desktop workspace" });
    const cover = shell.getByRole("img", { name: /^A scruffy gull/ });
    await cover.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        cover.evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    await requireAudioRuntime(page);
    await expect(page.locator("canvas")).toHaveCount(0);
    await page
      .getByRole("link", { name: "Play SHITBIRD", exact: true })
      .click();
    const game = page.getByRole("region", { name: "SHITBIRD arcade game" });
    const start = page.getByRole("button", { name: "Start game" });
    await expect(start).toBeEnabled();
    const canvas = game.locator("canvas");
    // Regression: the OS focus ring must never raise the canvas over Start.
    await canvas.focus();
    const box = await canvas.boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(2 / 3, 2);
    await expect(
      page.getByRole("button", { name: "Exit to Games" }),
    ).toBeInViewport();
    const results = await new AxeBuilder({ page })
      .include('[data-game="shitbird"]')
      .analyze();
    expect(results.violations).toEqual([]);

    await start.click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    if (isMobile) await canvas.tap();
    else await canvas.press("Space");
    await page.getByRole("button", { name: "Pause SHITBIRD" }).click();
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.waitForTimeout(1200);
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.getByRole("button", { name: "Resume flight" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    // No more inputs: gravity must end the run.
    await expect(game).toHaveAttribute("data-phase", "dead", { timeout: 6000 });
    await expect(
      page.getByRole("button", { name: "Play again" }),
    ).toBeFocused();
    const saved = await page.evaluate(() => ({
      games: JSON.parse(localStorage.getItem("wcl.games.v1")!).data,
      discoveries: JSON.parse(localStorage.getItem("wcl.discoveries.v1")!).data,
    }));
    expect(saved.games.shitbird.hasFlown).toBe(true);
    expect(saved.discoveries.achievementIds).toContain("shitbird.first-flight");
    expect(saved.discoveries.achievementIds).toContain("shitbird.first-death");
    expect(saved.discoveries.fightClubAchievementIds).toEqual([]);
    // The short impact guard expires while the report is being read.
    await page.waitForTimeout(220);
    await page.getByRole("button", { name: "Play again" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.getByRole("button", { name: "Exit to Games" }).click();
    await expect(page).toHaveURL(/\/games(?:\?view=os)?$/);
    await expect(page.locator("canvas")).toHaveCount(0);
    await page
      .getByRole("link", { name: "Play SHITBIRD", exact: true })
      .click();
    await expect(start).toBeEnabled();
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect(game).toHaveAttribute("data-phase", "ready");
    expect(errors).toEqual([]);
  });

  test("pauses on tab visibility and resize, keeps controls visible across themes", async ({
    page,
    isMobile,
  }) => {
    await page.addInitScript(() => {
      HTMLElement.prototype.requestFullscreen = () =>
        Promise.reject(new Error("Viewport resize fallback test"));
    });
    await page.goto("/games/shitbird?view=os");
    await requireAudioRuntime(page);
    const game = page.locator('[data-game="shitbird"]');
    await page.getByRole("button", { name: "Start game" }).click();
    await expect(game).toHaveAttribute("data-phase", "playing");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(game).toHaveAttribute("data-phase", "paused");
    await page.getByRole("button", { name: "Resume flight" }).click();
    if (isMobile) {
      await page.setViewportSize({ width: 844, height: 390 });
      await expect(game).toHaveAttribute("data-phase", "paused");
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      await page.setViewportSize({ width: 1100, height: 780 });
    }
    await expect(game).toHaveAttribute("data-phase", "paused");
    await expect(
      page.getByRole("button", { name: "Resume flight" }),
    ).toBeInViewport();
    for (const theme of ["westcose-95", "liquid-glass", "corporate-beige"]) {
      await page.evaluate((themeId) => {
        const p = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
        p.data.themeId = themeId;
        p.data.highContrast = true;
        p.data.extraReducedMotion = true;
        localStorage.setItem("wcl.preferences.v2", JSON.stringify(p));
        const discoveries = JSON.parse(
          localStorage.getItem("wcl.discoveries.v1")!,
        );
        discoveries.data.unlockedThemeIds = [
          ...new Set([...discoveries.data.unlockedThemeIds, themeId]),
        ];
        localStorage.setItem("wcl.discoveries.v1", JSON.stringify(discoveries));
      }, theme);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(
        page.getByRole("button", { name: "Start game" }),
      ).toBeEnabled();
      await expect(game.locator("canvas")).toBeInViewport();
      await expect(
        page.getByRole("button", { name: "Exit to Games" }),
      ).toBeInViewport();
    }
  });

  test("offers a usable exit when the browser cannot initialize Kaboom", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "AudioContext", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, "webkitAudioContext", {
        configurable: true,
        value: undefined,
      });
    });
    await page.goto("/games/shitbird?view=os");
    await expect(
      page.getByText(
        "This browser does not provide Web Audio, which Kaboom needs to start. Try another browser.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Exit to Games" }).click();
    await expect(page).toHaveURL(/\/games(?:\?view=os)?$/);
  });

  test("recovers a lost graphics context with a fresh canvas", async ({
    page,
  }) => {
    await page.goto("/games/shitbird?view=os");
    await requireAudioRuntime(page);
    await page.getByRole("button", { name: "Start game" }).click();
    await page.locator("canvas").evaluate((canvas) => {
      const gl = (canvas as HTMLCanvasElement).getContext("webgl")!;
      gl.getExtension("WEBGL_lose_context")!.loseContext();
    });
    await expect(
      page.getByText(
        "The graphics connection was interrupted. Reload the game; your best score is safe.",
      ),
    ).toBeVisible();
    await page.getByRole("button", { name: "Reload game" }).click();
    await expect(
      page.getByRole("button", { name: "Start game" }),
    ).toBeEnabled();
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.getByRole("button", { name: "Start game" }).click();
    await expect(page.locator('[data-game="shitbird"]')).toHaveAttribute(
      "data-phase",
      "playing",
    );
  });
});
