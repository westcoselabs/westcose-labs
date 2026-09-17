import { expect, test } from "@playwright/test";

const chapterNames = [
  "Overview",
  "Context and problem",
  "Role and responsibilities",
  "Strategy",
  "Information architecture",
  "UX and interaction design",
  "Visual system",
  "Technical architecture",
  "Challenges and tradeoffs",
  "Current status, outcomes, and next steps",
] as const;

test.describe("Phase 3 case studies", () => {
  test("renders a substantial Desktop case study with metadata and sticky index", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/projects/westcose-labs-os?view=os");

    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    await expect(
      page.getByRole("heading", { name: "WestCose Labs OS", level: 1 }),
    ).toBeVisible();
    await expect(page.locator(".case-study-section")).toHaveCount(10);
    for (const name of chapterNames) {
      await expect(page.getByRole("heading", { name, level: 2 })).toBeVisible();
    }
    await expect(page.getByRole("navigation", { name: "Case study sections" })).toHaveCSS(
      "position",
      "sticky",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/projects\/westcose-labs-os$/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /westcose-labs-os-cover\.webp$/,
    );
  });

  test("keeps Estate claims labeled and withholds unverified links", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/projects/estate-sales-bakersfield?view=normal");

    await expect(page.locator(".case-study-section")).toHaveCount(10);
    await expect(page.getByText("Development fixture", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Owner input needed", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Visit live site" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "View source" })).toHaveCount(0);
    await expect(page.getByText("Proposed", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Implemented", { exact: true }).first()).toBeVisible();
  });

  test("uses the same chapter content in Pocket without horizontal page overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects/westcose-labs-os?view=os");

    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.locator(".case-study-section")).toHaveCount(10);
    await expect(
      page.getByRole("heading", { name: chapterNames[9], level: 2 }),
    ).toBeAttached();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(0);
  });

  test("preserves related-work links and browser history between both case studies", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/projects/estate-sales-bakersfield?view=normal");
    await page
      .getByRole("link", { name: /WestCose Labs OS/ })
      .last()
      .click();
    await expect(page).toHaveURL("/projects/westcose-labs-os?view=normal");
    await page.goBack();
    await expect(page).toHaveURL(
      "/projects/estate-sales-bakersfield?view=normal",
    );
  });
});
