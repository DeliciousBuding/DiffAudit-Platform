import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DocsHome } from "../docs-home";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import { getDocsContent } from "../docs-data";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { headers } from "next/headers";

export default async function DocsSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const cookieStore = await cookies();
  const loggedIn = validateSession(cookieStore.get(SESSION_COOKIE_NAME)?.value) !== null;

  const headerStore = await headers();
  const locale = resolveLocaleFromHeaderStore(headerStore);

  const content = getDocsContent(locale);
  const page = content.pages.find((p) => p.slug === slugPath);

  if (!page) {
    notFound();
  }

  return <DocsHome loggedIn={loggedIn} initialSlug={page.slug} />;
}
