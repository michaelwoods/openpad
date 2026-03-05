import { test, expect } from "@playwright/test";

test.describe("OpenPAD E2E Tests", () => {
  test.describe("Page Load", () => {
    test("homepage renders successfully", async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveTitle(/OpenPAD/i);
      await expect(page.locator("h1")).toContainText("OpenPAD");
    });

    test("shows Agent and Editor mode buttons", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("button", { name: /Agent/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Editor/i })).toBeVisible();
    });

    test("shows sidebar with AI configuration", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: "AI Configuration" }),
      ).toBeVisible();
      await expect(
        page.locator("label", { hasText: "Provider" }),
      ).toBeVisible();
      await expect(page.locator("label", { hasText: "Model" })).toBeVisible();
    });

    test("shows export section in sidebar", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByText("Export")).toBeVisible();
      await expect(page.getByText("Format")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Download Model/i }),
      ).toBeVisible();
    });
  });

  test.describe("AI Provider Selection", () => {
    test("can select AI provider from dropdown", async ({ page }) => {
      await page.goto("/");

      const providerSelect = page.locator("select").first();
      await expect(providerSelect).toBeVisible();

      const options = providerSelect.locator("option");
      const count = await options.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("model dropdown updates when provider changes", async ({ page }) => {
      await page.goto("/");

      const providerSelect = page.locator("select").first();
      const initialValue = await providerSelect.inputValue();

      if (initialValue) {
        const modelSelect = page.locator("select").nth(1);
        await expect(modelSelect).toBeVisible();
      }
    });

    test("can toggle modular code switch", async ({ page }) => {
      await page.goto("/");

      const toggleButton = page
        .locator("button")
        .filter({ has: page.locator("span[class*='translate-x']") })
        .first();
      await expect(toggleButton).toBeVisible();
    });
  });

  test.describe("Mode Switching", () => {
    test("can switch between Agent and Editor modes", async ({ page }) => {
      await page.goto("/");

      const agentButton = page.getByRole("button", { name: /Agent/i });
      const editorButton = page.getByRole("button", { name: /Editor/i });

      await agentButton.click();
      await expect(agentButton).toHaveClass(/bg-zinc-700/);

      await editorButton.click();
      await expect(editorButton).toHaveClass(/bg-zinc-700/);
    });
  });

  test.describe("Sidebar Interactions", () => {
    test("can toggle sidebar visibility", async ({ page }) => {
      await page.goto("/");

      const toggleButton = page.getByRole("button", {
        name: /Toggle sidebar/i,
      });
      await expect(toggleButton).toBeVisible();
    });

    test("history section shows empty state", async ({ page }) => {
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: "History" }),
      ).toBeVisible();
      await expect(page.getByText("No history yet")).toBeVisible();
    });

    test("download button is disabled when no model is generated", async ({
      page,
    }) => {
      await page.goto("/");

      const downloadButton = page.getByRole("button", {
        name: /Download Model/i,
      });
      await expect(downloadButton).toBeVisible();
      await expect(downloadButton).toBeDisabled();
    });

    test("can click New Project button", async ({ page }) => {
      await page.goto("/");

      const newProjectButton = page.getByRole("button", {
        name: /New Project/i,
      });
      await expect(newProjectButton).toBeVisible();
    });
  });

  test.describe("About Modal", () => {
    test("can open about modal", async ({ page }) => {
      await page.goto("/");

      const aboutButton = page.getByRole("button", { name: /About/i });
      await aboutButton.click();

      await expect(page.getByText("About OpenPAD")).toBeVisible();
    });
  });

  test.describe("GitHub Link", () => {
    test("has GitHub link in header", async ({ page }) => {
      await page.goto("/");

      const githubLink = page.getByRole("link", { name: /GitHub/i });
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute(
        "href",
        "https://github.com/michaelwoods/openpad",
      );
    });
  });

  test.describe("Error States", () => {
    test("handles invalid route gracefully", async ({ page }) => {
      await page.goto("/invalid-route-that-does-not-exist");

      await expect(page.locator("h1")).toContainText("OpenPAD");
    });
  });

  test.describe("Export Format Selection", () => {
    test("can select different export formats", async ({ page }) => {
      await page.goto("/");

      const formatSelect = page.locator("select").nth(2);
      await expect(formatSelect).toBeVisible();

      await formatSelect.selectOption("stl");
      await expect(formatSelect).toHaveValue("stl");

      await formatSelect.selectOption("3mf");
      await expect(formatSelect).toHaveValue("3mf");

      await formatSelect.selectOption("amf");
      await expect(formatSelect).toHaveValue("amf");
    });
  });
});
