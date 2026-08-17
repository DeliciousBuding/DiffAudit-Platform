"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LOCALE_STORAGE_KEY = "platform-locale-v2";

export type Locale = "zh-CN" | "en-US";

const LOCALE_OPTIONS: Array<{ value: Locale; label: string; short: string }> = [
  { value: "en-US", label: "English", short: "EN" },
  { value: "zh-CN", label: "简体中文", short: "中" },
];

export function resolveActiveLocale({
  value,
  internalLocale,
  pendingLocale,
}: {
  value?: Locale;
  internalLocale: Locale;
  pendingLocale?: Locale | null;
}): Locale {
  return pendingLocale ?? value ?? internalLocale;
}

function resolveStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en-US";
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "zh-CN" || stored === "en-US") {
      return stored;
    }
  } catch {
    // Ignore storage failures and keep the default locale.
  }

  return "en-US";
}

export function getStoredLocale() {
  if (typeof window === "undefined") {
    return "en-US";
  }
  return resolveStoredLocale();
}

export function setStoredLocale(locale: Locale) {
  persistLocale(locale);
}

function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Ignore storage failures and keep the UI responsive.
  }
}

/**
 * LanguagePicker — workspace locale control.
 *
 * Migrated from the hand-rolled `useFloatingMenu` menu to the Base UI-backed
 * `DropdownMenu`. The trigger keeps the legacy `language-trigger` class so it
 * stays visually consistent with the (still legacy) shell. Base UI now owns
 * the roving-tabindex/Escape/outside-click/portal placement; `Check` marks the
 * active locale.
 */
export function LanguagePicker({
  value,
  onChange,
  reloadOnChange = false,
}: {
  value?: Locale;
  onChange?: (locale: Locale) => void;
  reloadOnChange?: boolean;
}) {
  const router = useRouter();
  const [internalLocale, setInternalLocale] = useState<Locale>("en-US");
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const locale = resolveActiveLocale({ value, internalLocale, pendingLocale });

  useEffect(() => {
    const stored = resolveStoredLocale();
    if (stored !== internalLocale) {
      setInternalLocale(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en-US";
  }, [locale]);

  useEffect(() => {
    if (value !== undefined && pendingLocale === value) {
      setPendingLocale(null);
    }
  }, [pendingLocale, value]);

  const currentOption = LOCALE_OPTIONS.find((opt) => opt.value === locale) || LOCALE_OPTIONS[0];

  function handleSelect(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    if (value === undefined) {
      setInternalLocale(nextLocale);
    }

    setPendingLocale(nextLocale);
    onChange?.(nextLocale);
    persistLocale(nextLocale);

    if (reloadOnChange) {
      startTransition(() => {
        router.refresh();
      });
      return;
    }

    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="language-trigger"
            aria-label={`Change language, current language: ${currentOption.label}`}
            title={currentOption.label}
          />
        }
      >
        <Languages strokeWidth={1.5} aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {LOCALE_OPTIONS.map((option) => {
          const selected = option.value === locale;
          return (
            <DropdownMenuItem key={option.value} onClick={() => handleSelect(option.value)}>
              <span>{option.label}</span>
              {selected ? <Check strokeWidth={2} className="ml-auto text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
