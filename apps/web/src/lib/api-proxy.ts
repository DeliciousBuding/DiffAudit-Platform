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

export async function proxyJsonToBackend(
  path: string,
  init: RequestInit | undefined,
  transform: (payload: unknown) => unknown,
): Promise<Response> {
  const url = new URL(path, backendBaseUrl());
  const upstream = await fetchBackend(url, init);

  const contentType = upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  const payload = await upstream.json().catch(() => null);
  if (payload === null) {
    return Response.json(
      { detail: "Runtime response unavailable." },
      { status: upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502 },
    );
  }

  return Response.json(transform(payload), {
    status: upstream.status,
    headers: {
      "content-type": contentType,
    },
  });
}

async function fetchBackend(url: URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[api-proxy]", error instanceof Error ? error.message : String(error));
    const status = error instanceof DOMException && error.name === "AbortError" ? 504 : 502;
    return Response.json(
      { detail: status === 504 ? "Platform gateway timeout." : "Platform gateway unavailable." },
      { status },
    );
  }
}
