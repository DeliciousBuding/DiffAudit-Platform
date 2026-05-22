"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { useFloatingMenu } from "@/hooks/use-floating-menu";

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
  const {
    closeMenu,
    handleMenuKeyDown,
    menuId,
    menuRef,
    open: isOpen,
    rootRef,
    toggleMenu,
    triggerRef,
  } = useFloatingMenu<HTMLButtonElement>({ itemSelector: "button:not([disabled])" });
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
      closeMenu(true);
      return;
    }

    if (value === undefined) {
      setInternalLocale(nextLocale);
    }

    setPendingLocale(nextLocale);
    onChange?.(nextLocale);
    persistLocale(nextLocale);

    closeMenu(true);

    if (reloadOnChange) {
      startTransition(() => {
        router.refresh();
      });
      return;
    }

    router.refresh();
  }

  return (
    <div ref={rootRef} className={`language-picker ${isOpen ? "is-open" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className="language-trigger"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Change language, current language: ${currentOption.label}`}
        title={currentOption.label}
      >
        <Languages aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          <div
            className="language-picker-backdrop"
            onClick={() => closeMenu(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            id={menuId}
            className="language-menu"
            role="menu"
            onKeyDown={handleMenuKeyDown}
          >
            {LOCALE_OPTIONS.map((option) => {
              const selected = option.value === locale;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={`language-option ${selected ? "is-selected" : ""}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="language-option-copy">
                    <span className="language-option-label">{option.label}</span>
                  </div>
                  {selected && <span className="language-option-check">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
