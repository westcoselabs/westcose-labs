import { expect, test } from "@playwright/test";

test.describe("Desktop OS", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("opens one route window beside a utility and restores from taskbar", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");

    const readme = page.getByRole("region", { name: "README.txt" });
    await expect(readme).toBeVisible();
    await readme.getByRole("button", { name: "Open Projects" }).click();
    await expect(page).toHaveURL("/projects");
    await expect(page.getByRole("region", { name: "Projects" })).toBeVisible();
    await expect(readme).toBeVisible();

    await page
      .getByRole("region", { name: "Projects" })
      .getByRole("button", { name: "Minimize Projects" })
      .click();
    await expect(page).toHaveURL("/");
    await page.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL("/projects");
  });

  test("searches the typed registry and exposes window placement alternatives", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("searchbox", { name: "Search applications" }).fill("settings");
    await page
      .getByRole("button", {
        name: "Settings Display, contrast, motion, sound, and session controls.",
      })
      .click();

    const settings = page.getByRole("region", { name: "Settings" });
    await settings
      .getByRole("button", { name: "Window menu for Settings" })
      .click();
    await expect(settings.getByRole("menuitem", { name: "Center" })).toBeVisible();
    await expect(settings.getByRole("menuitem", { name: "Snap left" })).toBeVisible();
    await expect(settings.getByRole("menuitem", { name: "Snap right" })).toBeVisible();
  });

  test("browser Back closes the route-backed window at Home", async ({ page }) => {
    await page.goto("/?view=os");
    await page
      .getByRole("region", { name: "README.txt" })
      .getByRole("button", { name: "Open Projects" })
      .click();
    await expect(page.getByRole("region", { name: "Projects" })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL("/?view=os");
    await expect(page.getByRole("region", { name: "Projects" })).toHaveCount(0);
  });

  test("uses explicit pinned placement and opens the tray status panel", async ({
    page,
  }) => {
    await page.goto("/?view=os");
    const pinned = page.getByRole("group", { name: "Pinned apps" });
    await expect(pinned.getByRole("button")).toHaveCount(4);
    await expect(pinned.getByRole("button").nth(0)).toHaveAccessibleName("Open Projects");
    await expect(pinned.getByRole("button").nth(1)).toHaveAccessibleName("Open Games");
    await expect(pinned.getByRole("button").nth(2)).toHaveAccessibleName("Open Notes");
    await expect(pinned.getByRole("button").nth(3)).toHaveAccessibleName("Open Settings");

    await page.locator('[aria-controls="desktop-clock-panel"]').click();
    await expect(
      page.getByRole("region", { name: "Date and system status" }),
    ).toBeVisible();
  });
});

test.describe("Normal View", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("preserves its query override across content routes", async ({ page }) => {
    await page.goto("/projects?view=normal");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
    await page
      .getByRole("article")
      .filter({ hasText: "Estate Sales Bakersfield" })
      .getByRole("link", { name: "Read case study" })
      .click();
    await expect(page).toHaveURL(
      "/projects/estate-sales-bakersfield?view=normal",
    );
    await expect(
      page.getByRole("heading", { name: "Estate Sales Bakersfield", level: 1 }),
    ).toBeVisible();
  });

  test("redirects the compatibility route", async ({ page }) => {
    await page.goto("/normal");
    await expect(page).toHaveURL("/?view=normal");
  });
});

test.describe("Pocket OS", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("unlocks into exactly two non-scrolling home pages", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await page.getByRole("button", { name: "Tap to unlock" }).click();

    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Home Page One" })).toHaveCount(1);
    await expect(page.getByRole("region", { name: "Home Page Two" })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Pocket Dock" })).toBeVisible();
    await expect(page.getByText("TV", { exact: true })).toHaveCount(0);
    await expect(page.getByText("World", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Arcade", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Go to Home Page 2" }).click();
    await expect
      .poll(() =>
        page
          .locator('[aria-label="Home pages"]')
          .evaluate((element) => element.scrollLeft),
      )
      .toBeGreaterThan(300);

    const geometry = await page.evaluate(() => ({
      body: document.body.scrollHeight,
      height: innerHeight,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    }));
    expect(geometry.body).toBeLessThanOrEqual(geometry.height + 1);
    expect(geometry.overflowX).toBe(0);
  });

  test("bypasses lock for a direct project route and follows nested Back", async ({
    page,
  }) => {
    await page.goto("/projects/estate-sales-bakersfield?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(page.getByRole("button", { name: "Tap to unlock" })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Estate Sales Bakersfield", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pocket Dock" })).toHaveCount(0);

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL("/projects");
    await page.getByRole("button", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
  });

  test("uses a route-scoped Normal fallback for Contact", async ({ page }) => {
    await page.goto("/contact?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
    await expect(
      page.getByText(
        "This destination uses Normal View on Pocket devices so every control remains conventional and accessible.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Text +1 612-741-7277" })).toHaveAttribute(
      "href",
      "sms:+16127417277",
    );
    await expect(page.getByRole("link", { name: "Call +1 612-741-7277" })).toHaveAttribute(
      "href",
      "tel:+16127417277",
    );
  });

  test("reveals status personality and restores the lock from Settings", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await page.getByRole("button", { name: "Tap to unlock" }).click();

    const status = page.getByRole("button", { name: "Build stable enough" });
    for (let tap = 0; tap < 5; tap += 1) await status.click();
    await expect(
      page.getByText("Diagnostic result: confidence exceeds available evidence."),
    ).toBeVisible();

    await page
      .getByRole("main", { name: "Pocket OS Home" })
      .locator("header")
      .getByRole("button", { name: "Open Settings" })
      .click();
    await page.getByRole("button", { name: "Preview lock screen" }).click();
    await expect(page.getByRole("button", { name: "Tap to unlock" })).toBeVisible();
    await page.getByRole("button", { name: "Tap to unlock" }).click();
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
  });

  test("keeps app overflow attached and switches to Normal View", async ({ page }) => {
    await page.goto("/projects?view=os");
    await page.getByRole("button", { name: "More actions for Projects" }).click();
    await page.getByRole("menuitem", { name: "Open Normal View" }).click();
    await expect(page).toHaveURL("/projects?view=normal");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
  });
});

test("keeps Pocket system screens inside required small viewports", async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== "chromium", "Focused viewport matrix runs once in Chromium");
  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 667, height: 375 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await page.getByRole("button", { name: "Tap to unlock" }).click();
    const overflow = await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth - innerWidth,
      vertical: document.body.scrollHeight - innerHeight,
    }));
    expect(overflow.horizontal).toBeLessThanOrEqual(0);
    expect(overflow.vertical).toBeLessThanOrEqual(1);
    await page.evaluate(() => sessionStorage.clear());
  }
});

test("does not request deferred heavy experiences", async ({ page }) => {
  const forbidden: string[] = [];
  page.on("request", (request) => {
    const url = request.url().toLowerCase();
    if (
      url.includes("three") ||
      url.includes("game-engine") ||
      url.includes("/tv") ||
      url.includes("/world")
    ) {
      forbidden.push(url);
    }
  });
  await page.goto("/");
  await page.goto("/games/fightclub");
  expect(forbidden).toEqual([]);
});
