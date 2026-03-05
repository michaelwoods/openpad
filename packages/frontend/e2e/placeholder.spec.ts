import { test, expect } from "@playwright/test";

test.describe("OpenPAD E2E Tests", () => {
  test("placeholder test", async ({ page }) => {
    await page.goto("/");
    expect(true).toBe(true);
  });
});
