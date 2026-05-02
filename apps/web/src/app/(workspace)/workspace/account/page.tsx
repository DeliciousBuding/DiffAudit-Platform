import { Lock, Mail, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { cookies, headers } from "next/headers";

import { StatusBadge } from "@/components/status-badge";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { getCurrentUserProfile, SESSION_COOKIE_NAME } from "@/lib/auth";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";

export default async function WorkspaceAccountPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const cookieStore = await cookies();
  const profile = getCurrentUserProfile(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const displayName = profile?.displayName || profile?.username || "DiffAudit user";
  const handle = profile?.username ? `@${profile.username}` : "@workspace-user";
  const copy = locale === "zh-CN"
    ? {
      eyebrow: "账户",
      title: "个人账户",
      description: "管理你的个人资料、登录方式和安全状态。",
      current: "当前用户",
      signIn: "登录方式",
      email: "邮箱",
      security: "安全状态",
      password: "密码登录",
      configured: "已配置",
      notConfigured: "未配置",
      verified: "已验证",
      unverified: "未验证",
      logout: "退出登录",
      twoFa: "两步验证",
      settingsHint: "点击上方卡片中的按钮，可跳转到设置页面进行管理",
      manageAccount: "管理账户设置",
      changePassword: "修改",
      setPassword: "设置",
      changeEmail: "修改",
      verifyEmail: "验证",
      connect: "连接",
      disconnect: "断开",
      setup2fa: "设置",
      manage2fa: "管理",
    }
    : {
      eyebrow: "Account",
      title: "Personal Account",
      description: "Manage your profile, sign-in methods, and security state.",
      current: "Current user",
      signIn: "Sign-in methods",
      email: "Email",
      security: "Security state",
      password: "Password",
      configured: "Active",
      notConfigured: "Not set",
      verified: "Verified",
      unverified: "Unverified",
      logout: "Sign out",
      twoFa: "Two-factor auth",
      settingsHint: "Click the buttons on each card to manage in Settings",
      manageAccount: "Manage account settings",
      changePassword: "Change",
      setPassword: "Set up",
      changeEmail: "Change",
      verifyEmail: "Verify",
      connect: "Connect",
      disconnect: "Disconnect",
      setup2fa: "Set up",
      manage2fa: "Manage",
    };

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
    >
      {/* Hero banner */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-lg font-bold text-[var(--accent-blue)]">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--accent-blue)]">{copy.current}</div>
            <h2 className="mt-0.5 truncate text-xl font-bold text-foreground">{displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{handle}</p>
          </div>
          <form action="/api/auth/logout" method="post" className="ml-auto">
            <button type="submit" className="workspace-btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <LogOut size={14} strokeWidth={1.5} />
              {copy.logout}
            </button>
          </form>
        </div>
      </div>

      {/* Status cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Password */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
              <Lock size={16} strokeWidth={1.5} className="text-[var(--accent-blue)]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.password}</span>
          </div>
          <div className="flex items-center justify-between">
            <strong className={`text-sm ${profile?.hasPassword ? "text-[var(--success)]" : "text-muted-foreground"}`}>
              {profile?.hasPassword ? copy.configured : copy.notConfigured}
            </strong>
            <Link href="/workspace/settings" className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/20">
              {profile?.hasPassword ? copy.changePassword : copy.setPassword}
            </Link>
          </div>
        </div>

        {/* Google */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-border/60">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Google</span>
          </div>
          <div className="flex items-center justify-between">
            <strong className={`text-sm ${profile?.providers.includes("google") ? "text-[var(--success)]" : "text-muted-foreground"}`}>
              {profile?.providers.includes("google") ? copy.configured : copy.notConfigured}
            </strong>
            <Link href="/workspace/settings" className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/20">
              {profile?.providers.includes("google") ? copy.disconnect : copy.connect}
            </Link>
          </div>
        </div>

        {/* GitHub */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#24292f]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">GitHub</span>
          </div>
          <div className="flex items-center justify-between">
            <strong className={`text-sm ${profile?.providers.includes("github") ? "text-[var(--success)]" : "text-muted-foreground"}`}>
              {profile?.providers.includes("github") ? copy.configured : copy.notConfigured}
            </strong>
            <Link href="/workspace/settings" className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/20">
              {profile?.providers.includes("github") ? copy.disconnect : copy.connect}
            </Link>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
              <Mail size={16} strokeWidth={1.5} className="text-[var(--accent-blue)]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-foreground truncate">{profile?.email ?? profile?.pendingEmail ?? "—"}</span>
              <StatusBadge tone={profile?.emailVerified ? "success" : "warning"} compact>
                {profile?.emailVerified ? copy.verified : copy.unverified}
              </StatusBadge>
            </div>
            <Link href="/workspace/settings" className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/20">
              {profile?.emailVerified ? copy.changeEmail : copy.verifyEmail}
            </Link>
          </div>
        </div>

        {/* 2FA */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-blue)]/10">
              <Shield size={16} strokeWidth={1.5} className="text-[var(--accent-blue)]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{copy.twoFa}</span>
          </div>
          <div className="flex items-center justify-between">
            <strong className={`text-sm ${profile?.twoFactorEnabled ? "text-[var(--success)]" : "text-muted-foreground"}`}>
              {profile?.twoFactorEnabled ? copy.configured : copy.notConfigured}
            </strong>
            <Link href="/workspace/settings" className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/20">
              {profile?.twoFactorEnabled ? copy.manage2fa : copy.setup2fa}
            </Link>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground">
        {copy.settingsHint}
      </p>
    </WorkspacePageFrame>
  );
}
