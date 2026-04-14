"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { BrandMark } from "@/components/brand-mark";
import {
  getStoredLocale,
  LanguagePicker,
  type Locale,
} from "@/components/language-picker";

const BRAND_HOME_URL = "https://diffaudit.vectorcontrol.tech/";

type DocsLink = {
  id: string;
  label: string;
  sectionId: string;
};

type DocsGroup = {
  title: string;
  items: Array<{ id: string; label: string }>;
};

type OutlineItem = {
  id: string;
  label: string;
};

type DocsSection = {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  outline: OutlineItem[];
};

type DocsCopy = {
  header: {
    home: string;
    docs: string;
    signIn: string;
    openWorkspace: string;
    searchPlaceholder: string;
    utilityLabel: string;
    brandAriaLabel: string;
  };
  meta: {
    title: string;
    summary: string;
    quickStart: string;
    copyPage: string;
    copied: string;
    onThisPage: string;
  };
  tabs: DocsLink[];
  groups: DocsGroup[];
  sections: DocsSection[];
  overview: {
    lead: string;
    body: string;
    highlights: Array<{ label: string; value: string; note: string }>;
  };
  gettingStarted: {
    body: string;
    lanes: Array<{ title: string; body: string }>;
    steps: Array<{ index: string; title: string; body: string }>;
  };
  structure: {
    body: string;
    areas: Array<{ title: string; body: string }>;
  };
  tracks: {
    body: string;
    cards: Array<{ tag: string; title: string; body: string }>;
    riskTitle: string;
    riskRows: Array<{ level: string; threshold: string; body: string; tone: string }>;
  };
  workflow: {
    body: string;
    phases: Array<{ index: string; title: string; body: string }>;
  };
  reports: {
    body: string;
    pillars: Array<{ title: string; body: string }>;
  };
  architecture: {
    body: string;
    tiers: Array<{ index: string; title: string; body: string }>;
    notes: string[];
  };
  api: {
    body: string;
    columns: { method: string; path: string; description: string };
    endpoints: Array<{ method: string; path: string; description: string }>;
  };
  resources: {
    body: string;
    links: Array<{ title: string; body: string; href: string; cta: string }>;
  };
};

function getCopy(locale: Locale): DocsCopy {
  const isZh = locale === "zh-CN";
  const t = (zh: string, en: string) => (isZh ? zh : en);

  return {
    header: {
      home: t("首页", "Home"),
      docs: t("文档", "Docs"),
      signIn: t("登录", "Sign in"),
      openWorkspace: t("进入工作台", "Open workspace"),
      searchPlaceholder: t("搜索章节、接口或页面...", "Search sections, endpoints, or pages..."),
      utilityLabel: t("文档工作台", "Docs workspace"),
      brandAriaLabel: t("前往 DiffAudit 首页", "Go to the DiffAudit homepage"),
    },
    meta: {
      title: t("DiffAudit 文档中心", "DiffAudit Docs"),
      summary: t(
        "把平台结构、使用流程、风险语义和接口边界放在同一套阅读路径里。页面本身也遵循 DiffAudit 的工作台设计规范。",
        "One reading path for platform structure, workflow, risk semantics, and interface boundaries. The page itself follows the DiffAudit workspace design language.",
      ),
      quickStart: t("快速开始", "Quick start"),
      copyPage: t("复制页面", "Copy page"),
      copied: t("已复制", "Copied"),
      onThisPage: t("在此页", "On this page"),
    },
    tabs: [
      { id: "start", label: t("快速开始", "Quick start"), sectionId: "overview" },
      { id: "workspace", label: t("工作台结构", "Workspace"), sectionId: "workspace-structure" },
      { id: "tracks", label: t("审计线路", "Tracks"), sectionId: "audit-tracks" },
      { id: "workflow", label: t("审计流程", "Workflow"), sectionId: "workflow" },
      { id: "architecture", label: t("架构", "Architecture"), sectionId: "architecture" },
      { id: "api", label: t("参考", "Reference"), sectionId: "api-reference" },
      { id: "resources", label: t("资源", "Resources"), sectionId: "resources" },
    ],
    groups: [
      {
        title: t("开始使用", "Get started"),
        items: [
          { id: "overview", label: t("概述", "Overview") },
          { id: "getting-started", label: t("快速开始", "Quick start") },
          { id: "workspace-structure", label: t("工作台结构", "Workspace map") },
        ],
      },
      {
        title: t("核心概念", "Core concepts"),
        items: [
          { id: "audit-tracks", label: t("三条审计线路", "Audit tracks") },
          { id: "reports-risk", label: t("报告与风险", "Reports & risk") },
        ],
      },
      {
        title: t("执行流程", "Execution flow"),
        items: [{ id: "workflow", label: t("完整流程", "Workflow") }],
      },
      {
        title: t("平台与接口", "Platform & API"),
        items: [
          { id: "architecture", label: t("系统架构", "Architecture") },
          { id: "api-reference", label: t("核心 API", "Core API") },
        ],
      },
      {
        title: t("资源入口", "Resources"),
        items: [{ id: "resources", label: t("常用入口", "Useful links") }],
      },
    ],
    sections: [
      {
        id: "overview",
        navLabel: t("概述", "Overview"),
        eyebrow: t("快速开始", "Quick start"),
        title: t("DiffAudit 概述", "DiffAudit overview"),
        summary: t(
          "这是一个围绕成员推断隐私风险构建的统一审计平台。入口、任务、结果、报告和配置都沿着同一套工作台结构展开。",
          "A unified audit platform for membership inference risk in diffusion models. Entry, tasks, results, reports, and settings stay inside one workspace structure.",
        ),
        outline: [
          { id: "overview-what", label: t("你可以做什么", "What you can do") },
          { id: "overview-highlights", label: t("文档重点", "What this page covers") },
        ],
      },
      {
        id: "getting-started",
        navLabel: t("快速开始", "Quick start"),
        eyebrow: t("开始使用", "Start here"),
        title: t("三步进入首次审计", "Launch your first audit in three steps"),
        summary: t(
          "先进入站点，再创建任务，然后回到工作台和报告页查看结果。文档页按实际使用路径排列，而不是按代码目录排列。",
          "Sign in, create a task, then return to workspace and reports to inspect outcomes. The docs follow the actual product path rather than code folders.",
        ),
        outline: [
          { id: "getting-started-entry", label: t("入口方式", "Entry points") },
          { id: "getting-started-steps", label: t("第一次使用", "First use") },
        ],
      },
      {
        id: "workspace-structure",
        navLabel: t("工作台结构", "Workspace map"),
        eyebrow: t("产品结构", "Product structure"),
        title: t("四个核心工作区", "Four core work areas"),
        summary: t(
          "文档页应该先帮用户理解平台结构，再去读接口或实现细节。DiffAudit 的产品骨架稳定收敛在四个工作区内。",
          "The docs should explain product structure before implementation detail. DiffAudit stays intentionally focused around four work areas.",
        ),
        outline: [
          { id: "workspace-structure-map", label: t("页面地图", "Page map") },
          { id: "workspace-structure-areas", label: t("区域职责", "Area roles") },
        ],
      },
      {
        id: "audit-tracks",
        navLabel: t("三条审计线路", "Audit tracks"),
        eyebrow: t("核心概念", "Core concept"),
        title: t("从黑盒到白盒的证据递进", "Evidence depth from black-box to white-box"),
        summary: t(
          "平台价值来自逐层递进的证据链，而不是单次脚本输出。文档需要先把这一点讲清楚。",
          "The platform value comes from a layered evidence chain rather than a single script output. The docs should frame that clearly.",
        ),
        outline: [
          { id: "audit-tracks-depth", label: t("三条线路", "Three tracks") },
          { id: "audit-tracks-risk", label: t("风险分级", "Risk levels") },
        ],
      },
      {
        id: "workflow",
        navLabel: t("完整流程", "Workflow"),
        eyebrow: t("执行流程", "Execution flow"),
        title: t("一条完整的审计工作流", "One complete audit path"),
        summary: t(
          "文档与产品都应该遵循同一条叙事链：先进入，再执行，再解释。这样读者读完文档后，不需要重新学习产品。",
          "The docs and product should share the same narrative: enter, execute, interpret. After reading, users should be able to act immediately.",
        ),
        outline: [{ id: "workflow-path", label: t("流程阶段", "Workflow stages") }],
      },
      {
        id: "reports-risk",
        navLabel: t("报告与风险", "Reports & risk"),
        eyebrow: t("结果解释", "Interpretation"),
        title: t("从指标到风险解读", "From metrics to risk explanation"),
        summary: t(
          "报告页不是结果堆积页，而是把 AUC、ASR、TPR、证据强度和缺口分析整理成可复核判断的解释面。",
          "The reports surface is not a result dump. It turns AUC, ASR, TPR, evidence strength, and coverage gaps into reviewable conclusions.",
        ),
        outline: [{ id: "reports-risk-pillars", label: t("解释支柱", "Interpretation pillars") }],
      },
      {
        id: "architecture",
        navLabel: t("系统架构", "Architecture"),
        eyebrow: t("平台与接口", "Platform & API"),
        title: t("Platform → Runtime-Server → Runners", "Platform → Runtime-Server → Runners"),
        summary: t(
          "架构说明应服务于产品理解。它不是部署清单，而是让读者知道任务如何从前端流向运行时，再流向具体实验执行单元。",
          "Architecture here exists to support product understanding. It explains how tasks flow from the frontend to runtime and then to concrete runners.",
        ),
        outline: [
          { id: "architecture-tiers", label: t("三层架构", "Three tiers") },
          { id: "architecture-notes", label: t("关键边界", "Key boundaries") },
        ],
      },
      {
        id: "api-reference",
        navLabel: t("核心 API", "Core API"),
        eyebrow: t("参考", "Reference"),
        title: t("对外暴露的核心接口", "Core external endpoints"),
        summary: t(
          "文档页里的 API 区保持精简，只保留用户能从平台行为上直接感知的关键接口，而不是复制全部后端路由。",
          "The API section stays intentionally small and product-facing. It explains endpoints users can reason about from platform behavior.",
        ),
        outline: [{ id: "api-reference-table", label: t("端点列表", "Endpoints") }],
      },
      {
        id: "resources",
        navLabel: t("常用入口", "Useful links"),
        eyebrow: t("资源", "Resources"),
        title: t("下一步去哪里", "Where to go next"),
        summary: t(
          "文档页不该把读者留在阅读状态，而是应该把人送回产品、报告或说明材料的下一站。",
          "The docs page should not leave people in reading mode. It should route them back into the product or the next supporting material.",
        ),
        outline: [{ id: "resources-links", label: t("常用入口", "Useful links") }],
      },
    ],
    overview: {
      lead: t(
        "DiffAudit 是扩散模型成员推断风险审计平台。它把模型目录、任务发起、运行状态、证据表和风险报告放到一套统一工作台里。",
        "DiffAudit is a membership inference audit platform for diffusion models. It keeps model catalog, job creation, runtime state, evidence tables, and risk reporting inside one workspace.",
      ),
      body: t(
        "这个文档页参考现代文档工作台结构，但严格遵循 DiffAudit 自己的设计规范：浅色 SaaS 背景、蓝色主操作、表格优先、结果解释优先、风险语义优先。",
        "This page borrows the structural clarity of a modern docs workspace while staying inside DiffAudit's own design language: light SaaS surfaces, blue primary actions, table-first information design, and risk-first interpretation.",
      ),
      highlights: [
        { label: t("统一入口", "Unified entry"), value: t("1 站", "1 site"), note: t("首页、文档、登录和工作台沿同一品牌入口收口", "Home, docs, sign-in, and workspace converge under one brand entry") },
        { label: t("核心工作区", "Core work areas"), value: t("4 区", "4 areas"), note: t("Workspace、Audits、Reports、Settings", "Workspace, Audits, Reports, and Settings") },
        { label: t("审计深度", "Audit depth"), value: t("3 线", "3 tracks"), note: t("Black-box、Gray-box、White-box", "Black-box, Gray-box, and White-box") },
      ],
    },
    gettingStarted: {
      body: t(
        "文档页里的快速开始不是安装说明，而是产品路径说明。因为当前平台的正确使用方式就是直接进入 Web 站点完成任务发起和结果整理。",
        "The quick-start area explains product usage rather than package installation. The correct path today is to use the web product directly and operate from the workspace.",
      ),
      lanes: [
        { title: t("公共入口", "Public entry"), body: t("首页与文档页承担说明、导航和进入引导。", "Home and docs explain the system and route users forward.") },
        { title: t("工作台", "Workspace"), body: t("创建任务、查看运行、追踪结果都在工作台完成。", "Task creation, runtime checks, and result review live here.") },
        { title: t("报告页", "Reports"), body: t("把审计结果转成结构化的风险判断与导出材料。", "Result rows become interpreted findings and export-ready material.") },
      ],
      steps: [
        { index: "01", title: t("进入站点并认证", "Enter and authenticate"), body: t("从首页、文档页或登录页进入，完成统一认证，之后保持在同一站点内继续操作。", "Start from home, docs, or sign-in. Once authenticated, stay inside the same site and continue into the workspace.") },
        { index: "02", title: t("在审计页创建任务", "Create an audit task"), body: t("选择目标模型、数据集或实验模板，提交新的审计任务，并观察运行状态。", "Choose the target model, dataset, or template, submit a new audit task, and watch runtime state.") },
        { index: "03", title: t("回看结果并导出报告", "Review and export"), body: t("在工作台和报告页查看指标、风险等级、覆盖缺口，并整理输出材料。", "Use workspace and reports to inspect metrics, risk levels, coverage gaps, and exportable summaries.") },
      ],
    },
    structure: {
      body: t(
        "DiffAudit 前端不是按后端模块暴露给用户，而是按“用户要做什么”组织页面。文档页应该优先解释这个结构。",
        "The frontend is not exposed according to backend modules. It is organized by user intent. The docs should explain that structure before implementation detail.",
      ),
      areas: [
        { title: "Workspace", body: t("总览态页面。看当前数据量、最近结果、运行健康度和下一步动作。", "Overview mode. Understand current volume, recent results, system health, and the next recommended action.") },
        { title: "Audits", body: t("操作态页面。创建任务、跟踪运行、检查最新结果。", "Action mode. Create tasks, monitor progress, and inspect fresh outcomes.") },
        { title: "Reports", body: t("解释态页面。把实验结果整理成风险解读和导出材料。", "Interpretation mode. Turn experiment rows into risk narratives and export material.") },
        { title: "Settings", body: t("控制态页面。管理默认参数、账户信息、系统状态和偏好。", "Control mode. Manage defaults, account context, and system status.") },
      ],
    },
    tracks: {
      body: t(
        "平台的产品价值来自逐层递进的证据链，而不是单次攻击脚本输出。文档需要先把这一点讲清楚。",
        "The platform value comes from a progressively stronger evidence chain rather than one attack script result. The docs need to frame that clearly.",
      ),
      cards: [
        { tag: "Black-box", title: t("Recon 快速筛查", "Recon fast screening"), body: t("以最低前置成本观察模型是否暴露成员推断风险。", "Observe whether the model exposes membership signals with minimal setup cost.") },
        { tag: "Gray-box", title: t("PIA 中间证据", "PIA intermediate evidence"), body: t("在黑盒基础上继续利用部分模型内部线索，增强攻击解释力。", "Use partial internal model signals to sharpen the attack picture and intermediate evidence.") },
        { tag: "White-box", title: t("GSA 深层验证", "GSA deep verification"), body: t("下钻到参数、梯度或训练痕迹，给出更强证据。", "Drill into parameters, gradients, or training traces for stronger evidence and comparison.") },
      ],
      riskTitle: t("风险分级", "Risk classification"),
      riskRows: [
        { level: t("高风险", "High"), threshold: "AUC > 0.85", body: t("成员信号显著，优先处理并查看防御对照。", "Strong member signal remains. Prioritize mitigation and defense comparison."), tone: "var(--accent-coral)" },
        { level: t("中风险", "Medium"), threshold: "0.65 ≤ AUC ≤ 0.85", body: t("存在可利用线索，建议继续对比证据和防御效果。", "Attack signal is usable. Continue evidence review and hardening."), tone: "var(--warning)" },
        { level: t("低风险", "Low"), threshold: "AUC < 0.65", body: t("攻击接近随机或暴露较低，可作为基线继续监控。", "Attack is close to random or exposure is limited. Keep as a monitored baseline."), tone: "var(--success)" },
      ],
    },
    workflow: {
      body: t(
        "文档与产品要遵循同一条叙事链：先进入，再执行，再解释。这样读者读完文档后，不需要重新学习产品。",
        "The docs and product should follow the same narrative chain: enter, execute, interpret. That makes the docs directly actionable.",
      ),
      phases: [
        { index: "A", title: t("进入", "Enter"), body: t("从公开入口进入文档、首页或登录页，理解平台结构并完成认证。", "Use the public entry points, understand the system shape, then authenticate.") },
        { index: "B", title: t("创建", "Create"), body: t("在审计页发起任务，明确目标对象、模板和当前运行上下文。", "Open the audits page, choose a target, and submit a new task.") },
        { index: "C", title: t("运行", "Run"), body: t("任务流向 Runtime-Server，再下发到具体 Runner 执行实验。", "The task flows through Runtime-Server and then to concrete experiment runners.") },
        { index: "D", title: t("回看", "Review"), body: t("回到 Workspace 与 Reports，查看结果表、风险分级和覆盖缺口。", "Return to Workspace and Reports to inspect rows, risk levels, and coverage gaps.") },
      ],
    },
    reports: {
      body: t(
        "报告与风险部分是 DiffAudit 区别于“只展示实验表格”的关键。文档页要把结果解释逻辑放到明显位置。",
        "This part separates DiffAudit from pages that only expose raw experiment tables. The docs should place result interpretation in a visible position.",
      ),
      pillars: [
        { title: t("指标", "Metrics"), body: t("展示 AUC、ASR、TPR 等原始结果，不隐藏核心数值。", "Expose AUC, ASR, TPR, and related values directly. Do not hide the core numbers.") },
        { title: t("分级", "Classification"), body: t("用稳定的风险颜色和标签，把数值转成直观风险等级。", "Use stable color and label rules to turn numbers into readable risk levels.") },
        { title: t("解释", "Interpretation"), body: t("说明为什么危险、危险体现在哪一层、是否需要继续看防御对照。", "Explain why a result matters, where the exposure shows up, and whether to inspect defense comparisons.") },
        { title: t("缺口", "Coverage gaps"), body: t("指出哪些合同、工作区或实验维度仍然没有被覆盖。", "Show which contracts, workspaces, or experiment dimensions are still uncovered.") },
      ],
    },
    architecture: {
      body: t(
        "这部分不追求把所有实现细节讲完，而是让读者看懂任务和结果是如何流动的。",
        "This section is not a deployment dump. Its purpose is to show how product behavior maps onto system flow.",
      ),
      tiers: [
        { index: "1", title: "Platform", body: t("Web 前端 + API Gateway，负责入口、任务编排、结果展示和报告组织。", "Web frontend and API gateway for entry, orchestration, presentation, and reporting.") },
        { index: "2", title: "Runtime-Server", body: t("承接任务控制、队列调度、运行中状态和 Runner 管理。", "Task control, queueing, in-flight state, and runner management.") },
        { index: "3", title: "Experiment Runners", body: t("执行具体攻击实验与结果产出，把数据回传给平台侧整理和解释。", "Concrete attack execution units that generate result rows for the platform to interpret.") },
      ],
      notes: [
        t("前端负责说明和调度，不直接承担实验执行。", "The frontend owns explanation and orchestration, not raw experiment execution."),
        t("运行时负责任务生命期，而不是结果叙事。", "Runtime owns lifecycle and coordination, not product narrative."),
        t("报告页负责把实验输出变成可复核的产品化结论。", "Reports turn experimental output into reviewable product conclusions."),
      ],
    },
    api: {
      body: t(
        "这里只列当前文档页最值得公开说明的核心接口。它们覆盖了从目录读取、任务创建、任务列表到证据查询的关键路径。",
        "Only the key product-facing endpoints are listed here. Together they cover catalog discovery, job creation, job review, and evidence lookup.",
      ),
      columns: { method: t("方法", "Method"), path: t("路径", "Path"), description: t("说明", "Description") },
      endpoints: [
        { method: "GET", path: "/api/v1/catalog", description: t("读取可审计模型与数据集目录。", "Read the auditable model and dataset catalog.") },
        { method: "GET", path: "/api/v1/audit/jobs", description: t("列出当前用户下的审计任务。", "List the current user's audit jobs.") },
        { method: "POST", path: "/api/v1/audit/jobs", description: t("创建新的审计任务并开始运行。", "Create a new audit job and start execution.") },
        { method: "GET", path: "/api/v1/experiments/{workspace}/summary", description: t("读取指定工作空间的实验汇总。", "Read experiment summary for a workspace.") },
        { method: "GET", path: "/api/v1/evidence/attack-defense-table", description: t("读取攻击-防御对照证据表。", "Read the attack-defense evidence table.") },
      ],
    },
    resources: {
      body: t(
        "文档页的结束不是页脚，而是把用户引导回真实操作入口。",
        "The end of the docs page should route people back into real product actions.",
      ),
      links: [
        { title: t("进入工作台", "Open workspace"), body: t("如果你已经登录，直接回到工作区继续任务和报告整理。", "If you are already signed in, go straight back to the main workspace surface."), href: "/workspace", cta: t("打开工作台", "Open workspace") },
        { title: "Audits", body: t("创建新任务、查看运行状态、跟踪结果变化。", "Create tasks, monitor runtime state, and inspect fresh results."), href: "/workspace/audits", cta: t("前往 Audits", "Go to Audits") },
        { title: "Reports", body: t("集中查看结果表、覆盖缺口与导出能力。", "Review result rows, coverage gaps, and export actions."), href: "/workspace/reports", cta: t("前往 Reports", "Go to Reports") },
        { title: t("申请试用", "Request trial"), body: t("如果还未进入主流程，可以先从公开入口发起试用。", "If you have not entered the main flow yet, start from the public trial form."), href: "/trial", cta: t("申请试用", "Request trial") },
      ],
    },
  };
}

function surfaceClass(extra = "") {
  return `surface-card border border-border ${extra}`.trim();
}

function scrollToAnchor(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function DocsHome({ loggedIn }: { loggedIn: boolean }) {
  const [locale, setLocale] = useState<Locale>("en-US");
  const [searchValue, setSearchValue] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("overview");
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) {
      setLocale(stored);
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const copy = useMemo(() => getCopy(locale), [locale]);
  const sectionMap = useMemo(
    () => Object.fromEntries(copy.sections.map((section) => [section.id, section])),
    [copy.sections],
  );
  const activeOutline = sectionMap[activeSectionId]?.outline ?? [];

  const filteredGroups = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return copy.groups;
    }

    return copy.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const section = sectionMap[item.id];
          if (!section) {
            return false;
          }
          return `${item.label} ${section.title} ${section.summary}`.toLowerCase().includes(query);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [copy.groups, searchValue, sectionMap]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSectionId(visible.target.id);
        }
      },
      {
        rootMargin: "-15% 0px -60% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    copy.sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [copy.sections]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return;
    }

    const match = copy.sections.find((section) =>
      `${section.navLabel} ${section.title} ${section.summary}`.toLowerCase().includes(query),
    );

    if (match) {
      scrollToAnchor(match.id);
    }
  };

  const handleCopyPage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-6">
            <a href={BRAND_HOME_URL} aria-label={copy.header.brandAriaLabel} className="brand-link">
              <BrandMark compact />
            </a>
            <div className="hidden items-center gap-6 text-[14px] text-muted-foreground lg:flex">
              <a href={BRAND_HOME_URL} className="transition hover:text-foreground">{copy.header.home}</a>
              <Link href="/docs" className="font-medium text-foreground">{copy.header.docs}</Link>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mx-auto hidden min-w-0 max-w-[560px] flex-1 lg:block">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <input
                ref={searchRef}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={copy.header.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                Ctrl K
              </span>
            </div>
          </form>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-card px-3 py-2 text-[13px] font-medium text-muted-foreground lg:inline-flex">
              {copy.header.utilityLabel}
            </span>
            <LanguagePicker value={locale} onChange={setLocale} />
            <Link
              href={loggedIn ? "/workspace" : "/login"}
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(47,109,246,0.18)] transition hover:-translate-y-px hover:bg-[color:rgba(47,109,246,0.92)]"
            >
              {loggedIn ? copy.header.openWorkspace : copy.header.signIn}
            </Link>
          </div>
        </div>

        <div className="border-t border-[rgba(33,34,38,0.06)]">
          <div className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-6 py-2">
            {copy.tabs.map((tab) => {
              const active = activeSectionId === tab.sectionId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToAnchor(tab.sectionId)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[rgba(47,109,246,0.10)] text-[var(--accent-blue)]"
                      : "text-muted-foreground hover:bg-[var(--palette-grey-10)] hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-8 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_220px]">
        <aside className="hidden xl:block">
          <div className={`${surfaceClass("sticky top-[152px] overflow-hidden")} p-4`}>
            <div className="mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {copy.meta.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.meta.summary}</p>
            </div>

            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="mb-3 text-[12px] font-semibold text-foreground">{group.title}</h2>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = activeSectionId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => scrollToAnchor(item.id)}
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                            active
                              ? "bg-[rgba(47,109,246,0.10)] text-foreground shadow-[inset_2px_0_0_var(--accent-blue)]"
                              : "text-muted-foreground hover:bg-[var(--palette-grey-10)] hover:text-foreground"
                          }`}
                        >
                          <span>{item.label}</span>
                          {active ? <span className="h-2 w-2 rounded-full bg-[var(--accent-blue)]" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <article className="min-w-0 space-y-8">
          <section id="overview" className={`${surfaceClass("scroll-mt-32")} p-8`}>
            <div className="flex flex-col gap-5 border-b border-[rgba(33,34,38,0.08)] pb-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-[780px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {sectionMap.overview.eyebrow}
                </div>
                <h1 className="mt-3 text-[42px] font-semibold leading-[1.05] tracking-[-0.04em] text-foreground">
                  {sectionMap.overview.title}
                </h1>
                <p className="mt-4 max-w-[68ch] text-[15px] leading-7 text-muted-foreground">
                  {sectionMap.overview.summary}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyPage}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:-translate-y-px hover:bg-[var(--palette-grey-10)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? copy.meta.copied : copy.meta.copyPage}
                </button>
              </div>
            </div>

            <div id="overview-what" className="scroll-mt-32 pt-8">
              <p className="max-w-[72ch] text-[18px] leading-8 text-foreground">{copy.overview.lead}</p>
              <p className="mt-5 max-w-[72ch] text-[15px] leading-7 text-muted-foreground">{copy.overview.body}</p>
            </div>

            <div id="overview-highlights" className="scroll-mt-32 mt-8 grid gap-4 md:grid-cols-3">
              {copy.overview.highlights.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-border bg-[rgba(255,255,255,0.82)] p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-[28px] font-semibold leading-none text-foreground">{item.value}</div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="getting-started" className={`${surfaceClass("scroll-mt-32")} p-8`}>
            <div className="border-b border-[rgba(33,34,38,0.08)] pb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {sectionMap["getting-started"].eyebrow}
              </div>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-foreground">
                {sectionMap["getting-started"].title}
              </h2>
              <p className="mt-4 max-w-[72ch] text-[15px] leading-7 text-muted-foreground">
                {copy.gettingStarted.body}
              </p>
            </div>

            <div id="getting-started-entry" className="scroll-mt-32 mt-6 grid gap-4 lg:grid-cols-3">
              {copy.gettingStarted.lanes.map((lane) => (
                <div key={lane.title} className="rounded-[24px] border border-border bg-[rgba(47,109,246,0.04)] p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-blue)]">
                    {copy.meta.quickStart}
                  </div>
                  <h3 className="mt-2 text-[18px] font-semibold text-foreground">{lane.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{lane.body}</p>
                </div>
              ))}
            </div>

            <div id="getting-started-steps" className="scroll-mt-32 mt-8 grid gap-4 lg:grid-cols-3">
              {copy.gettingStarted.steps.map((step) => (
                <div key={step.index} className="rounded-[24px] border border-border bg-card p-5">
                  <div className="inline-flex rounded-full bg-[rgba(47,109,246,0.10)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-blue)]">
                    {step.index}
                  </div>
                  <h3 className="mt-4 text-[18px] font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="workspace-structure" className={`${surfaceClass("scroll-mt-32")} p-8`}>
            <div className="border-b border-[rgba(33,34,38,0.08)] pb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {sectionMap["workspace-structure"].eyebrow}
              </div>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-foreground">
                {sectionMap["workspace-structure"].title}
              </h2>
              <p className="mt-4 max-w-[72ch] text-[15px] leading-7 text-muted-foreground">
                {copy.structure.body}
              </p>
            </div>

            <div id="workspace-structure-map" className="scroll-mt-32 mt-6 rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(47,109,246,0.08),rgba(47,109,246,0.03))] p-6">
              <div className="grid gap-3 lg:grid-cols-4">
                {copy.structure.areas.map((area, index) => (
                  <div key={area.title} className="rounded-[22px] border border-[rgba(33,34,38,0.08)] bg-white/80 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      0{index + 1}
                    </div>
                    <h3 className="mt-2 text-[18px] font-semibold text-foreground">{area.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{area.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="workspace-structure-areas" className="scroll-mt-32 mt-8 grid gap-4 md:grid-cols-2">
              {copy.structure.areas.map((area) => (
                <div key={area.title} className="rounded-[24px] border border-border bg-card p-5">
                  <h3 className="text-[17px] font-semibold text-foreground">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="audit-tracks" className={`${surfaceClass("scroll-mt-32")} p-8`}>
            <div className="border-b border-[rgba(33,34,38,0.08)] pb-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {sectionMap["audit-tracks"].eyebrow}
              </div>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-foreground">
                {sectionMap["audit-tracks"].title}
              </h2>
              <p className="mt-4 max-w-[72ch] text-[15px] leading-7 text-muted-foreground">
                {copy.tracks.body}
              </p>
            </div>

            <div id="audit-tracks-depth" className="scroll-mt-32 mt-6 grid gap-4 lg:grid-cols-3">
              {copy.tracks.cards.map((card) => (
                <div key={card.title} className="rounded-[24px] border border-border bg-card p-5">
                  <div className="inline-flex rounded-full border border-[rgba(47,109,246,0.18)] bg-[rgba(47,109,246,0.08)] px-3 py-1 text-[11px] font-semibold text-[var(--accent-blue)]">
                    {card.tag}
                  </div>
                  <h3 className="mt-4 text-[18px] font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
                </div>
              ))}
            </div>

            <div id="audit-tracks-risk" className="scroll-mt-32 mt-8 rounded-[24px] border border-border bg-card p-5">
              <h3 className="text-[18px] font-semibold text-foreground">{copy.tracks.riskTitle}</h3>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-[rgba(33,34,38,0.08)]">
                {copy.tracks.riskRows.map((row, index) => (
                  <div
                    key={row.level}
                    className={`grid gap-3 px-4 py-4 md:grid-cols-[160px_160px_minmax(0,1fr)] ${index === 0 ? "" : "border-t border-[rgba(33,34,38,0.08)]"}`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.tone }} />
                      {row.level}
                    </div>
                    <div className="mono text-sm text-muted-foreground">{row.threshold}</div>
                    <div className="text-sm leading-6 text-muted-foreground">{row.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
