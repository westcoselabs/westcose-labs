import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

// These cover several complete interactions in one session, including high-DPI
// WebKit screenshots and viewport changes. Keep actionability checks enabled.
test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await seedAppearance(page, "dusk", "dusk-cliffs");
  await page.clock.install();
});

test("desktop outbreak clears the cursor through exactly three dodges and cleans up repeatably", async ({
  page,
}, info) => {
  // WebKit captures and the full cleanup sequence need room on slower devices.
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/recycle?view=os");
  await expect(
    page.getByRole("button", { name: "Close Recycle", exact: true }),
  ).toBeVisible();
  const button = page.getByRole("button", { name: "DO NOT PRESS" });
  await button.scrollIntoViewIfNeeded();
  const transforms: string[] = [];
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(0, 0);
    const rect = (await button.boundingBox())!;
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.clock.runFor(180);
    const escaped = (await button.boundingBox())!;
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    expect(x < escaped.x || x > escaped.x + escaped.width || y < escaped.y || y > escaped.y + escaped.height,
      `Dodge ${i + 1} must move the whole button clear of the cursor`).toBe(true);
    const arena = (await page.locator('[data-evasion-arena]').boundingBox())!;
    expect(escaped.x).toBeGreaterThanOrEqual(arena.x - 1);
    expect(escaped.x + escaped.width).toBeLessThanOrEqual(arena.x + arena.width + 1);
    expect(escaped.y).toBeGreaterThanOrEqual(Math.max(8, arena.y) - 1);
    expect(escaped.y + escaped.height).toBeLessThanOrEqual(Math.min(892, arena.y + arena.height) + 1);
    transforms.push(
      await button.evaluate((node) => (node as HTMLElement).style.transform),
    );
    await expect(page.locator("[data-creature-field]")).toHaveCount(0);
    await expect(page.locator("[data-dodges]")).toHaveAttribute("data-dodges", String(i + 1));
  }
  expect(transforms[0]).not.toBe(transforms[1]);
  await expect(page.getByText("Fine. But you're their parent now.")).toBeVisible();
  await expect(page.getByText("Out of excuses")).toBeVisible();
  await page.mouse.move(0, 0);
  const resting = (await button.boundingBox())!;
  await page.mouse.move(resting.x + resting.width / 2, resting.y + resting.height / 2);
  await page.clock.runFor(180);
  expect(await button.boundingBox()).toEqual(resting);
  await page.screenshot({ path: info.outputPath("desktop-button.png"), scale: "css" });
  await button.click();
  await expect(page.getByText("WELL, FUCK.")).toBeVisible();
  const field = page.locator("[data-creature-field]");
  await expect(field).toBeVisible();
  await expect(field).toHaveAttribute("data-creature-count", "13");
  const outbreakId = await field.getAttribute("data-outbreak-id");
  await expect(page.locator("[data-egg-alert]").first()).toBeVisible();
  await page.screenshot({ path: info.outputPath("desktop-outbreak.png"), scale: "css" });
  await page
    .getByRole("button", { name: "Close Recycle", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(field).toHaveAttribute("data-outbreak-id", outbreakId!);
  await page.clock.fastForward(26_000);
  await expect(
    page.getByRole("button", { name: "GET THESE FUCKERS OUT" }),
  ).toBeVisible();
  const notice = page.locator("[data-egg-alert]").first();
  const title = await notice.locator("strong").innerText();
  await notice.getByRole("button").click();
  await expect(
    page.getByRole("button", { name: `Dismiss ${title}`, exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "GET THESE FUCKERS OUT" }).click();
  await page.clock.runFor(2500);
  await expect(field).toHaveCount(0);
  await expect(page.locator("[data-egg-alert]")).toHaveCount(0);
  await expect(page.locator("[data-egg-host]").getByRole("status")).toHaveText(
    /Quarantine restored.[\s\S]*Probably/,
  );
  await page.clock.fastForward(10_000);
  await expect(page.locator("[data-egg-alert]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("restore windows reuse desktop chrome and preserve the bounded revision save", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/recycle?view=os");
  await page.getByRole("button", { name: "Restore final-final file" }).click();
  await expect(
    page.getByText("final-final-v8-client-really-final.fig"),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("final-final-v8-client-really-final.fig"),
  ).toBeVisible();
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Restore final-final file" })
      .click();
  await expect(page.locator("[data-egg-host]").getByRole("status")).toHaveText(
    "Version control has requested medical leave.",
  );
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByRole("button", { name: /Restore weekend-project/ }).click();
  const process = page.locator("[data-egg-panel='weekend']");
  await expect(process).toBeVisible();
  await expect(process.getByText("438 days")).toBeVisible();
  await page.screenshot({ path: info.outputPath("process-monitor.png") });
  await page
    .getByRole("button", {
      name: "Minimize WestCose Process Monitor",
      exact: true,
    })
    .click();
  await expect(process).not.toBeVisible();
  await page.setViewportSize({ width: 1320, height: 880 });
  await expect(process).not.toBeVisible();
  await page
    .getByRole("button", { name: "WestCose Process Monitor", exact: true })
    .click();
  await expect(process).toBeVisible();
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(process).toHaveCount(1);
  await expect(process).toBeVisible();
  await page
    .getByRole("button", {
      name: "Close WestCose Process Monitor",
      exact: true,
    })
    .click();
  await expect(page.locator("[data-egg-host]").getByRole("status")).toHaveText(
    "Process minimized to your subconscious.",
  );
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await page.getByRole("button", { name: /Restore meeting-that/ }).click();
  await expect(page.getByText("5 joined", { exact: true })).toBeVisible();
  for (const line of [
    "Can everyone see my screen?",
    "You’re muted.",
    "Sorry, go ahead.",
    "No, you go ahead.",
    "We can circle back.",
    "This could have been a README.",
    "Everyone left.",
    "Meeting ended.",
  ]) {
    await page.clock.runFor(1500);
    await expect(page.getByText(line, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("Meeting ended.")).toBeVisible();
  await expect(page.getByText("Nothing was decided.")).toBeVisible();
  await page.screenshot({ path: info.outputPath("pocket-meeting.png") });
  await page.getByRole("button", { name: "Leave meeting" }).click();
  await expect(page.locator("[data-egg-panel]")).toHaveCount(0);
});

test("Terminal retains normal commands and deliberately launches the fake update", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/terminal?view=os");
  await expect(
    page.getByRole("button", { name: "Close Terminal", exact: true }),
  ).toBeVisible();
  const input = page.getByRole("textbox", { name: "Command" });
  for (const [command, response] of [
    ["sudo rm scope-creep", "scope-creep owns this machine"],
    ["sudo fix-client-feedback", "not a valid design specification"],
    ["open quarantine", "absolutely not"],
    ["open quarantine", "seriously."],
    ["help", "open fightclub | theme | history | secret | clear"],
  ]) {
    await input.fill(command);
    await input.press("Enter");
    await expect(page.getByRole("log")).toContainText(response);
  }
  await input.fill("sudo update");
  await input.press("Enter");
  await expect(page.locator("[data-egg-panel='update']")).toBeVisible();
  for (const progress of [17, 84, 97, 31, 99, 99, 99, 100, 100]) {
    await page.clock.runFor(1500);
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "value",
      String(progress),
    );
  }
  await expect(
    page.getByText("Client requested another revision."),
  ).toBeVisible();
  await page.getByRole("button", { name: "OF COURSE" }).click();
  await expect(page.locator("[data-egg-panel]")).toHaveCount(0);
  await input.fill("open quarantine");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/recycle#quarantine$/);
  await expect(
    page.getByRole("button", { name: "DO NOT PRESS" }),
  ).toBeVisible();
});

test.describe("Pocket", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
  test("three taps evade, fourth releases; creatures survive both home pages", async ({
    page,
  }, info) => {
    test.setTimeout(90_000);
    await page.goto("/recycle?view=os");
    const button = page.getByRole("button", { name: "DO NOT PRESS" });
    for (let i = 0; i < 3; i++) {
      await button.tap();
      await expect(button).toBeVisible();
      await expect(page.locator("[data-dodges]")).toHaveAttribute("data-dodges", String(i + 1));
      await expect(page.locator("[data-creature-field]")).toHaveCount(0);
    }
    await button.tap();
    const field = page.locator("[data-creature-field]");
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute("data-creature-count", "8");
    const id = await field.getAttribute("data-outbreak-id");
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await page.getByRole("button", { name: "Go to Home Page 2" }).click();
    await page.clock.runFor(400);
    await expect.poll(() => page.getByLabel("Home pages", { exact: true })
      .evaluate(node => Math.round(node.scrollLeft))).toBe(375);
    await expect(field).toHaveAttribute("data-outbreak-id", id!);
    await page.getByRole("button", { name: "Go to Home Page 1" }).click();
    await page.clock.runFor(400);
    await expect(field).toHaveAttribute("data-outbreak-id", id!);
    await expect
      .poll(() =>
        page
          .getByLabel("Home pages", { exact: true })
          .evaluate((node) => Math.round(node.scrollLeft)),
      )
      .toBe(0);
    await page.clock.runFor(3200);
    await page.screenshot({ path: info.outputPath("pocket-outbreak.png"), scale: "css" });
    // A slow capture can cross the 25-second label upgrade; this remains the
    // same containment button before and after Pest Control arrives.
    await page.locator("[data-outbreak-control]").click();
    await expect(field).toHaveCount(0);
    await expect(page.locator("[data-egg-alert]")).toHaveCount(0);
  });
});

test("reduced motion skips evasions and animation; keyboard can always recover", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/recycle?view=os");
  await page.getByRole("button", { name: "DO NOT PRESS" }).click();
  const field = page.locator("[data-creature-field]");
  await expect(field).toBeVisible();
  const first = await field.evaluate((node) =>
    (node as HTMLCanvasElement).toDataURL(),
  );
  await page.clock.runFor(800);
  expect(
    await field.evaluate((node) => (node as HTMLCanvasElement).toDataURL()),
  ).toBe(first);
  const accessibility = await new AxeBuilder({ page })
    .include("#quarantine")
    .include("[data-egg-host]")
    .analyze();
  expect(accessibility.violations).toEqual([]);
  // WebKit intentionally does not focus buttons on pointer clicks. Start the
  // keyboard path here; the second release below verifies automatic recovery.
  await page.locator("[data-outbreak-control]").focus();
  await page.keyboard.press("Enter");
  await page.clock.runFor(10);
  await expect(field).toHaveCount(0);
  await expect(page.getByRole("button", { name: "DO NOT PRESS" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(field).toHaveCount(1);
  await expect(page.locator("[data-outbreak-control]")).toBeFocused();
});
