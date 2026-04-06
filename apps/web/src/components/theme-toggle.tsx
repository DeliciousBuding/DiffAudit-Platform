"use client";

import { useState } from "react";

import { useTheme } from "@/hooks/use-theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 1.8v2.4M12 19.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8]">
      <path d="M20.2 14.2A8.6 8.6 0 0 1 9.8 3.8a8.6 8.6 0 1 0 10.4 10.4Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [spinning, setSpinning] = useState(false);

  return (
    <button
      type="button"
      onClick={(event) => {
        setSpinning(true);
        toggle(event.clientX, event.clientY);
        window.setTimeout(() => setSpinning(false), 500);
      }}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
      title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
    >
      <span className={`inline-flex transition-transform duration-500 ease-out ${spinning ? "rotate-[360deg] scale-110" : "rotate-0 scale-100"}`}>
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
