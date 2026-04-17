import { headers } from "next/headers";

import { githubOAuthConfigured, googleOAuthConfigured, sanitizeRedirectPath } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];
  const oauthEnabled = {
    google: googleOAuthConfigured(),
    github: githubOAuthConfigured(),
  };

  return (
    <>
      <div className="relative hidden w-full lg:flex lg:w-[45%] xl:w-[50%] flex-col overflow-hidden bg-muted/10 border-r border-border">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-accent-blue/15 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_10%,transparent_100%)]"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center px-12 xl:px-24 pb-32">
          <div className="w-full max-w-[500px] 2xl:max-w-[700px] mx-auto">
            <div className="mb-6 inline-flex rounded-full bg-accent-blue/10 border border-accent-blue/20 px-[16px] py-1.5 text-[13px] font-medium tracking-wide text-accent-blue uppercase shadow-sm">
              {copy.registerPage.eyebrow}
            </div>
            <h1 className="text-[38px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground xl:text-[46px] 2xl:text-[54px]">
              {copy.registerPage.title}
            </h1>
            <p className="mt-6 text-[16px] leading-[1.6] text-muted-foreground/80 xl:text-[17px] 2xl:text-[20px]">
              {copy.registerPage.description}
            </p>
          </div>
        </div>

        <div className="absolute -bottom-10 -left-10 text-[180px] 2xl:text-[240px] font-bold leading-none tracking-tighter text-foreground/[0.03] select-none pointer-events-none whitespace-nowrap">
          DiffAudit
        </div>
      </div>

      <div className="flex w-full lg:w-[55%] xl:w-[50%] items-center justify-center p-8 lg:p-12 xl:p-24 min-h-[100svh]">
        <div className="w-full max-w-[420px] 2xl:max-w-[480px] 2xl:scale-110 origin-center flex flex-col">
          <div className="mb-8 flex flex-col gap-2">
            <h2 className="text-[28px] 2xl:text-[34px] font-semibold tracking-[-0.02em] text-foreground">
              {copy.registerPage.formTitle}
            </h2>
            <p className="text-[15px] 2xl:text-[17px] text-muted-foreground">
              {locale === "zh-CN"
                ? String(copy.registerPage.description).split("。")[0]
                : "Get started with DiffAudit workspace."}
            </p>
          </div>
          <RegisterForm
            redirectTo={sanitizeRedirectPath(redirectTo)}
            copy={copy.registerForm}
            pageCopy={copy.registerPage}
            oauthEnabled={oauthEnabled}
          />
        </div>
      </div>
    </>
  );
}
