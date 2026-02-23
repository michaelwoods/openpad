import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingOverlay from "./LoadingOverlay";

describe("LoadingOverlay", () => {
  it("renders with default message", () => {
    render(<LoadingOverlay />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<LoadingOverlay message="Generating code..." />);
    expect(screen.getByText("Generating code...")).toBeInTheDocument();
  });

  it("renders the spinner svg", () => {
    render(<LoadingOverlay />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
