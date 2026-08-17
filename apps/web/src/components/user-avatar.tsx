"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, User as UserIcon } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { type Locale } from "@/components/language-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

interface UserInfo {
  username: string;
  avatarUrl?: string;
}

const AVATAR_STORAGE_KEY = "platform-custom-avatar-v1";
const USERNAME_STORAGE_KEY = "platform-custom-username-v1";

/**
 * UserAvatar — topbar account control.
 *
 * Migrated from the hand-rolled `useFloatingMenu` panel + inline-SVG icons to
 * the Base UI-backed `DropdownMenu` + Lucide icons. The trigger keeps the
 * legacy `header-pill` class for shell consistency; the menu now gets portal
 * placement, roving-tabindex, Escape, and outside-click for free. Link items
 * use `render={<Link/>}` so client-side navigation composes through the item.
 */
export function UserAvatar({ locale: localeProp }: { locale?: Locale }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [storedLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en-US";
    const stored = window.localStorage.getItem("platform-locale-v2");
    return stored === "zh-CN" || stored === "en-US" ? stored : "en-US";
  });
  const [avatarError, setAvatarError] = useState(false);
  const locale = localeProp ?? storedLocale;

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    async function loadUser() {
      try {
        const customUsername = window.localStorage.getItem(USERNAME_STORAGE_KEY);
        const customAvatar = window.localStorage.getItem(AVATAR_STORAGE_KEY);

        if (customUsername) {
          setUser({ username: customUsername, avatarUrl: customAvatar || undefined });
          return;
        }

        const res = await fetch("/api/auth/me", {
          signal: controller.signal,
          credentials: "include",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            user?: { username?: string; avatarUrl?: string | null } | null;
          };
          if (data.user?.username) {
            let avatarUrl = data.user.avatarUrl ?? undefined;
            if (!avatarUrl && data.user.username) {
              avatarUrl = `https://github.com/${data.user.username}.png?size=80`;
            }
            setUser({ username: data.user.username, avatarUrl });
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

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const copy = WORKSPACE_COPY[locale].userMenu;
  const accountLabel = WORKSPACE_COPY[locale].settings.account.title;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="header-pill flex items-center gap-2" aria-label="User menu" />
        }
      >
        {user?.avatarUrl && !avatarError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-[11px] font-semibold text-[var(--accent-blue)]">
            {initial}
          </div>
        )}
        <span className="hidden max-w-[100px] truncate text-xs font-medium text-foreground sm:inline">
          {user?.username ?? "User"}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-2 border-b border-border bg-muted/10 px-3 py-2.5">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-sm font-semibold text-[var(--accent-blue)]">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.username ?? "User"}</div>
            <div className="text-[10px] text-muted-foreground">{copy.loggedIn}</div>
          </div>
        </div>

        <DropdownMenuItem render={<Link href="/workspace/account" />}>
          <UserIcon strokeWidth={1.5} />
          {accountLabel}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/workspace/settings" />}>
          <SettingsIcon strokeWidth={1.5} />
          {copy.settings}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <LogoutButton role="menuitem" label={copy.signOut} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
