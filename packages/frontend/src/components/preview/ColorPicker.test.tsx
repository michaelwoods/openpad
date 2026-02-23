import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ColorPicker from "./ColorPicker";

describe("ColorPicker", () => {
  it("renders color button with current color", () => {
    render(<ColorPicker color="#ff0000" onChange={vi.fn()} />);

    const button = screen.getByLabelText("Open color picker");
    expect(button).toHaveStyle("background-color: rgb(255, 0, 0)");
  });

  it("opens popup when clicked", () => {
    render(<ColorPicker color="#ff0000" onChange={vi.fn()} />);

    const button = screen.getByLabelText("Open color picker");
    fireEvent.click(button);

    // Check preset colors are visible
    expect(screen.getByLabelText("Select color #ffaa00")).toBeInTheDocument();
  });

  it("calls onChange when a preset is selected", () => {
    const onChangeMock = vi.fn();
    render(<ColorPicker color="#ff0000" onChange={onChangeMock} />);

    // Open popup
    fireEvent.click(screen.getByLabelText("Open color picker"));

    // Click a preset
    fireEvent.click(screen.getByLabelText("Select color #00ff00"));

    expect(onChangeMock).toHaveBeenCalledWith("#00ff00");
  });

  it("closes popup after selection", () => {
    const onChangeMock = vi.fn();
    render(<ColorPicker color="#ff0000" onChange={onChangeMock} />);

    // Open popup
    fireEvent.click(screen.getByLabelText("Open color picker"));

    // Click a preset
    fireEvent.click(screen.getByLabelText("Select color #00ff00"));

    // Popup should be closed
    expect(
      screen.queryByLabelText("Select color #ffaa00"),
    ).not.toBeInTheDocument();
  });
});
