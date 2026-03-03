import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatPanel from "./ChatPanel";
import { useStore } from "../../store";
import * as api from "../../api";
import type { Provider } from "../../api";
import "@testing-library/jest-dom";

const mockConfiguredProvider: Provider = {
  id: "gemini",
  name: "Google Gemini",
  models: ["gemini-2.5-flash", "gemini-2.5-pro"],
  configured: true,
};

const mockUnconfiguredProvider: Provider = {
  id: "openai",
  name: "OpenAI",
  models: ["gpt-4o"],
  configured: false,
};

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
      availableProviders: [mockConfiguredProvider],
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

  it("shows error message when provider is not configured", async () => {
    useStore.setState({
      availableProviders: [mockConfiguredProvider, mockUnconfiguredProvider],
      provider: "openai",
      selectedModel: "gpt-4o",
    });

    render(<ChatPanel />);

    expect(
      screen.getByText("Selected provider is not configured"),
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(
      screen.getByText(/Please configure an API key/i),
    ).toBeInTheDocument();
  });

  it("shows warning when no providers are available", () => {
    useStore.setState({
      availableProviders: [],
    });

    render(<ChatPanel />);

    expect(screen.getByText(/No AI providers available/i)).toBeInTheDocument();
  });

  it("preserves model selection when switching to provider with same model", () => {
    const providerWithSharedModel: Provider = {
      id: "openrouter",
      name: "OpenRouter",
      models: ["openai/gpt-4o", "gemini-2.5-flash"],
      configured: true,
    };

    useStore.setState({
      availableProviders: [mockConfiguredProvider, providerWithSharedModel],
      selectedModel: "gemini-2.5-flash",
      provider: "gemini",
    });

    render(<ChatPanel />);

    const providerSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(providerSelect, { target: { value: "openrouter" } });

    expect(useStore.getState().selectedModel).toBe("gemini-2.5-flash");
  });

  it("resets model when switching to provider without current model", () => {
    const providerWithoutSharedModel: Provider = {
      id: "openrouter",
      name: "OpenRouter",
      models: ["openai/gpt-4o"],
      configured: true,
    };

    useStore.setState({
      availableProviders: [mockConfiguredProvider, providerWithoutSharedModel],
      selectedModel: "gemini-2.5-flash",
      provider: "gemini",
    });

    render(<ChatPanel />);

    const providerSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(providerSelect, { target: { value: "openrouter" } });

    expect(useStore.getState().selectedModel).toBe("openai/gpt-4o");
  });
});
