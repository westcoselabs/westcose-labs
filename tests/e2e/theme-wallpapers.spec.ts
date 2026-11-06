import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seedAppearance } from "./appearance-helpers";

test.setTimeout(90_000);

const collections = [
  { theme: "dusk", recommended: "dusk-cliffs", names: ["Dusk Cliffs", "Moonwater", "Obsidian Shore"], alternate: "dusk-moonwater" },
  { theme: "westcose-95", recommended: "westcose-95", names: ["WestCose 95", "Tidal Grid", "Pacific Circuit"], alternate: "95-tidal-grid" },
  { theme: "liquid-glass", recommended: "liquid-glass", names: ["Tidal Light", "Prism Tide", "Lagoon Lens"], alternate: "glass-prism-tide" },
  { theme: "westcose-xp", recommended: "coastal-hills", names: ["Coastal Hills", "Wildflower Bluff", "Blue Reservoir"], alternate: "xp-wildflower-bluff" },
  { theme: "corporate-beige", recommended: "standard-issue", names: ["Standard Issue", "Paper Architecture", "Sunlit Atrium"], alternate: "beige-paper-architecture" },
];

for (const shell of ["desktop", "pocket"] as const) {
  test(`${shell} has three exclusive wallpapers per theme and persists the selected alternate`, async ({ page }, info) => {
    test.skip(info.project.name.startsWith("mobile-"), "Both viewport sizes are explicit");
    await page.setViewportSize(shell === "desktop" ? { width: 1440, height: 1000 } : { width: 375, height: 812 });
    await seedAppearance(page, "dusk", "dusk-cliffs");
    await page.goto("/settings/personality?view=os");
    await page.getByRole("slider", { name: "Tolerance for bad ideas" }).fill("100");
    await page.goto("/settings/appearance?view=os");
    const root = page.locator("html");
    const group = page.getByRole("radiogroup", { name: "Wallpaper", exact: true });
    for (const collection of collections) {
      await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption(collection.theme);
      await expect(root).toHaveAttribute("data-wallpaper", collection.recommended);
      await expect(group.getByRole("radio")).toHaveCount(3);
      for (const name of collection.names) await expect(group.getByRole("radio", { name: new RegExp(`^${name}`) })).toBeVisible();
      const alternate = group.getByRole("radio", { name: new RegExp(`^${collection.names[1]}`) });
      await alternate.click();
      await expect(root).toHaveAttribute("data-wallpaper", collection.alternate);
      await page.reload();
      await expect(root).toHaveAttribute("data-wallpaper", collection.alternate);
      await expect(alternate).toHaveAttribute("aria-checked", "true");
      // Verify real local image decode, not just the style string.
      expect(await root.evaluate(async (element, surface) => {
        const value = element.style.getPropertyValue(`--wallpaper-${surface}-image`);
        const image = new Image();
        image.src = value.slice(5, -2);
        await image.decode();
        return image.naturalWidth > 0;
      }, shell)).toBe(true);
      await group.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`${shell}-${collection.theme}.png`) });
      const results = await new AxeBuilder({ page }).include('[role="radiogroup"][aria-label="Wallpaper"]').withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(results.violations).toEqual([]);
    }
    await page.getByRole("combobox", { name: "Theme", exact: true }).selectOption("dusk");
    await expect(root).toHaveAttribute("data-wallpaper", "dusk-cliffs");
    const defaultChoice = group.getByRole("radio", { name: /^Dusk Cliffs/ });
    await defaultChoice.focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.getByRole("radio", { name: /^Moonwater/ })).toBeFocused();
    await expect(root).toHaveAttribute("data-wallpaper", "dusk-moonwater");
  });
}

test("an older mixed save recovers before hydration", async ({ page }) => {
  await seedAppearance(page, "westcose-xp", "dusk-moonwater");
  await page.route("**/_next/**/*.js*", route => route.abort());
  await page.goto("/?view=os", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "westcose-xp");
  await expect(page.locator("html")).toHaveAttribute("data-wallpaper", "coastal-hills");
});
