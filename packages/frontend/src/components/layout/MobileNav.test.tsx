import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MobileNav from "./MobileNav";

describe("MobileNav", () => {
  it("renders all three tabs", () => {
    render(<MobileNav activeTab="chat" onTabChange={vi.fn()} />);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Code")).toBeInTheDocument();
  });

  it("calls onTabChange when a tab is clicked", () => {
    const onTabChangeMock = vi.fn();
    render(<MobileNav activeTab="chat" onTabChange={onTabChangeMock} />);

    fireEvent.click(screen.getByText("Preview"));
    expect(onTabChangeMock).toHaveBeenCalledWith("preview");
  });

  it("highlights the active tab", () => {
    render(<MobileNav activeTab="code" onTabChange={vi.fn()} />);

    const codeTab = screen.getByText("Code");
    expect(codeTab).toHaveClass("text-blue-500");
  });

  it("does not highlight inactive tabs", () => {
    render(<MobileNav activeTab="chat" onTabChange={vi.fn()} />);

    const previewTab = screen.getByText("Preview");
    expect(previewTab).not.toHaveClass("text-blue-500");
  });
});
