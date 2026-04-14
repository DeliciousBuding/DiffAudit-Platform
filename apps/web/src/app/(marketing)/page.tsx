import { cookies } from "next/headers";

import { MarketingHome } from "@/components/marketing-home";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const loggedIn = validateSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;

  return <MarketingHome loggedIn={loggedIn} workbenchUrl="/workspace" />;
}
