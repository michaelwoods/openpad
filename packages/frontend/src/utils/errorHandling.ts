export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ENETUNREACH"],
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: Error | undefined;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      const isLastAttempt = attempt === opts.maxRetries;
      if (isLastAttempt) {
        break;
      }

      const err = error as { status?: number; code?: string; message?: string };
      const isRetryableStatus =
        err.status && opts.retryableStatuses?.includes(err.status);
      const isRetryableError =
        err.code && opts.retryableErrors?.includes(err.code);

      if (!isRetryableStatus && !isRetryableError) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function getConnectionType(): string {
  const connection = (
    navigator as unknown as { connection?: { type?: string } }
  ).connection;
  return connection?.type || "unknown";
}

export type NetworkStatusListener = (online: boolean) => void;

const listeners: Set<NetworkStatusListener> = new Set();

export function onNetworkStatusChange(
  listener: NetworkStatusListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    listeners.forEach((listener) => listener(true));
  });
  window.addEventListener("offline", () => {
    listeners.forEach((listener) => listener(false));
  });
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("fetch")) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    if (error.message.includes("ECONNREFUSED")) {
      return "Server is not responding. Please try again later.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    if (error.message.includes("429")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    if (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503")
    ) {
      return "Server error. Please try again later.";
    }
    if (error.message.includes("401") || error.message.includes("403")) {
      return "Authentication failed. Please check your API key.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export function getErrorTitle(error: unknown): string {
  if (error instanceof Error) {
    if (!navigator.onLine) {
      return "You're offline";
    }
    if (
      error.message.includes("fetch") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return "Connection failed";
    }
    if (error.message.includes("timeout")) {
      return "Request timeout";
    }
    if (error.message.includes("429")) {
      return "Rate limited";
    }
    if (
      error.message.includes("500") ||
      error.message.includes("502") ||
      error.message.includes("503")
    ) {
      return "Server error";
    }
    if (error.message.includes("401") || error.message.includes("403")) {
      return "Authentication error";
    }
  }
  return "Error";
}
