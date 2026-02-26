import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Preview from "./Preview";
import { useStore } from "./store";
import "@testing-library/jest-dom";

describe("Preview", () => {
  beforeEach(() => {
    useStore.setState({ stlData: null, prompt: "", previewColor: "#ffaa00" });
    vi.clearAllMocks();
  });

  it("renders the preview component", () => {
    render(<Preview />);
    expect(screen.getByText("3D Preview")).toBeInTheDocument();
  });

  it("updates the preview color", () => {
    render(<Preview />);

    // Click the color button to open the popup
    const colorButton = screen.getByLabelText("Open color picker");
    fireEvent.click(colorButton);

    // Find and change the color input in the popup
    const colorInput = screen.getByDisplayValue("#ffaa00");
    fireEvent.change(colorInput, { target: { value: "#00ff00" } });

    expect(useStore.getState().previewColor).toBe("#00ff00");
  });
});
