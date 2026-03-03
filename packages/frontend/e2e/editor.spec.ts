import { test, expect } from "@playwright/test";

test.describe("Editor Panel E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("editor panel renders with title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Code Editor" }),
    ).toBeVisible();
  });

  test("editor loads with placeholder or initial code", async ({ page }) => {
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();
  });
});
