"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import {
  getStoredLocale,
  LanguagePicker,
  type Locale,
} from "@/components/language-picker";

const BRAND_HOME_URL = "https://diffaudit.vectorcontrol.tech/";

type DocsCopy = {
  nav: {
    ariaLabel: string;
    brandAriaLabel: string;
    signIn: string;
    openWorkspace: string;
    docs: string;
  };
  overview: {
    caption: string;
    heading: string;
    body: string;
  };
  quickStart: {
    caption: string;
    heading: string;
    steps: Array<{ index: string; title: string; body: string }>;
  };
  architecture: {
    caption: string;
    heading: string;
    body: string;
    diagram: {
      platform: string;
      runtimeServer: string;
      pythonRunners: string;
      arrow: string;
    };
  };
  api: {
    caption: string;
    heading: string;
    body: string;
    colMethod: string;
    colPath: string;
    colDescription: string;
    endpoints: Array<{ method: string; path: string; description: string }>;
  };
  attacks: {
    caption: string;
    heading: string;
    cards: Array<{
      title: string;
      tag: string;
      body: string;
    }>;
  };
  risk: {
    caption: string;
    heading: string;
    body: string;
    colLevel: string;
    colRange: string;
    colDescription: string;
    rows: Array<{
      level: string;
      range: string;
      description: string;
      color: string;
    }>;
  };
  footer: {
    note: string;
  };
};

const COPY: Record<Locale, DocsCopy> = {
  "zh-CN": {
    nav: {
      ariaLabel: "主导航",
      brandAriaLabel: "前往 DiffAudit 首页",
      signIn: "登录",
      openWorkspace: "进入工作台",
      docs: "文档",
    },
    overview: {
      caption: "概览",
      heading: "DiffAudit 技术文档",
      body: "DiffAudit 是扩散模型成员推断风险的统一审计平台。本文档涵盖快速上手、系统架构、API 参考和攻击线路说明。所有功能通过 Web 工作台访问，无需本地安装。",
    },
    quickStart: {
      caption: "快速开始",
      heading: "三步完成首次审计",
      steps: [
        {
          index: "1",
          title: "登录",
          body: "通过统一入口完成认证，获取工作台访问权限。",
        },
        {
          index: "2",
          title: "创建审计任务",
          body: "进入审计流程页，选择目标模型和数据集，发起审计运行。",
        },
        {
          index: "3",
          title: "查看结果",
          body: "运行完成后，在工作台查看指标、证据和风险等级，并导出报告。",
        },
      ],
    },
    architecture: {
      caption: "架构",
      heading: "三层服务架构",
      body: "系统由三个层级组成：前端平台负责任务编排与展示，运行时服务承接审计算力任务，Python Runner 执行具体攻击实验。各层通过 REST API 通信，支持水平扩展。",
      diagram: {
        platform: "Platform\n前端 + Go API Gateway",
        runtimeServer: "Runtime-Server\n审计任务编排与 Runner 管理",
        pythonRunners: "Python Runners\nRecon / PIA / GSA 实验执行",
        arrow: "→",
      },
    },
    api: {
      caption: "API 参考",
      heading: "核心 API 端点",
      body: "以下列出平台对外暴露的核心 REST API 端点。所有端点需携带认证 Cookie，返回 JSON 格式数据。",
      colMethod: "方法",
      colPath: "路径",
      colDescription: "说明",
      endpoints: [
        { method: "GET", path: "/api/v1/catalog", description: "获取可审计的模型与数据集目录" },
        { method: "GET", path: "/api/v1/audit/jobs", description: "列出当前用户的所有审计任务" },
        { method: "POST", path: "/api/v1/audit/jobs", description: "创建新的审计任务并开始运行" },
        { method: "GET", path: "/api/v1/experiments/{workspace}/summary", description: "获取指定工作空间的实验汇总" },
        { method: "GET", path: "/api/v1/evidence/attack-defense-table", description: "获取攻击-防御对照证据表" },
      ],
    },
    attacks: {
      caption: "攻击线路",
      heading: "三条审计深度线路",
      cards: [
        {
          title: "黑盒审计 (Recon)",
          tag: "Black-box",
          body: "最小前置成本，通过输入输出行为推断成员关系。适合快速筛查和初步风险暴露评估，无需访问模型内部状态。",
        },
        {
          title: "灰盒分析 (PIA)",
          tag: "Gray-box",
          body: "利用部分模型信息（如中间层特征）进行成员推断攻击。在黑盒结果基础上提供更细的攻击线索与中间状态分析。",
        },
        {
          title: "白盒证据 (GSA)",
          tag: "White-box",
          body: "完整访问模型参数与梯度，下钻到训练痕迹、对照实验和可解释性分析。提供最强的证据链和审计结论。",
        },
      ],
    },
    risk: {
      caption: "风险分级",
      heading: "成员推断风险等级",
      body: "系统根据审计实验的综合得分（攻击成功率等指标）将风险分为三个等级，帮助团队快速定位需要优先处理的模型。",
      colLevel: "等级",
      colRange: "阈值范围",
      colDescription: "说明",
      rows: [
        {
          level: "高风险",
          range: "> 0.85",
          description: "模型存在显著成员推断漏洞，需立即采取缓解措施",
          color: "var(--color-risk-high, #dc2626)",
        },
        {
          level: "中风险",
          range: "0.65 – 0.85",
          description: "存在可利用的推断线索，建议进一步分析和加固",
          color: "var(--color-risk-medium, #f59e0b)",
        },
        {
          level: "低风险",
          range: "< 0.65",
          description: "推断风险较低，可作为基线持续监控",
          color: "var(--color-risk-low, #22c55e)",
        },
      ],
    },
    footer: {
      note: "DiffAudit Team 2026",
    },
  },
  "en-US": {
    nav: {
      ariaLabel: "Primary navigation",
      brandAriaLabel: "Go to the DiffAudit homepage",
      signIn: "Sign in",
      openWorkspace: "Open workspace",
      docs: "Docs",
    },
    overview: {
      caption: "Overview",
      heading: "DiffAudit Documentation",
      body: "DiffAudit is a unified audit platform for membership inference risk in diffusion models. This documentation covers quick start, system architecture, API reference, and attack line descriptions. All features are accessed through the web workspace — no local installation required.",
    },
    quickStart: {
      caption: "Quick start",
      heading: "Complete your first audit in three steps",
      steps: [
        {
          index: "1",
          title: "Sign in",
          body: "Authenticate through the unified entry point and gain access to the workspace.",
        },
        {
          index: "2",
          title: "Create an audit job",
          body: "Open the audit flow, select the target model and dataset, and launch the run.",
        },
        {
          index: "3",
          title: "Review results",
          body: "Once the run completes, inspect metrics, evidence, and risk levels, then export the report.",
        },
      ],
    },
    architecture: {
      caption: "Architecture",
      heading: "Three-tier service architecture",
      body: "The system is composed of three tiers: the frontend platform handles task orchestration and display, the runtime server承接 audit compute tasks, and Python runners execute specific attack experiments. Tiers communicate via REST API and scale horizontally.",
      diagram: {
        platform: "Platform\nFrontend + Go API Gateway",
        runtimeServer: "Runtime-Server\nAudit orchestration & Runner management",
        pythonRunners: "Python Runners\nRecon / PIA / GSA experiment execution",
        arrow: "→",
      },
    },
    api: {
      caption: "API reference",
      heading: "Core API endpoints",
      body: "The following lists the core REST API endpoints exposed by the platform. All endpoints require an authentication cookie and return JSON-formatted data.",
      colMethod: "Method",
      colPath: "Path",
      colDescription: "Description",
      endpoints: [
        { method: "GET", path: "/api/v1/catalog", description: "Retrieve auditable models and datasets catalog" },
        { method: "GET", path: "/api/v1/audit/jobs", description: "List all audit jobs for the current user" },
        { method: "POST", path: "/api/v1/audit/jobs", description: "Create a new audit job and start the run" },
        { method: "GET", path: "/api/v1/experiments/{workspace}/summary", description: "Get experiment summary for a given workspace" },
        { method: "GET", path: "/api/v1/evidence/attack-defense-table", description: "Retrieve the attack-defense comparison evidence table" },
      ],
    },
    attacks: {
      caption: "Attack lines",
      heading: "Three audit depth tracks",
      cards: [
        {
          title: "Black-box audit (Recon)",
          tag: "Black-box",
          body: "Minimal setup cost. Infers membership through input-output behavior. Suitable for quick screening and initial risk exposure assessment — no internal model access required.",
        },
        {
          title: "Gray-box analysis (PIA)",
          tag: "Gray-box",
          body: "Leverages partial model information such as intermediate layer features. Builds on black-box results to provide finer attack signals and intermediate state analysis.",
        },
        {
          title: "White-box evidence (GSA)",
          tag: "White-box",
          body: "Full access to model parameters and gradients. Drills into training traces, controlled experiments, and interpretability analysis. Delivers the strongest evidence chain and audit conclusions.",
        },
      ],
    },
    risk: {
      caption: "Risk classification",
      heading: "Membership inference risk levels",
      body: "The system classifies risk into three tiers based on composite audit scores (attack success rate and related metrics), helping teams prioritize models that need immediate attention.",
      colLevel: "Level",
      colRange: "Threshold",
      colDescription: "Description",
      rows: [
        {
          level: "High",
          range: "> 0.85",
          description: "Significant membership inference vulnerability detected; mitigation required immediately",
          color: "var(--color-risk-high, #dc2626)",
        },
        {
          level: "Medium",
          range: "0.65 – 0.85",
          description: "Exploitable inference signals present; further analysis and hardening recommended",
          color: "var(--color-risk-medium, #f59e0b)",
        },
        {
          level: "Low",
          range: "< 0.65",
          description: "Low inference risk; suitable as a baseline for ongoing monitoring",
          color: "var(--color-risk-low, #22c55e)",
        },
      ],
    },
    footer: {
      note: "DiffAudit Team 2026",
    },
  },
};

export function DocsHome({ loggedIn }: { loggedIn: boolean }) {
  const [locale, setLocale] = useState<Locale>("en-US");

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) {
      setLocale(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const copy = COPY[locale];

  return (
    <main className="portal-shell">
      <header className="header">
        <div className="header-content">
          <div className="flex items-center gap-8">
            <a
              href={BRAND_HOME_URL}
              aria-label={copy.nav.brandAriaLabel}
              className="brand-link"
            >
              <BrandMark compact />
            </a>
            <nav className="hidden lg:flex items-center gap-6" aria-label={copy.nav.ariaLabel}>
              <a href={BRAND_HOME_URL} className="call-to-action--nav">
                {locale === "zh-CN" ? "首页" : "Home"}
              </a>
              <Link href="/docs" className="call-to-action--nav" style={{ color: "var(--accent-blue)" }}>
                {copy.nav.docs}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguagePicker value={locale} onChange={setLocale} />
            {loggedIn ? (
              <Link href="/workspace" className="portal-pill-sm portal-pill-sm-primary">
                {copy.nav.openWorkspace}
              </Link>
            ) : (
              <Link href="/login" className="portal-pill-sm portal-pill-sm-primary">
                {copy.nav.signIn}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Overview */}
      <section id="overview" className="section-rule" style={{ paddingTop: "calc(var(--nav-height, 72px) + 56px)", paddingBottom: 56 }}>
        <div className="grid-container">
          <p className="caption">{copy.overview.caption}</p>
          <h1 className="heading-3 mt-4">{copy.overview.heading}</h1>
          <p className="body-text mt-6 max-w-[72ch]">{copy.overview.body}</p>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="caption">{copy.quickStart.caption}</p>
              <h2 className="heading-3 mt-4">{copy.quickStart.heading}</h2>
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {copy.quickStart.steps.map((step) => (
              <div key={step.index} className="grid gap-3 border-t border-[var(--border)] pt-5">
                <p className="caption">{step.index}</p>
                <p className="heading-8">{step.title}</p>
                <p className="body-text">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <p className="caption">{copy.architecture.caption}</p>
          <h2 className="heading-3 mt-4">{copy.architecture.heading}</h2>
          <p className="body-text mt-6 max-w-[72ch]">{copy.architecture.body}</p>

          <div className="mt-12 surface-card" style={{ padding: "32px 40px" }}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
              <div className="grid gap-2">
                <p className="caption">1</p>
                <p className="heading-8" style={{ whiteSpace: "pre-line" }}>{copy.architecture.diagram.platform}</p>
              </div>
              <div className="hidden lg:flex items-center justify-center" style={{ color: "var(--accent-blue)", fontSize: 24 }}>
                {copy.architecture.diagram.arrow}
              </div>
              <div className="grid gap-2">
                <p className="caption">2</p>
                <p className="heading-8" style={{ whiteSpace: "pre-line" }}>{copy.architecture.diagram.runtimeServer}</p>
              </div>
              <div className="hidden lg:flex items-center justify-center" style={{ color: "var(--accent-blue)", fontSize: 24 }}>
                {copy.architecture.diagram.arrow}
              </div>
              <div className="grid gap-2">
                <p className="caption">3</p>
                <p className="heading-8" style={{ whiteSpace: "pre-line" }}>{copy.architecture.diagram.pythonRunners}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <p className="caption">{copy.api.caption}</p>
          <h2 className="heading-3 mt-4">{copy.api.heading}</h2>
          <p className="body-text mt-6 max-w-[72ch]">{copy.api.body}</p>

          <div className="mt-12" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5, lineHeight: "22px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.api.colMethod}</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.api.colPath}</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.api.colDescription}</th>
                </tr>
              </thead>
              <tbody>
                {copy.api.endpoints.map((ep) => (
                  <tr key={ep.path} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 450 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          background: ep.method === "GET" ? "rgba(47, 109, 246, 0.08)" : "rgba(34, 197, 94, 0.08)",
                          color: ep.method === "GET" ? "var(--accent-blue)" : "#16a34a",
                        }}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13.5, color: "#212226" }}>{ep.path}</td>
                    <td style={{ padding: "12px 16px", color: "#45474d" }}>{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Attack Lines */}
      <section id="attacks" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <p className="caption">{copy.attacks.caption}</p>
          <h2 className="heading-3 mt-4">{copy.attacks.heading}</h2>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {copy.attacks.cards.map((card) => (
              <div key={card.tag} className="surface-card" style={{ padding: "28px 32px" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: "rgba(47, 109, 246, 0.08)",
                      color: "var(--accent-blue)",
                    }}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3 className="heading-8">{card.title}</h3>
                <p className="body-text mt-3">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Classification */}
      <section id="risk" className="section-rule py-20 lg:py-28">
        <div className="grid-container">
          <p className="caption">{copy.risk.caption}</p>
          <h2 className="heading-3 mt-4">{copy.risk.heading}</h2>
          <p className="body-text mt-6 max-w-[72ch]">{copy.risk.body}</p>

          <div className="mt-12" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5, lineHeight: "22px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.risk.colLevel}</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.risk.colRange}</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 450, color: "#45474d" }}>{copy.risk.colDescription}</th>
                </tr>
              </thead>
              <tbody>
                {copy.risk.rows.map((row) => (
                  <tr key={row.level} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 450 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: row.color,
                          }}
                          aria-hidden="true"
                        />
                        {row.level}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13.5, color: "#212226" }}>{row.range}</td>
                    <td style={{ padding: "12px 16px", color: "#45474d" }}>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="grid-container">
          <div className="footer-row py-8">
            <a
              href={BRAND_HOME_URL}
              aria-label={copy.nav.brandAriaLabel}
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
