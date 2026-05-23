"use client";

import { useSyncExternalStore } from "react";
import { getStoredLocale, type Locale } from "@/components/language-picker";
import { ErrorFallbackUI } from "@/components/error-fallback-ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useSyncExternalStore<Locale>(
    () => () => undefined,
    () => getStoredLocale(),
    () => "en-US",
  );

  return <ErrorFallbackUI locale={locale} error={error} reset={reset} useClientLink />;
}
