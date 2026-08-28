import { clientLocale } from "@/lib/next-shims/runtime";
import { ApiKeysClient } from "./ApiKeysClient";

export default function ApiKeysPage() {
  const locale = clientLocale();
  return <ApiKeysClient locale={locale} />;
}
