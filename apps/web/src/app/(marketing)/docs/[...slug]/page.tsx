import { notFound } from "next/navigation";

import { DocsHome } from "../docs-home";
import { getDocsContent } from "../docs-data";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DocsSlugPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  const headerStore = await headers();
  const locale = resolveLocaleFromHeaderStore(headerStore);

  const content = getDocsContent(locale);
  const page = content.pages.find((p) => p.slug === slugPath);

  if (!page) {
    notFound();
  }

  return <DocsHome locale={locale} initialSlug={page.slug} />;
}
