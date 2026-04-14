import type { Locale } from "@/components/language-picker";

export type DocsSection = {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
  rows?: Array<{
    eyebrow?: string;
    title: string;
    body: string;
    tone?: "blue" | "green" | "amber" | "coral" | "neutral";
  }>;
  table?: {
    columns: string[];
    rows: string[][];
  };
  links?: Array<{
    title: string;
    body: string;
    href: string;
    cta: string;
  }>;
};

export type DocsPage = {
  slug: string;
  group: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: DocsSection[];
};

export type DocsContent = {
  header: {
    home: string;
    docs: string;
    searchPlaceholder: string;
    utilityLabel: string;
    signIn: string;
    openWorkspace: string;
    copyPage: string;
    copied: string;
    brandAriaLabel: string;
  };
  groups: string[];
  pages: DocsPage[];
};

function zhContent(): DocsContent {
  return {
    header: {
      home: "首页",
      docs: "文档",
      searchPlaceholder: "搜索文档、章节或接口...",
      utilityLabel: "DiffAudit Docs",
      signIn: "登录",
      openWorkspace: "进入工作台",
      copyPage: "复制页面",
      copied: "已复制",
      brandAriaLabel: "前往 DiffAudit 首页",
    },
    groups: ["开始使用", "产品结构", "运行与接入", "参考"],
    pages: [
      {
        slug: "quick-start",
        group: "开始使用",
        navLabel: "快速开始",
        eyebrow: "快速开始",
        title: "DiffAudit 概述与首次审计",
        summary:
          "从统一入口进入站点，在 Audits 创建任务，在 Workspace 与 Reports 查看运行和风险结果。文档页的结构与真实产品路径保持一致。",
        sections: [
          {
            id: "overview",
            label: "概述",
            title: "这是一个围绕隐私风险审计组织的工作台",
            paragraphs: [
              "DiffAudit 不是一个展示实验结果的静态站点，而是一套把目录、任务、运行状态、证据表与报告解释收口到同一工作台的审计产品。",
              "文档页本身也遵循这种结构：左侧是文档树，中间是当前文档，顶部是当前文档的内容锚点，而不是把所有内容堆成一页。",
            ],
            rows: [
              { eyebrow: "入口", title: "统一站点入口", body: "首页、登录、文档和工作台共用同一品牌入口与导航体系。", tone: "blue" },
              { eyebrow: "执行", title: "任务在 Audits 发起", body: "选择目标模型、实验模板和上下文后提交任务。", tone: "neutral" },
              { eyebrow: "解释", title: "结果在 Reports 完成解释", body: "AUC、ASR、TPR、风险等级和覆盖缺口会被整理成可复核结论。", tone: "amber" },
            ],
          },
          {
            id: "first-audit",
            label: "第一次使用",
            title: "三步完成第一次审计",
            paragraphs: [
              "正确路径不是先找后端接口，而是先进入产品，再沿着任务流转理解整套系统。",
            ],
            rows: [
              { eyebrow: "01", title: "登录并进入工作台", body: "通过统一认证进入站点，之后保持在同一产品壳层里完成操作。", tone: "blue" },
              { eyebrow: "02", title: "创建新的审计任务", body: "在 Audits 选择目标对象并发起运行，任务会流向 Runtime-Server 和具体 Runner。", tone: "neutral" },
              { eyebrow: "03", title: "回看结果并导出", body: "在 Workspace 看状态，在 Reports 看结果解释和导出材料。", tone: "green" },
            ],
          },
          {
            id: "common-routes",
            label: "常用入口",
            title: "最常用的页面入口",
            paragraphs: [
              "读完这一页后，用户应该直接知道下一步去哪里，而不是停留在文档里。",
            ],
            links: [
              { title: "Workspace", body: "查看当前任务、最近结果和系统状态。", href: "/workspace", cta: "打开 Workspace" },
              { title: "Audits", body: "创建任务并跟踪运行。", href: "/workspace/audits", cta: "前往 Audits" },
              { title: "Reports", body: "查看风险解释、覆盖缺口与导出。", href: "/workspace/reports", cta: "前往 Reports" },
            ],
          },
        ],
      },
      {
        slug: "workspace",
        group: "产品结构",
        navLabel: "工作台结构",
        eyebrow: "产品结构",
        title: "四个核心工作区",
        summary:
          "平台不是按后端模块暴露给用户，而是按用户要做什么组织成四个工作区：Workspace、Audits、Reports、Settings。",
        sections: [
          {
            id: "workspace-map",
            label: "页面地图",
            title: "工作台骨架",
            paragraphs: [
              "全站文档和产品都应该先讲清这个骨架：总览、操作、解释、控制。",
            ],
            rows: [
              { eyebrow: "Home", title: "Workspace", body: "展示当前结果量、运行态和下一步动作。", tone: "blue" },
              { eyebrow: "Run", title: "Audits", body: "承担任务创建、运行跟踪和结果回看。", tone: "neutral" },
              { eyebrow: "Read", title: "Reports", body: "把实验结果整理成风险解释与导出材料。", tone: "amber" },
              { eyebrow: "Control", title: "Settings", body: "管理默认参数、系统状态和账户环境。", tone: "green" },
            ],
          },
          {
            id: "page-grammar",
            label: "页面语法",
            title: "每一页都遵循同一套结构语法",
            paragraphs: [
              "页面层级固定为：全局壳层、页面头部、摘要带、主工作区、辅助工作区。",
              "文档页本身也应该采用相同语法，因此正文区是阅读面，左侧是文档树，顶部是当前文档的内容目录。",
            ],
            rows: [
              { title: "页面头部", body: "负责说明这一页的目的和一句话摘要。", tone: "neutral" },
              { title: "摘要带", body: "只放最关键的状态和数字，不抢正文阅读。", tone: "neutral" },
              { title: "主工作区", body: "承担这一页的核心任务。", tone: "blue" },
              { title: "辅助区", body: "只补充，不重复主内容。", tone: "neutral" },
            ],
          },
        ],
      },
      {
        slug: "audit-tracks",
        group: "产品结构",
        navLabel: "审计线路",
        eyebrow: "核心概念",
        title: "从黑盒到白盒的审计深度",
        summary:
          "DiffAudit 的产品价值来自逐层递进的证据链，而不是单次脚本执行结果。文档需要先把这个结构讲清楚。",
        sections: [
          {
            id: "tracks",
            label: "三条线路",
            title: "三条审计线路",
            paragraphs: [
              "平台把不同深度的攻击与证据组织成三条清晰线路，便于从筛查到验证逐层推进。",
            ],
            rows: [
              { eyebrow: "Black-box", title: "Recon", body: "以最低前置成本观察模型是否暴露成员信号。", tone: "blue" },
              { eyebrow: "Gray-box", title: "PIA", body: "利用部分模型内部信息增强攻击线索和解释力。", tone: "amber" },
              { eyebrow: "White-box", title: "GSA", body: "下钻到参数、梯度或训练痕迹，形成更强证据链。", tone: "coral" },
            ],
          },
          {
            id: "risk-levels",
            label: "风险分级",
            title: "结果如何被转成风险等级",
            paragraphs: [
              "前端不会只显示指标，而是把结果进一步翻译成等级和解释。",
            ],
            table: {
              columns: ["等级", "阈值", "说明"],
              rows: [
                ["高风险", "AUC > 0.85", "成员信号显著，需要优先处理并继续查看防御对照。"],
                ["中风险", "0.65 ≤ AUC ≤ 0.85", "存在可利用线索，建议继续分析与加固。"],
                ["低风险", "AUC < 0.65", "攻击接近随机或暴露较低，可作为基线继续监控。"],
              ],
            },
          },
          {
            id: "interpretation",
            label: "结果解释",
            title: "从指标到结论",
            paragraphs: [
              "每一个重要结果面都应该遵循同样的解释链条：原始指标、风险标签、短解释、下一步动作。",
              "这也是 Reports 页和文档页需要始终对齐的产品语义。",
            ],
          },
        ],
      },
      {
        slug: "deployment-runtime",
        group: "运行与接入",
        navLabel: "部署",
        eyebrow: "运行与接入",
        title: "Platform → Runtime-Server → Runners",
        summary:
          "这部分不是部署命令列表，而是帮助读者理解任务和结果是如何在三层系统里流动的。",
        sections: [
          {
            id: "tiers",
            label: "三层架构",
            title: "平台的三层分工",
            paragraphs: [
              "前端负责入口、调度和解释，运行时服务负责任务生命期，具体实验则由 Runner 执行。",
            ],
            rows: [
              { eyebrow: "1", title: "Platform", body: "Web 前端与 API Gateway，处理入口、编排、展示和报告组织。", tone: "blue" },
              { eyebrow: "2", title: "Runtime-Server", body: "负责队列调度、状态汇聚和 Runner 管理。", tone: "neutral" },
              { eyebrow: "3", title: "Experiment Runners", body: "执行 Recon、PIA、GSA 等具体实验，把结果回传上层。", tone: "amber" },
            ],
          },
          {
            id: "boundaries",
            label: "边界",
            title: "关键边界",
            paragraphs: [
              "前端不直接执行实验。",
              "Runtime 不负责结果叙事。",
              "Reports 负责把实验输出转成可复核的产品化结论。",
            ],
          },
        ],
      },
      {
        slug: "integration",
        group: "运行与接入",
        navLabel: "接入",
        eyebrow: "运行与接入",
        title: "如何把平台接入到你的使用流程",
        summary:
          "接入不是把一堆 API 调起来，而是把入口、任务、结果和报告整合进你自己的工作链路里。",
        sections: [
          {
            id: "entry",
            label: "入口接入",
            title: "统一入口与认证",
            paragraphs: [
              "文档、首页、登录和工作台应共享同一品牌和同一站点入口，避免把用户切到多个产品壳层。",
            ],
          },
          {
            id: "workflow-link",
            label: "流程接入",
            title: "让任务流转接入你的工作流",
            paragraphs: [
              "推荐做法是把 DiffAudit 放在‘创建任务 → 查看运行 → 导出报告’这条链的中间，而不是孤立调用单个接口。",
            ],
            rows: [
              { title: "任务入口", body: "从 Audits 发起，保证用户对目标和上下文有明确理解。", tone: "neutral" },
              { title: "结果回看", body: "回到 Workspace 与 Reports，看结构化输出，而不是只看接口响应。", tone: "blue" },
              { title: "材料导出", body: "把结果整理成可复核的风险报告。", tone: "green" },
            ],
          },
        ],
      },
      {
        slug: "api-reference",
        group: "参考",
        navLabel: "API",
        eyebrow: "参考",
        title: "当前对外可见的核心接口",
        summary:
          "API 文档保留产品可感知的关键路径，不复制全部后端路由。它应该服务于理解产品，而不是替代源码。",
        sections: [
          {
            id: "core-endpoints",
            label: "核心接口",
            title: "关键路径接口",
            paragraphs: [
              "这些接口覆盖了目录读取、任务创建、任务列表、实验汇总和证据表查询。",
            ],
            table: {
              columns: ["方法", "路径", "说明"],
              rows: [
                ["GET", "/api/v1/catalog", "读取可审计模型与数据集目录。"],
                ["GET", "/api/v1/audit/jobs", "列出当前用户的审计任务。"],
                ["POST", "/api/v1/audit/jobs", "创建新的审计任务并开始运行。"],
                ["GET", "/api/v1/experiments/{workspace}/summary", "读取指定工作区的实验汇总。"],
                ["GET", "/api/v1/evidence/attack-defense-table", "读取攻击-防御证据表。"],
              ],
            },
          },
          {
            id: "notes",
            label: "说明",
            title: "使用这些接口时的理解方式",
            paragraphs: [
              "接口只是系统行为的边界，不是产品体验的全部。",
              "真正的推荐阅读顺序是：先看产品结构，再看当前这页的接口，再回到工作台感知这些接口如何支撑页面行为。",
            ],
          },
        ],
      },
    ],
  };
}

function enContent(): DocsContent {
  return {
    header: {
      home: "Home",
      docs: "Docs",
      searchPlaceholder: "Search docs, sections, or endpoints...",
      utilityLabel: "DiffAudit Docs",
      signIn: "Sign in",
      openWorkspace: "Open workspace",
      copyPage: "Copy page",
      copied: "Copied",
      brandAriaLabel: "Go to the DiffAudit homepage",
    },
    groups: ["Get started", "Product structure", "Runtime & integration", "Reference"],
    pages: [
      {
        slug: "quick-start",
        group: "Get started",
        navLabel: "Quick start",
        eyebrow: "Quick start",
        title: "DiffAudit overview and first audit",
        summary:
          "Enter from one unified site, create jobs in Audits, and read runtime plus risk results through Workspace and Reports. The docs follow the real product path.",
        sections: [
          {
            id: "overview",
            label: "Overview",
            title: "A workspace built around privacy-risk auditing",
            paragraphs: [
              "DiffAudit is not a static result site. It is an audit product that keeps catalog, task creation, runtime state, evidence tables, and risk reporting inside one workspace.",
              "The docs follow the same structure: a file tree on the left, the current document in the middle, and current-document sections across the top.",
            ],
            rows: [
              { eyebrow: "Entry", title: "Unified site entry", body: "Home, sign-in, docs, and workspace share the same brand and navigation frame.", tone: "blue" },
              { eyebrow: "Run", title: "Jobs start in Audits", body: "Choose a target model and context, then launch execution from the audits surface.", tone: "neutral" },
              { eyebrow: "Read", title: "Results are interpreted in Reports", body: "AUC, ASR, TPR, risk level, and coverage gaps are organized into reviewable conclusions.", tone: "amber" },
            ],
          },
          {
            id: "first-audit",
            label: "First use",
            title: "Three steps to the first audit",
            paragraphs: [
              "The right path is not to start from raw APIs. Enter the product first, then follow the task flow.",
            ],
            rows: [
              { eyebrow: "01", title: "Sign in and enter workspace", body: "Authenticate once, then stay inside the same product shell.", tone: "blue" },
              { eyebrow: "02", title: "Create an audit job", body: "Choose a target and launch the run from Audits.", tone: "neutral" },
              { eyebrow: "03", title: "Review and export", body: "Return to Workspace and Reports for results, risk interpretation, and export.", tone: "green" },
            ],
          },
          {
            id: "common-routes",
            label: "Useful routes",
            title: "The most useful entry points",
            paragraphs: [
              "The end of this page should send people back into the product, not keep them reading forever.",
            ],
            links: [
              { title: "Workspace", body: "See current tasks, recent results, and system state.", href: "/workspace", cta: "Open Workspace" },
              { title: "Audits", body: "Create jobs and monitor execution.", href: "/workspace/audits", cta: "Go to Audits" },
              { title: "Reports", body: "Read risk interpretation, coverage gaps, and exports.", href: "/workspace/reports", cta: "Go to Reports" },
            ],
          },
        ],
      },
      {
        slug: "workspace",
        group: "Product structure",
        navLabel: "Workspace structure",
        eyebrow: "Product structure",
        title: "Four core work areas",
        summary:
          "The product is not exposed according to backend modules. It is organized around four work areas: Workspace, Audits, Reports, and Settings.",
        sections: [
          {
            id: "workspace-map",
            label: "Page map",
            title: "The workspace skeleton",
            paragraphs: [
              "The docs and product should both explain the same skeleton: overview, operation, interpretation, and control.",
            ],
            rows: [
              { eyebrow: "Home", title: "Workspace", body: "Current volume, recent results, runtime health, and next action.", tone: "blue" },
              { eyebrow: "Run", title: "Audits", body: "Task creation, progress tracking, and fresh results.", tone: "neutral" },
              { eyebrow: "Read", title: "Reports", body: "Risk interpretation, evidence review, and export.", tone: "amber" },
              { eyebrow: "Control", title: "Settings", body: "Defaults, account context, and system configuration.", tone: "green" },
            ],
          },
          {
            id: "page-grammar",
            label: "Page grammar",
            title: "A shared page grammar",
            paragraphs: [
              "Every major page follows the same hierarchy: global shell, page header, summary band, primary work area, supporting area.",
              "The docs page should follow that grammar too, so it feels like part of the same product family.",
            ],
          },
        ],
      },
      {
        slug: "audit-tracks",
        group: "Product structure",
        navLabel: "Audit tracks",
        eyebrow: "Core concept",
        title: "Evidence depth from black-box to white-box",
        summary:
          "The product value comes from a layered evidence chain rather than one script output. The docs need to frame that clearly.",
        sections: [
          {
            id: "tracks",
            label: "Three tracks",
            title: "Three audit tracks",
            paragraphs: [
              "The platform organizes attacks and evidence into three progressive tracks so screening, analysis, and validation can stay on one path.",
            ],
            rows: [
              { eyebrow: "Black-box", title: "Recon", body: "Observe whether the model exposes membership signals with minimal setup cost.", tone: "blue" },
              { eyebrow: "Gray-box", title: "PIA", body: "Use partial internal model information to sharpen attack signals.", tone: "amber" },
              { eyebrow: "White-box", title: "GSA", body: "Drill into parameters, gradients, or traces for stronger evidence.", tone: "coral" },
            ],
          },
          {
            id: "risk-levels",
            label: "Risk levels",
            title: "How metrics become risk levels",
            paragraphs: [
              "The frontend does not stop at showing numbers. It turns them into readable risk levels and interpretation.",
            ],
            table: {
              columns: ["Level", "Threshold", "Description"],
              rows: [
                ["High", "AUC > 0.85", "Strong member signal remains; prioritize mitigation and defense review."],
                ["Medium", "0.65 ≤ AUC ≤ 0.85", "Usable attack signal exists; continue analysis and hardening."],
                ["Low", "AUC < 0.65", "Attack is near random or exposure is limited; keep as a monitored baseline."],
              ],
            },
          },
          {
            id: "interpretation",
            label: "Interpretation",
            title: "From metric to conclusion",
            paragraphs: [
              "Every major result surface should use the same interpretation chain: raw metric, risk label, short explanation, and next action.",
            ],
          },
        ],
      },
      {
        slug: "deployment-runtime",
        group: "Runtime & integration",
        navLabel: "Deployment",
        eyebrow: "Runtime & integration",
        title: "Platform → Runtime-Server → Runners",
        summary:
          "This is not a command dump. It exists to show how tasks and results flow through the three system layers.",
        sections: [
          {
            id: "tiers",
            label: "Three tiers",
            title: "Three-layer responsibility split",
            paragraphs: [
              "The frontend owns entry, orchestration, and explanation. Runtime owns lifecycle. Runners own concrete experiments.",
            ],
            rows: [
              { eyebrow: "1", title: "Platform", body: "Frontend and API gateway for entry, orchestration, presentation, and reporting.", tone: "blue" },
              { eyebrow: "2", title: "Runtime-Server", body: "Task control, queueing, state, and runner management.", tone: "neutral" },
              { eyebrow: "3", title: "Experiment Runners", body: "Concrete execution units for Recon, PIA, GSA, and related experiments.", tone: "amber" },
            ],
          },
          {
            id: "boundaries",
            label: "Boundaries",
            title: "Important boundaries",
            paragraphs: [
              "The frontend does not directly execute experiments.",
              "Runtime is not responsible for final product narrative.",
              "Reports turn experimental output into reviewable product conclusions.",
            ],
          },
        ],
      },
      {
        slug: "integration",
        group: "Runtime & integration",
        navLabel: "Integration",
        eyebrow: "Runtime & integration",
        title: "How the platform fits into your workflow",
        summary:
          "Integration is not just about calling APIs. It is about connecting entry, task flow, results, and reports into one working chain.",
        sections: [
          {
            id: "entry",
            label: "Entry",
            title: "Unified entry and authentication",
            paragraphs: [
              "Docs, home, sign-in, and workspace should share one site frame so users do not feel bounced across different surfaces.",
            ],
          },
          {
            id: "workflow-link",
            label: "Workflow",
            title: "Connect task flow to your working process",
            paragraphs: [
              "The best integration path is to use DiffAudit in the middle of a larger loop: create task, watch run, then export results.",
            ],
            rows: [
              { title: "Task entry", body: "Start from Audits so users understand the target and current context.", tone: "neutral" },
              { title: "Result review", body: "Return to Workspace and Reports for structured interpretation rather than raw responses.", tone: "blue" },
              { title: "Export", body: "Use the report path to produce material that can be reviewed by others.", tone: "green" },
            ],
          },
        ],
      },
      {
        slug: "api-reference",
        group: "Reference",
        navLabel: "API",
        eyebrow: "Reference",
        title: "Core external endpoints",
        summary:
          "The API docs keep only the product-facing critical path. They should help readers understand behavior, not replace source code.",
        sections: [
          {
            id: "core-endpoints",
            label: "Core endpoints",
            title: "Critical path endpoints",
            paragraphs: [
              "These endpoints cover catalog discovery, job creation, job review, experiment summaries, and evidence lookup.",
            ],
            table: {
              columns: ["Method", "Path", "Description"],
              rows: [
                ["GET", "/api/v1/catalog", "Read the auditable model and dataset catalog."],
                ["GET", "/api/v1/audit/jobs", "List the current user's audit jobs."],
                ["POST", "/api/v1/audit/jobs", "Create a new audit job and start execution."],
                ["GET", "/api/v1/experiments/{workspace}/summary", "Read experiment summary for a workspace."],
                ["GET", "/api/v1/evidence/attack-defense-table", "Read the attack-defense evidence table."],
              ],
            },
          },
          {
            id: "notes",
            label: "Notes",
            title: "How to read these APIs",
            paragraphs: [
              "APIs define system boundaries, but they are not the whole product experience.",
              "The best reading order is: understand product structure first, then read APIs, then return to the workspace to see those APIs embodied in the UI.",
            ],
          },
        ],
      },
    ],
  };
}

export function getDocsContent(locale: Locale): DocsContent {
  return locale === "zh-CN" ? zhContent() : enContent();
}

export function getDocsPage(content: DocsContent, slug: string) {
  return content.pages.find((page) => page.slug === slug) ?? null;
}

