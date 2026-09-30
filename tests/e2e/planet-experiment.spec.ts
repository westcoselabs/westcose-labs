import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { seedAppearance } from "./appearance-helpers";

const route = "/experiments/westcose-world?view=os";
const stat = (page: Page, label: string) => page.locator("[data-planet-stats] > div")
  .filter({ has: page.getByText(label, { exact: true }) }).locator("dd");

// Compare pixels rather than PNG bytes, allowing antialiased edge rounding.
async function changedPixelRatio(page: Page, first: Buffer, second: Buffer) {
  return page.evaluate(async ([left, right]) => {
    const decode = async (data: string) => {
      const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const canvas = document.createElement("canvas");
      // Focus-visible outlines can overlay the canvas edges after keyboard
      // input. Compare the rendered interior, not that accessibility chrome.
      canvas.width = image.width - 24;
      canvas.height = image.height - 24;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, -12, -12);
      image.close();
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [a, b] = await Promise.all([decode(left), decode(right)]);
    if (a.length !== b.length) return 1;
    let changed = 0;
    for (let index = 0; index < a.length; index += 4) {
      if ([0, 1, 2].some((channel) => Math.abs(a[index + channel] - b[index + channel]) > 18)) changed++;
    }
    return changed / (a.length / 4);
  }, [first.toString("base64"), second.toString("base64")]);
}

test.beforeEach(async ({ page }) => { await seedAppearance(page, "dusk", "dusk-cliffs"); });

test("opens each original planet alone full screen with independent controls", async ({ page, isMobile }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/planet-assets/")) requests.push(new URL(request.url()).pathname.split("/").at(-1)!);
  });
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("button", { name: "Explore Designs" })).toBeVisible();
  expect(requests).toEqual([]);
  const quality = isMobile ? "compact" : "full";
  await expect(page.getByLabel("Texture quality")).toHaveValue(quality);
  const worlds = [
    { id: "designs", label: "Designs", file: "westcose_designs", meshes: "1", triangles: "102,838" },
    { id: "labs", label: "Labs", file: "wc_building_westcose_labs_01_server_satellite_refined", meshes: "286", triangles: "72,736" },
    { id: "shop", label: "Shop", file: "wc_building_westcose_shop_01_apparel_exterior", meshes: "37", triangles: "276,682" },
  ];
  for (const [index, world] of worlds.entries()) {
    const trigger = page.getByRole("button", { name: `Explore ${world.label}`, exact: true });
    await trigger.click();
    const viewer = page.getByRole("dialog", { name: `WestCose ${world.label}`, exact: true });
    await expect(viewer).toHaveAttribute("data-status", "ready", { timeout: 45_000 });
    await expect(page.locator("[data-planet-stage] canvas")).toHaveCount(1);
    const canvas = viewer.locator("canvas");
    expect(requests).toHaveLength(index + 1);
    expect(requests[index]).toBe(`${world.file}.web-${quality}.glb`);
    const bounds = await viewer.boundingBox();
    expect(bounds?.x).toBe(0);
    expect(bounds?.y).toBe(0);
    expect(bounds?.width).toBe(page.viewportSize()!.width);
    expect(bounds?.height).toBe(page.viewportSize()!.height);
    await expect(viewer.getByRole("checkbox", { name: "Slow spin", exact: true })).toBeChecked();
    if (index === 0) {
      const firstSpinFrame = await canvas.screenshot();
      await expect.poll(async () => changedPixelRatio(page, await canvas.screenshot(), firstSpinFrame), { timeout: 15_000 }).toBeGreaterThan(0.01);
    }
    await viewer.getByRole("checkbox", { name: "Slow spin", exact: true }).uncheck();
    await viewer.getByRole("button", { name: "Reset", exact: true }).click();
    const stage = viewer.getByRole("group", { name: "3D planet controls" });
    await stage.focus();
    const captureScene = async (filename?: string) => {
      await stage.focus();
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      return canvas.screenshot(filename ? { path: info.outputPath(filename) } : {});
    };
    const baseline = await captureScene(`${world.id}-full-screen.png`);
    await page.keyboard.press("ArrowRight");
    expect(await changedPixelRatio(page, await captureScene(), baseline)).toBeGreaterThan(0.01);
    await page.keyboard.press("Home");
    await expect.poll(async () => changedPixelRatio(page, await captureScene(), baseline)).toBeLessThan(0.005);
    await viewer.getByRole("button", { name: "Move", exact: true }).click();
    await stage.focus();
    await page.keyboard.press("ArrowRight");
    expect(await changedPixelRatio(page, await captureScene(), baseline)).toBeGreaterThan(0.01);
    await page.keyboard.press("Home");
    await page.keyboard.press("+");
    expect(await changedPixelRatio(page, await captureScene(), baseline)).toBeGreaterThan(0.01);
    await page.keyboard.press("Home");
    await viewer.getByRole("button", { name: "Inspect", exact: true }).click();
    await expect(stat(page, "Triangles")).toHaveText(world.triangles);
    await expect(stat(page, "Meshes")).toHaveText(world.meshes);
    await viewer.getByRole("radio", { name: "Clay", exact: true }).check();
    await viewer.getByRole("button", { name: "Hide inspector", exact: true }).click();
    const clay = await captureScene(`${world.id}-clay.png`);
    expect(await changedPixelRatio(page, clay, baseline)).toBeGreaterThan(0.01);
    await viewer.getByRole("button", { name: "Inspect", exact: true }).click();
    await viewer.getByRole("radio", { name: "Wireframe", exact: true }).check();
    await expect(stat(page, "Triangles")).toHaveText(world.triangles);
    if (world.id === "labs") {
      await viewer.getByRole("combobox", { name: "Model parts", exact: true }).selectOption("labs:dish");
      await expect(stat(page, "Meshes")).toHaveText("95");
      await viewer.getByRole("combobox", { name: "Model parts", exact: true }).selectOption("labs");
      await expect(stat(page, "Meshes")).toHaveText("286");
    }
    await viewer.getByRole("radio", { name: "Final Materials", exact: true }).check();
    await viewer.getByRole("button", { name: "Hide inspector", exact: true }).click();
    await expect.poll(async () => changedPixelRatio(page, await captureScene(), baseline)).toBeLessThan(0.005);
    expect(requests).toHaveLength(index + 1);
    if (index === 0) {
      const results = await new AxeBuilder({ page }).include("[data-planet-viewer]").analyze();
      expect(results.violations).toEqual([]);
    }
    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    await expect(canvas).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test("respects reduced motion and recovers from a missing planet", async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/planet-assets/*labs*.glb", (route) => route.fulfill({ status: 503, body: "Source unavailable" }), { times: 1 });
  await page.goto(route);
  const trigger = page.getByRole("button", { name: "Explore Labs", exact: true });
  await trigger.click();
  await expect(page.locator("[data-planet-viewer]")).toHaveAttribute("data-status", "error", { timeout: 30_000 });
  await expect(page.getByRole("alert").filter({ hasText: "Retry" })).toBeVisible();
  await expect(page.locator("[data-planet-stage] canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  const viewer = page.getByRole("dialog", { name: "WestCose Labs", exact: true });
  await expect(viewer).toHaveAttribute("data-status", "ready", { timeout: 45_000 });
  await expect(viewer.getByRole("checkbox", { name: /Slow spin/ })).toBeDisabled();
  await expect(viewer.getByRole("checkbox", { name: /Slow spin/ })).not.toBeChecked();
  const canvas = viewer.locator("canvas");
  await expect(canvas).toHaveCount(1);
  const still = await canvas.screenshot();
  await expect.poll(async () => changedPixelRatio(page, await canvas.screenshot(), still)).toBeLessThan(0.005);
  await page.getByRole("button", { name: "Close 3D", exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(viewer).toHaveAttribute("data-status", "ready", { timeout: 45_000 });
  await expect(canvas).toHaveCount(1);
  await page.getByRole("button", { name: "Close 3D", exact: true }).click();
  await expect(trigger).toBeFocused();
});
