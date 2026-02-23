import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatInput from "./ChatInput";
import { useStore } from "../../store";
import "@testing-library/jest-dom";

describe("ChatInput", () => {
  beforeEach(() => {
    useStore.setState({ isLoading: false });
    vi.clearAllMocks();
  });

  it("renders the input field", () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Type a message/)).toBeInTheDocument();
  });

  it("calls onSend when the send button is clicked", () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(onSendMock).toHaveBeenCalledWith("Hello");
  });

  it("clears the input after sending", () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(input).toHaveValue("");
  });

  it("disables the input when disabled prop is true", () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);
    expect(screen.getByPlaceholderText(/Type a message/)).toBeDisabled();
  });

  it("does not send empty messages", () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    fireEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(onSendMock).not.toHaveBeenCalled();
  });

  it("sends message on Cmd+Enter", () => {
    const onSendMock = vi.fn();
    render(<ChatInput onSend={onSendMock} />);

    const input = screen.getByPlaceholderText(/Type a message/);
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter", metaKey: true });

    expect(onSendMock).toHaveBeenCalledWith("Test message");
  });
});
