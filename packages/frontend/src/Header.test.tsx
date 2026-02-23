import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Header from "./Header";
import "@testing-library/jest-dom";

describe("Header", () => {
  it("renders the title", () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByText("OpenPAD")).toBeInTheDocument();
  });

  it('renders the "About" button', () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
  });

  it('calls onShowAbout when the "About" button is clicked', () => {
    const mockOnShowAbout = vi.fn();
    render(<Header onShowAbout={mockOnShowAbout} />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    expect(mockOnShowAbout).toHaveBeenCalledTimes(1);
  });

  it("renders the mode toggle with Agent and Editor options", () => {
    render(<Header onShowAbout={() => {}} />);
    expect(screen.getByRole("button", { name: /Agent/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Editor/i })).toBeInTheDocument();
  });

  it("renders the sidebar toggle button", () => {
    render(<Header onShowAbout={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Toggle sidebar" }),
    ).toBeInTheDocument();
  });
});
