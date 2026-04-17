import { cookies } from "next/headers";
import { DEMO_MODE_COOKIE } from "@/lib/demo-mode-constants";

export async function isDemoModeEnabledServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(DEMO_MODE_COOKIE)?.value === "1";
  } catch {
    return false;
  }
}
