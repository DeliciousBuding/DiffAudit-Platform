import { headers } from "next/headers";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { LanguagePicker, type Locale } from "@/components/language-picker";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { TrialForm } from "@/components/trial-form";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

export const dynamic = "force-dynamic";

const TRIAL_PAGE_META: Record<
  Locale,
  {
    pageLabel: string;
    docsCta: string;
    homeCta: string;
    externalCta: string;
    externalHint: string;
    localFormEyebrow: string;
    localFormTitle: string;
    localFormBody: string;
    checklistTitle: string;
    checklistItems: string[];
    responseTitle: string;
    responseItems: string[];
  }
> = {
  "en-US": {
    pageLabel: "Public Intake",
    docsCta: "Open docs",
    homeCta: "Back home",
    externalCta: "Open external intake form",
    externalHint: "If you switch to a Feishu or external questionnaire later, only `DIFFAUDIT_TRIAL_FORM_URL` needs to change.",
    localFormEyebrow: "Temporary intake",
    localFormTitle: "The in-site form is still available as a fallback.",
    localFormBody: "Use it while the external questionnaire is not connected yet. Once the public intake link is ready, this page can stay as the branded handoff surface.",
    checklistTitle: "What to prepare",
    checklistItems: [
      "Which model or product line needs an audit.",
      "What role is requesting the trial: security, compliance, platform, or research.",
      "What risk matters right now: launch review, customer evidence, or governance review.",
    ],
    responseTitle: "What happens next",
    responseItems: [
      "We align the appropriate attack track and expected evidence depth.",
      "We confirm whether the first pass should stay black-box or go deeper.",
      "We hand the team into the workspace or the external intake channel.",
    ],
  },
  "zh-CN": {
    pageLabel: "公开试用入口",
    docsCta: "查看 Docs",
    homeCta: "返回首页",
    externalCta: "打开外部申请表",
    externalHint: "后面如果你改成飞书问卷，只需要替换 `DIFFAUDIT_TRIAL_FORM_URL`，这个入口页结构不用再重做。",
    localFormEyebrow: "临时站内入口",
    localFormTitle: "当前站内表单保留为兜底入口。",
    localFormBody: "在外部问卷未接入前，你仍可直接在这里收集线索。等公开申请链路切到飞书或别的外部表单后，这一页继续作为品牌化入口与分流页使用。",
    checklistTitle: "建议先准备",
    checklistItems: [
      "准备要审计的模型、产品线或上线场景。",
      "说明当前发起方角色：安全、合规、平台或研究。",
      "明确这次最关心的风险：上线前评估、对外交付证据，还是内部治理。",
    ],
    responseTitle: "后续会发生什么",
    responseItems: [
      "先对齐适合的攻击线路和证据深度。",
      "确认首轮应该停留在黑盒筛查，还是直接进入更深层审计。",
      "再把团队导向工作台或外部问卷链路。",
    ],
  },
};

export default async function TrialPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const copy = WORKSPACE_COPY[locale];
  const meta = TRIAL_PAGE_META[locale];
  const trialFormUrl = process.env.DIFFAUDIT_TRIAL_FORM_URL?.trim();
  const hasExternalForm = Boolean(trialFormUrl);

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="container site-header-inner">
          <div className="flex items-center gap-3">
            <BrandMark compact href="/" prefetch={false} />
            <span className="hidden border-l border-[var(--color-border-subtle)] pl-3 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] sm:inline">
              {meta.pageLabel}
            </span>
          </div>
          <div className="header-controls">
            <Link href="/docs/quick-start" className="header-pill hidden sm:inline-flex">
              {meta.docsCta}
            </Link>
            <ThemeToggleButton />
            <LanguagePicker value={locale} reloadOnChange />
          </div>
        </div>
      </header>

      <section className="container py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)] lg:items-start">
          <div className="grid gap-6">
            <div className="surface-card overflow-hidden p-7 md:p-9">
              <div className="caption">{copy.trialPage.eyebrow}</div>
              <h1 className="mt-3 max-w-[15ch] text-[38px] font-[450] leading-[1.02] tracking-[-0.04em] md:text-[52px]">
                {copy.trialPage.title}
              </h1>
              <p className="mt-5 max-w-[56ch] text-sm leading-7 text-muted-foreground md:text-[15px]">
                {copy.trialPage.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {hasExternalForm ? (
                  <a
                    href={trialFormUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-pill portal-pill-primary"
                  >
                    {meta.externalCta}
                  </a>
                ) : null}
                <Link href="/" className="portal-pill portal-pill-secondary">
                  {meta.homeCta}
                </Link>
              </div>
              <p className="mt-4 max-w-[58ch] text-xs leading-6 text-muted-foreground">
                {meta.externalHint}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-card p-6">
                <div className="caption">{meta.checklistTitle}</div>
                <div className="mt-4 grid gap-4">
                  {meta.checklistItems.map((item, index) => (
                    <div key={item} className="grid gap-1 border-t border-[var(--color-border-subtle)] pt-4 first:border-t-0 first:pt-0">
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-blue)]">
                        0{index + 1}
                      </div>
                      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card p-6">
                <div className="caption">{meta.responseTitle}</div>
                <div className="mt-4 grid gap-4">
                  {meta.responseItems.map((item, index) => (
                    <div key={item} className="grid gap-1 border-t border-[var(--color-border-subtle)] pt-4 first:border-t-0 first:pt-0">
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-accent-coral)]">
                        S{index + 1}
                      </div>
                      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {hasExternalForm ? (
              <div className="surface-card p-7">
                <div className="caption">{meta.localFormEyebrow}</div>
                <h2 className="mt-3 text-[28px] font-[450] leading-tight">{meta.localFormTitle}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{meta.localFormBody}</p>
                <a
                  href={trialFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="portal-pill portal-pill-primary mt-6"
                >
                  {meta.externalCta}
                </a>
              </div>
            ) : null}

            <TrialForm copy={copy.trialForm} />
          </div>
        </div>
      </section>
    </main>
  );
}
