import { cookies } from "next/headers";

import { DEMO_MODE_COOKIE } from "@/lib/demo-mode-constants";
import { isDemoModeEnvConfigured, readDemoModeEnv } from "@/lib/demo-mode-flags";

export function isDemoModeForcedServer(env: NodeJS.ProcessEnv = process.env): boolean {
  return readDemoModeEnv(env) === true;
}

export function isDemoModeConfiguredServer(env: NodeJS.ProcessEnv = process.env): boolean {
  return isDemoModeEnvConfigured(env);
}

export async function isDemoModeEnabledServer(request?: Request): Promise<boolean> {
  const envMode = readDemoModeEnv();
  if (envMode !== undefined) {
    return envMode;
  }

  const headerCookie = request?.headers.get("cookie");
  if (headerCookie) {
    const parsed = headerCookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${DEMO_MODE_COOKIE}=`));

    if (parsed) {
      const value = parsed.slice(DEMO_MODE_COOKIE.length + 1);
      if (value === "0") return false;
      if (value === "1") return true;
    }
  }

  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(DEMO_MODE_COOKIE)?.value;
    if (cookieValue === "0") {
      return false;
    }
    if (cookieValue === "1") {
      return true;
    }
  } catch {
    return true;
  }

  return true;
}
