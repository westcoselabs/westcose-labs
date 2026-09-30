import { expect, test, type Page } from "@playwright/test";

async function expectViewportOnly(page: Page) {
  const geometry = await page.evaluate(() => ({
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
    scrollY,
  }));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  expect(geometry.scrollY).toBe(0);
}

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
    await page
      .getByRole("searchbox", { name: "Search applications" })
      .fill("settings");
    await page
      .getByRole("button", {
        name: "Settings Display, contrast, motion, sound, and session controls.",
      })
      .click();

    const settings = page.getByRole("region", { name: "Settings" });
    await settings
      .getByRole("button", { name: "Window menu for Settings" })
      .click();
    await expect(
      settings.getByRole("menuitem", { name: "Center" }),
    ).toBeVisible();
    await expect(
      settings.getByRole("menuitem", { name: "Snap left" }),
    ).toBeVisible();
    await expect(
      settings.getByRole("menuitem", { name: "Snap right" }),
    ).toBeVisible();
  });

  test("browser Back closes the route-backed window at Home", async ({
    page,
  }) => {
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
    await expect(pinned.getByRole("button").nth(0)).toHaveAccessibleName(
      "Open Projects",
    );
    await expect(pinned.getByRole("button").nth(1)).toHaveAccessibleName(
      "Open Games",
    );
    await expect(pinned.getByRole("button").nth(2)).toHaveAccessibleName(
      "Open Notes",
    );
    await expect(pinned.getByRole("button").nth(3)).toHaveAccessibleName(
      "Open Settings",
    );

    await page.locator('[aria-controls="desktop-clock-panel"]').click();
    await expect(
      page.getByRole("region", { name: "Date and system status" }),
    ).toBeVisible();
  });

  test("opens Services from the desktop and keeps scrolling inside its window", async ({ page }) => {
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell-ready", "true");
    await page.getByRole("button", { name: "Close README.txt", exact: true }).click();
    await expectViewportOnly(page);

    const shortcut = page.getByRole("region", { name: "Desktop shortcuts" })
      .getByRole("button", { name: /^Open Services\./ });
    await shortcut.click();
    await expect(page).toHaveURL("/?view=os");
    await shortcut.dblclick();
    await expect(page).toHaveURL("/services");
    const services = page.getByRole("region", { name: "Services", exact: true });
    await expect(services).toBeVisible();
    await expect(services.getByRole("heading", { level: 1 })).toHaveText("Website design and web development services");

    const content = services.locator('[data-route-content]').locator("..");
    expect(await content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await content.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByRole("navigation", { name: "Desktop taskbar" })).toBeInViewport();
    await expectViewportOnly(page);

    await services.getByRole("button", { name: "Close Services", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expectViewportOnly(page);
    for (const key of ["Enter", "Space"]) {
      await shortcut.focus();
      await shortcut.press(key);
      await expect(page).toHaveURL("/services");
      await expect(services).toBeVisible();
      await services.getByRole("button", { name: "Close Services", exact: true }).click();
      await expect(page).toHaveURL("/");
    }
  });
});

test.describe("Semantic document fallback", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("preserves its query override across content routes", async ({
    page,
  }) => {
    await page.goto("/projects?view=normal");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
    await page
      .getByRole("link", {
        name: "Explore Estate Sales Bakersfield",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      "/projects/estate-sales-bakersfield?view=normal",
    );
    await expect(
      page.getByRole("heading", { name: "Estate Sales Bakersfield", level: 1 }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Open OS view" }).click();
    await expect(page).toHaveURL("/projects/estate-sales-bakersfield?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
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

  test("unlocks into exactly two non-scrolling home pages", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await page.getByRole("button", { name: "Tap to unlock" }).click();

    await expect(
      page.getByRole("main", { name: "Pocket OS Home" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Home Page One" }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("region", { name: "Home Page Two" }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Pocket Dock" }),
    ).toBeVisible();
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

    await expectViewportOnly(page);
  });

  test("bypasses lock for a direct project route and follows nested Back", async ({
    page,
  }) => {
    await page.goto("/projects/estate-sales-bakersfield?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(
      page.getByRole("button", { name: "Tap to unlock" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Estate Sales Bakersfield", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Pocket Dock" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL("/projects");
    await page.getByRole("button", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("main", { name: "Pocket OS Home" }),
    ).toBeVisible();
  });

  test("uses a route-scoped semantic fallback for Contact", async ({
    page,
  }) => {
    await page.goto("/contact?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "normal");
    await expect(
      page.getByText(
        "This destination uses the accessible document layout on Pocket devices so every control remains conventional and accessible.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Text +1 612-741-7277" }),
    ).toHaveAttribute("href", "sms:+16127417277");
    await expect(
      page.getByRole("link", { name: "Call +1 612-741-7277" }),
    ).toHaveAttribute("href", "tel:+16127417277");
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
      page.getByText(
        "Diagnostic result: confidence exceeds available evidence.",
      ),
    ).toBeVisible();

    await page
      .getByRole("main", { name: "Pocket OS Home" })
      .locator("header")
      .getByRole("button", { name: "Open Settings" })
      .click();
    await page.getByRole("button", { name: "System", exact: true }).click();
    await expect(page).toHaveURL("/settings/system");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Reset home screen and session" })
      .click();
    await expect(
      page.getByRole("button", { name: "Tap to unlock" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tap to unlock" }).click();
    await expect(
      page.getByRole("main", { name: "Pocket OS Home" }),
    ).toBeVisible();
  });

  test("keeps app overflow attached without exposing the document fallback", async ({
    page,
  }) => {
    await page.goto("/projects?view=os");
    await page
      .getByRole("button", { name: "More actions for Projects" })
      .click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByText(/normal view/iu)).toHaveCount(0);
    await expect(page).toHaveURL("/projects?view=os");
  });

  test("opens Services as an app with nested Back and internal scrolling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?view=os");
    await page.getByRole("button", { name: "Tap to unlock" }).click();
    await page.getByRole("main", { name: "Pocket OS Home" })
      .getByRole("button", { name: "Open Services", exact: true }).click();
    await expect(page).toHaveURL("/services");
    const app = page.getByRole("region", { name: "Services app", exact: true });
    await expect(app).toBeVisible();
    const content = page.locator("#pocket-app-content");
    expect(await content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await content.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(app.getByRole("button", { name: "Home", exact: true })).toBeInViewport();
    await expectViewportOnly(page);

    await app.getByRole("link", { name: "Explore website design", exact: true }).click();
    await expect(page).toHaveURL("/services/website-design");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Custom website design for your business");
    await expectViewportOnly(page);
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page).toHaveURL("/services");
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Home Page One" })).toBeInViewport();
    await expectViewportOnly(page);
  });
});

test("keeps Pocket system screens inside required small viewports", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "Focused viewport matrix runs once in Chromium",
  );
  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 667, height: 375 },
  ];

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const clockTime = new Date("2026-09-28T12:00:00Z");
  await page.clock.install({ time: clockTime });
  await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/?view=os");
    await expect(page.getByRole("button", { name: "Skip startup" })).toBeVisible();
    await expectViewportOnly(page);
    await page.getByRole("button", { name: "Skip startup" }).click();
    await expect(page.getByRole("button", { name: "Tap to unlock" })).toBeVisible();
    await expectViewportOnly(page);
    await page.getByRole("button", { name: "Tap to unlock" }).click();
    await page.clock.runFor(250);
    await expect(page.getByRole("main", { name: "Pocket OS Home" })).toBeVisible();
    await expectViewportOnly(page);
  }
});

test("does not request deferred heavy experiences", async ({ page }) => {
  const forbidden: string[] = [];
  page.on("request", (request) => {
    const url = request.url().toLowerCase();
    if (
      url.includes("three") ||
      url.includes("game-engine") ||
      url.includes("rosy-oak-905.higgsfield.gg") ||
      url.includes("/tv") ||
      url.includes("/world")
    ) {
      forbidden.push(url);
    }
  });
  await page.goto("/");
  await page.goto("/games");
  await page.goto("/games/fightclub");
  expect(forbidden).toEqual([]);
});
