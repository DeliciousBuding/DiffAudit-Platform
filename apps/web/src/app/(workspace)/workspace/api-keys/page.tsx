import { headers } from "next/headers";

import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { ApiKeysClient } from "./ApiKeysClient";

export default async function ApiKeysPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  return <ApiKeysClient locale={locale} />;
}
