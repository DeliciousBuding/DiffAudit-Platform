import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { getDocsContent } from "./docs-data";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { headers } from "next/headers";

export default async function DocsPage() {
  const cookieStore = await cookies();
  const loggedIn = validateSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;

  const headerStore = await headers();
  const locale = resolveLocaleFromHeaderStore(headerStore);

  const content = getDocsContent(locale);
  const firstSlug = content.pages[0]?.slug ?? "quick-start";

  redirect(`/docs/${firstSlug}`);
}
