import { useParams } from "react-router";

import NotFound from "@/app/not-found";
import { clientLocale } from "@/lib/locale";

import { DocsHome } from "../docs-home";
import { getDocsContent } from "../docs-data";

export default function DocsSlugPage() {
  const slugPath = useParams()["*"] ?? "";
  const locale = clientLocale();

  const content = getDocsContent(locale);
  const page = content.pages.find((p) => p.slug === slugPath);

  if (!page) {
    return <NotFound />;
  }

  return <DocsHome locale={locale} initialSlug={page.slug} />;
}
