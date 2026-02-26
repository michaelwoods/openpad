import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PreviewPanel from "./PreviewPanel";

describe("PreviewPanel", () => {
  it("renders children", () => {
    render(
      <PreviewPanel>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.getByText("Preview Content")).toBeInTheDocument();
  });

  it("shows loading overlay when isLoading is true", () => {
    render(
      <PreviewPanel isLoading={true}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("hides loading overlay when isLoading is false", () => {
    render(
      <PreviewPanel isLoading={false}>
        <div>Preview Content</div>
      </PreviewPanel>,
    );

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
