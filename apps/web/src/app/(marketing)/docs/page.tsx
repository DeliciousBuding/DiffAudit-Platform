import { cookies } from "next/headers";

import { DocsHome } from "./docs-home";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";

export default async function DocsPage() {
  const cookieStore = await cookies();
  const loggedIn = validateSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;

  return <DocsHome loggedIn={loggedIn} />;
}
