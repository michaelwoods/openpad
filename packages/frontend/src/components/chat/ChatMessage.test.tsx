import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ChatMessage from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../../store";

describe("ChatMessage", () => {
  it("renders user message correctly", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "user",
      content: "Hello, AI!",
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("Hello, AI!")).toBeInTheDocument();
  });

  it("renders assistant message correctly", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "assistant",
      content: "Hello, human!",
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("Hello, human!")).toBeInTheDocument();
  });

  it("renders thinking state with spinner", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "assistant",
      content: "Thinking...",
      isThinking: true,
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("renders code block when present", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "assistant",
      content: "Here's the code:",
      code: "cube(10);",
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText("Here's the code:")).toBeInTheDocument();
    expect(screen.getByText("cube(10);")).toBeInTheDocument();
  });

  it("applies correct styling for user messages", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "user",
      content: "User message",
    };

    const { container } = render(<ChatMessage message={message} />);
    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv.className).toContain("justify-end");
  });

  it("applies correct styling for assistant messages", () => {
    const message: ChatMessageType = {
      id: "1",
      timestamp: Date.now(),
      role: "assistant",
      content: "Assistant message",
    };

    const { container } = render(<ChatMessage message={message} />);
    const messageDiv = container.firstChild as HTMLElement;
    expect(messageDiv.className).toContain("justify-start");
  });
});
