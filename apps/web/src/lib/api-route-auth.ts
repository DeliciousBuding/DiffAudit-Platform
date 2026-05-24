import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { isDemoModeEnabledServer } from "@/lib/demo-mode";

type ApiRouteAuthResult =
  | {
      ok: true;
      demoMode: boolean;
      session?: NonNullable<ReturnType<typeof validateSession>>;
    }
  | {
      ok: false;
      response: Response;
    };

function cookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return rawValue.join("=");
    }
  }

  return undefined;
}

export async function authorizeApiV1Request(request?: Request): Promise<ApiRouteAuthResult> {
  if (await isDemoModeEnabledServer(request)) {
    return { ok: true, demoMode: true };
  }

  const token = cookieValue(request?.headers.get("cookie") ?? null, SESSION_COOKIE_NAME);
  const session = validateSession(token);

  if (!session) {
    return {
      ok: false,
      response: Response.json({ message: "Authentication required." }, { status: 401 }),
    };
  }

  return { ok: true, demoMode: false, session };
}
