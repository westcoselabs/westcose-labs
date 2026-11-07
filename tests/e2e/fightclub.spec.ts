import { expect, test } from "@playwright/test";
import { seedAppearance } from "./appearance-helpers";

const destination = "https://rosy-oak-905.higgsfield.gg/";
for (const width of [1440, 390]) {
  test(`FightClub opens directly in a new tab at ${width}px`, async ({ page, context }) => {
    await seedAppearance(page, "dusk", "dusk-cliffs");
    await page.setViewportSize({ width, height: 900 });
    await context.route(`${destination}**`, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Hosted FightClub</title><h1>FightClub</h1>" }));
    await page.goto("/games?view=os");
    const link = page.getByRole("link", { name: "Play FightClub", exact: true });
    await expect(link).toHaveAttribute("target", "_blank");
    const popupPromise = page.waitForEvent("popup");
    await link.click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(destination);
    await expect(page).toHaveURL(/\/games(?:\?view=os)?$/);
    await expect(page.locator('iframe[src*="higgsfield"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Start game" })).toHaveCount(0);
    await popup.close();
  });
}

test("the old FightClub URL redirects to the hosted game", async ({ request }) => {
  const response = await request.get("/games/fightclub", { maxRedirects: 0 });
  expect([307, 308]).toContain(response.status());
  expect(response.headers().location).toBe(destination);
});

test("desktop and Pocket shortcuts launch FightClub without an intermediate route", async ({ page, context }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await context.route(`${destination}**`, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>FightClub</title>" }));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?view=os");
    if (width < 768) await page.getByRole("button", { name: "Go to Home Page 2" }).click();
    const shortcut = page.getByRole("button", { name: /^Open FightClub in a new tab/ });
    const popupPromise = page.waitForEvent("popup");
    await shortcut.press("Enter");
    const popup = await popupPromise;
    await popup.waitForLoadState();
    await expect(popup).toHaveURL(destination);
    expect(new URL(page.url()).pathname).toBe("/");
    await popup.close();
  }
});
