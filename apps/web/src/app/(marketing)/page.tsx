import { cookies } from "next/headers";

import { MarketingHome } from "@/components/marketing-home";
import { readAuthConfig, SESSION_COOKIE_NAME } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const config = readAuthConfig();
  const loggedIn = cookieStore.get(SESSION_COOKIE_NAME)?.value === config.sessionToken;

  return <MarketingHome loggedIn={loggedIn} />;
}
