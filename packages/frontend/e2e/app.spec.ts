import { test, expect } from "@playwright/test";

test.describe("OpenPAD E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Page Load", () => {
    test("homepage renders successfully", async ({ page }) => {
      await expect(page).toHaveTitle(/OpenPAD/i);
      await expect(page.locator("h1")).toContainText("OpenPAD");
      await expect(page.locator("header")).toBeVisible();
      await expect(page.getByRole("button", { name: /agent/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /editor/i })).toBeVisible();
    });

    test("main layout components are visible", async ({ page }) => {
      await expect(page.locator(".flex.flex-col.h-screen")).toBeVisible();
      await expect(page.getByLabel("Toggle sidebar")).toBeVisible();
      await expect(page.getByLabel("About")).toBeVisible();
      await expect(page.getByLabel("GitHub")).toBeVisible();
    });
  });

  test.describe("AI Provider Configuration", () => {
    test("provider selector exists in sidebar", async ({ page }) => {
      await expect(page.getByLabel(/provider/i)).toBeVisible();
    });

    test("model selector exists in sidebar", async ({ page }) => {
      await expect(page.getByLabel(/model/i)).toBeVisible();
    });

    test("can toggle code style", async ({ page }) => {
      const toggle = page
        .locator('button[aria-label="Toggle code style"]')
        .first();
      if (await toggle.isVisible()) {
        await toggle.click();
      }
    });
  });

  test.describe("Chat Interaction", () => {
    test("chat input is visible", async ({ page }) => {
      await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
    });

    test("shows initial chat message prompt", async ({ page }) => {
      await expect(page.getByText(/start a conversation/i)).toBeVisible();
    });

    test("can type in chat input", async ({ page }) => {
      const input = page.getByPlaceholder(/type a message/i);
      await input.fill("Create a simple cube");
      await expect(input).toHaveValue("Create a simple cube");
    });

    test("send button is disabled when input is empty", async ({ page }) => {
      const sendButton = page.getByRole("button", { name: /send/i });
      await expect(sendButton).toBeDisabled();
    });

    test("send button is enabled when input has text", async ({ page }) => {
      const input = page.getByPlaceholder(/type a message/i);
      await input.fill("Create a simple cube");
      const sendButton = page.getByRole("button", { name: /send/i });
      await expect(sendButton).toBeEnabled();
    });

    test("shows error when provider not configured", async ({ page }) => {
      const input = page.getByPlaceholder(/type a message/i);
      await input.fill("Create a cube");
      await page.getByRole("button", { name: /send/i }).click();
      await expect(page.getByText(/not configured/i)).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("3D Preview", () => {
    test("preview panel is visible", async ({ page }) => {
      await expect(page.getByText(/preview/i)).toBeVisible();
    });
  });

  test.describe("Export Functionality", () => {
    test("export section exists in sidebar", async ({ page }) => {
      await expect(page.getByText(/export/i)).toBeVisible();
      await expect(page.getByText(/format/i)).toBeVisible();
    });

    test("download button exists", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /download model/i }),
      ).toBeVisible();
    });

    test("download button is disabled when no model generated", async ({
      page,
    }) => {
      const downloadButton = page.getByRole("button", {
        name: /download model/i,
      });
      await expect(downloadButton).toBeDisabled();
    });

    test("new project button exists", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /new project/i }),
      ).toBeVisible();
    });
  });

  test.describe("History", () => {
    test("history section exists in sidebar", async ({ page }) => {
      await expect(page.getByText(/history/i)).toBeVisible();
    });

    test("shows empty history message initially", async ({ page }) => {
      await expect(page.getByText(/no history yet/i)).toBeVisible();
    });
  });

  test.describe("Mode Switching", () => {
    test("can switch between agent and editor mode", async ({ page }) => {
      const agentButton = page.getByRole("button", { name: /agent/i });
      const editorButton = page.getByRole("button", { name: /editor/i });

      await expect(agentButton).toBeVisible();
      await expect(editorButton).toBeVisible();

      await editorButton.click();
      await expect(editorButton).toHaveClass(/bg-zinc-700/);

      await agentButton.click();
      await expect(agentButton).toHaveClass(/bg-zinc-700/);
    });
  });

  test.describe("Error States", () => {
    test("shows error message for unconfigured provider", async ({ page }) => {
      const input = page.getByPlaceholder(/type a message/i);
      await input.fill("Create a cube");
      await page.getByRole("button", { name: /send/i }).click();
      await expect(page.getByText(/not configured|api key/i)).toBeVisible({
        timeout: 10000,
      });
    });
  });
});
