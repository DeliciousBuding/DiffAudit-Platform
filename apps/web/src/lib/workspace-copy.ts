import { type Locale } from "@/components/language-picker";

export const WORKSPACE_COPY: Record<
  Locale,
  {
    shell: {
      siteBadge: string;
      runtimeChecking: string;
      runtimeConnected: string;
      runtimeDisconnected: string;
      desktopNavAriaLabel: string;
      mobileNavAriaLabel: string;
      githubTitle: string;
      signOut: string;
    };
    nav: Array<{
      href: string;
      title: string;
      subtitle: string;
      shortLabel: string;
    }>;
    workspace: {
      eyebrow: string;
      title: string;
      description: string;
      kpis: {
        liveContractsLabel: string;
        liveContractsNote: string;
        defendedRowsLabel: string;
        defendedRowsNote: string;
        avgAucLabel: string;
        avgAucNote: string;
        defenseEvaluatedLabel: string;
        defenseEvaluatedNote: string;
      };
      sections: {
        tasks: string;
        recentResults: string;
        riskOverview: string;
      };
      riskInterpretations: {
        high: string;
        medium: string;
        low: string;
      };
      todoItems: string[];
      emptyResults: string;
    };
    audits: {
      eyebrow: string;
      title: string;
      description: string;
      sections: {
        recommendedContracts: string;
        runningJobs: string;
        recentResults: string;
      };
      recommendedWorkspace: string;
      createJob: string;
      updatedAt: string;
      jobsRefreshNote: string;
      jobsUnavailable: string;
      emptyContracts: string;
      emptyJobs: string;
      emptyResults: string;
      filters: {
        statusAll: string;
        statusCompleted: string;
        statusFailed: string;
        statusRunning: string;
        trackAll: string;
        trackBlackBox: string;
        trackGrayBox: string;
        trackWhiteBox: string;
        searchPlaceholder: string;
        activeFilters: string;
      };
    };
    reports: {
      eyebrow: string;
      title: string;
      description: string;
      sections: {
        auditResults: string;
        coverageGaps: string;
      };
      exportSummary: string;
      emptyResults: string;
      emptyGaps: string;
    };
    settings: {
      eyebrow: string;
      title: string;
      description: string;
      sections: Array<{ title: string; copy: string }>;
      systemStatus: { title: string; runtime: string; demoMode: string; demoOn: string; demoOff: string };
      auditConfig: { title: string; defaultRounds: string; defaultBatchSize: string; saved: string };
      account: { title: string; username: string; logout: string };
      errorPage: { title: string; description: string; retry: string; goHome: string };
      notFound: { title: string; description: string; goHome: string };
    };
    loginPage: {
      eyebrow: string;
      title: string;
      description: string;
      formEyebrow: string;
      formTitle: string;
      oauthDivider: string;
      registerLink: string;
      registerCta: string;
      github: string;
    };
    registerPage: {
      eyebrow: string;
      title: string;
      description: string;
      formEyebrow: string;
      formTitle: string;
      oauthDivider: string;
      loginLink: string;
      loginCta: string;
      github: string;
    };
    loginForm: {
      username: string;
      password: string;
      passwordPlaceholder: string;
      submit: string;
      pending: string;
      hint: string;
      error: string;
    };
    registerForm: {
      username: string;
      email: string;
      emailPlaceholder: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      submit: string;
      pending: string;
      hint: string;
      error: string;
      passwordMismatch: string;
    };
    trialPage: {
      eyebrow: string;
      title: string;
      description: string;
    };
    trialForm: {
      successEyebrow: string;
      successTitle: string;
      successBody: string;
      team: string;
      teamPlaceholder: string;
      contact: string;
      contactPlaceholder: string;
      scenario: string;
      scenarioPlaceholder: string;
      submit: string;
    };
  }
> = {
  "en-US": {
    shell: {
      siteBadge: "Single-site workspace",
      runtimeChecking: "Runtime checking",
      runtimeConnected: "Runtime connected",
      runtimeDisconnected: "Runtime disconnected",
      desktopNavAriaLabel: "Workspace navigation",
      mobileNavAriaLabel: "Mobile navigation",
      githubTitle: "GitHub",
      signOut: "Sign out",
    },
    nav: [
      { href: "/workspace", title: "Workspace", subtitle: "Tasks and metrics", shortLabel: "Home" },
      { href: "/workspace/audits", title: "Audits", subtitle: "Create jobs and review runs", shortLabel: "Audits" },
      { href: "/workspace/reports", title: "Reports", subtitle: "Summaries and exports", shortLabel: "Reports" },
      { href: "/workspace/settings", title: "Settings", subtitle: "Team, keys, and preferences", shortLabel: "Settings" },
    ],
    workspace: {
      eyebrow: "Workspace",
      title: "Tasks, audit results, and key metrics.",
      description: "The workspace home aggregates current tasks, recent results, and system status.",
      kpis: {
        liveContractsLabel: "Live contracts",
        liveContractsNote: "Available contracts in the catalog.",
        defendedRowsLabel: "Defended rows",
        defendedRowsNote: "Result rows with defense comparisons.",
        avgAucLabel: "Avg. Attack AUC",
        avgAucNote: "Mean AUC across all evaluated rows",
        defenseEvaluatedLabel: "Defense Evaluated",
        defenseEvaluatedNote: "total audit results",
      },
      sections: {
        tasks: "Current tasks",
        recentResults: "Recent results",
        riskOverview: "Risk distribution",
      },
      riskInterpretations: {
        high: "Member signal remains strong. Review defense comparison.",
        medium: "Partial signal leakage. Consider additional defenses.",
        low: "Attack near random guessing. Privacy protection effective.",
      },
      todoItems: [
        "Review parameters and data sources for the current audit run.",
        "Check the latest admitted results and decide whether to export a report.",
        "Update team settings, keys, and personal preferences.",
      ],
      emptyResults: "No audit results yet. Create a job in the audits page.",
    },
    audits: {
      eyebrow: "Audits",
      title: "Create jobs, track runs, review results.",
      description: "The audit flow organizes around contracts, job queue, and result summaries.",
      sections: {
        recommendedContracts: "Recommended contracts",
        runningJobs: "Running jobs",
        recentResults: "Recent results",
      },
      recommendedWorkspace: "Recommended workspace",
      createJob: "Create job",
      updatedAt: "Updated",
      jobsRefreshNote: "Running jobs refresh after the page loads.",
      jobsUnavailable: "Control plane unavailable. Live jobs will return after the gateway reconnects.",
      emptyContracts: "No contracts available. Check the catalog data source.",
      emptyJobs: "No running jobs.",
      emptyResults: "No audit results yet.",
      filters: {
        statusAll: "All",
        statusCompleted: "Completed",
        statusFailed: "Failed",
        statusRunning: "Running",
        trackAll: "All tracks",
        trackBlackBox: "Black-box/Recon",
        trackGrayBox: "Gray-box/PIA",
        trackWhiteBox: "White-box/GSA",
        searchPlaceholder: "Search contract key or job ID",
        activeFilters: "active",
      },
    },
    reports: {
      eyebrow: "Reports",
      title: "Result summaries, coverage gaps, and report exports.",
      description: "The reports page aggregates audit results, identifies coverage gaps, and supports exports.",
      sections: {
        auditResults: "Audit results",
        coverageGaps: "Coverage gaps",
      },
      exportSummary: "Export report summary",
      emptyResults: "No audit results yet.",
      emptyGaps: "No coverage gap data.",
    },
    settings: {
      eyebrow: "Settings",
      title: "Team, keys, and preferences.",
      description: "The settings page manages team members, API keys, and workspace preferences.",
      sections: [
        { title: "Team members", copy: "Manage team name, roles, and the default workspace scope." },
        { title: "API keys", copy: "Keep service endpoints, API keys, and access boundaries in one place." },
        { title: "Preferences", copy: "Save language, page defaults, and report presentation preferences." },
      ],
      systemStatus: {
        title: "System status",
        runtime: "Runtime connection",
        demoMode: "Demo mode",
        demoOn: "On",
        demoOff: "Off",
      },
      auditConfig: {
        title: "Audit defaults",
        defaultRounds: "Default attack rounds",
        defaultBatchSize: "Default batch size",
        saved: "Saved",
      },
      account: {
        title: "Account",
        username: "Current user",
        logout: "Sign out",
      },
      errorPage: {
        title: "Something went wrong",
        description: "An unexpected error occurred. You can try again or return to the workspace.",
        retry: "Retry",
        goHome: "Return to workspace",
      },
      notFound: {
        title: "Page not found",
        description: "The page you are looking for does not exist or has been moved.",
        goHome: "Return to workspace",
      },
    },
    loginPage: {
      eyebrow: "Sign in",
      title: "Access the DiffAudit workspace.",
      description: "Use your account or continue with GitHub.",
      formEyebrow: "Workspace access",
      formTitle: "Sign in to continue.",
      oauthDivider: "Or continue with",
      registerLink: "New to DiffAudit?",
      registerCta: "Create an account",
      github: "Continue with GitHub",
    },
    registerPage: {
      eyebrow: "Register",
      title: "Create a DiffAudit account.",
      description: "Set up an account to access audits, reports, and workspace settings.",
      formEyebrow: "Account setup",
      formTitle: "Register to continue.",
      oauthDivider: "Or continue with",
      loginLink: "Already have an account?",
      loginCta: "Sign in",
      github: "Continue with GitHub",
    },
    loginForm: {
      username: "Username",
      password: "Password",
      passwordPlaceholder: "Enter password",
      submit: "Sign in",
      pending: "Signing in...",
      hint: "You'll enter the workspace after signing in.",
      error: "Sign in failed. Check your credentials.",
    },
    registerForm: {
      username: "Username",
      email: "Email",
      emailPlaceholder: "Enter email",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Re-enter password",
      submit: "Create account",
      pending: "Creating account...",
      hint: "After registration, you can sign in to the workspace.",
      error: "Registration failed. Please try again.",
      passwordMismatch: "Passwords do not match.",
    },
    trialPage: {
      eyebrow: "Request trial",
      title: "Start with one audit flow for your team.",
      description: "Tell us the model type, team role, and current risk focus. We'll use it to arrange the trial.",
    },
    trialForm: {
      successEyebrow: "Request received",
      successTitle: "We'll follow up through the contact details you shared.",
      successBody: "This page currently uses a front-end placeholder flow and can be connected to a real intake system later.",
      team: "Team",
      teamPlaceholder: "For example: Model Safety Team / Compliance Team",
      contact: "Contact",
      contactPlaceholder: "Name / Email / Chat handle",
      scenario: "Use case",
      scenarioPlaceholder: "Describe the model, the team using it, and the current risk focus.",
      submit: "Submit trial request",
    },
  },
  "zh-CN": {
    shell: {
      siteBadge: "单站工作台",
      runtimeChecking: "Runtime 检查中",
      runtimeConnected: "Runtime 已连接",
      runtimeDisconnected: "Runtime 未连接",
      desktopNavAriaLabel: "工作台导航",
      mobileNavAriaLabel: "移动端导航",
      githubTitle: "GitHub",
      signOut: "退出登录",
    },
    nav: [
      { href: "/workspace", title: "工作台", subtitle: "待办与关键指标", shortLabel: "工作台" },
      { href: "/workspace/audits", title: "审计流程", subtitle: "创建任务与查看结果", shortLabel: "审计" },
      { href: "/workspace/reports", title: "报告", subtitle: "结果汇总与导出", shortLabel: "报告" },
      { href: "/workspace/settings", title: "设置", subtitle: "团队、密钥与偏好", shortLabel: "设置" },
    ],
    workspace: {
      eyebrow: "工作台",
      title: "待办、审计结果和关键指标。",
      description: "工作台首页汇总当前任务、最近结果和系统状态。",
      kpis: {
        liveContractsLabel: "活跃合同",
        liveContractsNote: "Catalog 中可用的合同项数量。",
        defendedRowsLabel: "已防御行",
        defendedRowsNote: "包含防御对照的结果行数。",
        avgAucLabel: "平均攻击 AUC",
        avgAucNote: "所有评估行的 AUC 均值",
        defenseEvaluatedLabel: "防御评估",
        defenseEvaluatedNote: "总审计结果数",
      },
      sections: {
        tasks: "当前待办",
        recentResults: "最近结果",
        riskOverview: "风险分布",
      },
      riskInterpretations: {
        high: "成员推断信号仍然较强，建议对比防御效果。",
        medium: "存在部分信号泄露，建议增加防御策略。",
        low: "攻击接近随机猜测，隐私保护有效。",
      },
      todoItems: [
        "检查本轮审计任务的参数与数据源。",
        "查看最新 admitted 结果，确认是否需要导出报告。",
        "同步团队设置、密钥与个人偏好。",
      ],
      emptyResults: "暂无审计结果。前往审计页创建任务。",
    },
    audits: {
      eyebrow: "审计流程",
      title: "创建任务、跟踪运行、查看结果。",
      description: "审计流程页围绕合同项、任务队列和结果摘要组织。",
      sections: {
        recommendedContracts: "推荐合同项",
        runningJobs: "运行中任务",
        recentResults: "最近结果",
      },
      recommendedWorkspace: "推荐 workspace",
      createJob: "创建任务",
      updatedAt: "最近更新",
      jobsRefreshNote: "运行中任务将在页面载入后刷新。",
      jobsUnavailable: "控制面暂时不可达。网关恢复后会重新显示实时任务。",
      emptyContracts: "暂无可用合同项。检查 catalog 数据源。",
      emptyJobs: "暂无运行中任务。",
      emptyResults: "暂无审计结果。",
      filters: {
        statusAll: "全部",
        statusCompleted: "已完成",
        statusFailed: "已失败",
        statusRunning: "运行中",
        trackAll: "全部轨道",
        trackBlackBox: "黑盒/Recon",
        trackGrayBox: "灰盒/PIA",
        trackWhiteBox: "白盒/GSA",
        searchPlaceholder: "搜索合同项或任务 ID",
        activeFilters: "个筛选",
      },
    },
    reports: {
      eyebrow: "报告",
      title: "结果汇总、覆盖缺口与报告导出。",
      description: "报告页汇总审计结果、识别覆盖缺口并支持导出。",
      sections: {
        auditResults: "审计结果",
        coverageGaps: "覆盖缺口",
      },
      exportSummary: "导出报告摘要",
      emptyResults: "暂无审计结果。",
      emptyGaps: "暂无覆盖缺口数据。",
    },
    settings: {
      eyebrow: "设置",
      title: "团队、密钥和个人偏好。",
      description: "设置页管理团队成员、API 密钥和工作台偏好。",
      sections: [
        { title: "团队成员", copy: "管理团队名称、协作角色和默认工作区范围。" },
        { title: "API 密钥", copy: "集中维护服务地址、API 密钥和访问边界。" },
        { title: "工作台偏好", copy: "保存默认语言、页面偏好和报告展示方式。" },
      ],
      systemStatus: {
        title: "系统状态",
        runtime: "Runtime 连接",
        demoMode: "演示模式",
        demoOn: "开启",
        demoOff: "关闭",
      },
      auditConfig: {
        title: "审计默认配置",
        defaultRounds: "默认攻击轮次",
        defaultBatchSize: "默认 batch size",
        saved: "已保存",
      },
      account: {
        title: "账户",
        username: "当前用户",
        logout: "退出登录",
      },
      errorPage: {
        title: "出错了",
        description: "发生了意外错误。你可以重试或返回工作台。",
        retry: "重试",
        goHome: "返回工作台",
      },
      notFound: {
        title: "页面未找到",
        description: "你访问的页面不存在或已被移动。",
        goHome: "返回工作台",
      },
    },
    loginPage: {
      eyebrow: "登录",
      title: "进入 DiffAudit 工作台。",
      description: "使用账号登录，或通过 GitHub 继续。",
      formEyebrow: "工作台访问",
      formTitle: "登录后继续。",
      oauthDivider: "或使用以下方式继续",
      registerLink: "还没有账号？",
      registerCta: "创建账号",
      github: "使用 GitHub 继续",
    },
    registerPage: {
      eyebrow: "注册",
      title: "创建 DiffAudit 账号。",
      description: "注册后即可进入审计、报告和工作台设置。",
      formEyebrow: "账号创建",
      formTitle: "注册后继续。",
      oauthDivider: "或使用以下方式继续",
      loginLink: "已有账号？",
      loginCta: "去登录",
      github: "使用 GitHub 继续",
    },
    loginForm: {
      username: "账号",
      password: "密码",
      passwordPlaceholder: "输入密码",
      submit: "登录",
      pending: "登录中...",
      hint: "登录后进入工作台。",
      error: "登录失败，请检查账号信息。",
    },
    registerForm: {
      username: "账号",
      email: "邮箱",
      emailPlaceholder: "输入邮箱",
      password: "密码",
      passwordPlaceholder: "至少 8 位",
      confirmPassword: "确认密码",
      confirmPasswordPlaceholder: "再次输入密码",
      submit: "创建账号",
      pending: "创建中...",
      hint: "注册完成后即可登录工作台。",
      error: "注册失败，请稍后重试。",
      passwordMismatch: "两次输入的密码不一致。",
    },
    trialPage: {
      eyebrow: "申请试用",
      title: "从一条审计流程开始，为团队验证可行性。",
      description: "告诉我们模型类型、团队角色和当前风险关注点。我们会据此安排试用。",
    },
    trialForm: {
      successEyebrow: "申请已记录",
      successTitle: "我们会通过你留下的联系方式继续跟进。",
      successBody: "当前页面使用前端占位提交流程，后续可以直接接入真实线索系统。",
      team: "团队名称",
      teamPlaceholder: "例如：模型安全组 / 法务合规组",
      contact: "联系人",
      contactPlaceholder: "姓名 / 邮箱 / 企业微信",
      scenario: "使用场景",
      scenarioPlaceholder: "请简要描述你想审计的模型、使用团队和当前风险关注点。",
      submit: "提交试用申请",
    },
  },
};
