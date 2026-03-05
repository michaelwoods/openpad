import { test, expect } from "@playwright/test";

test.describe("OpenPAD E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("homepage renders correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/OpenPAD/);
    await expect(page.getByRole("heading", { name: "OpenPAD" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Agent" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Editor" })).toBeVisible();
  });

  test("mode switching works", async ({ page }) => {
    const agentButton = page.getByRole("button", { name: "Agent" });
    const editorButton = page.getByRole("button", { name: "Editor" });

    await expect(agentButton).toHaveClass(/bg-zinc-700/);
    await editorButton.click();
    await expect(editorButton).toHaveClass(/bg-zinc-700/);
  });

  test("sidebar toggle works", async ({ page }) => {
    const sidebarToggle = page.getByRole("button", { name: "Toggle sidebar" });
    await sidebarToggle.click();
  });

  test("about modal opens", async ({ page }) => {
    await page.getByRole("button", { name: "About" }).click();
    await expect(
      page.getByRole("heading", { name: "About OpenPAD" }),
    ).toBeVisible();
  });

  test("AI provider selection dropdown exists", async ({ page }) => {
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });
});
