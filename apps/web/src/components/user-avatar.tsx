"use client";

import { useEffect, useState, useRef } from "react";
import { LogoutButton } from "@/components/logout-button";
import { useTheme } from "@/hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";
import { LOCALE_STORAGE_KEY, type Locale } from "@/components/language-picker";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

interface UserInfo {
  username: string;
  avatarUrl?: string;
}

const AVATAR_STORAGE_KEY = "platform-custom-avatar-v1";
const USERNAME_STORAGE_KEY = "platform-custom-username-v1";

/**
 * User avatar displayed in the topbar.
 * Supports: default initial, GitHub avatar, and custom avatar URL.
 */
export function UserAvatar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [locale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return "en-US";
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return (stored === "zh-CN" || stored === "en-US") ? stored : "en-US";
  });
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Fetch user info
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    async function loadUser() {
      try {
        // Check custom username first
        const customUsername = window.localStorage.getItem(USERNAME_STORAGE_KEY);
        const customAvatar = window.localStorage.getItem(AVATAR_STORAGE_KEY);

        if (customUsername) {
          setUser({
            username: customUsername,
            avatarUrl: customAvatar || undefined,
          });
          return;
        }

        // Try to fetch from API
        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as { username?: string; avatar_url?: string };
          if (data.username) {
            // Try GitHub avatar as fallback
            let avatarUrl = data.avatar_url;
            if (!avatarUrl && data.username) {
              avatarUrl = `https://github.com/${data.username}.png?size=80`;
            }
            setUser({ username: data.username, avatarUrl });
          }
        }
      } catch {
        // Use default
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    void loadUser();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const copy = WORKSPACE_COPY[locale].userMenu;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 transition-all hover:border-[color:var(--accent-blue)]/40 hover:bg-[color:var(--accent-blue)]/5"
        aria-label="User menu"
        aria-expanded={showMenu}
      >
        {user?.avatarUrl && !avatarError ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/10 text-[11px] font-semibold text-[color:var(--accent-blue)]">
            {initial}
          </div>
        )}
        <span className="text-xs font-medium text-foreground max-w-[100px] truncate hidden sm:inline">
          {user?.username ?? "User"}
        </span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1.5 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
          {/* User info header */}
          <div className="px-3 py-2.5 border-b border-border bg-muted/10">
            <div className="flex items-center gap-2">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent-blue)]/10 text-sm font-semibold text-[color:var(--accent-blue)]">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{user?.username ?? "User"}</div>
                <div className="text-[10px] text-muted-foreground">{copy.loggedIn}</div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            {/* Theme selector */}
            <div className="px-2.5 py-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{copy.themeLabel}</div>
              <div className="flex gap-1">
                {([
                  { value: "light" as ThemeMode, label: copy.themeLight, icon: "sun" },
                  { value: "dark" as ThemeMode, label: copy.themeDark, icon: "moon" },
                  { value: "system" as ThemeMode, label: copy.themeSystem, icon: "system" },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex-1 flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] transition-colors ${
                      theme === option.value
                        ? "bg-[color:var(--accent-blue)]/10 text-[color:var(--accent-blue)] font-medium"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                    title={option.label}
                    aria-label={option.label}
                  >
                    {option.icon === "sun" ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : option.icon === "moon" ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <path d="M13 3v18M13 7h4M13 11h5M13 15h4" />
                        <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
                        <circle cx="9" cy="15" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                    <span className="truncate max-w-full">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 border-t border-border" />

            <a
              href="/workspace/settings"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/30"
              onClick={() => setShowMenu(false)}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {copy.settings}
            </a>
            <div className="mt-1 pt-1 border-t border-border">
              <div className="px-2.5 py-1.5">
                <LogoutButton label={copy.signOut} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
