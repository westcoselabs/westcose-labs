import { expect, test, type Page } from "@playwright/test";

const HOST_PATTERN = "https://rosy-oak-905.higgsfield.gg/**";
const EMBED_URL = "https://rosy-oak-905.higgsfield.gg/?__raw=1";

async function readFightClubState(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("wcl.discoveries.v1");
    if (!raw) return null;
    const state = JSON.parse(raw).data;
    return {
      achievements: state.fightClubAchievementIds,
      launches: state.counters.fightClubLaunches,
    };
  });
}

test.describe("Phase 4 FightClub integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("does not request the remote build before explicit Play", async ({ page }) => {
    const remoteRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith("https://rosy-oak-905.higgsfield.gg/")) {
        remoteRequests.push(request.url());
      }
    });

    await page.goto("/?view=os");
    await page.goto("/games?view=os");
    await page.goto("/games/fightclub?view=os");

    expect(remoteRequests).toEqual([]);
    await expect(page.getByTitle("Citryn Fight Club hosted game")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("lazy-creates a constrained iframe and restores the Desktop launcher on Exit", async ({
    page,
  }) => {
    const remoteRequests: string[] = [];
    await page.route(HOST_PATTERN, async (route) => {
      remoteRequests.push(route.request().url());
      await route.fulfill({
        body: "<!doctype html><title>Citryn Fight Club test build</title><canvas></canvas>",
        contentType: "text/html",
      });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/games?view=os");
    await page.getByRole("link", { name: "Open launcher" }).click();
    await expect(page).toHaveURL(/\/games\/fightclub(?:\?view=os)?$/);
    expect(remoteRequests).toEqual([]);

    await page.getByRole("button", { name: "Play" }).click();
    const frame = page.getByTitle("Citryn Fight Club hosted game");
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("src", EMBED_URL);
    await expect(frame).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox",
    );
    await expect.poll(() => remoteRequests).toEqual([EMBED_URL]);
    await expect(
      page.getByRole("toolbar", { name: "FightClub player controls" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Open hosted build/ })).toHaveAttribute(
      "href",
      "https://rosy-oak-905.higgsfield.gg/",
    );

    const beforeMessages = await readFightClubState(page);
    await page.evaluate(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "unlock", achievement: "fightclub.fake-win" },
          origin: "https://evil.example",
        }),
      );
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "navigate", url: "https://evil.example" },
          origin: "https://rosy-oak-905.higgsfield.gg",
        }),
      );
    });
    expect(await readFightClubState(page)).toEqual(beforeMessages);

    await page.getByRole("button", { name: "Exit" }).click();
    await expect(frame).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Play" })).toBeFocused();
    expect((await readFightClubState(page))?.achievements).toEqual([
      "fightclub.first-launch",
      "fightclub.returned-to-os",
    ]);

    await page.goBack();
    await expect(page).toHaveURL(/\/games(?:\?view=os)?$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/games\/fightclub(?:\?view=os)?$/);
    await expect(page.getByTitle("Citryn Fight Club hosted game")).toHaveCount(0);
  });

  test("keeps a visible Pocket exit and returns through the shell Back flow", async ({
    page,
  }) => {
    await page.route(HOST_PATTERN, (route) =>
      route.fulfill({
        body: "<!doctype html><title>Citryn Fight Club test build</title><canvas></canvas>",
        contentType: "text/html",
      }),
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/games/fightclub?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");

    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByTitle("Citryn Fight Club hosted game")).toBeVisible();
    await expect(page.getByRole("button", { name: "Exit" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Exit" }).click();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL("/games");
  });
});
