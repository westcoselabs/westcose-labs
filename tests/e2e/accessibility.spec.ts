import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test("Semantic project fallback has no automated WCAG A/AA violations", async ({
  page,
}) => {
  await page.goto("/projects/estate-sales-bakersfield?view=normal");
  await expectNoAxeViolations(page);
});

test("Desktop case study has no automated WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects/westcose-labs-os?view=os");
  await expectNoAxeViolations(page);
});

test("Pocket case study has no automated WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/westcose-labs-os?view=os");
  await expectNoAxeViolations(page);
});

test("FightClub launcher has no automated WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/fightclub?view=os");
  await expectNoAxeViolations(page);
});

test("Pocket FightClub player chrome has no automated WCAG A/AA violations", async ({
  page,
}) => {
  await page.route("https://rosy-oak-905.higgsfield.gg/**", (route) =>
    route.fulfill({
      body: "<!doctype html><title>Citryn Fight Club test build</title><canvas></canvas>",
      contentType: "text/html",
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/games/fightclub?view=os");
  await page.getByRole("button", { name: "Play" }).click();
  await expectNoAxeViolations(page);
});

test("Desktop root has no automated WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?view=os");
  await expectNoAxeViolations(page);
});

test("Pocket home has no automated WCAG A/AA violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?view=os");
  await page.getByRole("button", { name: "Tap to unlock" }).click();
  await expectNoAxeViolations(page);
});
