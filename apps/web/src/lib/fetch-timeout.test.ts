import { describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetch-timeout";

describe("fetchWithTimeout", () => {
  it("aborts when the timeout elapses", async () => {
    vi.useFakeTimers();

    let abortHandler: (() => void) | null = null;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        abortHandler = () => reject(new Error("aborted"));
        init?.signal?.addEventListener("abort", abortHandler);
      });
    });

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    // Start the fetch with timeout and immediately catch to prevent unhandled rejection
    const promise = fetchWithTimeout("https://example.invalid", undefined, { timeoutMs: 30 }).catch(
      (err: unknown) => err as Error,
    );

    // Advance timers to trigger the timeout
    await vi.advanceTimersByTimeAsync(35);

    // Now await the promise which should have the error
    const error = await promise;

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("aborted");
    vi.useRealTimers();
  });

  it("passes through the response when the fetch resolves before the timeout", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const response = await fetchWithTimeout("https://example.invalid", undefined, { timeoutMs: 30 });
    expect(response.status).toBe(204);

    vi.useRealTimers();
  });
});
