import { cookies } from "next/headers";

import { type Locale, LOCALE_STORAGE_KEY } from "@/components/language-picker";

export const LOCALE_COOKIE_NAME = LOCALE_STORAGE_KEY;

export async function readServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    return locale === "zh-CN" || locale === "en-US" ? locale : "en-US";
  } catch {
    return "en-US";
  }
}
