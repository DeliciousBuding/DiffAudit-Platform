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
  codeBlocks?: Array<{
    language: string;
    title?: string;
    code: string;
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
    searchNoResults: string;
    searchNavigate: string;
    searchOpen: string;
    searchClose: string;
    editPage: string;
    previousPage: string;
    nextPage: string;
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
      searchNoResults: "没有找到关于",
      searchNavigate: "导航",
      searchOpen: "打开",
      searchClose: "关闭",
      editPage: "在 GitHub 上编辑此页",
      previousPage: "上一页",
      nextPage: "下一页",
    },
    groups: ["开始使用", "产品结构", "运行与接入", "参考"],
    pages: [
      {
        slug: "quick-start",
        group: "开始使用",
        navLabel: "快速开始",
        eyebrow: "快速开始",
        title: "DiffAudit 概述",
        summary:
          "DiffAudit 是一套成员推断风险审计系统，涵盖目录管理、任务执行、状态追踪与证据报告四个模块。本文档按产品实际路径组织。",
        sections: [
          {
            id: "overview",
            label: "概述",
            title: "系统定位与架构",
            paragraphs: [
              "DiffAudit 将目录、任务、运行状态、证据表与报告整合在工作台中。用户通过 Web 前端发起审计任务，任务经由 API Gateway 转发至 Runtime-Server，最终由 Python Runner 执行具体实验。",
              "系统的输出包括 AUC、ASR、TPR@FPR 等量化指标，以及基于这些指标的风险分级与防御效果对照。",
            ],
            rows: [
              { eyebrow: "入口", title: "统一站点入口", body: "首页、登录、文档和工作台共用同一品牌入口与导航体系。", tone: "blue" },
              { eyebrow: "执行", title: "任务发起", body: "在 Audits 页面选择目标模型、攻击类型和执行参数后提交任务。", tone: "neutral" },
              { eyebrow: "解释", title: "结果解释", body: "AUC、ASR、TPR 和风险等级会在 Workspace 与 Reports 页面汇总展示，并支持直接导出 PDF 审计报告。", tone: "amber" },
            ],
          },
          {
            id: "first-audit",
            label: "首次审计",
            title: "首次审计流程",
            paragraphs: [
              "完成一次完整的审计任务需要三个步骤：认证登录、创建任务、查看结果。",
            ],
            rows: [
              { eyebrow: "01", title: "登录工作台", body: "通过认证后进入 Workspace 页面，查看当前任务状态和最近的审计结果。", tone: "blue" },
              { eyebrow: "02", title: "创建审计任务", body: "在 Audits 页面选择目标模型和攻击参数，提交后任务自动执行。", tone: "neutral" },
              { eyebrow: "03", title: "查看与导出结果", body: "任务完成后，在 Workspace 查看状态概览，在 Reports 查看详细分析和导出报告。", tone: "green" },
            ],
          },
          {
            id: "common-routes",
            label: "常用入口",
            title: "功能入口",
            paragraphs: [
              "以下链接可直接跳转到对应功能页面。",
            ],
            links: [
              { title: "Workspace", body: "查看当前任务、最近结果和系统状态。", href: "/workspace/start", cta: "打开 Workspace" },
              { title: "Audits", body: "创建任务并跟踪运行状态。", href: "/workspace/audits", cta: "前往 Audits" },
              { title: "Reports", body: "查看风险解释、覆盖缺口与导出报告。", href: "/workspace/reports", cta: "前往 Reports" },
            ],
          },
        ],
      },
      {
        slug: "workspace",
        group: "产品结构",
        navLabel: "工作台结构",
        eyebrow: "产品结构",
        title: "工作台模块",
        summary:
          "工作台包含四个模块：Workspace（总览）、Audits（任务管理）、Reports（结果分析）、Settings（系统配置）。",
        sections: [
          {
            id: "workspace-map",
            label: "模块概览",
            title: "四个功能模块",
            paragraphs: [
              "工作台按用户操作类型组织为四个页面，每个页面承担明确的职责。",
            ],
            rows: [
              { eyebrow: "总览", title: "Workspace", body: "KPI 指标、风险分布雷达图、最近结果表和下一步建议。", tone: "blue" },
              { eyebrow: "执行", title: "Audits", body: "任务创建向导、活跃任务列表和历史任务记录。", tone: "neutral" },
              { eyebrow: "分析", title: "Reports", body: "AUC/ROC 分布图、风险等级分布、攻击效果对比，以及可直接导出的 PDF 审计报告。", tone: "amber" },
              { eyebrow: "配置", title: "Settings", body: "默认参数设置、系统连接状态和关于系统说明。", tone: "green" },
            ],
          },
          {
            id: "page-grammar",
            label: "页面结构",
            title: "页面层级结构",
            paragraphs: [
              "每个页面遵循统一的结构层级：全局布局、页面头部（标题 + 一句话描述）、主工作区、辅助工作区。",
            ],
            rows: [
              { title: "页面头部", body: "说明当前页面的目的和一句话摘要。", tone: "neutral" },
              { title: "主工作区", body: "承担页面的核心功能和数据展示。", tone: "blue" },
              { title: "辅助区", body: "补充信息，与主工作区不重复。", tone: "neutral" },
            ],
          },
        ],
      },
      {
        slug: "audit-tracks",
        group: "产品结构",
        navLabel: "审计线路",
        eyebrow: "核心概念",
        title: "审计线路与风险分级",
        summary:
          "系统提供三条审计线路（Recon/PIA/GSA），覆盖从黑盒到白盒的攻击深度。每条线路的输出统一转换为风险等级。",
        sections: [
          {
            id: "tracks",
            label: "三条线路",
            title: "三条审计线路",
            paragraphs: [
              "三条线路按攻击所需的前置信息量从低到高排列，便于从快速筛查到深度验证逐级推进。",
            ],
            rows: [
              { eyebrow: "Black-box", title: "Recon（黑盒）", body: "仅需模型输入输出接口，以最低成本判断模型是否暴露成员信号。", tone: "blue" },
              { eyebrow: "Gray-box", title: "PIA（灰盒）", body: "需要部分模型内部信息（如中间层激活值），增强攻击效果和可解释性。", tone: "amber" },
              { eyebrow: "White-box", title: "GSA（白盒）", body: "需要完全访问模型参数和梯度，形成最强的证据链。", tone: "coral" },
            ],
          },
          {
            id: "risk-levels",
            label: "风险分级",
            title: "风险分级标准",
            paragraphs: [
              "系统根据 AUC 指标将审计结果划分为三个风险等级，每个等级附带处理建议。",
            ],
            table: {
              columns: ["等级", "阈值", "说明"],
              rows: [
                ["高风险", "AUC > 0.85", "成员信号显著，建议优先评估防御策略效果。"],
                ["中风险", "0.65 ≤ AUC ≤ 0.85", "存在可检测信号，建议增加攻击轮次以获取更精确的评估。"],
                ["低风险", "AUC < 0.65", "攻击效果接近随机，可作为安全基线参考。"],
              ],
            },
          },
          {
            id: "interpretation",
            label: "结果解释",
            title: "指标解读方法",
            paragraphs: [
              "审计结果包含三个核心指标：AUC（区分训练集与非成员样本的能力）、ASR（攻击成功率）和 TPR@FPR（固定误报率下的检测率）。",
              "Reports 页面将这些指标转换为可视化的风险分布图和攻击效果对比图，便于判断模型泄露风险。",
            ],
          },
        ],
      },
      {
        slug: "deployment-runtime",
        group: "运行与接入",
        navLabel: "部署架构",
        eyebrow: "运行与接入",
        title: "Platform → Runtime-Server → Runners",
        summary:
          "系统由三层组件构成：Platform 负责任务编排与结果展示，Runtime-Server 负责任务调度与状态管理，Runners 负责执行具体实验。",
        sections: [
          {
            id: "tiers",
            label: "三层架构",
            title: "系统分层职责",
            paragraphs: [
              "Web 前端通过 Next.js 构建，API Gateway 使用 Go 语言实现。Runtime-Server 同样使用 Go，Python Runner 负责具体的攻击实验执行。",
            ],
            rows: [
              { eyebrow: "1", title: "Platform", body: "Web 前端与 API Gateway（端口 8780），负责任务入口、流程编排、结果展示与报告生成。", tone: "blue" },
              { eyebrow: "2", title: "Runtime-Server", body: "独立运行服务（端口 8765），负责任务调度、状态管理和 Runner 进程管理。", tone: "neutral" },
              { eyebrow: "3", title: "Experiment Runners", body: "Python 进程，执行 Recon、PIA、GSA 实验并将结果通过标准输出回传。", tone: "amber" },
            ],
          },
          {
            id: "boundaries",
            label: "边界",
            title: "组件边界",
            paragraphs: [
              "前端通过 HTTP API 与 Runtime-Server 通信，不直接执行实验代码。",
              "Runtime-Server 负责任务生命周期管理，不参与结果分析和报告生成。",
              "Reports 模块将实验数据转换为结构化的风险评估结论。",
            ],
          },
        ],
      },
      {
        slug: "integration",
        group: "运行与接入",
        navLabel: "接入指南",
        eyebrow: "运行与接入",
        title: "平台接入流程",
        summary:
          "接入流程包含：配置 Runtime-Server 连接参数、创建审计任务、查看结果并导出报告。",
        sections: [
          {
            id: "entry",
            label: "认证",
            title: "统一认证入口",
            paragraphs: [
              "首页、登录、文档和工作台共享同一认证体系，用户登录后即可访问全部功能。",
            ],
          },
          {
            id: "workflow-link",
            label: "工作流",
            title: "任务流转流程",
            paragraphs: [
              "完整流程：在 Audits 页面创建任务 → 查看任务执行状态 → 在 Workspace 查看汇总结果 → 在 Reports 页面导出分析报告。",
            ],
            rows: [
              { title: "任务创建", body: "选择攻击类型、目标模型和执行参数，提交后任务自动执行。", tone: "neutral" },
              { title: "状态跟踪", body: "任务状态通过 3 秒轮询更新，支持取消和重试操作。", tone: "blue" },
              { title: "报告导出", body: "支持直接导出 PDF 审计报告，内含封面、曲线图、风险分布与标准表格。", tone: "green" },
            ],
          },
        ],
      },
      {
        slug: "api-reference",
        group: "参考",
        navLabel: "API 参考",
        eyebrow: "参考",
        title: "API 接口",
        summary:
          "以下接口覆盖目录查询、任务创建、任务列表、实验汇总、证据表查询和公开快照数据契约。",
        sections: [
          {
            id: "core-endpoints",
            label: "核心接口",
            title: "关键路径接口",
            paragraphs: [
              "这些接口覆盖了目录读取、任务创建、任务列表、实验汇总和证据表查询。",
            ],
            codeBlocks: [
              {
                language: "bash",
                title: "查询可审计模型目录",
                code: `curl -s http://localhost:8780/api/v1/catalog | jq '.tracks[].entries[].contractKey'`,
              },
              {
                language: "bash",
                title: "创建审计任务",
                code: `curl -s -X POST http://localhost:8780/api/v1/audit/jobs \\
  -H 'Content-Type: application/json' \\
  -d '{"contract_key":"black-box/recon/sd15-ddim","workspace_name":"demo-recon","job_type":"recon_artifact_mainline"}'`,
              },
            ],
            table: {
              columns: ["方法", "路径", "说明"],
              rows: [
                ["GET", "/api/v1/catalog", "读取可审计模型与数据集目录。"],
                ["GET", "/api/v1/models", "读取公开快照中的模型列表。"],
                ["GET", "/api/v1/audit/jobs", "列出当前用户的审计任务。"],
                ["POST", "/api/v1/audit/jobs", "创建新的审计任务并开始运行。"],
                ["GET", "/api/v1/audit/jobs/{jobId}", "读取单个任务的公开安全状态与日志摘要。"],
                ["GET", "/api/v1/experiments/{workspace}/summary", "读取指定工作区的实验汇总。"],
                ["GET", "/api/v1/evidence/attack-defense-table", "读取攻击-防御证据表。"],
              ],
            },
          },
          {
            id: "snapshot-contract",
            label: "数据契约",
            title: "公开快照数据契约",
            paragraphs: [
              "目录、模型、证据表与报告读取接口默认消费发布后的 public snapshot。请求期不会回退读取本地 Research 工作区、Runtime 文件系统或私有部署路径。",
              "字段可能随研究主线演进扩展；客户端应将新增字段视为可选增强，并在缺失时显示空状态或破折号。",
            ],
            table: {
              columns: ["资源", "关键字段", "说明"],
              rows: [
                ["Catalog entry", "contract_key, track, attack_family, target_key, label, availability, evidence_level, best_workspace, system_gap, admission_status, provenance_status", "描述一个可审计合约及其证据入选状态。"],
                ["Attack-defense row", "track, attack, defense, auc, asr, tpr_at_fpr, risk_level, evidence_level, boundary, source_path, provenance_status", "描述单条攻击/防御实验结果，可用于表格、图表和报告导出。"],
                ["Experiment summary", "workspace, metrics, curves, metadata, provenance", "描述指定工作区的指标、曲线和来源摘要。"],
                ["Audit job facade", "job_id, status, created_at, updated_at, job_type, contract_key, stdout_tail, stderr_tail, state_history", "任务接口返回公开安全的状态与日志摘要；原始 Runtime 文本会先经过脱敏。"],
              ],
            },
          },
          {
            id: "response-examples",
            label: "响应示例",
            title: "响应形状示例",
            paragraphs: [
              "下面示例只展示稳定字段和可选增强字段，真实响应可能包含更多公开安全字段。",
            ],
            codeBlocks: [
              {
                language: "json",
                title: "Catalog entry",
                code: `{
  "contract_key": "black-box/recon/sd15-ddim",
  "track": "black-box",
  "attack_family": "recon",
  "target_key": "sd15-ddim",
  "label": "Stable Diffusion 1.5 DDIM Recon",
  "availability": "ready",
  "evidence_level": "admitted",
  "best_workspace": "research://experiments/recon-runtime-mainline",
  "provenance_status": "verified"
}`,
              },
              {
                language: "json",
                title: "Attack-defense row",
                code: `{
  "track": "gray-box",
  "attack": "PIA",
  "defense": "stochastic-dropout",
  "auc": 0.828,
  "asr": 0.742,
  "tpr_at_fpr": 0.516,
  "risk_level": "high",
  "boundary": "public-snapshot",
  "source_path": "research://tables/unified-attack-defense-table"
}`,
              },
            ],
          },
          {
            id: "notes",
            label: "说明",
            title: "使用说明",
            paragraphs: [
              "接口地址中的端口 8780 对应 API Gateway 服务。前端页面通过 API Gateway 转发，不直接访问 Runtime-Server。",
              "控制面接口在 Runtime 不可用时会返回公开安全的不可达状态；页面应保留 demo/snapshot 数据，不应显示原始网络异常、机器路径或私有主机信息。",
            ],
          },
        ],
      },
      {
        slug: "privacy",
        group: "参考",
        navLabel: "隐私政策",
        eyebrow: "法律",
        title: "隐私政策",
        summary: "说明 DiffAudit 在登录、工作台和文档场景下读取、保存和展示哪些账号与运行时信息。",
        sections: [
          {
            id: "account-data",
            label: "账户数据",
            title: "账户与身份信息",
            paragraphs: [
              "当你使用 Google 或 GitHub 登录时，DiffAudit 仅读取完成账户识别所需的最小字段：名称、邮箱、头像和 provider 标识。",
              "这些字段仅用于创建或关联 DiffAudit 账户、显示当前登录用户、以及在工作台中恢复你的访问状态。",
            ],
          },
          {
            id: "runtime-data",
            label: "运行数据",
            title: "任务与运行时数据",
            paragraphs: [
              "工作台会展示任务状态、目标模型、审计指标和报告摘要。这些数据用于成员推断风险评估，不会作为第三方广告或推荐用途。",
              "本地偏好设置如主题、语言、默认参数和 Runtime 地址会保存在浏览器本地存储中，以便你下次访问时恢复界面状态。",
            ],
          },
          {
            id: "security",
            label: "安全边界",
            title: "安全与边界",
            paragraphs: [
              "DiffAudit 是风险审计平台，不会主动替你执行防御措施或将模型数据共享给外部服务。",
              "若系统启用了邮件验证、API 密钥或外部 Runtime 连接，这些能力也仅在当前部署边界内使用。",
            ],
          },
        ],
      },
      {
        slug: "terms",
        group: "参考",
        navLabel: "服务条款",
        eyebrow: "法律",
        title: "服务条款",
        summary: "说明 DiffAudit 工作台、文档和实验入口的使用边界，以及用户在平台中的操作责任。",
        sections: [
          {
            id: "usage-scope",
            label: "使用范围",
            title: "使用范围",
            paragraphs: [
              "DiffAudit 用于成员推断审计、风险评估和评审演示，不替代防御系统或生产监控。",
              "你应仅在已授权的数据集、模型和实验环境中使用本系统。任何超出授权范围的操作，都不属于平台设计目标。",
            ],
          },
          {
            id: "user-responsibility",
            label: "用户责任",
            title: "用户责任",
            paragraphs: [
              "用户应自行确认任务参数、目标模型、Runtime 地址和导出内容的准确性，避免将错误配置带入正式使用或报告。",
              "如果你使用 OAuth、本地密码、API 密钥或 Runtime 连接能力，应妥善保管相关凭据，并在不再需要时及时轮换或撤销。",
            ],
          },
          {
            id: "service-notice",
            label: "服务说明",
            title: "服务说明",
            paragraphs: [
              "平台可能在版本更新、文档优化或界面调整期间发生功能变更。发布前应通过本地构建、关键页面回归和运行链路验证完成确认。",
              "DiffAudit 保留对工作台文案、文档结构、指标解释和界面样式进行迭代优化的权利，但不会改变其核心审计定位。",
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
      searchNoResults: "No results for",
      searchNavigate: "navigate",
      searchOpen: "open",
      searchClose: "close",
      editPage: "Edit this page on GitHub",
      previousPage: "Previous",
      nextPage: "Next",
    },
    groups: ["Get started", "Product structure", "Runtime & integration", "Reference"],
    pages: [
      {
        slug: "quick-start",
        group: "Get started",
        navLabel: "Quick start",
        eyebrow: "Quick start",
        title: "DiffAudit overview",
        summary:
          "DiffAudit is a membership inference risk audit system with four modules: catalog management, task execution, status tracking, and evidence reporting.",
        sections: [
          {
            id: "overview",
            label: "Overview",
            title: "System overview",
            paragraphs: [
              "DiffAudit integrates catalog, task execution, runtime state, evidence tables, and report interpretation into a single workspace. Users initiate audit tasks through the web frontend, which are forwarded via the API Gateway to the Runtime-Server and executed by Python Runners.",
              "Output includes quantitative metrics (AUC, ASR, TPR@FPR) and risk classification derived from those metrics.",
            ],
            rows: [
              { eyebrow: "Entry", title: "Unified site entry", body: "Home, sign-in, docs, and workspace share the same brand and navigation frame.", tone: "blue" },
              { eyebrow: "Execution", title: "Task initiation", body: "Select attack type, target model, and execution parameters in the Audits page.", tone: "neutral" },
              { eyebrow: "Analysis", title: "Result interpretation", body: "AUC, ASR, TPR, and risk levels are summarized in Workspace and Reports, with direct PDF audit report export.", tone: "amber" },
            ],
          },
          {
            id: "first-audit",
            label: "First audit",
            title: "First audit workflow",
            paragraphs: [
              "A complete audit workflow requires three steps: authenticate, create a task, and review results.",
            ],
            rows: [
              { eyebrow: "01", title: "Sign in to workspace", body: "After authentication, enter the Workspace page to view current task status and recent results.", tone: "blue" },
              { eyebrow: "02", title: "Create an audit task", body: "Select a target model and attack parameters in the Audits page. The task executes automatically.", tone: "neutral" },
              { eyebrow: "03", title: "Review and export results", body: "View status summaries in Workspace and detailed analysis with report export in Reports.", tone: "green" },
            ],
          },
          {
            id: "common-routes",
            label: "Navigation",
            title: "Function entry points",
            paragraphs: [
              "Direct links to each functional page.",
            ],
            links: [
              { title: "Workspace", body: "View current tasks, recent results, and system status.", href: "/workspace/start", cta: "Open Workspace" },
              { title: "Audits", body: "Create tasks and track execution status.", href: "/workspace/audits", cta: "Go to Audits" },
              { title: "Reports", body: "View risk analysis, coverage gaps, and export reports.", href: "/workspace/reports", cta: "Go to Reports" },
            ],
          },
        ],
      },
      {
        slug: "workspace",
        group: "Product structure",
        navLabel: "Workspace structure",
        eyebrow: "Product structure",
        title: "Workspace modules",
        summary:
          "The workspace contains four pages: Workspace (overview), Audits (task management), Reports (result analysis), and Settings (system configuration).",
        sections: [
          {
            id: "workspace-map",
            label: "Module overview",
            title: "Four functional pages",
            paragraphs: [
              "Each page in the workspace has a clearly defined role.",
            ],
            rows: [
              { eyebrow: "Overview", title: "Workspace", body: "KPI metrics, risk radar chart, recent results table, and next-step suggestions.", tone: "blue" },
              { eyebrow: "Execution", title: "Audits", body: "Task creation wizard, active task list, and historical task records.", tone: "neutral" },
              { eyebrow: "Analysis", title: "Reports", body: "AUC/ROC distribution charts, risk breakdown, attack comparison, and direct PDF audit report export.", tone: "amber" },
              { eyebrow: "Config", title: "Settings", body: "Default parameters, system connection status, and system information.", tone: "green" },
            ],
          },
          {
            id: "page-grammar",
            label: "Page structure",
            title: "Page hierarchy",
            paragraphs: [
              "Each page follows a unified structure: global shell, page header (title + one-line description), primary work area, and supporting area.",
            ],
            rows: [
              { title: "Page header", body: "States the purpose and one-line summary of the current page.", tone: "neutral" },
              { title: "Primary area", body: "Core functionality and data display for the page.", tone: "blue" },
              { title: "Supporting area", body: "Supplementary information that does not duplicate the primary area.", tone: "neutral" },
            ],
          },
        ],
      },
      {
        slug: "audit-tracks",
        group: "Product structure",
        navLabel: "Audit tracks",
        eyebrow: "Core concept",
        title: "Audit tracks and risk classification",
        summary:
          "The system provides three audit tracks (Recon/PIA/GSA) covering black-box to white-box attack depth. Each track's output is converted to a unified risk level.",
        sections: [
          {
            id: "tracks",
            label: "Three tracks",
            title: "Three audit tracks",
            paragraphs: [
              "Tracks are ordered by the amount of prior information required for the attack, from quick screening to deep validation.",
            ],
            rows: [
              { eyebrow: "Black-box", title: "Recon", body: "Requires only model input/output interface. Lowest cost for initial risk assessment.", tone: "blue" },
              { eyebrow: "Gray-box", title: "PIA", body: "Requires partial internal model information (e.g., intermediate layer activations) for stronger attack signals.", tone: "amber" },
              { eyebrow: "White-box", title: "GSA", body: "Requires full access to model parameters and gradients. Produces the strongest evidence chain.", tone: "coral" },
            ],
          },
          {
            id: "risk-levels",
            label: "Risk levels",
            title: "Risk classification criteria",
            paragraphs: [
              "Audit results are classified into three risk levels based on AUC thresholds, each with recommended actions.",
            ],
            table: {
              columns: ["Level", "Threshold", "Description"],
              rows: [
                ["High", "AUC > 0.85", "Strong membership signal. Prioritize defense strategy evaluation."],
                ["Medium", "0.65 ≤ AUC ≤ 0.85", "Detectable signal exists. Increase attack rounds for more precise assessment."],
                ["Low", "AUC < 0.65", "Attack near random. Use as a security baseline reference."],
              ],
            },
          },
          {
            id: "interpretation",
            label: "Interpretation",
            title: "Metric interpretation",
            paragraphs: [
              "Each audit result includes three core metrics: AUC (discrimination between training and non-member samples), ASR (attack success rate), and TPR@FPR (detection rate at fixed false positive rate).",
              "The Reports page converts these metrics into visual risk distribution charts and attack comparison graphs.",
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
          "The system has three layers: Platform (task orchestration and display), Runtime-Server (scheduling and state management), and Runners (experiment execution).",
        sections: [
          {
            id: "tiers",
            label: "Three tiers",
            title: "Layer responsibilities",
            paragraphs: [
              "The web frontend is built with Next.js. The API Gateway is implemented in Go. The Runtime-Server also uses Go, with Python Runners executing attack experiments.",
            ],
            rows: [
              { eyebrow: "1", title: "Platform", body: "Web frontend and API Gateway (port 8780) for task entry, orchestration, display, and reporting.", tone: "blue" },
              { eyebrow: "2", title: "Runtime-Server", body: "Independent service (port 8765) for task scheduling, state management, and runner process management.", tone: "neutral" },
              { eyebrow: "3", title: "Experiment Runners", body: "Python processes executing Recon, PIA, GSA experiments, returning results via stdout.", tone: "amber" },
            ],
          },
          {
            id: "boundaries",
            label: "Boundaries",
            title: "Component boundaries",
            paragraphs: [
              "The frontend communicates with Runtime-Server via HTTP API. It does not execute experiment code directly.",
              "The Runtime-Server manages task lifecycle but does not participate in result analysis or report generation.",
              "The Reports module converts experiment data into structured risk assessment conclusions.",
            ],
          },
        ],
      },
      {
        slug: "integration",
        group: "Runtime & integration",
        navLabel: "Integration",
        eyebrow: "Runtime & integration",
        title: "Integration workflow",
        summary:
          "Integration steps: configure Runtime-Server connection, create audit tasks, review results, and export reports.",
        sections: [
          {
            id: "entry",
            label: "Authentication",
            title: "Unified authentication",
            paragraphs: [
              "Home, login, docs, and workspace share the same authentication system. All features are accessible after login.",
            ],
          },
          {
            id: "workflow-link",
            label: "Workflow",
            title: "Task flow",
            paragraphs: [
              "Complete workflow: create task in Audits → monitor execution → view summary in Workspace → export report from Reports.",
            ],
            rows: [
              { title: "Task creation", body: "Select attack type, target model, and parameters. The task executes automatically after submission.", tone: "neutral" },
              { title: "Status tracking", body: "Task status updates via 3-second polling. Cancel and retry operations are supported.", tone: "blue" },
              { title: "Report export", body: "Supports direct PDF audit report export with cover page, charts, risk analysis, and structured tables.", tone: "green" },
            ],
          },
        ],
      },
      {
        slug: "api-reference",
        group: "Reference",
        navLabel: "API",
        eyebrow: "Reference",
        title: "API endpoints",
        summary:
          "Endpoints cover catalog query, task creation, task listing, experiment summary, evidence table lookup, and public snapshot data contracts.",
        sections: [
          {
            id: "core-endpoints",
            label: "Core endpoints",
            title: "Key endpoints",
            paragraphs: [
              "Port 8780 is the API Gateway. Port 8765 is the Runtime-Server. The frontend communicates only with the API Gateway.",
            ],
            codeBlocks: [
              {
                language: "bash",
                title: "Query auditable model catalog",
                code: `curl -s http://localhost:8780/api/v1/catalog | jq '.tracks[].entries[].contractKey'`,
              },
              {
                language: "bash",
                title: "Create audit task",
                code: `curl -s -X POST http://localhost:8780/api/v1/audit/jobs \\
  -H 'Content-Type: application/json' \\
  -d '{"contract_key":"black-box/recon/sd15-ddim","workspace_name":"demo-recon","job_type":"recon_artifact_mainline"}'`,
              },
            ],
            table: {
              columns: ["Method", "Path", "Description"],
              rows: [
                ["GET", "/api/v1/catalog", "Read the auditable model and dataset catalog."],
                ["GET", "/api/v1/models", "Read model entries from the public snapshot."],
                ["GET", "/api/v1/audit/jobs", "List current audit jobs."],
                ["POST", "/api/v1/audit/jobs", "Create a new audit job."],
                ["GET", "/api/v1/audit/jobs/{jobId}", "Read a public-safe job status and log summary."],
                ["GET", "/api/v1/experiments/{workspace}/summary", "Read experiment summary for a workspace."],
                ["GET", "/api/v1/evidence/attack-defense-table", "Read the attack-defense evidence table."],
              ],
            },
          },
          {
            id: "snapshot-contract",
            label: "Data contract",
            title: "Public snapshot data contract",
            paragraphs: [
              "Catalog, model, evidence-table, and report-reading endpoints consume the published public snapshot by default. Request-time handlers do not fall back to local Research workspaces, Runtime filesystems, or private deployment paths.",
              "Fields can expand as the research mainline evolves. Clients should treat new fields as optional enhancements and render empty states or dashes when optional fields are absent.",
            ],
            table: {
              columns: ["Resource", "Key fields", "Notes"],
              rows: [
                ["Catalog entry", "contract_key, track, attack_family, target_key, label, availability, evidence_level, best_workspace, system_gap, admission_status, provenance_status", "Describes an auditable contract and its admitted-evidence state."],
                ["Attack-defense row", "track, attack, defense, auc, asr, tpr_at_fpr, risk_level, evidence_level, boundary, source_path, provenance_status", "Describes one attack/defense result for tables, charts, and report export."],
                ["Experiment summary", "workspace, metrics, curves, metadata, provenance", "Describes metrics, curves, and provenance summary for a workspace."],
                ["Audit job facade", "job_id, status, created_at, updated_at, job_type, contract_key, stdout_tail, stderr_tail, state_history", "Job APIs return public-safe status and log summaries; raw Runtime text is sanitized before rendering."],
              ],
            },
          },
          {
            id: "response-examples",
            label: "Response examples",
            title: "Response shape examples",
            paragraphs: [
              "The examples show stable fields and optional enhancements. Actual responses can contain additional public-safe fields.",
            ],
            codeBlocks: [
              {
                language: "json",
                title: "Catalog entry",
                code: `{
  "contract_key": "black-box/recon/sd15-ddim",
  "track": "black-box",
  "attack_family": "recon",
  "target_key": "sd15-ddim",
  "label": "Stable Diffusion 1.5 DDIM Recon",
  "availability": "ready",
  "evidence_level": "admitted",
  "best_workspace": "research://experiments/recon-runtime-mainline",
  "provenance_status": "verified"
}`,
              },
              {
                language: "json",
                title: "Attack-defense row",
                code: `{
  "track": "gray-box",
  "attack": "PIA",
  "defense": "stochastic-dropout",
  "auc": 0.828,
  "asr": 0.742,
  "tpr_at_fpr": 0.516,
  "risk_level": "high",
  "boundary": "public-snapshot",
  "source_path": "research://tables/unified-attack-defense-table"
}`,
              },
            ],
          },
          {
            id: "notes",
            label: "Notes",
            title: "Usage notes",
            paragraphs: [
              "Port 8780 is the API Gateway. Frontend routes go through the API Gateway and do not directly access the Runtime-Server.",
              "When the Runtime control plane is unavailable, control endpoints return public-safe disconnected states. Pages should keep demo/snapshot data visible and must not display raw network errors, machine paths, or private host details.",
            ],
          },
        ],
      },
      {
        slug: "privacy",
        group: "Reference",
        navLabel: "Privacy policy",
        eyebrow: "Legal",
        title: "Privacy policy",
        summary: "What DiffAudit reads, stores, and displays across login, workspace, and docs flows.",
        sections: [
          {
            id: "account-data",
            label: "Account data",
            title: "Account and identity data",
            paragraphs: [
              "When you sign in with Google or GitHub, DiffAudit reads only the minimum fields required for account identification: name, email, avatar, and provider identity.",
              "These fields are used only to create or link your DiffAudit account, display the signed-in user, and restore access state inside the workspace.",
            ],
          },
          {
            id: "runtime-data",
            label: "Runtime data",
            title: "Task and runtime data",
            paragraphs: [
              "The workspace displays task status, target model, audit metrics, and report summaries. This data is used for membership inference risk evaluation only.",
              "Local preferences such as theme, language, default parameters, and Runtime endpoint are stored in browser-local storage so the UI can restore your last-used state.",
            ],
          },
          {
            id: "security",
            label: "Security",
            title: "Security boundary",
            paragraphs: [
              "DiffAudit surfaces risks. It does not deploy defenses or share your model data with external services.",
              "If email verification, API keys, or external Runtime integration are enabled, those capabilities remain bounded to the current deployment environment.",
            ],
          },
        ],
      },
      {
        slug: "terms",
        group: "Reference",
        navLabel: "Terms",
        eyebrow: "Legal",
        title: "Terms of service",
        summary: "Usage boundaries and reviewer responsibilities for the DiffAudit workspace, docs, and audit entry points.",
        sections: [
          {
            id: "usage-scope",
            label: "Scope",
            title: "Usage scope",
            paragraphs: [
              "DiffAudit is for membership inference auditing, risk assessment, and research review demos. It does not replace a defense system or production monitoring stack.",
              "You should only use the platform with authorized datasets, models, and experiment environments.",
            ],
          },
          {
            id: "user-responsibility",
            label: "Responsibilities",
            title: "User responsibilities",
            paragraphs: [
              "Reviewers are responsible for checking task parameters, target models, Runtime endpoints, and exported report content before formal use.",
              "If you use OAuth, local passwords, API keys, or Runtime connectivity, you are responsible for protecting and rotating those credentials when needed.",
            ],
          },
          {
            id: "service-notice",
            label: "Notice",
            title: "Service notice",
            paragraphs: [
              "The platform may evolve through version updates, documentation improvements, and UI refinements. Local build and regression verification should be completed before release.",
              "DiffAudit may update wording, documentation structure, metric explanations, and visual presentation, while keeping the product anchored to its audit-focused purpose.",
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

