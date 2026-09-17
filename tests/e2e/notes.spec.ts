import { expect, test } from "@playwright/test";

test.describe("Phase 1 Notes", () => {
  test.beforeEach(async ({ browserName, page }) => {
    test.skip(browserName !== "chromium", "Focused Notes coverage runs once");
    await page.addInitScript(() => {
      if (sessionStorage.getItem("phase1-notes-seeded")) return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("phase1-notes-seeded", "true");
    });
  });

  test("uses nested Pocket routes and persists the local note lifecycle", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/notes?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "pocket");
    await expect(page.getByRole("heading", { level: 1, name: "Notes" })).toBeVisible();

    await page.getByRole("button", { name: /Project Notes/ }).click();
    await expect(page).toHaveURL("/notes/folder/project-notes");
    await page.getByRole("button", { name: /WestCose Labs README/ }).click();
    await expect(page).toHaveURL("/notes/readme");
    await expect(page.getByRole("heading", { level: 1, name: "WestCose Labs README" })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL("/notes/folder/project-notes");

    await page.goto("/notes?view=os");
    await page.getByRole("button", { name: "Create new note" }).click();
    await expect(page).toHaveURL(/\/notes\/local-/u);
    const localUrl = page.url();
    await page.getByRole("textbox", { name: "Note title" }).fill("Pocket field note");
    await page.getByRole("textbox", { name: "Note body" }).fill("Saved locally across reloads.");
    await page.getByRole("button", { name: "Pin note" }).click();
    await page.reload();
    await expect(page).toHaveURL(localUrl);
    await expect(page.getByRole("textbox", { name: "Note title" })).toHaveValue("Pocket field note");
    await expect(page.getByRole("textbox", { name: "Note body" })).toHaveValue("Saved locally across reloads.");
    await page.getByRole("button", { name: "Move note to Recycle" }).click();
    await expect(page).toHaveURL("/notes/folder/recently-deleted");
    await expect(page.getByText("Pocket field note")).toBeVisible();
    await page.getByRole("button", { name: "Restore", exact: true }).click();
    await expect(page.getByText("Pocket field note")).toHaveCount(0);
  });

  test("renders the Desktop PC editor and enforces the final filename", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/notes/final-final-v8?view=os");
    await expect(page.locator("html")).toHaveAttribute("data-shell", "desktop");
    const notepad = page.locator('[data-app-presenter="desktop-notepad"]');
    await expect(notepad.getByRole("menubar", { name: "Pocket Notepad menu" })).toBeVisible();
    await expect(notepad.getByRole("heading", { name: "Final_FINAL_v8", exact: true })).toBeVisible();
    await expect(notepad.getByRole("heading", { name: "Folders" })).toHaveCount(0);

    await notepad.getByRole("button", { name: "Edit" }).click();
    await notepad.getByRole("menuitem", { name: "Rename" }).click();
    await expect(notepad.getByText("This file is already final.").first()).toBeVisible();
  });

  test("mutates the configured note title after five opens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/notes/do-not-redesign?view=os");
    for (let open = 1; open < 5; open += 1) {
      await page.reload();
    }

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Do not redesign this again (seriously)",
      }),
    ).toBeVisible();
    await expect(page.getByText("Five opens later, the note would still prefer not to be redesigned.")).toBeVisible();
  });
});
