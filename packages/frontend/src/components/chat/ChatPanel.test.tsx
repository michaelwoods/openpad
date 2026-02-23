import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatPanel from "./ChatPanel";
import { useStore } from "../../store";
import * as api from "../../api";
import "@testing-library/jest-dom";

vi.mock("../../api", () => ({
  handleGenerate: vi.fn(),
}));

describe("ChatPanel", () => {
  beforeEach(() => {
    useStore.setState({
      chatMessages: [],
      isLoading: false,
      selectedModel: "gemini-2.5-flash",
      provider: "gemini",
      codeStyle: "Default",
    });
    vi.clearAllMocks();
  });

  it("renders chat panel with title", () => {
    render(<ChatPanel />);
    expect(screen.getByText("AI Chat")).toBeInTheDocument();
  });

  it("shows empty state when no messages", () => {
    render(<ChatPanel />);
    expect(screen.getByText(/Start a conversation/)).toBeInTheDocument();
  });

  it("adds user message when send is called", async () => {
    const mockHandleGenerate = vi.mocked(api.handleGenerate);
    mockHandleGenerate.mockResolvedValue(undefined);

    render(<ChatPanel />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText("Hello AI")).toBeInTheDocument();
    });
  });

  it("shows thinking message while loading", async () => {
    const mockHandleGenerate = vi.mocked(api.handleGenerate);
    mockHandleGenerate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    render(<ChatPanel />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thinking/)).toBeInTheDocument();
    });
  });

  it("does not send empty messages", () => {
    render(<ChatPanel />);

    const sendButton = screen.getByRole("button", { name: /Send/i });
    fireEvent.click(sendButton);

    expect(api.handleGenerate).not.toHaveBeenCalled();
  });

  it("does not send when already loading", async () => {
    useStore.setState({ isLoading: true });
    render(<ChatPanel />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Test" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(api.handleGenerate).not.toHaveBeenCalled();
  });

  it("calls handleGenerate with correct parameters", async () => {
    const mockHandleGenerate = vi.mocked(api.handleGenerate);
    mockHandleGenerate.mockResolvedValue(undefined);

    render(<ChatPanel />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Make a cube" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    await waitFor(() => {
      expect(mockHandleGenerate).toHaveBeenCalledWith(
        "Make a cube",
        "gemini-2.5-flash",
        "gemini",
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        undefined,
        "Default",
        undefined,
        expect.any(Function),
        expect.any(Array),
      );
    });
  });
});
