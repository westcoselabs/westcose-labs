import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { seedAppearance } from "./appearance-helpers";

// Each case audits all four skins; high-DPI WebKit needs time for each AX tree.
test.setTimeout(90_000);

for (const viewport of [{ width: 1440, height: 900 }, { width: 320, height: 568 }]) {
  test(`theme gallery stays usable at ${viewport.width}px and preserves wallpaper`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await seedAppearance(page, "dusk", "dusk-cliffs");
    await page.goto("/settings/appearance?view=os");
    for (const name of ["WestCose 95", "Liquid Glass", "WestCose XP", "Dusk"]) {
      const option = page.getByRole("button", { name: `Apply ${name} theme` });
      await option.click();
      await expect(option).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("radio", { name: /^Dusk Cliffs/ })).toHaveAttribute("aria-checked", "true");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const presenter = page.locator('[data-app-presenter]').first();
      expect(await presenter.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) }))).toEqual([]);
    }
    const wallpaper = page.getByRole("radio", { name: /^Dusk Cliffs/ });
    await wallpaper.focus();
    await wallpaper.press("ArrowRight");
    await expect(page.getByRole("radio", { name: /^Graphite Field/ })).toBeFocused();
    await expect(page.getByRole("radio", { name: /^Graphite Field/ })).toHaveAttribute("aria-checked", "true");
    await page.reload();
    await expect(page.getByRole("radio", { name: /^Graphite Field/ })).toHaveAttribute("aria-checked", "true");
  });
}
