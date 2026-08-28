import { clientLocale } from "@/lib/locale";
import { ApiKeysClient } from "./ApiKeysClient";

export default function ApiKeysPage() {
  const locale = clientLocale();
  return <ApiKeysClient locale={locale} />;
}
