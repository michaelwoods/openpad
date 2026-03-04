import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test("should load the main page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OpenPAD/);
  });
});
