import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "./App";
import { useStore } from "./store";
import "@testing-library/jest-dom";

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("App", () => {
  beforeEach(() => {
    useStore.setState({
      showAbout: false,
      showHistory: false,
      prompt: "",
      generatedCode: "// OpenSCAD code will appear here",
      availableProviders: [
        {
          id: "gemini",
          name: "Gemini",
          models: ["gemini-2.5-flash"],
          configured: true,
        },
      ],
      provider: "gemini",
      selectedModel: "gemini-2.5-flash",
    });
  });

  it("renders the main page with the editor and preview", () => {
    render(<App />);
    expect(screen.getByText("OpenPAD")).toBeInTheDocument();
  });

  it("shows and hides the About page", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    expect(screen.getByText("About OpenPAD")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to Editor" }));
    expect(screen.queryByText("About OpenPAD")).not.toBeInTheDocument();
  });

  it("renders the sidebar with configuration sections", () => {
    render(<App />);
    expect(screen.getByText("AI Configuration")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("generates code when a prompt is sent in Agent mode", async () => {
    render(<App />);

    const inputs = screen.getAllByPlaceholderText(/Type a message/);
    const input = inputs[0];
    fireEvent.change(input, { target: { value: "Make a cube" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Send/i })[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("cube(10);")).toBeInTheDocument();
    });
  });

  it("toggles between Agent and Editor modes", () => {
    render(<App />);

    // Default is Agent mode
    expect(useStore.getState().mode).toBe("agent");

    // Click Editor button
    fireEvent.click(screen.getByRole("button", { name: /Editor/i }));
    expect(useStore.getState().mode).toBe("editor");

    // Click Agent button
    fireEvent.click(screen.getByRole("button", { name: /Agent/i }));
    expect(useStore.getState().mode).toBe("agent");
  });

  it("shows chat interface when in Agent mode", () => {
    render(<App />);

    // In Agent mode, chat should be visible - use getAllByText for both desktop and mobile
    expect(screen.getAllByText("AI Chat").length).toBeGreaterThan(0);
  });

  it("toggles sidebar open/closed", () => {
    render(<App />);

    // Default sidebar should be open
    expect(useStore.getState().sidebarOpen).toBe(true);

    // Click sidebar toggle
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(useStore.getState().sidebarOpen).toBe(false);

    // Toggle again
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));
    expect(useStore.getState().sidebarOpen).toBe(true);
  });
});
