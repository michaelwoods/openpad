import { test, expect } from "@playwright/test";

test.describe("Chat Panel E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("chat panel renders with title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "AI Chat" }).first(),
    ).toBeVisible();
  });

  test("shows empty state when no messages", async ({ page }) => {
    await expect(
      page.getByText("Start a conversation to iterate on your design").first(),
    ).toBeVisible();
  });

  test("provider dropdown is visible", async ({ page }) => {
    const providerSelect = page.locator("select").first();
    await expect(providerSelect).toBeVisible();
  });

  test("chat input is visible and enabled", async ({ page }) => {
    const input = page
      .locator('textarea[placeholder="Type a message... (Cmd+Enter to send)"]')
      .first();
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test("send button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Send message" }).first(),
    ).toBeVisible();
  });
});
