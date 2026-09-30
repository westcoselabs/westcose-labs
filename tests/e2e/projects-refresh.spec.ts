import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

test.beforeEach(async ({ page }) =>
  seedAppearance(page, "dusk", "dusk-cliffs"),
);

for (const theme of ["westcose-95", "liquid-glass"]) {
  test(`project showcase remains accessible in ${theme}`, async ({ page }) => {
    await page.goto("/projects?view=os");
    await expect(page.locator("[data-project-showcase]")).toBeVisible();
    await page.evaluate((theme) => {
      const saved = JSON.parse(localStorage.getItem("wcl.preferences.v2")!);
      saved.data.themeId = theme;
      saved.data.wallpaperId = theme;
      localStorage.setItem("wcl.preferences.v2", JSON.stringify(saved));
    }, theme);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(
      (
        await new AxeBuilder({ page })
          .include("[data-project-showcase]")
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

for (const size of [
  { width: 1440, height: 900 },
  { width: 375, height: 667 },
]) {
  test(`project showcase at ${size.width}px has real assets, working filters and source links`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize(size);
    await page.goto("/projects?view=os");
    const showcase = page.locator("[data-project-showcase]");
    await expect(showcase).toBeVisible();
    await expect(showcase.locator("[data-project-card]")).toHaveCount(14);
    await expect(
      showcase.getByRole("link", {
        name: "Visit Estate Sales Bakersfield",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://estate-sales-bakersfield.vercel.app");
    await expect(
      showcase.getByRole("link", {
        name: "View source for GitPress",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://github.com/westcoselabs/Gitpress");
    await expect
      .poll(() =>
        showcase
          .locator("img")
          .first()
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    expect(
      await showcase.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`projects-${size.width}.png`),
    });
    const filters = page.getByRole("group", { name: "Filter projects" });
    await filters.getByRole("button", { name: /^Tools/ }).click();
    await expect(showcase.locator("[data-project-card]")).toHaveCount(3);
    await expect(
      showcase.getByRole("heading", { name: "GitPress Forms", exact: true }),
    ).toBeVisible();
    await filters.getByRole("button", { name: /^Archive/ }).click();
    await expect(showcase.locator("[data-project-card]")).toHaveCount(1);
    await expect(
      showcase.getByRole("heading", { name: "WordPress workspace" }),
    ).toBeVisible();
    await filters.getByRole("button", { name: /^All/ }).click();
    const accessibility = await new AxeBuilder({ page })
      .include("[data-project-showcase]")
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await showcase
      .getByRole("link", { name: "Explore WestCose Designs", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "WestCose Designs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View source" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/westcoselabs/westcose-designs",
    );
    await page.goBack();
    await expect(showcase).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const width of [1440, 375]) {
  test(`interactive portfolio browsing, device previews and quick look at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: width === 375 ? 667 : 900 });
    await page.goto("/projects?view=os");
    const showcase = page.locator("[data-project-showcase]");
    const spotlight = page.getByRole("region", {
      name: "Client work spotlight",
    });
    await spotlight
      .getByRole("button", { name: "Show First Medical Associates" })
      .click();
    await expect(
      spotlight.getByRole("heading", { name: "First Medical Associates" }),
    ).toBeVisible();
    await spotlight.getByRole("button", { name: "Mobile preview" }).click();
    await expect(
      spotlight.getByRole("img", {
        name: "First Medical Associates mobile website capture",
      }),
    ).toBeVisible();
    await spotlight
      .getByRole("button", { name: "Show Simply Decorated by Riley" })
      .click();
    await expect(
      spotlight.getByRole("button", { name: "Mobile preview" }),
    ).toHaveCount(0);
    await expect(
      spotlight.getByRole("link", { name: "Visit Simply Decorated by Riley" }),
    ).toHaveAttribute("href", "https://decoratedbyriley.com/");
    await spotlight
      .getByRole("button", { name: "Show Trends Collision Center" })
      .click();
    await expect(
      spotlight.getByText("Redesign preview captures · September 2026"),
    ).toBeVisible();
    await expect(
      spotlight.getByRole("link", {
        name: "Preview design for Trends Collision Center",
      }),
    ).toHaveAttribute("href", "https://trends-frontend-eight.vercel.app/");

    const search = showcase.getByRole("searchbox", { name: "Search projects" });
    await search.fill("  gitpress  ");
    await expect(showcase.locator("[data-project-card]")).toHaveCount(2);
    await showcase.getByRole("button", { name: "List view" }).click();
    await expect(
      showcase.getByRole("button", { name: "List view" }),
    ).toHaveAttribute("aria-pressed", "true");
    const opener = showcase.getByRole("button", {
      name: "Preview GitPress",
      exact: true,
    });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "GitPress", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("link", {
        name: "View source for GitPress",
        exact: true,
      }),
    ).toHaveAttribute("href", "https://github.com/westcoselabs/Gitpress");
    await dialog
      .getByRole("button", { name: "Next project", exact: true })
      .click();
    await expect(
      dialog.getByRole("heading", { name: "GitPress Forms", exact: true }),
    ).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include("dialog").analyze()).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    await search.fill("nothing matches this project");
    await expect(
      showcase.getByRole("heading", { name: "No projects found" }),
    ).toBeVisible();
    await showcase.getByRole("button", { name: "Show all projects" }).click();
    await expect(showcase.locator("[data-project-card]")).toHaveCount(14);
    await showcase
      .getByRole("group", { name: "Filter projects" })
      .getByRole("button", { name: "Client sites", exact: true })
      .click();
    await expect(showcase.locator("[data-project-card]")).toHaveCount(4);
    await showcase
      .getByRole("button", { name: "Preview Barber Refinery", exact: true })
      .click();
    await expect(
      dialog.getByRole("link", {
        name: "Private repository for Barber Refinery",
      }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Mobile preview" }).click();
    await page.screenshot({ path: info.outputPath(`quick-look-${width}.png`) });
    await dialog.getByRole("button", { name: "Close preview" }).click();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
    await showcase
      .getByRole("link", {
        name: "Explore Simply Decorated by Riley",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("link", { name: /^Visit live site/ }),
    ).toHaveAttribute("href", "https://decoratedbyriley.com/");
    await expect(
      page.getByRole("link", { name: /repository documentation/ }),
    ).toHaveCount(0);
  });
}

test("Start menu contains its results and footer at ordinary and short desktop heights", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop pointer controls");
  for (const height of [720, 540, 400]) {
    await page.setViewportSize({ width: 1280, height });
    await page.goto("/projects?view=os");
    await page
      .getByRole("button", { name: "Close Projects", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    const menu = page.getByRole("region", { name: "Start menu", exact: true });
    await expect(menu).toBeVisible();
    const containment = await menu.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const footer = node.querySelector("footer")!.getBoundingClientRect();
      return {
        top: bounds.top,
        bottom: bounds.bottom,
        footerContained:
          footer.bottom <= bounds.bottom || style.overflowY === "auto",
      };
    });
    expect(containment.top).toBeGreaterThanOrEqual(0);
    expect(containment.bottom).toBeLessThan(height - 72);
    expect(containment.footerContained).toBe(true);
    await menu.getByRole("button", { name: "Restart later" }).focus();
    await expect(
      menu.getByRole("button", { name: "Restart later" }),
    ).toBeInViewport();
    await menu.getByRole("searchbox").fill("terminal");
    await expect(menu.getByRole("button", { name: /Terminal/ })).toHaveCount(1);
  }
});

test("all four invisible resize corners keep the opposite corner anchored", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop pointer controls");
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const corner of ["nw", "ne", "sw", "se"]) {
    await page.goto("/projects?view=os");
    await page
      .getByRole("button", { name: "Close Projects", exact: true })
      .waitFor();
    const handle = page.locator(`[data-corner="${corner}"]`).first();
    await expect(page.locator("[data-corner]")).toHaveCount(4);
    await expect(handle.locator("svg")).toHaveCount(0);
    const frame = handle.locator("..");
    const before = (await frame.boundingBox())!;
    const target = (await handle.boundingBox())!;
    const dx = corner.includes("w") ? 45 : -45;
    const dy = corner.includes("n") ? 35 : -35;
    await page.mouse.move(
      target.x + target.width / 2,
      target.y + target.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      target.x + target.width / 2 + dx,
      target.y + target.height / 2 + dy,
      { steps: 8 },
    );
    await page.mouse.up();
    await expect
      .poll(async () => (await frame.boundingBox())!.width)
      .toBeCloseTo(before.width - 45, 0);
    const after = (await frame.boundingBox())!;
    expect(after.height).toBeCloseTo(before.height - 35, 0);
    expect(corner.includes("w") ? after.x + after.width : after.x).toBeCloseTo(
      corner.includes("w") ? before.x + before.width : before.x,
      0,
    );
    expect(corner.includes("n") ? after.y + after.height : after.y).toBeCloseTo(
      corner.includes("n") ? before.y + before.height : before.y,
      0,
    );
  }
  await page
    .getByRole("button", { name: "Maximize Projects", exact: true })
    .click();
  await expect(page.locator("[data-corner]")).toHaveCount(0);
});

test("portrait LOW TIDE LOOT starts immediately with clear controls and a 16:9 canvas", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.addInitScript(() => {
    HTMLElement.prototype.requestFullscreen = () =>
      Promise.reject(new Error("Viewport fallback"));
  });
  await page.goto("/games/arcade/low-tide-loot");
  test.skip(
    !(await page.evaluate(() => Boolean(window.AudioContext))),
    "This runtime lacks Web Audio; the existing fallback test covers it.",
  );
  await expect(page.getByText("Turn your phone sideways to play.")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Start game" }).click();
  const game = page.locator('[data-game="low-tide-loot"]');
  await expect(game).toHaveAttribute("data-phase", "playing");
  const canvas = (await game.locator("canvas").boundingBox())!;
  const drop = page.getByRole("button", { name: "Drop claw" });
  await expect(drop).toBeInViewport();
  expect(canvas.width / canvas.height).toBeCloseTo(16 / 9, 2);
  expect((await drop.boundingBox())!.y).toBeGreaterThanOrEqual(
    canvas.y + canvas.height,
  );
  expect(
    await game.evaluate(
      (node) =>
        node.scrollWidth <= node.clientWidth &&
        node.scrollHeight <= node.clientHeight,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("loot-portrait-playing.png") });
  await drop.click();
  await expect(game).not.toHaveAttribute("data-claw", "swinging");
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(game).toHaveAttribute("data-phase", "paused");
  await page.getByRole("button", { name: "Resume salvaging" }).click();
  await expect(game).toHaveAttribute("data-phase", "playing");
  await page.screenshot({
    path: info.outputPath("loot-landscape-playing.png"),
  });
});
