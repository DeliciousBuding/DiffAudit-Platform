"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { BrandMark } from "@/components/brand-mark";
import {
  LanguagePicker,
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

const BRAND_HOME_URL = "/";

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
          description: "扩散模型隐私泄露风险的统一审计入口",
          links: [
            {
              title: "能力概览",
              description: "查看系统支持的审计范围",
              href: "#product",
            },
            {
              title: "试用申请",
              description: "进入公开试用申请流程",
              href: "/trial",
            },
            {
              title: "统一登录",
              description: "在同一站点完成登录，然后继续进入工作台",
              href: "/login",
            },
            {
              title: "工作台入口",
              description: "直接进入当前审计工作区",
              href: "/workspace/start",
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
          description: "从快速筛查到深入证据，都沿着同一条链路推进",
          links: [
            {
              title: "黑盒审计",
              description: "用最小前置成本判断风险暴露面",
              href: "#coverage",
            },
            {
              title: "灰盒分析",
              description: "查看更细的攻击线索与中间状态",
              href: "#coverage",
            },
            {
              title: "白盒证据",
              description: "继续下钻到训练痕迹、对照结果和解释面",
              href: "#coverage",
            },
            {
              title: "报告输出",
              description: "把结果整理成可复核的审计结论",
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
          description: "先进入系统，再创建审计任务，然后回看结果",
          links: [
            {
              title: "登录",
              description: "在同一站点完成认证",
              href: "/login",
            },
            {
              title: "创建任务",
              description: "在审计流程页发起新的审计任务",
              href: "/workspace/audits",
            },
            {
              title: "查看状态",
              description: "跟踪运行进度、关键指标和输出结果",
              href: "/workspace/start",
            },
            {
              title: "导出报告",
              description: "把汇总结果带到报告页继续整理",
              href: "/workspace/reports",
            },
          ],
        },
      },
      workbench: {
        id: "workbench",
        label: "工作台",
        href: "/workspace/start",
        dropdown: {
          title: "工作台",
          description: "任务、报告和设置都收在同一套结构里",
          links: [
            {
              title: "工作台首页",
              description: "查看待办、最近任务和关键指标",
              href: "/workspace/start",
            },
            {
              title: "审计流程",
              description: "创建任务，跟踪运行状态，查看结果",
              href: "/workspace/audits",
            },
            {
              title: "报告中心",
              description: "汇总输出并导出报告",
              href: "/workspace/reports",
            },
            {
              title: "设置",
              description: "管理团队、密钥和个人偏好",
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
          description: "架构、API 参考和使用指南",
          links: [
            {
              title: "快速开始",
              description: "三步完成首次审计",
              href: "/docs/quick-start",
            },
            {
              title: "架构",
              description: "Platform → Runtime-Server → Runner 三层架构",
              href: "/docs/deployment-runtime",
            },
            {
              title: "API 参考",
              description: "核心 REST API 端点说明",
              href: "/docs/api-reference",
            },
            {
              title: "审计线路",
              description: "黑盒、灰盒、白盒三条审计线路",
              href: "/docs/audit-tracks",
            },
          ],
        },
      },
    },
    hero: {
      headline: "探明数据记忆边界",
      subheadline: "让生成模型的隐私风险与合规分析有迹可循",
      description: "基于成员推断攻击（MIA）的生成式扩散模型隐私审计平台",
      subheadlineNoWrap: true,
      primaryCtaLoggedIn: "进入审计工作台",
      primaryCtaLoggedOut: "登录并开始审计",
      secondaryCta: "从风险到报告",
    },
    coverage: {
      caption: "从风险到报告",
      heading: "一站式模型隐私风险审计",
      items: [
        {
          index: "01",
          title: "黑盒线索",
          body: "用最低成本判断模型是否暴露成员推断风险，适合快速筛查和对外沟通",
        },
        {
          index: "02",
          title: "灰盒与白盒",
          body: "需要更深的证据链时，可以继续下钻到训练痕迹、攻击效果和对照结果",
        },
        {
          index: "03",
          title: "统一工作台",
          body: "首页负责讲清范围和入口，工作台负责任务、运行状态与报告导出",
        },
      ],
    },
    flow: {
      caption: "审计流程",
      heading: "提交目标，跟踪运行，交付报告",
      body: "从模型与数据配置开始，平台会把任务进度、风险指标和报告材料收束到同一个审计工作流里",
      steps: [
        {
          index: "A",
          title: "提交审计目标",
          body: "选择模型、数据集和审计线路，快速发起一次隐私风险评估",
        },
        {
          index: "B",
          title: "跟踪风险信号",
          body: "实时查看运行状态、攻击效果和关键指标，判断风险暴露程度",
        },
        {
          index: "C",
          title: "沉淀审计报告",
          body: "汇总证据、指标和结论，形成可分享、可复查的审计输出",
        },
      ],
    },
    resources: {
      caption: "开始审计",
      heading: "把下一次模型隐私检查放进工作台",
      primaryCtaLoggedIn: "打开审计工作台",
      primaryCtaLoggedOut: "现在登录",
      secondaryCta: "返回顶部",
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
          description: "Membership inference audit for diffusion models, in one place",
          links: [
            {
              title: "Value proposition",
              description: "Start with what the system can explain and support",
              href: "#product",
            },
            {
              title: "Request trial",
              description: "Open the public trial flow from the same site",
              href: "/trial",
            },
            {
              title: "Unified sign in",
              description: "Authenticate here, then continue straight into the workspace",
              href: "/login",
            },
            {
              title: "Workspace entry",
              description: "Go directly to the current audit workspace",
              href: "/workspace/start",
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
          description: "From a quick screen to deep evidence, all in the same tool chain",
          links: [
            {
              title: "Black-box audit",
              description: "Get a quick read on exposure with minimal setup",
              href: "#coverage",
            },
            {
              title: "Gray-box analysis",
              description: "Inspect attack signals and intermediate evidence",
              href: "#coverage",
            },
            {
              title: "White-box evidence",
              description: "Drill down into training traces, comparisons, and explanations",
              href: "#coverage",
            },
            {
              title: "Reports",
              description: "Turn results into a reviewable audit package",
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
          description: "Sign in, create a run, then review the results",
          links: [
            {
              title: "Sign in",
              description: "Use the shared entry point for authentication",
              href: "/login",
            },
            {
              title: "Create run",
              description: "Launch a new audit job from the audit flow page",
              href: "/workspace/audits",
            },
            {
              title: "Track status",
              description: "Review runtime progress, metrics, and outputs",
              href: "/workspace/start",
            },
            {
              title: "Export reports",
              description: "Carry the result set into the report center",
              href: "/workspace/reports",
            },
          ],
        },
      },
      workbench: {
        id: "workbench",
        label: "Workbench",
        href: "/workspace/start",
        dropdown: {
          title: "Workbench",
          description: "Tasks, reports, and settings stay inside one structure",
          links: [
            {
              title: "Workspace home",
              description: "Review todos, recent jobs, and key metrics",
              href: "/workspace/start",
            },
            {
              title: "Audit flow",
              description: "Create jobs, track runtime, and inspect outputs",
              href: "/workspace/audits",
            },
            {
              title: "Reports",
              description: "Collect results and export the final package",
              href: "/workspace/reports",
            },
            {
              title: "Settings",
              description: "Manage team access, keys, and preferences",
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
          description: "Architecture, API reference, and usage guides",
          links: [
            {
              title: "Quick Start",
              description: "Complete your first audit in three steps",
              href: "/docs/quick-start",
            },
            {
              title: "Architecture",
              description: "Platform, Runtime-Server, and Python Runners",
              href: "/docs/deployment-runtime",
            },
            {
              title: "API Reference",
              description: "Core REST API endpoint descriptions",
              href: "/docs/api-reference",
            },
            {
              title: "Audit Tracks",
              description: "Black-box, Gray-box, and White-box audit tracks",
              href: "/docs/audit-tracks",
            },
          ],
        },
      },
    },
    hero: {
      headline: "Audit diffusion models",
      subheadline: "before they reach production.",
      description: "Membership inference attack platform for privacy-aware AI compliance",
      subheadlineNoWrap: true,
      primaryCtaLoggedIn: "Open audit workspace",
      primaryCtaLoggedOut: "Sign in to start",
      secondaryCta: "From risk to report",
    },
    coverage: {
      caption: "From risk to report",
      heading: "Complete model privacy audits in one workspace",
      items: [
        {
          index: "01",
          title: "Black-box signals",
          body: "Get a fast read on exposure for early screening and stakeholder communication",
        },
        {
          index: "02",
          title: "Gray-box and white-box depth",
          body: "When you need stronger evidence, drill into training traces, attack effects, and comparisons",
        },
        {
          index: "03",
          title: "One workspace",
          body: "The homepage frames the system. The workspace carries tasks, runtime status, and exports",
        },
      ],
    },
    flow: {
      caption: "Audit workflow",
      heading: "Submit a target. Track the run. Deliver the report",
      body: "Start with model and dataset setup, then keep progress, risk metrics, and report material inside one audit workflow",
      steps: [
        {
          index: "A",
          title: "Submit audit target",
          body: "Choose the model, dataset, and audit track to launch a privacy risk evaluation",
        },
        {
          index: "B",
          title: "Track risk signals",
          body: "Review runtime status, attack performance, and key metrics as the run progresses",
        },
        {
          index: "C",
          title: "Package the report",
          body: "Collect evidence, metrics, and conclusions into an output your team can review",
        },
      ],
    },
    resources: {
      caption: "Start audit",
      heading: "Put your next model privacy check into the workspace",
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
  workbenchUrl = "/workspace/start",
  initialLocale,
}: {
  loggedIn: boolean;
  workbenchUrl?: string;
  initialLocale?: Locale;
}) {
  const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locale = localeOverride ?? initialLocale ?? "en-US";

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
          href: link.href === "/workspace/start" ? workbenchUrl : link.href,
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
                <LanguagePicker value={locale} onChange={setLocaleOverride} />
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
                <LanguagePicker value={locale} onChange={setLocaleOverride} />
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

      <section id="coverage" className="coverage-showcase section-rule">
        <div className="grid-container">
          <div className="coverage-showcase-grid">
            <div className="coverage-showcase-copy">
              <p className="caption">{copy.coverage.caption}</p>
              <h2 className="heading-3">{copy.coverage.heading}</h2>
              <div className="coverage-list">
              {copy.coverage.items.map((item) => (
                <div key={item.index} className="coverage-item">
                  <p className="caption">{item.index}</p>
                  <h3 className="heading-8">{item.title}</h3>
                  <p className="body-text">{item.body}</p>
                </div>
              ))}
              </div>
            </div>

            <div className="audit-preview-stage" aria-hidden="true">
              <div className="hero-audit-panel hero-audit-panel-main">
                <div className="hero-audit-panel-header">
                  <span>Audit run</span>
                  <span className="hero-status-pill">Live</span>
                </div>
                <div className="hero-risk-readout">
                  <span className="hero-risk-label">MIA exposure</span>
                  <strong>0.84</strong>
                  <span className="hero-risk-delta">+18.6%</span>
                </div>
                <div className="hero-curve">
                  <svg viewBox="0 0 320 150" role="img">
                    <defs>
                      <linearGradient id="heroCurveFill" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(47,109,246,0.28)" />
                        <stop offset="100%" stopColor="rgba(255,95,70,0.03)" />
                      </linearGradient>
                    </defs>
                    <path d="M10 132 C62 124 84 91 126 76 C178 58 204 31 310 18 L310 142 L10 142 Z" fill="url(#heroCurveFill)" />
                    <path d="M10 132 C62 124 84 91 126 76 C178 58 204 31 310 18" fill="none" stroke="var(--accent-blue)" strokeWidth="4" strokeLinecap="round" />
                    <path d="M10 130 C76 126 128 121 186 98 C230 81 260 63 310 58" fill="none" stroke="rgba(255,95,70,0.72)" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
                    <g fill="var(--background)" stroke="var(--accent-blue)" strokeWidth="3">
                      <circle cx="126" cy="76" r="6" />
                    <circle cx="310" cy="18" r="6" />
                    </g>
                  </svg>
                </div>
                <div className="hero-audit-metrics">
                  <span><strong>7</strong> jobs</span>
                  <span><strong>3</strong> tracks</span>
                  <span><strong>4</strong> reports</span>
                </div>
              </div>

              <div className="hero-audit-panel hero-audit-panel-side">
                <div className="hero-audit-panel-header">
                  <span>Risk bands</span>
                  <span>Evidence</span>
                </div>
                <div className="hero-risk-bars">
                  <span style={{ "--bar-size": "86%" } as CSSProperties}><i /> High</span>
                  <span style={{ "--bar-size": "58%" } as CSSProperties}><i /> Medium</span>
                  <span style={{ "--bar-size": "32%" } as CSSProperties}><i /> Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="flow-showcase section-rule">
        <div className="grid-container">
          <div className="flow-showcase-grid">
            <div className="flow-showcase-copy">
              <p className="caption">{copy.flow.caption}</p>
              <h2 className="heading-3">{copy.flow.heading}</h2>
              <p className="body-text">{copy.flow.body}</p>
            </div>

            <div className="flow-visual" aria-hidden="true">
              <div className="flow-visual-toolbar">
                <span />
                <span />
                <span />
                <strong>Audit pipeline</strong>
              </div>
              <div className="flow-visual-body">
                <svg className="flow-visual-map" viewBox="0 0 620 280" role="img">
                  <defs>
                    <linearGradient id="flowLine" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="var(--accent-blue)" />
                      <stop offset="100%" stopColor="var(--accent-coral)" />
                    </linearGradient>
                    <linearGradient id="flowPanel" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(47,109,246,0.12)" />
                      <stop offset="100%" stopColor="rgba(255,95,70,0.08)" />
                    </linearGradient>
                  </defs>
                  <path d="M80 150 C168 82 248 84 320 142 C392 200 476 202 548 112" fill="none" stroke="url(#flowLine)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M80 150 C168 82 248 84 320 142 C392 200 476 202 548 112" fill="none" stroke="rgba(47,109,246,0.13)" strokeWidth="30" strokeLinecap="round" />
                  <g className="flow-node">
                    <circle cx="80" cy="150" r="30" />
                    <path d="M68 145h24M68 155h16" />
                  </g>
                  <g className="flow-node">
                    <circle cx="320" cy="142" r="30" />
                    <path d="M308 154l12-25 12 25M313 146h14" />
                  </g>
                  <g className="flow-node">
                    <circle cx="548" cy="112" r="30" />
                    <path d="M536 101h24v25h-24zM541 109h14M541 117h10" />
                  </g>
                  <rect x="118" y="188" width="132" height="54" rx="10" fill="url(#flowPanel)" />
                  <rect x="372" y="40" width="132" height="54" rx="10" fill="url(#flowPanel)" />
                  <path d="M136 208h82M136 224h52M390 60h82M390 76h48" stroke="rgba(18,19,23,0.32)" strokeWidth="6" strokeLinecap="round" />
                </svg>

                <div className="flow-visual-status">
                  <span><strong>Target</strong> Model + dataset</span>
                  <span><strong>Signals</strong> Attack metrics</span>
                  <span><strong>Report</strong> Evidence package</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flow-step-grid">
            {copy.flow.steps.map((step) => (
              <div key={step.index} className="flow-step">
                <div className="flow-step-icon" aria-hidden="true">
                  <span>{step.index}</span>
                </div>
                <div>
                  <p className="heading-8">{step.title}</p>
                  <p className="body-text">{step.body}</p>
                </div>
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
