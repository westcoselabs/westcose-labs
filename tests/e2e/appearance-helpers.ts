import { expect, type Page } from "@playwright/test";

/** Seed once so reloads/navigation exercise real preference persistence. */
export async function seedAppearance(page: Page, themeId = "westcose-95", wallpaperId = "westcose-95") {
  await page.addInitScript(({ themeId, wallpaperId }) => {
    if (sessionStorage.getItem("classic-test-seeded")) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("classic-test-seeded", "true");
    sessionStorage.setItem("wcl.session.v2", JSON.stringify({
      version: 2,
      data: { readmeShown: true, startupPlayed: true, unlocked: true, page: 0, originPage: null, dismissedNotificationIds: [] },
    }));
    localStorage.setItem("wcl.preferences.v2", JSON.stringify({
      version: 2,
      data: { themeId, wallpaperId, soundEnabled: false, highContrast: false, extraReducedMotion: false, displayPreference: "auto" },
    }));
  }, { themeId, wallpaperId });
}

export async function selectDesktopTheme(page: Page, name: "Dusk" | "WestCose 95" | "Liquid Glass") {
  await page.getByRole("region", { name: "Desktop shortcuts" }).getByRole("button").first().focus();
  await page.keyboard.press("Shift+F10");
  await page.keyboard.press("ArrowRight");
  const menu = page.getByRole("menu", { name: "Theme", exact: true });
  await expect(menu).toBeVisible();
  // Opening a submenu focuses its checked item on the next animation frame.
  // Wait for that handoff before pressing another item (especially in WebKit).
  await expect(menu.locator('[aria-checked="true"]')).toBeFocused();
  await menu.getByRole("menuitemradio", { name: new RegExp(`^${name}`) }).press("Enter");
}

export async function openCustomize(page: Page) {
  await page.getByRole("button", { name: "Customize Home Screen" }).focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Customize" });
  await expect(sheet).toBeVisible();
  return sheet;
}

export async function expectClassicAttributes(page: Page, shell: "desktop" | "pocket") {
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-shell", shell);
  for (const [axis, value] of Object.entries({
    theme: "westcose-95", "theme-palette": "theme-tokens", "theme-scheme": "light",
    "theme-surface": "beveled", "theme-border": "outset", "theme-depth": "hard-shadow",
    "theme-type": "system-ui", "theme-chrome": "classic-titlebar", "theme-taskbar": "anchored-bar",
    "theme-widget": "flat-panel", "theme-icons": "outline", "theme-effects": "none",
  })) await expect(root).toHaveAttribute(`data-${axis}`, value);
}
