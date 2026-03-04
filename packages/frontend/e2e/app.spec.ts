import { test, expect } from "@playwright/test";

test.describe("App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the main page", async ({ page }) => {
    await expect(page).toHaveTitle(/OpenPAD/);
    await expect(page.locator("h1")).toContainText("OpenPAD");
  });

  test("should show agent and editor mode toggle", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Agent/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Editor/i })).toBeVisible();
  });

  test("should toggle between agent and editor modes", async ({ page }) => {
    const agentButton = page.getByRole("button", { name: /Agent/i });
    const editorButton = page.getByRole("button", { name: /Editor/i });

    await expect(agentButton).toHaveClass(/bg-zinc-700/);
    await editorButton.click();
    await expect(editorButton).toHaveClass(/bg-zinc-700/);
  });

  test("should display sidebar with AI configuration", async ({ page }) => {
    await expect(page.getByText("AI Configuration")).toBeVisible();
    await expect(page.getByText("Provider")).toBeVisible();
    await expect(page.getByText("Model")).toBeVisible();
  });

  test("should display export section in sidebar", async ({ page }) => {
    await expect(page.getByText("Export")).toBeVisible();
    await expect(page.getByText("Format")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Download Model/i }),
    ).toBeVisible();
  });

  test("should display chat panel", async ({ page }) => {
    await expect(page.getByText("AI Chat")).toBeVisible();
    await expect(
      page.getByText("Iterate on your design with natural language"),
    ).toBeVisible();
  });

  test("should show empty chat state", async ({ page }) => {
    await expect(
      page.getByText("Start a conversation to iterate on your design"),
    ).toBeVisible();
  });

  test("should have disabled download button when no model generated", async ({
    page,
  }) => {
    const downloadButton = page.getByRole("button", {
      name: /Download Model/i,
    });
    await expect(downloadButton).toBeDisabled();
  });

  test("should show history section in sidebar", async ({ page }) => {
    await expect(page.getByText("History")).toBeVisible();
    await expect(page.getByText("No history yet")).toBeVisible();
  });

  test("should have new project button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /New Project/i }),
    ).toBeVisible();
  });

  test("should toggle sidebar", async ({ page }) => {
    const toggleButton = page.getByRole("button", { name: /Toggle sidebar/i });
    await toggleButton.click();
  });
});

test.describe("AI Provider Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display provider select in chat panel", async ({ page }) => {
    const providerSelect = page.locator("select").first();
    await expect(providerSelect).toBeVisible();
  });

  test("should change provider in sidebar", async ({ page }) => {
    const providerSelect = page.locator("select").first();
    const options = providerSelect.locator("option");
    const count = await options.count();
    if (count > 1) {
      await providerSelect.selectOption({ index: 1 });
    }
  });
});

test.describe("Chat Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have chat input field", async ({ page }) => {
    const input = page.getByPlaceholder(/Describe what you want to create/i);
    await expect(input).toBeVisible();
  });

  test("should have send button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Send/i })).toBeVisible();
  });

  test("should show not configured message when provider is not set up", async ({
    page,
  }) => {
    const warning = page.getByText(/not configured/i);
    const warningCount = await warning.count();
    if (warningCount > 0) {
      await expect(warning.first()).toBeVisible();
    }
  });
});

test.describe("Editor Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Editor/i }).click();
  });

  test("should switch to editor mode", async ({ page }) => {
    const editorButton = page.getByRole("button", { name: /Editor/i });
    await expect(editorButton).toHaveClass(/bg-zinc-700/);
  });
});

test.describe("Export Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have STL as default export format", async ({ page }) => {
    const formatSelect = page.locator("select").nth(1);
    await expect(formatSelect).toHaveValue("stl");
  });

  test("should allow changing export format", async ({ page }) => {
    const formatSelect = page.locator("select").nth(1);
    await formatSelect.selectOption("3mf");
    await expect(formatSelect).toHaveValue("3mf");
  });
});

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should open about modal", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).click();
    await expect(page.getByText("About OpenPAD")).toBeVisible();
  });

  test("should close about modal", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).click();
    await expect(page.getByText("About OpenPAD")).toBeVisible();
    await page.getByRole("button", { name: /Back to Editor/i }).click();
    await expect(page.getByText("About OpenPAD")).not.toBeVisible();
  });
});
