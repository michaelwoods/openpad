import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isOnline,
  formatErrorMessage,
  getErrorTitle,
  onNetworkStatusChange,
} from "./errorHandling";

describe("formatErrorMessage", () => {
  it("should return friendly message for fetch errors", () => {
    const error = new Error("Failed to fetch");
    expect(formatErrorMessage(error)).toContain("Unable to connect");
  });

  it("should return friendly message for connection refused", () => {
    const error = new Error("ECONNREFUSED");
    expect(formatErrorMessage(error)).toContain("not responding");
  });

  it("should return friendly message for timeout", () => {
    const error = new Error("Request timeout");
    expect(formatErrorMessage(error)).toContain("timed out");
  });

  it("should return friendly message for rate limiting", () => {
    const error = new Error("429 Too Many Requests");
    expect(formatErrorMessage(error)).toContain("Too many requests");
  });

  it("should return friendly message for server errors", () => {
    const error = new Error("500 Internal Server Error");
    expect(formatErrorMessage(error)).toContain("Server error");
  });

  it("should return friendly message for auth errors", () => {
    const error = new Error("401 Unauthorized");
    expect(formatErrorMessage(error)).toContain("Authentication");
  });

  it("should return original message for unknown errors", () => {
    const error = new Error("Some unknown error");
    expect(formatErrorMessage(error)).toBe("Some unknown error");
  });

  it("should handle non-Error objects", () => {
    expect(formatErrorMessage("string error")).toBe(
      "An unexpected error occurred. Please try again.",
    );
    expect(formatErrorMessage(null)).toBe(
      "An unexpected error occurred. Please try again.",
    );
    expect(formatErrorMessage(undefined)).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});

describe("getErrorTitle", () => {
  it("should return 'You're offline' when offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const error = new Error("fetch failed");
    expect(getErrorTitle(error)).toBe("You're offline");
  });

  it("should return 'Connection failed' for fetch errors when online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error = new Error("fetch failed");
    expect(getErrorTitle(error)).toBe("Connection failed");
  });

  it("should return 'Request timeout' for timeout errors", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error = new Error("timeout");
    expect(getErrorTitle(error)).toBe("Request timeout");
  });

  it("should return 'Rate limited' for 429 errors", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error = new Error("429 Too Many Requests");
    expect(getErrorTitle(error)).toBe("Rate limited");
  });

  it("should return 'Server error' for 5xx errors", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error = new Error("500 Internal Server Error");
    expect(getErrorTitle(error)).toBe("Server error");
  });

  it("should return 'Authentication error' for 401/403 errors", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error401 = new Error("401 Unauthorized");
    expect(getErrorTitle(error401)).toBe("Authentication error");

    const error403 = new Error("403 Forbidden");
    expect(getErrorTitle(error403)).toBe("Authentication error");
  });

  it("should return 'Error' for unknown errors", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const error = new Error("Unknown error");
    expect(getErrorTitle(error)).toBe("Error");
  });
});

describe("onNetworkStatusChange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call listener when going online", () => {
    const listener = vi.fn();
    onNetworkStatusChange(listener);

    window.dispatchEvent(new Event("online"));
    expect(listener).toHaveBeenCalledWith(true);
  });

  it("should call listener when going offline", () => {
    const listener = vi.fn();
    onNetworkStatusChange(listener);

    window.dispatchEvent(new Event("offline"));
    expect(listener).toHaveBeenCalledWith(false);
  });

  it("should return unsubscribe function", () => {
    const listener = vi.fn();
    const unsubscribe = onNetworkStatusChange(listener);
    unsubscribe();

    window.dispatchEvent(new Event("online"));
    expect(listener).not.toHaveBeenCalled();
  });

  it("should handle multiple listeners", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    onNetworkStatusChange(listener1);
    onNetworkStatusChange(listener2);

    window.dispatchEvent(new Event("offline"));

    expect(listener1).toHaveBeenCalledWith(false);
    expect(listener2).toHaveBeenCalledWith(false);
  });
});

describe("isOnline", () => {
  it("should return navigator.onLine value", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    expect(isOnline()).toBe(true);

    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(isOnline()).toBe(false);
  });
});
