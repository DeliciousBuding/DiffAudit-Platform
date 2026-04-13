"use client";

import { ChangeEvent, useState } from "react";

const STORAGE_KEY = "platform-locale";

type Locale = "zh-CN" | "en-US";

export function LanguagePicker() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "zh-CN";
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "zh-CN" || stored === "en-US") {
        return stored;
      }
    } catch {
      // Ignore storage failures and keep the default locale.
    }

    return "zh-CN";
  });

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    setLocale(nextLocale);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Ignore storage failures and keep the UI responsive.
    }
  }

  return (
    <select
      aria-label="语言选择"
      className="language-select"
      value={locale}
      onChange={handleChange}
    >
      <option value="zh-CN">简体中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
