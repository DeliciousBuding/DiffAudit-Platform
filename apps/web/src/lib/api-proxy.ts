export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8780";

export function backendBaseUrl() {
  return process.env.DIFFAUDIT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function proxyToBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(path, backendBaseUrl());
  const upstream = await fetchBackend(url, init);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}

const PROXY_TIMEOUT_MS = 15_000;
const NO_BODY_STATUSES = new Set([204, 205, 304]);

export async function proxyJsonToBackend(
  path: string,
  init: RequestInit | undefined,
  transform: (payload: unknown) => unknown,
): Promise<Response> {
  const url = new URL(path, backendBaseUrl());
  const upstream = await fetchBackend(url, init);

  if (NO_BODY_STATUSES.has(upstream.status)) {
    return new Response(null, { status: upstream.status });
  }

  const text = await upstream.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    if (upstream.ok) {
      // 2xx but not JSON — protocol violation
      return Response.json({ detail: "Runtime response unavailable." }, { status: 502 });
    }
    // Non-2xx non-JSON (e.g. HTML error page) — preserve upstream status
    return Response.json(
      { detail: `Runtime request failed (status ${upstream.status}).` },
      { status: upstream.status },
    );
  }

  return Response.json(transform(payload), {
    status: upstream.status,
  });
}

async function fetchBackend(url: URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    console.error("[api-proxy]", isTimeout ? "timeout" : "upstream unavailable");
    return Response.json(
      { detail: isTimeout ? "Platform gateway timeout." : "Platform gateway unavailable." },
      { status: isTimeout ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
