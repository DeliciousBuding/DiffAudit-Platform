import { describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetch-timeout";

describe("fetchWithTimeout", () => {
  it("aborts when the timeout elapses", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new Error("aborted"));
        });
      });
    });

    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    // Attach a handler immediately to avoid an unhandled-rejection window.
    const promise = fetchWithTimeout("https://example.invalid", undefined, { timeoutMs: 30 }).catch(
      (error) => error as Error,
    );
    await vi.advanceTimersByTimeAsync(35);

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("aborted");
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
