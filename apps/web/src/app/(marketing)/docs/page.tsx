import { Navigate } from "react-router";

import { getDocsContent } from "./docs-data";
import { clientLocale } from "@/lib/locale";

export default function DocsPage() {
  const locale = clientLocale();
  const content = getDocsContent(locale);
  const firstSlug = content.pages[0]?.slug ?? "quick-start";

  return <Navigate to={`/docs/${firstSlug}`} replace />;
}
