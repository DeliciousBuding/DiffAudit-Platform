const TIMEOUT_MS = 5_000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const port = url.searchParams.get("port");

  if (!host || !port) {
    return Response.json(
      { connected: false, error: "Missing host or port parameter." },
      { status: 400 },
    );
  }

  const target = `${host}:${port}/health`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(target, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    return Response.json({ connected: res.ok });
  } catch {
    return Response.json({ connected: false });
  }
}
