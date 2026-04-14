"use client";

import { useEffect, useState } from "react";

export const LOCALE_STORAGE_KEY = "platform-locale-v2";

export type Locale = "zh-CN" | "en-US";

const LOCALE_OPTIONS: Array<{ value: Locale; label: string; short: string }> = [
  { value: "en-US", label: "English", short: "EN" },
  { value: "zh-CN", label: "简体中文", short: "中" },
];

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

export function LanguagePicker({
  value,
  onChange,
  reloadOnChange = false,
}: {
  value?: Locale;
  onChange?: (locale: Locale) => void;
  reloadOnChange?: boolean;
}) {
  const [internalLocale, setInternalLocale] = useState<Locale>("en-US");
  const [isOpen, setIsOpen] = useState(false);
  const locale = value ?? internalLocale;

  useEffect(() => {
    const stored = resolveStoredLocale();
    if (stored !== internalLocale) {
      setInternalLocale(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentOption = LOCALE_OPTIONS.find((opt) => opt.value === locale) || LOCALE_OPTIONS[0];

  function handleSelect(nextLocale: Locale) {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }

    if (value === undefined) {
      setInternalLocale(nextLocale);
    }

    onChange?.(nextLocale);

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
      document.cookie = `${LOCALE_STORAGE_KEY}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // Ignore storage failures and keep the UI responsive.
    }

    setIsOpen(false);

    if (reloadOnChange) {
      window.location.reload();
    }
  }

  return (
    <div className={`language-picker ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="language-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="language-trigger-label">{currentOption.label}</span>
        <span className="language-trigger-chevron">▾</span>
      </button>

      {isOpen && (
        <>
          <div
            className="language-picker-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="language-menu">
            {LOCALE_OPTIONS.map((option) => {
              const selected = option.value === locale;

              return (
                <button
                  key={option.value}
                  type="button"
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
