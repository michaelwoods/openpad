import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PreviewPanel from "./PreviewPanel";

describe("PreviewPanel", () => {
  it("renders children", () => {
    render(
      <PreviewPanel color="#ff0000" onColorChange={vi.fn()}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.getByText("Preview Content")).toBeInTheDocument();
  });

  it("renders color picker", () => {
    render(
      <PreviewPanel color="#ff0000" onColorChange={vi.fn()}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.getByLabelText("Open color picker")).toBeInTheDocument();
  });

  it("shows loading overlay when isLoading is true", () => {
    render(
      <PreviewPanel color="#ff0000" onColorChange={vi.fn()} isLoading={true}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("hides loading overlay when isLoading is false", () => {
    render(
      <PreviewPanel color="#ff0000" onColorChange={vi.fn()} isLoading={false}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
