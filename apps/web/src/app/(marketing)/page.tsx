import { cookies, headers } from "next/headers";

import { MarketingHome } from "@/components/marketing-home";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = resolveLocaleFromHeaderStore(await headers());
  const loggedIn = validateSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;

  return <MarketingHome loggedIn={loggedIn} workbenchUrl="/workspace" initialLocale={locale} />;
}
