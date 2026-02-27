/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Editor from "./Editor";
import { useStore } from "./store";
import "@testing-library/jest-dom";

describe("Editor", () => {
  beforeEach(() => {
    useStore.setState({
      isLoading: false,
      generatedCode: "cube(10);",
      generationInfo: null,
    });
    vi.clearAllMocks();
  });

  it("renders the code editor component", () => {
    render(<Editor />);
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
  });

  it("shows Save Changes button when code is edited", () => {
    render(<Editor />);

    const editor = screen.getByRole("textbox", { name: "Code Editor" });
    fireEvent.change(editor, { target: { value: "edited code" } });

    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("hides Save Changes button when code is not edited", () => {
    render(<Editor />);
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  it("calls setGeneratedCode when Save Changes is clicked", () => {
    const setGeneratedCodeSpy = vi.fn();
    useStore.setState({ setGeneratedCode: setGeneratedCodeSpy });

    render(<Editor />);

    const editor = screen.getByRole("textbox", { name: "Code Editor" });
    fireEvent.change(editor, { target: { value: "edited code" } });

    fireEvent.click(screen.getByText("Save Changes"));

    expect(setGeneratedCodeSpy).toHaveBeenCalledWith("edited code");
  });

  it("shows generation info when available", () => {
    useStore.setState({
      generationInfo: { tokens: 100, model: "gemini-2.5-flash" },
    });

    render(<Editor />);
    expect(screen.getByText("Show Generation Info")).toBeInTheDocument();
  });

  it("does not show generation info when not available", () => {
    useStore.setState({ generationInfo: null });

    render(<Editor />);
    expect(screen.queryByText("Show Generation Info")).not.toBeInTheDocument();
  });

  it("resets editedCode when generatedCode changes", () => {
    render(<Editor />);

    const editor = screen.getByRole("textbox", { name: "Code Editor" });
    fireEvent.change(editor, { target: { value: "edited" } });

    act(() => {
      useStore.setState({ generatedCode: "new code" });
    });

    const editorAfter = screen.getByRole("textbox", { name: "Code Editor" });
    expect(editorAfter).toHaveValue("new code");
  });
});
