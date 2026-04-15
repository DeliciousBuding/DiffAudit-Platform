import { headers } from "next/headers";

import { githubOAuthConfigured, sanitizeRedirectPath } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];
  const oauthEnabled = githubOAuthConfigured();

  return (
    <div className="mx-auto grid max-w-[960px] gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="workspace-highlight">
        <div className="caption">{copy.loginPage.eyebrow}</div>
        <h1 className="mt-3 text-[34px] font-[450] leading-tight">{copy.loginPage.title}</h1>
        <p className="mt-4 max-w-[48ch] text-sm leading-7 text-muted-foreground">{copy.loginPage.description}</p>
      </div>

      <div className="surface-card p-6 md:p-8">
        <div className="caption">{copy.loginPage.formEyebrow}</div>
        <h2 className="mt-3 text-[28px] font-[450] leading-tight">{copy.loginPage.formTitle}</h2>
        <div className="mt-6">
          <LoginForm
            redirectTo={sanitizeRedirectPath(redirectTo)}
            copy={copy.loginForm}
            pageCopy={copy.loginPage}
            oauthEnabled={oauthEnabled}
          />
        </div>
      </div>
    </div>
  );
}
