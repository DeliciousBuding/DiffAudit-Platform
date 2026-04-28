import { redirect } from "next/navigation";
import { getDocsContent } from "./docs-data";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const headerStore = await headers();
  const locale = resolveLocaleFromHeaderStore(headerStore);

  const content = getDocsContent(locale);
  const firstSlug = content.pages[0]?.slug ?? "quick-start";

  redirect(`/docs/${firstSlug}`);
}
