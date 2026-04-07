export type FetchWithTimeoutOptions = {
  timeoutMs: number;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  options: FetchWithTimeoutOptions,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
