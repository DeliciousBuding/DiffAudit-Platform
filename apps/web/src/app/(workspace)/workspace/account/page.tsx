import { cookies, headers } from "next/headers";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { WorkspacePageFrame, WorkspaceSectionCard } from "@/components/workspace-frame";
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
      title: "账户",
      description: "管理个人资料、登录方式和安全状态。Google 和 GitHub 仅用于建号与登录。",
      current: "当前用户",
      signIn: "登录方式",
      email: "邮箱",
      security: "安全状态",
      providers: "已连接登录方式",
      noProvider: "还没有连接 OAuth 登录方式。",
      password: "密码访问",
      configured: "已配置",
      notConfigured: "未配置",
      verified: "已验证",
      unverified: "未验证",
      manage: "管理完整账户设置",
      logout: "退出登录",
    }
    : {
      eyebrow: "Account",
      title: "Account",
      description: "Manage profile, sign-in methods, and security state. Google and GitHub are only used for account creation and sign-in.",
      current: "Current user",
      signIn: "Sign-in methods",
      email: "Email",
      security: "Security state",
      providers: "Connected providers",
      noProvider: "No OAuth provider connected.",
      password: "Password access",
      configured: "Configured",
      notConfigured: "Not configured",
      verified: "Verified",
      unverified: "Unverified",
      manage: "Manage full account settings",
      logout: "Sign out",
    };

  return (
    <WorkspacePageFrame
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      actions={<Link href="/workspace/settings" className="workspace-btn-secondary px-4 py-2 text-sm">{copy.manage}</Link>}
    >
      <div className="workspace-account-layout">
        <section className="workspace-account-hero">
          <div className="workspace-account-avatar">{displayName.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-blue)]">{copy.current}</div>
            <h2 className="mt-2 truncate text-3xl font-black tracking-[-0.05em] text-foreground">{displayName}</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">{handle}</p>
          </div>
        </section>

        <WorkspaceSectionCard title={copy.signIn}>
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="workspace-inspector-metric"><span>{copy.password}</span><strong>{profile?.hasPassword ? copy.configured : copy.notConfigured}</strong></div>
            <div className="workspace-inspector-metric"><span>Google</span><strong>{profile?.providers.includes("google") ? copy.configured : copy.notConfigured}</strong></div>
            <div className="workspace-inspector-metric"><span>GitHub</span><strong>{profile?.providers.includes("github") ? copy.configured : copy.notConfigured}</strong></div>
          </div>
        </WorkspaceSectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <WorkspaceSectionCard title={copy.email}>
            <div className="grid gap-3 p-4">
              <div className="workspace-inspector-metric">
                <span>{profile?.email ?? profile?.pendingEmail ?? copy.notConfigured}</span>
                <StatusBadge tone={profile?.emailVerified ? "success" : "warning"} compact>
                  {profile?.emailVerified ? copy.verified : copy.unverified}
                </StatusBadge>
              </div>
            </div>
          </WorkspaceSectionCard>
          <WorkspaceSectionCard title={copy.security}>
            <div className="grid gap-3 p-4">
              <div className="workspace-inspector-metric"><span>2FA</span><strong>{profile?.twoFactorEnabled ? copy.configured : copy.notConfigured}</strong></div>
            </div>
          </WorkspaceSectionCard>
        </div>

        <form action="/api/auth/logout" method="post">
          <button className="workspace-btn-secondary px-4 py-2 text-sm" type="submit">{copy.logout}</button>
        </form>
      </div>
    </WorkspacePageFrame>
  );
}
