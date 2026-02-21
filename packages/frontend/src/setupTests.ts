import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import React from "react";
import { server } from "./mocks/server";

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

vi.mock("@react-three/fiber", () => ({
  Canvas: vi.fn(() => "canvas-mock"),
  useThree: vi.fn(() => ({})),
  extend: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    options,
  }: {
    value?: string;
    onChange?: (value: string) => void;
    options?: { ariaLabel?: string };
  }) => {
    return React.createElement("textarea", {
      "aria-label": options?.ariaLabel || "Code Editor",
      value: value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onChange?.(e.target.value),
    });
  },
}));
