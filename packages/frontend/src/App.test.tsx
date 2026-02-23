import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import App from "./App";
import { useStore } from "./store";
import "@testing-library/jest-dom";

describe("App", () => {
  beforeEach(() => {
    useStore.setState({
      showAbout: false,
      showHistory: false,
      prompt: "",
      generatedCode: "// OpenSCAD code will appear here",
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

  it("generates code when the Generate button is clicked", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Generate"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("cube(10);")).toBeInTheDocument();
    });
  });
});
