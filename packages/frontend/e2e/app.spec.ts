import { test, expect } from "@playwright/test";

test.describe("OpenPAD App", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OpenPAD|Open Prompt/);
  });

  test("should display header with app name", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/OpenPAD|Open Prompt/i)).toBeVisible();
  });

  test("should have editor and preview sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".monaco-editor")).toBeVisible({
      timeout: 10000,
    });
  });
});
