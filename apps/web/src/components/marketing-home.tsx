"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import {
  LanguagePicker,
  getStoredLocale,
  type Locale,
} from "@/components/language-picker";
import { ParticleField } from "@/components/particle-field";
import { UserAvatar } from "@/components/user-avatar";
import { GithubIcon } from "@/components/platform-shell-icons";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

type NavLink = {
  title: string;
  description: string;
  href: string;
};

type NavItem = {
  id: string;
  label: string;
  href: string;
  dropdown: {
    title: string;
    description: string;
    links: NavLink[];
  };
};

const BRAND_HOME_URL = "https://diffaudit.vectorcontrol.tech/";

const HOME_COPY: Record<
  Locale,
  {
    header: {
      navAriaLabel: string;
      brandAriaLabel: string;
      signIn: string;
      openWorkspace: string;
    };
    nav: {
      product: NavItem;
      coverage: NavItem;
      flow: NavItem;
      workbench: NavItem;
      docs: NavItem;
    };
    hero: {
      headline: string;
      subheadline: string;
      description: string;
      subheadlineNoWrap?: boolean;
      primaryCtaLoggedIn: string;
      primaryCtaLoggedOut: string;
      secondaryCta: string;
    };
    coverage: {
      caption: string;
      heading: string;
      items: Array<{
        index: string;
        title: string;
        body: string;
      }>;
    };
    flow: {
      caption: string;
      heading: string;
      body: string;
      steps: Array<{
        index: string;
        title: string;
        body: string;
      }>;
    };
    resources: {
      caption: string;
      heading: string;
      primaryCtaLoggedIn: string;
      primaryCtaLoggedOut: string;
      secondaryCta: string;
    };
    footer: {
      note: string;
    };
  }
> = {
  "zh-CN": {
    header: {
      navAriaLabel: "主导航",
      brandAriaLabel: "前往 DiffAudit 首页",
      signIn: "登录",
      openWorkspace: "进入工作台",
    },
    nav: {
      product: {
        id: "product",
        label: "产品",
        href: "#product",
        dropdown: {
          title: "DiffAudit Platform",
          description: "扩散模型成员推断风险的统一审计入口。",
          links: [
            {
              title: "首页价值主张",
              description: "先看清系统能解决什么，再决定如何接入。",
              href: "#product",
            },
            {
              title: "申请试用",
              description: "从公开入口进入试用申请流程。",
              href: "/trial",
            },
            {
              title: "统一登录",
              description: "在同一站点完成登录，然后继续进入工作台。",
              href: "/login",
            },
            {
              title: "工作台入口",
              description: "直接进入当前审计工作区。",
              href: "/workspace",
            },
          ],
        },
      },
      coverage: {
        id: "coverage",
        label: "能力范围",
        href: "#coverage",
        dropdown: {
          title: "审计深度",
          description: "从快速筛查到深入证据，都沿着同一条链路推进。",
          links: [
            {
              title: "黑盒审计",
              description: "用最小前置成本判断风险暴露面。",
              href: "#coverage",
            },
            {
              title: "灰盒分析",
              description: "查看更细的攻击线索与中间状态。",
              href: "#coverage",
            },
            {
              title: "白盒证据",
              description: "继续下钻到训练痕迹、对照结果和解释面。",
              href: "#coverage",
            },
            {
              title: "报告输出",
              description: "把结果整理成可复核的审计结论。",
              href: "/workspace/reports",
            },
          ],
        },
      },
      flow: {
        id: "flow",
        label: "流程",
        href: "#flow",
        dropdown: {
          title: "使用流程",
          description: "先进入，再创建任务，然后回看结果。",
          links: [
            {
              title: "登录",
              description: "统一入口完成认证。",
              href: "/login",
            },
            {
              title: "创建任务",
              description: "在审计流程页发起新的审计任务。",
              href: "/workspace/audits",
            },
            {
              title: "查看状态",
              description: "跟踪运行进度、关键指标和输出结果。",
              href: "/workspace",
            },
            {
              title: "导出报告",
              description: "把汇总结果带到报告页继续整理。",
              href: "/workspace/reports",
            },
          ],
        },
      },
      workbench: {
        id: "workbench",
        label: "工作台",
        href: "/workspace",
        dropdown: {
          title: "工作台",
          description: "任务、报告和设置都收在同一套结构里。",
          links: [
            {
              title: "工作台首页",
              description: "查看待办、最近任务和关键指标。",
              href: "/workspace",
            },
            {
              title: "审计流程",
              description: "创建任务，跟踪运行状态，查看结果。",
              href: "/workspace/audits",
            },
            {
              title: "报告中心",
              description: "汇总输出并导出报告。",
              href: "/workspace/reports",
            },
            {
              title: "设置",
              description: "管理团队、密钥和个人偏好。",
              href: "/workspace/settings",
            },
          ],
        },
      },
      docs: {
        id: "docs",
        label: "文档",
        href: "/docs",
        dropdown: {
          title: "文档",
          description: "架构、API 参考和使用指南。",
          links: [
            {
              title: "快速开始",
              description: "三步完成首次审计。",
              href: "/docs",
            },
            {
              title: "架构",
              description: "Platform → Runtime-Server → Runner 三层架构。",
              href: "/docs#architecture",
            },
            {
              title: "API 参考",
              description: "核心 REST API 端点说明。",
              href: "/docs#api",
            },
            {
              title: "攻击线路",
              description: "黑盒、灰盒、白盒三条审计线路。",
              href: "/docs#attacks",
            },
          ],
        },
      },
    },
    hero: {
      headline: "探明数据记忆边界",
      subheadline: "让生成模型的隐私风险与合规分析有迹可循。",
      description: "基于成员推断攻击（MIA）的生成式扩散模型隐私审计平台。",
      subheadlineNoWrap: true,
      primaryCtaLoggedIn: "进入审计工作台",
      primaryCtaLoggedOut: "登录并开始审计",
      secondaryCta: "查看能力范围",
    },
    coverage: {
      caption: "能力范围",
      heading: "成员推断风险，三层审计深度。",
      items: [
        {
          index: "01",
          title: "黑盒线索",
          body: "先用最小前置成本判断模型是否暴露成员推断风险，适合做快速筛查和对外沟通。",
        },
        {
          index: "02",
          title: "灰盒与白盒",
          body: "当你需要更深的证据链，可以继续下钻到训练痕迹、攻击效果和对照结果。",
        },
        {
          index: "03",
          title: "统一工作台",
          body: "首页负责讲清范围和入口，工作台承接任务、运行状态与报告导出。",
        },
      ],
    },
    flow: {
      caption: "流程",
      heading: "首页定义范围，工作台承接执行。",
      body: "首页只做说明与导航。任务、运行状态和报告导出都在工作台完成。",
      steps: [
        {
          index: "A",
          title: "登录",
          body: "统一入口完成认证，停留在当前站点内继续操作。",
        },
        {
          index: "B",
          title: "创建任务",
          body: "进入审计流程页，选择目标、发起运行并跟踪状态。",
        },
        {
          index: "C",
          title: "查看结果",
          body: "回到工作台和报告页，整理关键指标与输出结论。",
        },
      ],
    },
    resources: {
      caption: "开始使用",
      heading: "从首页进入，在工作台完成审计。",
      primaryCtaLoggedIn: "打开审计工作台",
      primaryCtaLoggedOut: "现在登录",
      secondaryCta: "回到顶部",
    },
    footer: {
      note: "DiffAudit Team 2026",
    },
  },
  "en-US": {
    header: {
      navAriaLabel: "Primary navigation",
      brandAriaLabel: "Go to the DiffAudit homepage",
      signIn: "Sign in",
      openWorkspace: "Open workspace",
    },
    nav: {
      product: {
        id: "product",
        label: "Product",
        href: "#product",
        dropdown: {
          title: "DiffAudit Platform",
          description: "Membership inference audit for diffusion models, in one place.",
          links: [
            {
              title: "Value proposition",
              description: "Start with what the system can explain and support.",
              href: "#product",
            },
            {
              title: "Request trial",
              description: "Open the public trial flow from the same site.",
              href: "/trial",
            },
            {
              title: "Unified sign in",
              description: "Authenticate here, then continue straight into the workspace.",
              href: "/login",
            },
            {
              title: "Workspace entry",
              description: "Go directly to the current audit workspace.",
              href: "/workspace",
            },
          ],
        },
      },
      coverage: {
        id: "coverage",
        label: "Coverage",
        href: "#coverage",
        dropdown: {
          title: "Audit depth",
          description: "From a quick screen to deep evidence, all in the same tool chain.",
          links: [
            {
              title: "Black-box audit",
              description: "Get a quick read on exposure with minimal setup.",
              href: "#coverage",
            },
            {
              title: "Gray-box analysis",
              description: "Inspect attack signals and intermediate evidence.",
              href: "#coverage",
            },
            {
              title: "White-box evidence",
              description: "Drill down into training traces, comparisons, and explanations.",
              href: "#coverage",
            },
            {
              title: "Reports",
              description: "Turn results into a reviewable audit package.",
              href: "/workspace/reports",
            },
          ],
        },
      },
      flow: {
        id: "flow",
        label: "Flow",
        href: "#flow",
        dropdown: {
          title: "Workflow",
          description: "Sign in, create a run, then review the results.",
          links: [
            {
              title: "Sign in",
              description: "Use the shared entry point for authentication.",
              href: "/login",
            },
            {
              title: "Create run",
              description: "Launch a new audit job from the audit flow page.",
              href: "/workspace/audits",
            },
            {
              title: "Track status",
              description: "Review runtime progress, metrics, and outputs.",
              href: "/workspace",
            },
            {
              title: "Export reports",
              description: "Carry the result set into the report center.",
              href: "/workspace/reports",
            },
          ],
        },
      },
      workbench: {
        id: "workbench",
        label: "Workbench",
        href: "/workspace",
        dropdown: {
          title: "Workbench",
          description: "Tasks, reports, and settings stay inside one structure.",
          links: [
            {
              title: "Workspace home",
              description: "Review todos, recent jobs, and key metrics.",
              href: "/workspace",
            },
            {
              title: "Audit flow",
              description: "Create jobs, track runtime, and inspect outputs.",
              href: "/workspace/audits",
            },
            {
              title: "Reports",
              description: "Collect results and export the final package.",
              href: "/workspace/reports",
            },
            {
              title: "Settings",
              description: "Manage team access, keys, and preferences.",
              href: "/workspace/settings",
            },
          ],
        },
      },
      docs: {
        id: "docs",
        label: "Docs",
        href: "/docs",
        dropdown: {
          title: "Documentation",
          description: "Architecture, API reference, and usage guides.",
          links: [
            {
              title: "Quick Start",
              description: "Complete your first audit in three steps.",
              href: "/docs",
            },
            {
              title: "Architecture",
              description: "Platform, Runtime-Server, and Python Runners.",
              href: "/docs#architecture",
            },
            {
              title: "API Reference",
              description: "Core REST API endpoint descriptions.",
              href: "/docs#api",
            },
            {
              title: "Attack Lines",
              description: "Black-box, Gray-box, and White-box audit tracks.",
              href: "/docs#attacks",
            },
          ],
        },
      },
    },
    hero: {
      headline: "Audit diffusion models",
      subheadline: "before they reach production.",
      description: "Membership inference attack platform for privacy-aware AI compliance.",
      subheadlineNoWrap: true,
      primaryCtaLoggedIn: "Open audit workspace",
      primaryCtaLoggedOut: "Sign in to start",
      secondaryCta: "Explore coverage",
    },
    coverage: {
      caption: "Coverage",
      heading: "Membership inference risk, three layers of audit depth.",
      items: [
        {
          index: "01",
          title: "Black-box signals",
          body: "Start with the fastest read on exposure so teams can screen risk early and brief stakeholders clearly.",
        },
        {
          index: "02",
          title: "Gray-box and white-box depth",
          body: "When the story needs stronger evidence, keep drilling into training traces, attack effects, and comparisons.",
        },
        {
          index: "03",
          title: "One workspace",
          body: "The homepage frames the system. The workspace carries tasks, runtime status, and exports.",
        },
      ],
    },
    flow: {
      caption: "Flow",
      heading: "The homepage sets scope. The workspace handles execution.",
      body: "The homepage covers scope and entry points. Tasks, runtime status, and report exports live in the workspace.",
      steps: [
        {
          index: "A",
          title: "Sign in",
          body: "Authenticate through one entry point and stay inside the same site.",
        },
        {
          index: "B",
          title: "Create a job",
          body: "Open the audit flow, choose the target, launch the run, and follow its state.",
        },
        {
          index: "C",
          title: "Review results",
          body: "Return to the workspace and report pages to collect metrics and package the outcome.",
        },
      ],
    },
    resources: {
      caption: "Get started",
      heading: "Start from the homepage. Finish in the workspace.",
      primaryCtaLoggedIn: "Open audit workspace",
      primaryCtaLoggedOut: "Sign in now",
      secondaryCta: "Back to top",
    },
    footer: {
      note: "DiffAudit Team 2026",
    },
  },
};

function DropdownPanel({
  item,
  onNavigate,
}: {
  item: NavItem | null;
  onNavigate: () => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <div className="dropdown-panel">
      <div className="dropdown-panel-content">
        <div className="dropdown-panel-left">
          <p className="dropdown-title">{item.dropdown.title}</p>
          <p className="caption dropdown-info">{item.dropdown.description}</p>
        </div>
        <div className="dropdown-panel-right">
          <div className="subnav">
            {item.dropdown.links.map((link, index) => (
              link.href.startsWith("/") ? (
                <Link
                  key={link.title}
                  href={link.href}
                  className="subnav-link"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={onNavigate}
                >
                  <span className="link-arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="subnav-copy">
                    <span className="subnav-title">{link.title}</span>
                    <span className="subnav-description">{link.description}</span>
                  </span>
                </Link>
              ) : (
                <a
                  key={link.title}
                  href={link.href}
                  className="subnav-link"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={onNavigate}
                >
                  <span className="link-arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="subnav-copy">
                    <span className="subnav-title">{link.title}</span>
                    <span className="subnav-description">{link.description}</span>
                  </span>
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketingHome({
  loggedIn,
  workbenchUrl = "/workspace",
  initialLocale,
}: {
  loggedIn: boolean;
  workbenchUrl?: string;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(() => initialLocale ?? getStoredLocale());
  const [openNav, setOpenNav] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeDropdownNow = useCallback(() => {
    clearCloseTimer();
    setOpenNav(null);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback((delay = 120) => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenNav(null);
      closeTimerRef.current = null;
    }, delay);
  }, [clearCloseTimer]);

  const openDropdown = useCallback((id: string) => {
    clearCloseTimer();
    setOpenNav(id);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const copy = HOME_COPY[locale];
  const navItems: NavItem[] = [
    copy.nav.product,
    copy.nav.coverage,
    copy.nav.flow,
    {
      ...copy.nav.workbench,
      href: workbenchUrl,
      dropdown: {
        ...copy.nav.workbench.dropdown,
        links: copy.nav.workbench.dropdown.links.map((link) => ({
          ...link,
          href: link.href === "/workspace" ? workbenchUrl : link.href,
        })),
      },
    },
    copy.nav.docs,
  ];

  const hasOpenDropdown = openNav !== null;
  const openNavItem = navItems.find((item) => item.id === openNav) || null;

  return (
    <main id="top" className="portal-shell">
      <div
        className={`dropdown-overlay ${hasOpenDropdown ? "open" : ""}`}
        onMouseEnter={closeDropdownNow}
        aria-hidden="true"
      />

      <header
        className={`header ${hasOpenDropdown ? "dropdown-open" : ""}`}
        onMouseLeave={() => scheduleClose(120)}
        onMouseEnter={clearCloseTimer}
      >
        <div className="header-content">
          <div className="flex items-center gap-8" onMouseEnter={() => scheduleClose(80)}>
            <a
              href={BRAND_HOME_URL}
              aria-label={copy.header.brandAriaLabel}
              className="brand-link"
            >
              <BrandMark compact />
            </a>
            <nav
              className="hidden lg:flex items-center gap-6"
              aria-label={copy.header.navAriaLabel}
              onMouseEnter={clearCloseTimer}
              onMouseLeave={() => scheduleClose(140)}
            >
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="nav-item-wrapper"
                  onMouseEnter={() => openDropdown(item.id)}
                >
                  {item.href.startsWith("/") ? (
                    <Link
                      href={item.href}
                      className={`call-to-action--nav nav-trigger ${openNav === item.id ? "nav-trigger-active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`call-to-action--nav nav-trigger ${openNav === item.id ? "nav-trigger-active" : ""}`}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="header-controls flex items-center gap-2" onMouseEnter={() => scheduleClose(80)}>
            {loggedIn ? (
              <>
                <Link href={workbenchUrl} className="header-pill header-pill-primary hidden sm:inline-flex">
                  {copy.header.openWorkspace}
                </Link>
                <LanguagePicker value={locale} onChange={setLocale} />
                <ThemeToggleButton />
                <a
                  href="https://github.com/DeliciousBuding/DiffAudit-Research"
                  target="_blank"
                  rel="noreferrer"
                  className="header-pill header-pill-icon"
                  title="GitHub"
                >
                  <GithubIcon />
                </a>
                <UserAvatar locale={locale} />
              </>
            ) : (
              <>
                <Link href="/login" className="header-pill header-pill-primary">
                  {copy.header.signIn}
                </Link>
                <LanguagePicker value={locale} onChange={setLocale} />
                <ThemeToggleButton />
                <a
                  href="https://github.com/DeliciousBuding/DiffAudit-Research"
                  target="_blank"
                  rel="noreferrer"
                  className="header-pill header-pill-icon"
                  title="GitHub"
                >
                  <GithubIcon />
                </a>
              </>
            )}
          </div>
        </div>

        {hasOpenDropdown ? (
          <div onMouseEnter={clearCloseTimer} onMouseLeave={() => scheduleClose(120)}>
            <DropdownPanel item={openNavItem} onNavigate={closeDropdownNow} />
          </div>
        ) : null}
      </header>

      <div className="welcome-wrapper">
        <ParticleField className="particle-field-hero" />

        <section id="product" className="welcome-section">
          <div className="logo-container">
            <BrandMark hero />
          </div>

          <div className="header-container" style={{ maxWidth: "900px" }}>
            <div className="landing-hero-copy">
              <h1 className="landing-main-header">{copy.hero.headline}</h1>
              <p
                className={`landing-subheader${copy.hero.subheadlineNoWrap ? " landing-subheader-nowrap" : ""}`}
              >
                {copy.hero.subheadline}
              </p>
              <p className="landing-hero-body landing-hero-body-nowrap">{copy.hero.description}</p>
            </div>
          </div>

          <div className="welcome-cta">
            {loggedIn ? (
              <Link href={workbenchUrl} className="hero-button hero-button-primary">
                {copy.hero.primaryCtaLoggedIn}
              </Link>
            ) : (
              <Link href="/login" className="hero-button hero-button-primary">
                {copy.hero.primaryCtaLoggedOut}
              </Link>
            )}
            <a href="#coverage" className="hero-button hero-button-secondary">
              {copy.hero.secondaryCta}
            </a>
          </div>

        </section>
      </div>

      <section id="coverage" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <div className="grid gap-14 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="caption">{copy.coverage.caption}</p>
              <h2 className="heading-3 mt-4">{copy.coverage.heading}</h2>
            </div>

            <div className="grid gap-8">
              {copy.coverage.items.map((item) => (
                <div key={item.index} className="grid gap-3 border-t border-[var(--border)] pt-5">
                  <p className="caption">{item.index}</p>
                  <h3 className="heading-8">{item.title}</h3>
                  <p className="body-text max-w-[58ch]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <p className="caption">{copy.flow.caption}</p>
              <h2 className="heading-3 mt-4">{copy.flow.heading}</h2>
            </div>
            <p className="body-text max-w-[54ch]">{copy.flow.body}</p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {copy.flow.steps.map((step) => (
              <div key={step.index} className="grid gap-3 border-t border-[var(--border)] pt-5">
                <p className="caption">{step.index}</p>
                <p className="heading-8">{step.title}</p>
                <p className="body-text">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="resources" className="section-rule py-18 lg:py-24">
        <div className="grid-container">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="caption">{copy.resources.caption}</p>
              <h2 className="heading-3 mt-4">{copy.resources.heading}</h2>
            </div>

            <div className="flex flex-wrap gap-4">
              {loggedIn ? (
                <Link href={workbenchUrl} className="portal-pill portal-pill-primary">
                  {copy.resources.primaryCtaLoggedIn}
                </Link>
              ) : (
                <Link href="/login" className="portal-pill portal-pill-primary">
                  {copy.resources.primaryCtaLoggedOut}
                </Link>
              )}
              <a href="#top" className="portal-pill portal-pill-secondary">
                {copy.resources.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="grid-container">
          <div className="footer-row py-8">
            <a
              href={BRAND_HOME_URL}
              aria-label={copy.header.brandAriaLabel}
              className="brand-link footer-brand"
            >
              <BrandMark compact hideText />
            </a>
            <p className="caption footer-note">{copy.footer.note}</p>
            <div className="footer-spacer" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </main>
  );
}
