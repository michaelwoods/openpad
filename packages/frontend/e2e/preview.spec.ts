import { test, expect } from "@playwright/test";

test.describe("Preview Panel E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("preview panel renders with title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "3D Preview" }).first(),
    ).toBeVisible();
  });

  test("export format dropdown is visible", async ({ page }) => {
    const formatSelect = page.locator("select").nth(1);
    await expect(formatSelect).toBeVisible();
  });

  test("download button is visible", async ({ page }) => {
    const downloadButton = page
      .getByRole("button", { name: "Download" })
      .first();
    await expect(downloadButton).toBeVisible();
  });
});
