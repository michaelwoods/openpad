import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Sidebar from "./Sidebar";
import { useStore } from "../../store";
import type { Provider } from "../../api";
import "@testing-library/jest-dom";

describe("Sidebar", () => {
  const mockProvider: Provider = {
    id: "google-gemini",
    name: "Google Gemini",
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
    configured: true,
  };

  beforeEach(() => {
    useStore.setState({
      provider: "google-gemini",
      selectedModel: "gemini-2.5-flash",
      codeStyle: "Default",
      exportFormat: "stl",
      history: [],
      availableProviders: [mockProvider],
      prompt: "",
      stlData: null,
      clearHistory: vi.fn(),
      loadHistoryItem: vi.fn(),
      resetProject: vi.fn(),
    });
  });

  it("renders AI Configuration section", () => {
    render(<Sidebar />);
    expect(screen.getByText("AI Configuration")).toBeInTheDocument();
  });

  it("renders provider dropdown with configured providers", () => {
    render(<Sidebar />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).toBeInTheDocument();
    expect(screen.getByDisplayValue("Google Gemini")).toBeInTheDocument();
  });

  it("renders model dropdown with provider models", () => {
    render(<Sidebar />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[1]).toBeInTheDocument();
    expect(screen.getByDisplayValue("gemini-2.5-flash")).toBeInTheDocument();
  });

  it("updates selected model when provider changes", () => {
    const newProvider: Provider = {
      id: "google-gemini-2",
      name: "Google Gemini 2",
      models: ["gemini-3-flash"],
      configured: true,
    };
    useStore.setState({
      availableProviders: [mockProvider, newProvider],
    });

    render(<Sidebar />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "google-gemini-2" } });

    expect(useStore.getState().selectedModel).toBe("gemini-3-flash");
  });

  it("disables model dropdown when no provider is configured", () => {
    useStore.setState({
      provider: "google-gemini",
      availableProviders: [
        { ...mockProvider, id: "google-gemini", configured: false },
      ],
    });

    render(<Sidebar />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[1]).toBeDisabled();
  });

  it("shows 'No provider configured' when provider is not configured", () => {
    useStore.setState({
      provider: "",
      availableProviders: [],
      selectedModel: "",
    });

    render(<Sidebar />);
    expect(screen.getByText("No provider configured")).toBeInTheDocument();
  });

  it("renders Modular Code toggle", () => {
    render(<Sidebar />);
    expect(screen.getByText("Modular Code")).toBeInTheDocument();
  });

  it("renders History section", () => {
    render(<Sidebar />);
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("shows 'No history yet' when history is empty", () => {
    render(<Sidebar />);
    expect(screen.getByText("No history yet")).toBeInTheDocument();
  });

  it("renders history items", () => {
    useStore.setState({
      history: [
        {
          id: "123",
          timestamp: Date.now(),
          prompt: "a test cube",
          code: "cube(10);",
          model: "gemini-2.5-flash",
          style: "Default",
          attachment: null,
        },
      ],
    });

    render(<Sidebar />);
    expect(screen.getByText("a test cube")).toBeInTheDocument();
  });

  it("loads history item when clicked", () => {
    const loadHistoryItemMock = vi.fn();
    useStore.setState({
      history: [
        {
          id: "123",
          timestamp: Date.now(),
          prompt: "a test cube",
          code: "cube(10);",
          model: "gemini-2.5-flash",
          style: "Default",
          attachment: null,
        },
      ],
      loadHistoryItem: loadHistoryItemMock,
    });

    render(<Sidebar />);
    fireEvent.click(screen.getByText("a test cube"));
    expect(loadHistoryItemMock).toHaveBeenCalled();
  });

  it("renders Export section", () => {
    render(<Sidebar />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("renders Format dropdown", () => {
    render(<Sidebar />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[2]).toBeInTheDocument();
  });

  it("renders Download Model button disabled when no stlData", () => {
    render(<Sidebar />);
    const downloadButton = screen.getByRole("button", {
      name: "Download Model",
    });
    expect(downloadButton).toBeDisabled();
  });

  it("renders New Project button", () => {
    render(<Sidebar />);
    expect(
      screen.getByRole("button", { name: "New Project" }),
    ).toBeInTheDocument();
  });

  it("calls resetProject when New Project is clicked", () => {
    const resetProjectMock = vi.fn();
    useStore.setState({ resetProject: resetProjectMock });

    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: "New Project" }));
    expect(resetProjectMock).toHaveBeenCalled();
  });
});
