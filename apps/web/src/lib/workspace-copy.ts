import { type Locale } from "@/components/language-picker";
import type { WorkspaceNavKey } from "@/lib/workspace-registry";

export const WORKSPACE_COPY: Record<
  Locale,
  {
    shell: {
      siteBadge: string;
      liveMode: string;
      demoMode: string;
      runtimeChecking: string;
      runtimeConnected: string;
      runtimeDisconnected: string;
      localApiChecking: string;
      localApiConnected: string;
      localApiDisconnected: string;
      desktopNavAriaLabel: string;
      mobileNavAriaLabel: string;
      githubTitle: string;
      signOut: string;
      statusTrigger: string;
      statusTitle: string;
      statusDescription: string;
      statusDataMode: string;
      statusSnapshot: string;
      statusBuild: string;
      statusReady: string;
      statusMissing: string;
      statusUnknown: string;
      searchPlaceholder: string;
      searchShortcut: string;
      notificationTitle: string;
    };
    userMenu: {
      loggedIn: string;
      themeLabel: string;
      themeLight: string;
      themeDark: string;
      themeSystem: string;
      settings: string;
      signOut: string;
    };
    nav: Record<WorkspaceNavKey, {
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
        tableHeaders: {
          risk: string;
          attack: string;
          model: string;
          track: string;
          auc: string;
          asr: string;
          tpr: string;
        };
        noAucData: string;
        chartTitles: {
          aucDistribution: string;
          rocCurve: string;
          riskDistribution: string;
          attackComparison: string;
          riskRadar: string;
        };
        riskLabels: {
          high: string;
          medium: string;
          low: string;
        };
        radarDimensionsLabel: string;
        chartDimensions: string[];
        suggestedNextSteps: string;
        radarLabels: {
          auc: string;
          asr: string;
          tpr: string;
          coverage: string;
          defense: string;
        };
      };
      auditTracks: {
        blackBoxLabel: string; blackBoxTitle: string; blackBoxDesc: string;
        grayBoxLabel: string; grayBoxTitle: string; grayBoxDesc: string;
        whiteBoxLabel: string; whiteBoxTitle: string; whiteBoxDesc: string;
        createAudit: string;
      };
      riskBadgeLabels: { high: string; medium: string; low: string; critical: string };
      coverageBar: {
        title: string; summaryText: (defended: number, total: number, contracts: number) => string;
        tracks: Record<string, string>; trackCountSuffix: string;
      };
      suggestions: {
        highRisk: (count: number) => string;
        noDefense: string;
        mediumRisk: (count: number) => string;
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
      createTaskButton: string;
      sections: {
        activeTasks: string;
        taskHistory: string;
      };
      taskTable: {
        name: string;
        model: string;
        type: string;
        status: string;
        created: string;
        duration: string;
        action: string;
      };
      createTask: string;
      recommendedWorkspace: string;
      createJob: string;
      updatedAt: string;
      jobsRefreshNote: string;
      jobsUnavailable: string;
      emptyContracts: string;
      emptyJobs: string;
      emptyResults: string;
      emptyTasks: string;
      emptyHistory: string;
      viewDetails: string;
      viewReport: string;
      retry: string;
      retrying: string;
      retryTitle: string;
      statusLabels: Record<string, string>;
      filters: {
        groupLabel: string;
        statusGroupLabel: string;
        trackSelectLabel: string;
        searchLabel: string;
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
    createTask: {
      eyebrow: string;
      title: string;
      description: string;
      backToTasks: string;
      steps: {
        stepperLabel: string;
        step1Label: string;
        step1Title: string;
        step1Desc: string;
        step2Label: string;
        step2Title: string;
        step2Desc: string;
        step3Label: string;
        step3Title: string;
        step3Desc: string;
        step4Label: string;
        step4Title: string;
        step4Desc: string;
      };
      attackTypes: {
        blackBoxTitle: string;
        blackBoxDesc: string;
        blackBoxNote: string;
        grayBoxTitle: string;
        grayBoxDesc: string;
        grayBoxNote: string;
        whiteBoxTitle: string;
        whiteBoxDesc: string;
        whiteBoxNote: string;
      };
      labels: {
        selectModel: string;
        modelPlaceholder: string;
        rounds: string;
        batchSize: string;
        adaptiveSampling: string;
        adaptiveSamplingNote: string;
        reviewSummary: string;
        reviewAttackType: string;
        reviewModel: string;
        reviewRounds: string;
        reviewBatchSize: string;
        reviewAdaptiveSampling: string;
        reviewEstTime: string;
        adaptiveOn: string;
        adaptiveOff: string;
        estimatedSuffix: string;
        submissionFailed: string;
        submitButton: string;
        submitting: string;
        successTitle: string;
        successBody: string;
        goToTasks: string;
        disabled: string;
        availabilityReady: string;
        availabilityPartial: string;
        availabilityDisabled: string;
      };
      recommendedConfig: {
        blackBoxTitle: string; blackBoxRounds: string; blackBoxBatch: string; blackBoxAdaptive: string;
        grayBoxTitle: string; grayBoxRounds: string; grayBoxBatch: string; grayBoxAdaptive: string;
        whiteBoxTitle: string; whiteBoxRounds: string; whiteBoxBatch: string; whiteBoxAdaptive: string;
      };
    };
    jobDetail: {
      eyebrow: string; title: string; description: string;
      backToAudits: string; cancelJob: string; cancelling: string; confirmCancel: string;
      closeDialog: string;
      keepRunning: string; cancelTitle: string; cancelBody: string; nextStepsTitle: string;
      reportReadyTitle: string; reportReadyBody: string; viewReport: string;
      nextSteps: Record<"completed" | "failed" | "cancelled", string[]>;
      statusLabels: Record<string, string>;
      labels: {
        contractKey: string; workspace: string; type: string; targetModel: string;
        created: string; duration: string; updated: string; error: string;
        stdoutTail: string; stderrTail: string; lines: string;
        noLogOutput: string; jobNotFound: string; loadFailed: string; apiUnreachable: string;
        stateHistory: string; stateTimestamp: string; noStateHistory: string;
      };
    };
    emptyWorkspace: {
      title: string; description: string; cta: string;
      steps: Array<{ step: string; title: string; desc: string }>;
    };
    reports: {
      eyebrow: string;
      title: string;
      description: string;
      reportTabs: {
        results: string;
        compare: string;
      };
      compareView: {
        title: string;
        description: string;
        noDefense: string;
        defense: string;
        delta: string;
        attack: string;
        model: string;
        auc: string;
        asr: string;
        tpr: string;
        improvement: string;
        noPairs: string;
        better: string;
        worse: string;
        summaryPairs: string;
        summaryAvgChange: string;
        summaryEffective: string;
        effectiveCount: string;
        effectiveNote: string;
        effectiveYes: string;
        effectiveNo: string;
        visualization: string;
        before: string;
        after: string;
      };
      sections: {
        auditResults: string;
        coverageGaps: string;
        aucDistribution: string;
        rocCurve: string;
        riskDistribution: string;
        attackComparison: string;
        highRiskGaps: string;
      };
      exportSummary: string;
      emptyResults: string;
      emptyGaps: string;
      jobContext: {
        title: string;
        matched: (count: number) => string;
        notAdmitted: string;
        contract: string;
        model: string;
        auc: string;
        job: string;
        matchedRow: string;
      };
      chartDimensions: string[];
      tableHeaders: {
        attack: string;
        defense: string;
        model: string;
        track: string;
        evidence: string;
        qualityCost: string;
        provenance: string;
        boundary: string;
        source: string;
        auc: string;
        asr: string;
        tpr: string;
        risk: string;
        contractKey: string;
        label: string;
        systemGap: string;
        workspace: string;
      };
      metricTooltips: {
        auc: string;
        asr: string;
        tpr: string;
      };
    };
    apiKeys: {
      eyebrow: string;
      title: string;
      description: string;
      create: string;
      createTitle: string;
      keyName: string;
      keyNamePlaceholder: string;
      permissions: string;
      generate: string;
      cancel: string;
      createdTitle: string;
      createdBody: string;
      copy: string;
      copied: string;
      copyFailed: string;
      done: string;
      activeKeys: string;
      createdAt: string;
      lastUsed: string;
      revoke: string;
      active: string;
      revoked: string;
      demoNotice: string;
      demoKeyPrefix: string;
      revokeConfirmTitle: string;
      revokeConfirmBody: string;
      revokeConfirmCancel: string;
      revokeConfirmAction: string;
      usageExample: string;
    };
    settings: {
      eyebrow: string;
      title: string;
      description: string;
      sections: Array<{ title: string; copy: string }>;
      systemStatus: { title: string; runtime: string; snapshot: string; snapshotReady: string; snapshotMissing: string; build: string; unknown: string; demoMode: string; demoOn: string; demoOff: string; demoHintOn: string; demoHintOff: string };
      auditConfig: { title: string; defaultRounds: string; defaultBatchSize: string; saved: string };
      account: { title: string; username: string; email: string; pendingEmail: string; pendingEmailNote: string; addEmail: string; changeEmail: string; emailPlaceholder: string; saveEmail: string; savingEmail: string; cancelEmailEdit: string; emailSaved: string; emailInvalid: string; emailInUse: string; generateVerificationLink: string; generatingVerificationLink: string; verificationWorkspaceMode: string; verificationLinkReady: string; openVerificationLink: string; copyVerificationLink: string; showVerificationDetails: string; hideVerificationDetails: string; verificationLinkCopied: string; verificationRequestFailed: string; passwordSaveFailed: string; verificationSuccess: string; verificationMissing: string; verificationInvalid: string; verificationExpired: string; verificationMissingPending: string; providers: string; connectGoogle: string; connectGithub: string; providerLinkedGoogle: string; providerLinkedGithub: string; providerAlreadyLinkedGoogle: string; providerAlreadyLinkedGithub: string; providerInUseGoogle: string; providerInUseGithub: string; accessSummary: string; accessSummaryPrefix: string; accessSummaryPasswordOn: string; accessSummaryPasswordOff: string; accessSummaryPendingEmail: string; accessSummaryNoProvider: string; password: string; passwordManage: string; passwordSet: string; passwordUnset: string; loginId: string; loginIdPending: string; verified: string; unverified: string; noEmail: string; securityNote: string; privacy: string; terms: string; currentPassword: string; currentPasswordPlaceholder: string; currentPasswordRequired: string; currentPasswordIncorrect: string; newPassword: string; newPasswordPlaceholder: string; confirmPassword: string; confirmPasswordPlaceholder: string; passwordHintNew: string; passwordHintExisting: string; openPasswordCreate: string; openPasswordChange: string; closePasswordEditor: string; savePassword: string; savingPassword: string; passwordSaved: string; passwordMismatch: string; passwordTooShort: string; passwordRequired: string; passwordUnauthorized: string; logout: string };
      preferences: { title: string; language: string; languageNote: string; theme: string; themeLight: string; themeDark: string; themeSystem: string };
      runtimeConfig: { title: string; host: string; hostPlaceholder: string; port: string; testConnection: string; testing: string; connected: string; disconnected: string; saved: string };
      auditTemplates: { title: string; description: string; saveCurrent: string; saved: string; noTemplates: string };
      aboutSystem: { title: string; useCases: string; useCaseItems: { title: string; desc: string }[]; systemBoundary: string; boundaryNote: string; framework: string; frameworkItems: { tier: string; desc: string }[] };
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
      passwordDivider: string;
      hidePasswordCta: string;
      providerHint: string;
      registerLink: string;
      registerCta: string;
      google: string;
      github: string;
      legalPrefix: string;
      privacy: string;
      terms: string;
    };
    registerPage: {
      eyebrow: string;
      title: string;
      description: string;
      formEyebrow: string;
      formTitle: string;
      oauthDivider: string;
      passwordDivider: string;
      providerHint: string;
      loginLink: string;
      loginCta: string;
      google: string;
      github: string;
      legalPrefix: string;
      privacy: string;
      terms: string;
    };
    loginForm: {
      username: string;
      password: string;
      passwordPlaceholder: string;
      submit: string;
      pending: string;
      hint: string;
      error: string;
      oauthErrors: {
        state: string;
        config: string;
        networkGoogle: string;
        networkGithub: string;
        token: string;
        user: string;
        fallback: string;
      };
      validation: {
        usernameRequired: string;
        passwordRequired: string;
      };
    };
    registerForm: {
      username: string;
      password: string;
      passwordPlaceholder: string;
      confirmPassword: string;
      confirmPasswordPlaceholder: string;
      submit: string;
      pending: string;
      hint: string;
      error: string;
      passwordMismatch: string;
      validation: {
        usernameRequired: string;
        passwordRequired: string;
        passwordMinLength: string;
        confirmPasswordRequired: string;
      };
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
    exportButton: {
      exporting: string;
      pdf: string;
      csv: string;
    };
    liveJobsPanel: {
      justUpdated: string;
      noSummary: string;
    };
  }
> = {
  "en-US": {
    shell: {
      siteBadge: "Single-site workspace",
      liveMode: "Live data",
      demoMode: "Demo snapshot",
      runtimeChecking: "Runtime checking",
      runtimeConnected: "Runtime connected",
      runtimeDisconnected: "Runtime disconnected",
      localApiChecking: "Checking Runtime",
      localApiConnected: "Runtime OK",
      localApiDisconnected: "Runtime unreachable",
      desktopNavAriaLabel: "Workspace navigation",
      mobileNavAriaLabel: "Mobile navigation",
      githubTitle: "GitHub",
      signOut: "Sign out",
      statusTrigger: "Workspace status",
      statusTitle: "Workspace status",
      statusDescription: "Current data mode, snapshot availability, and deployed build.",
      statusDataMode: "Data mode",
      statusSnapshot: "Snapshot bundle",
      statusBuild: "Build revision",
      statusReady: "Ready",
      statusMissing: "Missing",
      statusUnknown: "Unknown",
      searchPlaceholder: "Search models, tasks, reports...",
      searchShortcut: "⌘ K",
      notificationTitle: "Notifications",
    },
    userMenu: {
      loggedIn: "Signed in",
      themeLabel: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
      settings: "Settings",
      signOut: "Sign out",
    },
    nav: {
      workspace: { title: "Workspace", subtitle: "Tasks and metrics overview", shortLabel: "Home" },
      audits: { title: "Audit Tasks", subtitle: "Create, run, and review jobs", shortLabel: "Tasks" },
      modelAssets: { title: "Model Assets", subtitle: "Targets, datasets, and versions", shortLabel: "Assets" },
      riskFindings: { title: "Risk Findings", subtitle: "Evidence, gaps, and remediation", shortLabel: "Risks" },
      reportCenter: { title: "Report Center", subtitle: "Summaries, exports, and sharing", shortLabel: "Reports" },
      apiKeys: { title: "API Management", subtitle: "Issue and revoke access keys", shortLabel: "API" },
      account: { title: "Personal Account", subtitle: "Profile and sign-in settings", shortLabel: "Account" },
    },
    workspace: {
      eyebrow: "Workspace",
      title: "See what your model is leaking.",
      description: "Your workspace aggregates current audit tasks, recent results, and system status at a glance.",
      kpis: {
        liveContractsLabel: "Auditable contracts",
        liveContractsNote: "Number of audit contracts currently available.",
        defendedRowsLabel: "Defended results",
        defendedRowsNote: "Result rows with defense comparisons included.",
        avgAucLabel: "Avg. attack AUC",
        avgAucNote: "Mean attack AUC across all audit results — higher means greater leakage risk.",
        defenseEvaluatedLabel: "Defenses evaluated",
        defenseEvaluatedNote: "Total number of completed audit results.",
      },
      sections: {
        tasks: "Active tasks",
        recentResults: "Recent results",
        riskOverview: "Risk distribution",
        tableHeaders: {
          risk: "Risk",
          attack: "Attack",
          model: "Model",
          track: "Track",
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR",
        },
        noAucData: "No AUC data available",
        chartTitles: {
          aucDistribution: "AUC Distribution",
          rocCurve: "ROC Curve",
          riskDistribution: "Risk Distribution",
          attackComparison: "Attack Comparison",
          riskRadar: "Risk Radar",
        },
        riskLabels: {
          high: "High risk",
          medium: "Medium risk",
          low: "Low risk",
        },
        radarDimensionsLabel: "dimensions",
        chartDimensions: ["Detection Rate", "Stealth", "Coverage", "Reproducibility", "Speed"],
        suggestedNextSteps: "Suggested next steps",
        radarLabels: {
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR",
          coverage: "Coverage",
          defense: "Defense",
        },
      },
      auditTracks: {
        blackBoxLabel: "Black-box", blackBoxTitle: "Recon Member Inference Audit", blackBoxDesc: "Lowest privilege: reconstructs training data features from just 100 public samples. Suitable for initial risk screening before model deployment.",
        grayBoxLabel: "Gray-box", grayBoxTitle: "PIA Privacy Attack Audit", grayBoxDesc: "Partial access: model API available. Baseline AUC 0.841, drops to 0.828 with stochastic-dropout defense. Quantifies risk intensity + evaluates defense effectiveness.",
        whiteBoxLabel: "White-box", whiteBoxTitle: "GSA Gradient Signature Audit", whiteBoxDesc: "Full access: model weights available. Baseline AUC 0.998, drops to 0.489 with W-1 strong defense (near random guessing). Characterizes risk upper bound + strongest defense evaluation.",
        createAudit: "Create audit",
      },
      riskBadgeLabels: { high: "High risk", medium: "Medium risk", low: "Low risk", critical: "Critical risk" },
      coverageBar: {
        title: "Audit Coverage",
        summaryText: (defended: number, total: number, contracts: number) => `${defended} / ${total} defended · ${contracts} contracts registered`,
        tracks: { "black-box": "Black-box", "gray-box": "Gray-box", "white-box": "White-box" },
        trackCountSuffix: " rows",
      },
      suggestions: {
        highRisk: (count: number) => `${count} high-risk results detected. Compare defense strategies to reduce leakage risk.`,
        noDefense: "Audit results exist but no defense comparison. Create a task with defense configuration.",
        mediumRisk: (count: number) => `${count} medium-risk results detected. Increase attack rounds for more accurate signal.`,
      },
      riskInterpretations: {
        high: "High attack AUC — the model likely memorized training data. Compare defense strategies.",
        medium: "Partial signal detected — privacy protection is not yet sufficient.",
        low: "Attack is near random guessing — current privacy measures are effective.",
      },
      todoItems: [
        "Review parameters and data sources for the current audit run.",
        "Check the latest audit results and decide whether to export a report.",
        "Update team settings, keys, and personal preferences.",
      ],
      emptyResults: "No audit results yet — create a task to get started.",
    },
    audits: {
      eyebrow: "Audits",
      title: "Create tasks, track progress, review results.",
      description: "Create new audit tasks, monitor running jobs, and review audit history.",
      createTaskButton: "Create task",
      sections: {
        activeTasks: "Running tasks",
        taskHistory: "History",
      },
      taskTable: {
        name: "Task",
        model: "Model",
        type: "Type",
        status: "Status",
        created: "Created",
        duration: "Duration",
        action: "Action",
      },
      createTask: "Create task",
      recommendedWorkspace: "Recommended workspace",
      createJob: "Create job",
      updatedAt: "Updated",
      jobsRefreshNote: "Running jobs refresh automatically after page load.",
      jobsUnavailable: "Control plane temporarily unreachable. Live jobs will return when the gateway reconnects.",
      emptyContracts: "No audit contracts available.",
      emptyJobs: "No tasks running right now.",
      emptyResults: "No audit results yet.",
      emptyTasks: "No active tasks.",
      emptyHistory: "No task history yet.",
      viewDetails: "View details",
      viewReport: "View report",
      retry: "Retry",
      retrying: "Retrying...",
      retryTitle: "Retry this job",
      statusLabels: {
        queued: "Queued",
        running: "Running",
        completed: "Completed",
        failed: "Failed",
        cancelled: "Cancelled",
      },
      filters: {
        groupLabel: "Audit filters",
        statusGroupLabel: "Filter by task status",
        trackSelectLabel: "Filter by audit track",
        searchLabel: "Search audit contracts and jobs",
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
    createTask: {
      eyebrow: "New task",
      title: "Create a new audit task.",
      description: "Choose an attack method, pick a target model, set parameters, and launch the audit.",
      backToTasks: "Back to tasks",
      steps: {
        stepperLabel: "Create audit task steps",
        step1Label: "1",
        step1Title: "Attack method",
        step1Desc: "Which attack methodology would you like to use?",
        step2Label: "2",
        step2Title: "Target model",
        step2Desc: "Select the model to audit.",
        step3Label: "3",
        step3Title: "Parameters",
        step3Desc: "Configure job parameters.",
        step4Label: "4",
        step4Title: "Review",
        step4Desc: "Confirm and submit.",
      },
      attackTypes: {
        blackBoxTitle: "Black-box / Recon",
        blackBoxDesc: "Infer membership from output scores alone — no model internals needed. Best starting point for quick risk assessment.",
        blackBoxNote: "Recommended as the starting point.",
        grayBoxTitle: "Gray-box / PIA",
        grayBoxDesc: "Launch privacy inference attacks using intermediate layer representations. Stronger signal when you can access model features.",
        grayBoxNote: "Stronger signal with intermediate feature access.",
        whiteBoxTitle: "White-box / GSA",
        whiteBoxDesc: "Full access to model weights and gradients — the most powerful attack method. Uncovers the most hidden privacy leaks.",
        whiteBoxNote: "Requires full model weights and gradient access.",
      },
      labels: {
        selectModel: "Target model",
        modelPlaceholder: "Select a model from catalog",
        rounds: "Attack rounds",
        batchSize: "Batch size",
        adaptiveSampling: "Adaptive sampling",
        adaptiveSamplingNote: "Dynamically adjust sampling strategy based on intermediate results to save compute.",
        reviewSummary: "Last chance to review before submitting.",
        reviewAttackType: "Attack method",
        reviewModel: "Target model",
        reviewRounds: "Rounds",
        reviewBatchSize: "Batch size",
        reviewAdaptiveSampling: "Adaptive sampling",
        reviewEstTime: "Estimated time",
        adaptiveOn: "On",
        adaptiveOff: "Off",
        estimatedSuffix: "(estimated)",
        submissionFailed: "Submission failed",
        submitButton: "Start audit",
        submitting: "Submitting...",
        successTitle: "Task created.",
        successBody: "Your audit job has been queued. Redirecting to the task detail.",
        goToTasks: "Go to task list",
        disabled: "Not available",
        availabilityReady: "Ready",
        availabilityPartial: "Partial",
        availabilityDisabled: "Disabled",
      },
      recommendedConfig: {
        blackBoxTitle: "Recommended: Black-box Attack",
        blackBoxRounds: "10 rounds (sufficient for stable signal)",
        blackBoxBatch: "Batch 32 (balances speed and coverage)",
        blackBoxAdaptive: "Enable adaptive sampling (skips low-confidence samples)",
        grayBoxTitle: "Recommended: Gray-box Attack",
        grayBoxRounds: "15 rounds (intermediate-layer attacks need more rounds)",
        grayBoxBatch: "Batch 16 (feature extraction is compute-heavy)",
        grayBoxAdaptive: "Enable adaptive sampling (adjusts by feature similarity)",
        whiteBoxTitle: "Recommended: White-box Attack",
        whiteBoxRounds: "20 rounds (gradient attacks need full convergence)",
        whiteBoxBatch: "Batch 8 (gradient computation is expensive)",
        whiteBoxAdaptive: "Enable adaptive sampling (adjusts by gradient magnitude)",
      },
    },
    jobDetail: {
      eyebrow: "Job Detail",
      title: "Audit Job",
      description: "View status, logs, and details for this audit job.",
      backToAudits: "Back to audits",
      cancelJob: "Cancel job",
      cancelling: "Cancelling...",
      confirmCancel: "Confirm cancel",
      closeDialog: "Close dialog",
      keepRunning: "Keep running",
      cancelTitle: "Cancel audit job",
      cancelBody: "Are you sure you want to cancel this audit job? This action cannot be undone.",
      nextStepsTitle: "Suggested next steps",
      reportReadyTitle: "Report review is ready",
      reportReadyBody: "Open the matching report track to review evidence, charts, and export options.",
      viewReport: "Open report",
      statusLabels: {
        queued: "Queued",
        running: "Running",
        completed: "Completed",
        failed: "Failed",
        cancelled: "Cancelled",
      },
      labels: {
        contractKey: "Contract key",
        workspace: "Workspace",
        type: "Type",
        targetModel: "Target model",
        created: "Created",
        duration: "Duration",
        updated: "Updated",
        error: "Error",
        stdoutTail: "stdout (tail)",
        stderrTail: "stderr (tail)",
        lines: "lines",
        noLogOutput: "No log output available for this job.",
        jobNotFound: "Job not found.",
        loadFailed: "Failed to load job",
        apiUnreachable: "Unable to reach the API.",
        stateHistory: "State history",
        stateTimestamp: "Timestamp",
        noStateHistory: "No state history available.",
      },
      nextSteps: {
        completed: [
          "Run a defense comparison experiment to see if you can reduce leakage.",
          "Create a task with a different attack method to cross-validate results.",
          "Export a PDF report to document your findings.",
        ],
        failed: [
          "Check the error log above for the root cause.",
          "Retry the task with fewer attack rounds or a smaller batch size.",
          "Verify that the Runtime service is running and accessible.",
        ],
        cancelled: [
          "Resume the audit by creating a new task with the same configuration.",
          "Consider reducing the attack rounds if you cancelled due to time constraints.",
        ],
      },
    },
    emptyWorkspace: {
      title: "No audit results yet.",
      description: "DiffAudit helps you discover privacy risks in machine learning models through three attack lines: black-box, gray-box, and white-box.",
      cta: "Create your first audit task",
      steps: [
        { step: "1", title: "Choose an attack method", desc: "Black-box (recommended starting point), gray-box, or white-box." },
        { step: "2", title: "Select target model", desc: "Pick the model to audit from the contract catalog." },
        { step: "3", title: "Wait for results", desc: "After submission, the system runs the audit automatically and displays results here." },
      ],
    },
    reports: {
      eyebrow: "Reports",
      title: "Audit results and coverage gaps.",
      description: "Aggregate audit results and identify weak spots in your model's defenses.",
      reportTabs: {
        results: "Results",
        compare: "Compare",
      },
      compareView: {
        title: "Defense Effectiveness",
        description: "Compare metrics between undefended and defended states for each attack.",
        noDefense: "Undefended",
        defense: "Defended",
        delta: "Delta",
        attack: "Attack",
        model: "Model",
        auc: "AUC",
        asr: "ASR",
        tpr: "TPR@1%",
        improvement: "Defense Effect",
        noPairs: "No defense comparison data yet. Create tasks with defense configurations to see results.",
        better: "Reduced",
        worse: "Increased",
        summaryPairs: "Comparison Pairs",
        summaryAvgChange: "Avg AUC Change",
        summaryEffective: "Effective Defense",
        effectiveCount: "AUC Reduced > 0.1",
        effectiveNote: "Defense Effective",
        effectiveYes: "Defense Effective",
        effectiveNo: "Defense Limited",
        visualization: "Visualization",
        before: "Before",
        after: "After",
      },
      sections: {
        auditResults: "Audit results",
        coverageGaps: "Coverage gaps",
        aucDistribution: "AUC Score Distribution",
        rocCurve: "ROC Curve",
        riskDistribution: "Risk Distribution",
        attackComparison: "Attack Comparison",
        highRiskGaps: "high-risk gaps (AUC >= 0.7)",
      },
      chartDimensions: ["Detection Rate", "Stealth", "Coverage", "Reproducibility", "Speed"],
      exportSummary: "Export report",
      emptyResults: "No audit results yet.",
      emptyGaps: "No coverage gap data.",
      jobContext: {
        title: "Reviewing completed job",
        matched: (count: number) => `${count} matching admitted result row${count === 1 ? "" : "s"} found in this snapshot.`,
        notAdmitted: "This completed job has not been admitted into the current public snapshot yet.",
        contract: "Contract",
        model: "Model",
        auc: "AUC",
        job: "Job",
        matchedRow: "Matched job",
      },
      tableHeaders: {
        attack: "Attack",
        defense: "Defense",
        model: "Model",
        track: "Track",
        evidence: "Evidence",
        qualityCost: "Quality / Cost",
        provenance: "Provenance",
        boundary: "Boundary",
        source: "Source Path",
        auc: "AUC",
        asr: "ASR",
        tpr: "TPR",
        risk: "Risk",
        contractKey: "Contract Key",
        label: "Label",
        systemGap: "System Gap",
        workspace: "Workspace",
      },
      metricTooltips: {
        auc: "Area Under the ROC Curve - measures membership inference attack effectiveness",
        asr: "Attack Success Rate - percentage of successful privacy attacks",
        tpr: "True Positive Rate - sensitivity of the attack at detecting members",
      },
    },
    apiKeys: {
      eyebrow: "API Management",
      title: "Issue and revoke API access keys.",
      description: "Create, scope, copy, and revoke API keys used by runners, notebooks, and integrations.",
      create: "Create new key",
      createTitle: "Create a new API key",
      keyName: "Key name",
      keyNamePlaceholder: "e.g. Production Runner, CI Pipeline",
      permissions: "Permissions",
      generate: "Generate key",
      cancel: "Cancel",
      createdTitle: "Key created successfully",
      createdBody: "Copy your key now. You will not be able to see it again.",
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Copy failed",
      done: "Done",
      activeKeys: "Active keys",
      createdAt: "Created",
      lastUsed: "Last used",
      revoke: "Revoke",
      active: "Active",
      revoked: "Revoked",
      demoNotice: "Demo-only API key preview. These keys are local examples and are not connected to backend credential issuance.",
      demoKeyPrefix: "Demo key",
      revokeConfirmTitle: "Revoke demo key?",
      revokeConfirmBody: "This only updates the local preview. It will not revoke a real credential.",
      revokeConfirmCancel: "Cancel",
      revokeConfirmAction: "Revoke demo key",
      usageExample: "API usage example",
    },
    settings: {
      eyebrow: "Settings",
      title: "Team, keys, and preferences.",
      description: "Manage team settings, runtime connection, and local preferences.",
      sections: [
        { title: "Team members", copy: "Manage team name, collaboration roles, and default workspace scope." },
        { title: "API keys", copy: "Centralize service endpoints, API keys, and access boundaries." },
        { title: "Preferences", copy: "Save default language, page preferences, and report presentation." },
      ],
      systemStatus: {
        title: "System status",
        runtime: "Runtime connection",
        snapshot: "Snapshot bundle",
        snapshotReady: "Ready",
        snapshotMissing: "Missing",
        build: "Build revision",
        unknown: "Unknown",
        demoMode: "Demo mode",
        demoOn: "On",
        demoOff: "Off",
        demoHintOn: "Using snapshot contracts, jobs, and reports across the workspace.",
        demoHintOff: "Using live Runtime and API responses instead of snapshot data.",
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
        email: "Email",
        pendingEmail: "Pending email",
        pendingEmailNote: "Pending email stays out of password sign-in until it is verified.",
        addEmail: "Add email",
        changeEmail: "Change email",
        emailPlaceholder: "name@example.com",
        saveEmail: "Save email",
        savingEmail: "Saving email...",
        cancelEmailEdit: "Cancel",
        emailSaved: "Email saved. Continue verification to use it as a password login ID.",
        emailInvalid: "Enter a valid email address.",
        emailInUse: "This email is already in use.",
        generateVerificationLink: "Generate verification link",
        generatingVerificationLink: "Generating link...",
        verificationWorkspaceMode: "Until email delivery is connected, verification continues inside this workspace.",
        verificationLinkReady: "Verification link ready. Open it in a new tab or copy it.",
        openVerificationLink: "Open link",
        copyVerificationLink: "Copy link",
        showVerificationDetails: "Advanced options",
        hideVerificationDetails: "Hide advanced options",
        verificationLinkCopied: "Verification link copied.",
        verificationRequestFailed: "Could not generate a verification link right now.",
        passwordSaveFailed: "Could not save your password. Please try again.",
        verificationSuccess: "Email verified. This address is now your canonical sign-in email.",
        verificationMissing: "Verification link is missing a token.",
        verificationInvalid: "Verification link is invalid.",
        verificationExpired: "Verification link expired. Generate a new one.",
        verificationMissingPending: "This verification link no longer matches the pending email on your account.",
        providers: "Connected sign-in methods",
        connectGoogle: "Connect Google",
        connectGithub: "Connect GitHub",
        providerLinkedGoogle: "Google is now connected to this account.",
        providerLinkedGithub: "GitHub is now connected to this account.",
        providerAlreadyLinkedGoogle: "Google was already connected to this account.",
        providerAlreadyLinkedGithub: "GitHub was already connected to this account.",
        providerInUseGoogle: "This Google account is already linked to another user.",
        providerInUseGithub: "This GitHub account is already linked to another user.",
        accessSummary: "Account access",
        accessSummaryPrefix: "You can currently sign in with",
        accessSummaryPasswordOn: "Password sign-in is enabled.",
        accessSummaryPasswordOff: "Password sign-in is not enabled yet.",
        accessSummaryPendingEmail: "Verify the pending email to use it as a password login ID.",
        accessSummaryNoProvider: "No OAuth providers are connected yet.",
        password: "Password access",
        passwordManage: "Password management",
        passwordSet: "Configured",
        passwordUnset: "Not configured",
        loginId: "Password login ID",
        loginIdPending: "Set a local password to use this ID.",
        verified: "Verified",
        unverified: "Unverified",
        noEmail: "Not set",
        securityNote: "Google and GitHub only read name, email, and avatar for account creation and sign-in.",
        privacy: "Privacy policy",
        terms: "Terms",
        currentPassword: "Current password",
        currentPasswordPlaceholder: "Enter current password",
        currentPasswordRequired: "Enter your current password.",
        currentPasswordIncorrect: "Current password is incorrect.",
        newPassword: "New password",
        newPasswordPlaceholder: "At least 8 characters",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "Re-enter new password",
        passwordHintNew: "Add a local password only if you need username/email + password access.",
        passwordHintExisting: "You already have password access. Update it here if you need to rotate credentials.",
        openPasswordCreate: "Add local password",
        openPasswordChange: "Change password",
        closePasswordEditor: "Hide password form",
        savePassword: "Save password",
        savingPassword: "Saving...",
        passwordSaved: "Password updated",
        passwordMismatch: "Passwords do not match.",
        passwordTooShort: "Password must be at least 8 characters.",
        passwordRequired: "Password and confirmation are required.",
        passwordUnauthorized: "Sign in again before changing your password.",
        logout: "Sign out",
      },
      preferences: {
        title: "Preferences",
        language: "Language",
        languageNote: "Choose your preferred display language.",
        theme: "Theme",
        themeLight: "Light",
        themeDark: "Dark",
        themeSystem: "System",
      },
      runtimeConfig: {
        title: "Runtime Connection",
        host: "Host",
        hostPlaceholder: "http://127.0.0.1",
        port: "Port",
        testConnection: "Test",
        testing: "Testing...",
        connected: "Connected",
        disconnected: "Disconnected",
        saved: "Saved",
      },
      auditTemplates: {
        title: "Audit Templates",
        description: "Save your frequently-used parameters as templates for quick task creation.",
        saveCurrent: "Save current defaults as template",
        saved: "Saved",
        noTemplates: "No saved templates yet.",
      },
      aboutSystem: {
        title: "About the System",
        useCases: "Use Cases",
        useCaseItems: [
          { title: "Pre-deployment privacy assessment", desc: "Audit diffusion models before production launch to identify member inference risks." },
          { title: "Data compliance review", desc: "Provide quantitative evidence (AUC/ASR/TPR) for privacy audits and regulatory reviews." },
          { title: "Enterprise model governance", desc: "Quantify privacy risk across different access levels (black-box / gray-box / white-box)." },
          { title: "Defense effectiveness evaluation", desc: "Compare attack success rates with and without defenses to measure mitigation impact." },
        ],
        systemBoundary: "System Boundary",
        boundaryNote: "DiffAudit is a privacy risk audit platform, not a defense system. It discovers, quantifies, and visualizes risks — it does not eliminate them.",
        framework: "Three-tier Audit Framework",
        frameworkItems: [
          { tier: "Black-box", desc: "Lowest privilege — detects whether membership privacy leakage exists." },
          { tier: "Gray-box", desc: "Partial access — quantifies risk intensity and evaluates defense effectiveness." },
          { tier: "White-box", desc: "Full access — characterizes risk upper bound and evaluates strongest defenses." },
        ],
      },
      errorPage: {
        title: "Something went wrong",
        description: "An unexpected error occurred. Please retry or return to the workspace.",
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
      title: "Sign in to the DiffAudit workspace",
      description: "Use your account and password by default. You can also continue with Google or GitHub.",
      formEyebrow: "Workspace access",
      formTitle: "Sign in to continue",
      oauthDivider: "Or continue with",
      passwordDivider: "Use account and password",
      hidePasswordCta: "Switch back to OAuth",
      providerHint: "Google and GitHub only read your name, email, and avatar for account access.",
      registerLink: "Need a local account?",
      registerCta: "Create one",
      google: "Google",
      github: "Continue with GitHub",
      legalPrefix: "By continuing, you agree to the",
      privacy: "Privacy Policy",
      terms: "Terms",
    },
    registerPage: {
      eyebrow: "Local account",
      title: "Create a local account",
      description: "Use this page only when you explicitly need an independent local account/password entry. It fits recovery access, controlled demos, or environments without OAuth.",
      formEyebrow: "Local account setup",
      formTitle: "Create a DiffAudit account",
      oauthDivider: "Prefer OAuth?",
      passwordDivider: "Or create a local account",
      providerHint: "If you want Google or GitHub, go back to the main sign-in page.",
      loginLink: "Already have an account?",
      loginCta: "Sign in",
      google: "Google",
      github: "GitHub",
      legalPrefix: "Account access is governed by the",
      privacy: "Privacy Policy",
      terms: "Terms",
    },
    loginForm: {
      username: "Username or email",
      password: "Password",
      passwordPlaceholder: "Enter password",
      submit: "Sign in",
      pending: "Signing in...",
      hint: "You can sign in with either your username or your email.",
      error: "Sign in failed. Check your credentials.",
      oauthErrors: {
        state: "Your sign-in session expired. Please try again.",
        config: "OAuth sign-in is not configured right now.",
        networkGoogle: "Google sign-in is temporarily unavailable. Please try again.",
        networkGithub: "GitHub sign-in is temporarily unavailable. Please try again.",
        token: "The identity provider did not return a usable sign-in token.",
        user: "We could not read your account details from the identity provider.",
        fallback: "OAuth sign-in failed. Please try again.",
      },
      validation: {
        usernameRequired: "Username is required",
        passwordRequired: "Password is required",
      },
    },
    registerForm: {
      username: "Username",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Re-enter password",
      submit: "Create local account",
      pending: "Creating account...",
      hint: "This creates a local account and signs you into the workspace directly.",
      error: "Registration failed. Please try again.",
      passwordMismatch: "Passwords do not match.",
      validation: {
        usernameRequired: "Username is required",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 8 characters",
        confirmPasswordRequired: "Please confirm your password",
      },
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
    exportButton: {
      exporting: "Exporting...",
      pdf: "Export as PDF",
      csv: "Export as CSV",
    },
    liveJobsPanel: {
      justUpdated: "Just updated",
      noSummary: "Summary path will appear after the run completes.",
    },
  },
  "zh-CN": {
    shell: {
      siteBadge: "单站工作台",
      liveMode: "实时数据",
      demoMode: "演示快照",
      runtimeChecking: "Runtime 检查中",
      runtimeConnected: "Runtime 已连接",
      runtimeDisconnected: "Runtime 未连接",
      localApiChecking: "检查 Runtime",
      localApiConnected: "Runtime 正常",
      localApiDisconnected: "Runtime 无法访问",
      desktopNavAriaLabel: "工作台导航",
      mobileNavAriaLabel: "移动端导航",
      githubTitle: "GitHub",
      signOut: "退出登录",
      statusTrigger: "工作台状态",
      statusTitle: "工作台状态",
      statusDescription: "当前数据模式、快照可用性和部署构建版本。",
      statusDataMode: "数据模式",
      statusSnapshot: "快照数据包",
      statusBuild: "构建版本",
      statusReady: "已就绪",
      statusMissing: "缺失",
      statusUnknown: "未知",
      searchPlaceholder: "搜索模型、任务、报告...",
      searchShortcut: "⌘ K",
      notificationTitle: "通知",
    },
    userMenu: {
      loggedIn: "已登录",
      themeLabel: "主题",
      themeLight: "浅色",
      themeDark: "深色",
      themeSystem: "跟随系统",
      settings: "设置",
      signOut: "退出登录",
    },
    nav: {
      workspace: { title: "工作台", subtitle: "任务和指标概览", shortLabel: "工作台" },
      audits: { title: "审计任务", subtitle: "创建、运行与查看任务", shortLabel: "任务" },
      modelAssets: { title: "模型资产", subtitle: "目标、数据集与版本", shortLabel: "资产" },
      riskFindings: { title: "风险发现", subtitle: "证据、缺口与修复建议", shortLabel: "风险" },
      reportCenter: { title: "报告中心", subtitle: "报告汇总、导出与分享", shortLabel: "报告" },
      apiKeys: { title: "API 管理", subtitle: "分发与吊销访问密钥", shortLabel: "API" },
      account: { title: "个人账户设置", subtitle: "资料与登录方式", shortLabel: "账户" },
    },
    workspace: {
      eyebrow: "工作台",
      title: "看看你的模型泄露了什么。",
      description: "这里汇总了当前正在运行的审计任务、最近的审计结果，以及系统的连接状态。",
      kpis: {
        liveContractsLabel: "可审计合同",
        liveContractsNote: "当前可用的审计合同数。",
        defendedRowsLabel: "已防御结果",
        defendedRowsNote: "包含防御对照的审计结果行数。",
        avgAucLabel: "平均攻击 AUC",
        avgAucNote: "所有审计结果的攻击 AUC 均值，越高说明泄露风险越大。",
        defenseEvaluatedLabel: "已评估防御",
        defenseEvaluatedNote: "已完成审计的结果总数。",
      },
      sections: {
        tasks: "当前任务",
        recentResults: "最近结果",
        riskOverview: "风险分布",
        tableHeaders: {
          risk: "风险",
          attack: "攻击方法",
          model: "目标模型",
          track: "攻击线",
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR",
        },
        noAucData: "暂无 AUC 数据",
        chartTitles: {
          aucDistribution: "AUC 分布",
          rocCurve: "ROC 曲线",
          riskDistribution: "风险分布",
          attackComparison: "攻击对比",
          riskRadar: "风险雷达",
        },
        riskLabels: {
          high: "高风险",
          medium: "中风险",
          low: "低风险",
        },
        radarDimensionsLabel: "维度",
        chartDimensions: ["检测率", "隐蔽性", "覆盖范围", "可复现性", "速度"],
        suggestedNextSteps: "建议的下一步",
        radarLabels: {
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR",
          coverage: "覆盖率",
          defense: "防御效果",
        },
      },
      auditTracks: {
        blackBoxLabel: "黑盒", blackBoxTitle: "Recon 成员推断审计", blackBoxDesc: "最低权限：仅需 100 个公开样本即可重建训练数据特征。适用于模型上线前的初步风险筛查。",
        grayBoxLabel: "灰盒", grayBoxTitle: "PIA 隐私攻击审计", grayBoxDesc: "部分权限：可访问模型 API。基线 AUC 0.841，stochastic-dropout 防御后降至 0.828。量化风险强度 + 评估防御效果。",
        whiteBoxLabel: "白盒", whiteBoxTitle: "GSA 梯度签名审计", whiteBoxDesc: "完全权限：模型权重全访问。基线 AUC 0.998，W-1 强防御后降至 0.489（接近瞎猜）。刻画风险上界 + 最强防御评估。",
        createAudit: "创建审计",
      },
      riskBadgeLabels: { high: "高风险", medium: "中风险", low: "低风险", critical: "极高风险" },
      coverageBar: {
        title: "审计覆盖度",
        summaryText: (defended: number, total: number, contracts: number) => `${defended} / ${total} 条已防御 · ${contracts} 个合约已注册`,
        tracks: { "black-box": "黑盒", "gray-box": "灰盒", "white-box": "白盒" },
        trackCountSuffix: " 条",
      },
      suggestions: {
        highRisk: (count: number) => `有 ${count} 个高风险结果，建议对比防御策略降低泄露风险。`,
        noDefense: "已有审计结果但缺少防御对比，建议创建带防御配置的审计任务。",
        mediumRisk: (count: number) => `${count} 个中等风险结果，建议增加攻击轮次获取更准确的信号。`,
      },
      riskInterpretations: {
        high: "攻击 AUC 很高，模型很可能记住了训练数据。建议对比不同防御策略的效果。",
        medium: "检测到部分信号泄露，说明隐私保护还不够充分。",
        low: "攻击接近随机猜测，当前的隐私保护机制有效。",
      },
      todoItems: [
        "检查本轮审计任务的参数和数据源。",
        "查看最新的审计结果，确认是否需要导出报告。",
        "更新团队设置、密钥和个人偏好。",
      ],
      emptyResults: "还没有审计结果，去创建一个任务试试。",
    },
    audits: {
      eyebrow: "审计流程",
      title: "创建任务，跟踪进度，查看结果。",
      description: "在这里创建新的审计任务，监控运行中的任务，查看历史审计记录。",
      createTaskButton: "创建任务",
      sections: {
        activeTasks: "运行中的任务",
        taskHistory: "历史任务",
      },
      taskTable: {
        name: "任务",
        model: "模型",
        type: "类型",
        status: "状态",
        created: "创建时间",
        duration: "耗时",
        action: "操作",
      },
      createTask: "创建任务",
      recommendedWorkspace: "推荐 workspace",
      createJob: "创建任务",
      updatedAt: "最近更新",
      jobsRefreshNote: "运行中的任务会在页面载入后自动刷新。",
      jobsUnavailable: "控制面暂时不可达。网关恢复后会重新显示实时任务。",
      emptyContracts: "暂无可用的审计合同项。",
      emptyJobs: "当前没有运行中的任务。",
      emptyResults: "还没有审计结果。",
      emptyTasks: "当前没有活跃任务。",
      emptyHistory: "还没有历史任务。",
      viewDetails: "查看详情",
      viewReport: "查看报告",
      retry: "重试",
      retrying: "重试中...",
      retryTitle: "重试此任务",
      statusLabels: {
        queued: "排队中",
        running: "运行中",
        completed: "已完成",
        failed: "失败",
        cancelled: "已取消",
      },
      filters: {
        groupLabel: "审计筛选",
        statusGroupLabel: "按任务状态筛选",
        trackSelectLabel: "按审计轨道筛选",
        searchLabel: "搜索审计合约和任务",
        statusAll: "全部",
        statusCompleted: "已完成",
        statusFailed: "失败",
        statusRunning: "运行中",
        trackAll: "全部轨道",
        trackBlackBox: "黑盒/Recon",
        trackGrayBox: "灰盒/PIA",
        trackWhiteBox: "白盒/GSA",
        searchPlaceholder: "搜索合同项或任务 ID",
        activeFilters: "个筛选",
      },
    },
    createTask: {
      eyebrow: "新建任务",
      title: "创建一个新的审计任务。",
      description: "选择攻击方式、目标模型，设置参数后启动审计。",
      backToTasks: "返回任务列表",
      steps: {
        stepperLabel: "创建审计任务步骤",
        step1Label: "1",
        step1Title: "攻击方式",
        step1Desc: "你想用哪种攻击方法来审计？",
        step2Label: "2",
        step2Title: "目标模型",
        step2Desc: "选择要审计的模型。",
        step3Label: "3",
        step3Title: "参数设置",
        step3Desc: "设置任务的运行参数。",
        step4Label: "4",
        step4Title: "确认提交",
        step4Desc: "确认配置无误后提交任务。",
      },
      attackTypes: {
        blackBoxTitle: "黑盒 / Recon",
        blackBoxDesc: "通过输出分数反推模型是否记住了某条数据。不需要任何模型内部信息，最适合快速评估。",
        blackBoxNote: "推荐作为首次评估的起点。",
        grayBoxTitle: "灰盒 / PIA",
        grayBoxDesc: "利用模型中间层的表示信息发起攻击。如果你能拿到中间特征，效果会更好。",
        grayBoxNote: "可获取中间特征时信号更强。",
        whiteBoxTitle: "白盒 / GSA",
        whiteBoxDesc: "完全访问模型权重和梯度，是最强的攻击方式。能发现最隐蔽的隐私泄露。",
        whiteBoxNote: "需要完整的模型权重和梯度信息。",
      },
      labels: {
        selectModel: "目标模型",
        modelPlaceholder: "从目录中选择模型",
        rounds: "攻击轮次",
        batchSize: "批次大小",
        adaptiveSampling: "自适应采样",
        adaptiveSamplingNote: "根据中间结果动态调整采样策略，节省计算资源。",
        reviewSummary: "提交前最后确认一下配置。",
        reviewAttackType: "攻击方式",
        reviewModel: "目标模型",
        reviewRounds: "轮次",
        reviewBatchSize: "批次大小",
        reviewAdaptiveSampling: "自适应采样",
        reviewEstTime: "预计耗时",
        adaptiveOn: "开",
        adaptiveOff: "关",
        estimatedSuffix: "（预估）",
        submissionFailed: "提交失败",
        submitButton: "开始审计",
        submitting: "提交中...",
        successTitle: "任务已创建。",
        successBody: "审计任务已加入队列，正在跳转到任务详情。",
        goToTasks: "前往任务列表",
        disabled: "暂不可用",
        availabilityReady: "就绪",
        availabilityPartial: "部分可用",
        availabilityDisabled: "已禁用",
      },
      recommendedConfig: {
        blackBoxTitle: "黑盒攻击推荐配置",
        blackBoxRounds: "10 轮（足够获取稳定信号）",
        blackBoxBatch: "批量 32（平衡速度和覆盖率）",
        blackBoxAdaptive: "开启自适应采样（自动跳过低置信度样本）",
        grayBoxTitle: "灰盒攻击推荐配置",
        grayBoxRounds: "15 轮（中间层攻击需要更多轮次）",
        grayBoxBatch: "批量 16（特征提取计算量较大）",
        grayBoxAdaptive: "开启自适应采样（根据特征相似度动态调整）",
        whiteBoxTitle: "白盒攻击推荐配置",
        whiteBoxRounds: "20 轮（梯度攻击需要充分收敛）",
        whiteBoxBatch: "批量 8（梯度计算开销大）",
        whiteBoxAdaptive: "开启自适应采样（根据梯度幅值调整采样）",
      },
    },
    jobDetail: {
      eyebrow: "任务详情",
      title: "审计任务",
      description: "查看任务状态、运行日志和详细信息。",
      backToAudits: "返回任务列表",
      cancelJob: "取消任务",
      cancelling: "取消中...",
      confirmCancel: "确认取消",
      closeDialog: "关闭对话框",
      keepRunning: "继续运行",
      cancelTitle: "取消审计任务",
      cancelBody: "确定要取消这个审计任务吗？此操作不可撤销。",
      nextStepsTitle: "建议的下一步",
      reportReadyTitle: "报告审阅已就绪",
      reportReadyBody: "打开对应报告轨道，查看证据、图表和导出选项。",
      viewReport: "打开报告",
      statusLabels: {
        queued: "排队中",
        running: "运行中",
        completed: "已完成",
        failed: "失败",
        cancelled: "已取消",
      },
      labels: {
        contractKey: "合约标识",
        workspace: "工作区",
        type: "任务类型",
        targetModel: "目标模型",
        created: "创建时间",
        duration: "耗时",
        updated: "更新时间",
        error: "错误信息",
        stdoutTail: "标准输出 (尾部)",
        stderrTail: "标准错误 (尾部)",
        lines: "行",
        noLogOutput: "该任务暂无日志输出。",
        jobNotFound: "任务不存在。",
        loadFailed: "加载任务失败",
        apiUnreachable: "无法连接到 API 服务。",
        stateHistory: "状态变更历史",
        stateTimestamp: "时间戳",
        noStateHistory: "暂无状态变更记录。",
      },
      nextSteps: {
        completed: [
          "运行防御对照实验，看看是否能降低泄露风险。",
          "用不同的攻击方式创建一个新任务，交叉验证结果。",
          "导出 PDF 报告，记录你的审计发现。",
        ],
        failed: [
          "检查上面的错误日志，确认失败原因。",
          "减少攻击轮次或缩小批次大小后重试。",
          "确认 Runtime 服务正在运行且可以访问。",
        ],
        cancelled: [
          "用相同的配置重新创建审计任务。",
          "如果是因为时间原因取消的，可以考虑减少攻击轮次。",
        ],
      },
    },
    emptyWorkspace: {
      title: "还没有审计结果。",
      description: "DiffAudit 通过三条攻击线（黑盒、灰盒、白盒）帮助你发现机器学习模型中的隐私风险。",
      cta: "创建第一个审计任务",
      steps: [
        { step: "1", title: "选择攻击方式", desc: "黑盒（推荐起点）、灰盒或白盒。" },
        { step: "2", title: "选择目标模型", desc: "从合同目录中挑选要审计的模型。" },
        { step: "3", title: "等待结果", desc: "提交后系统会自动运行审计，完成后在这里展示。" },
      ],
    },
    reports: {
      eyebrow: "报告",
      title: "审计结果和覆盖缺口。",
      description: "这里汇总了所有审计结果，帮你发现模型防御的薄弱环节。",
      reportTabs: {
        results: "审计结果",
        compare: "对比分析",
      },
      compareView: {
        title: "防御效果对比",
        description: "对比同一攻击类型在无防御和有防御状态下的指标差异。",
        noDefense: "无防御",
        defense: "有防御",
        delta: "变化",
        attack: "攻击类型",
        model: "模型",
        auc: "AUC",
        asr: "ASR",
        tpr: "TPR@1%",
        improvement: "防御效果",
        noPairs: "暂无可对比的防御数据。创建带防御配置的任务后会自动显示对比结果。",
        better: "降低",
        worse: "升高",
        summaryPairs: "对比组数",
        summaryAvgChange: "AUC 平均变化",
        summaryEffective: "有效防御",
        effectiveCount: "AUC 降低 > 0.1",
        effectiveNote: "防御有效",
        effectiveYes: "防御有效",
        effectiveNo: "防御效果有限",
        visualization: "可视化",
        before: "防御前",
        after: "防御后",
      },
      sections: {
        auditResults: "审计结果",
        coverageGaps: "覆盖缺口",
        aucDistribution: "AUC 分数分布",
        rocCurve: "ROC 曲线",
        riskDistribution: "风险分布",
        attackComparison: "攻击效果对比",
        highRiskGaps: "个高风险缺口 (AUC >= 0.7)",
      },
      chartDimensions: ["检测率", "隐蔽性", "覆盖范围", "可复现性", "速度"],
      exportSummary: "导出报告",
      emptyResults: "还没有审计结果。",
      emptyGaps: "暂无覆盖缺口数据。",
      jobContext: {
        title: "正在审阅已完成任务",
        matched: (count: number) => `当前快照中找到 ${count} 条匹配的 admitted 结果行。`,
        notAdmitted: "这个已完成任务尚未进入当前公开快照。",
        contract: "合约",
        model: "模型",
        auc: "AUC",
        job: "任务",
        matchedRow: "匹配任务",
      },
      tableHeaders: {
        attack: "攻击方法",
        defense: "防御方法",
        model: "目标模型",
        track: "攻击线",
        evidence: "证据等级",
        qualityCost: "质量 / 成本",
        provenance: "溯源状态",
        boundary: "证据边界",
        source: "来源路径",
        auc: "AUC",
        asr: "ASR",
        tpr: "TPR",
        risk: "风险等级",
        contractKey: "合约标识",
        label: "名称",
        systemGap: "系统缺口",
        workspace: "工作区",
      },
      metricTooltips: {
        auc: "ROC 曲线下面积 - 衡量成员推断攻击的有效性",
        asr: "攻击成功率 - 隐私攻击成功的百分比",
        tpr: "真阳性率 - 攻击检测成员的灵敏度",
      },
    },
    apiKeys: {
      eyebrow: "API 管理",
      title: "分发与吊销 API 访问密钥。",
      description: "为 Runner、Notebook 和集成系统创建、授权、复制和吊销 API 密钥。",
      create: "创建新密钥",
      createTitle: "创建新的 API 密钥",
      keyName: "密钥名称",
      keyNamePlaceholder: "例如：生产 Runner、CI 流水线",
      permissions: "权限范围",
      generate: "生成密钥",
      cancel: "取消",
      createdTitle: "密钥已创建",
      createdBody: "请立即复制这串密钥。离开当前提示后将无法再次看到完整内容。",
      copy: "复制",
      copied: "已复制",
      copyFailed: "复制失败",
      done: "完成",
      activeKeys: "启用中的密钥",
      createdAt: "创建于",
      lastUsed: "最近使用",
      revoke: "吊销",
      active: "启用",
      revoked: "已吊销",
      demoNotice: "当前是 API 密钥演示预览。这些密钥只是本地示例，不会连接后端凭证签发。",
      demoKeyPrefix: "演示密钥",
      revokeConfirmTitle: "吊销演示密钥？",
      revokeConfirmBody: "这个操作只会更新本地预览，不会吊销真实凭证。",
      revokeConfirmCancel: "取消",
      revokeConfirmAction: "吊销演示密钥",
      usageExample: "API 调用示例",
    },
    settings: {
      eyebrow: "设置",
      title: "团队、密钥和个人偏好。",
      description: "管理团队设置、运行时连接和本地偏好。",
      sections: [
        { title: "团队成员", copy: "管理团队名称、协作角色和默认工作区范围。" },
        { title: "API 密钥", copy: "集中维护服务地址、API 密钥和访问边界。" },
        { title: "工作台偏好", copy: "保存默认语言、页面偏好和报告展示方式。" },
      ],
      systemStatus: {
        title: "系统状态",
        runtime: "Runtime 连接",
        snapshot: "快照数据包",
        snapshotReady: "已就绪",
        snapshotMissing: "缺失",
        build: "构建版本",
        unknown: "未知",
        demoMode: "演示模式",
        demoOn: "开启",
        demoOff: "关闭",
        demoHintOn: "当前工作台统一使用演示快照：合同、任务、报告都会显示模拟数据。",
        demoHintOff: "当前使用实时 Runtime / API 数据，不再显示演示快照。",
      },
      auditConfig: {
        title: "审计默认值",
        defaultRounds: "默认攻击轮次",
        defaultBatchSize: "默认批次大小",
        saved: "已保存",
      },
      account: {
        title: "账户",
        username: "当前用户",
        email: "邮箱",
        pendingEmail: "待确认邮箱",
        pendingEmailNote: "待确认邮箱在验证完成前不会进入密码登录标识。",
        addEmail: "添加邮箱",
        changeEmail: "修改邮箱",
        emailPlaceholder: "name@example.com",
        saveEmail: "保存邮箱",
        savingEmail: "保存中...",
        cancelEmailEdit: "取消",
        emailSaved: "邮箱已保存。完成验证后即可把它作为密码登录标识使用。",
        emailInvalid: "请输入有效的邮箱地址。",
        emailInUse: "这个邮箱已被占用。",
        generateVerificationLink: "生成验证链接",
        generatingVerificationLink: "生成中...",
        verificationWorkspaceMode: "在邮件通道接入前，邮箱验证会先在当前工作区内完成。",
        verificationLinkReady: "验证链接已生成。你可以直接打开，或复制后在新标签页完成验证。",
        openVerificationLink: "打开链接",
        copyVerificationLink: "复制链接",
        showVerificationDetails: "高级操作",
        hideVerificationDetails: "收起高级操作",
        verificationLinkCopied: "验证链接已复制。",
        verificationRequestFailed: "暂时无法生成验证链接。",
        passwordSaveFailed: "无法保存密码，请重试。",
        verificationSuccess: "邮箱已验证，现已成为你的正式登录邮箱。",
        verificationMissing: "验证链接缺少必要参数。",
        verificationInvalid: "验证链接无效。",
        verificationExpired: "验证链接已过期，请重新生成。",
        verificationMissingPending: "这个验证链接已不再匹配你当前账户上的待确认邮箱。",
        providers: "已连接登录方式",
        connectGoogle: "绑定 Google",
        connectGithub: "绑定 GitHub",
        providerLinkedGoogle: "Google 已绑定到当前账户。",
        providerLinkedGithub: "GitHub 已绑定到当前账户。",
        providerAlreadyLinkedGoogle: "Google 已经绑定在当前账户上。",
        providerAlreadyLinkedGithub: "GitHub 已经绑定在当前账户上。",
        providerInUseGoogle: "这个 Google 账号已绑定到其他用户。",
        providerInUseGithub: "这个 GitHub 账号已绑定到其他用户。",
        accessSummary: "访问方式概览",
        accessSummaryPrefix: "你当前可以通过以下方式登录：",
        accessSummaryPasswordOn: "密码登录已启用。",
        accessSummaryPasswordOff: "密码登录尚未启用。",
        accessSummaryPendingEmail: "待确认邮箱验证完成后，才能作为密码登录标识使用。",
        accessSummaryNoProvider: "还没有连接 OAuth 登录方式。",
        password: "密码访问",
        passwordManage: "密码管理",
        passwordSet: "已配置",
        passwordUnset: "未配置",
        loginId: "密码登录标识",
        loginIdPending: "设置本地密码后即可使用这些标识登录。",
        verified: "已验证",
        unverified: "未验证",
        noEmail: "未设置",
        securityNote: "Google 和 GitHub 仅会读取名称、邮箱和头像，用于建号与登录。",
        privacy: "隐私政策",
        terms: "服务条款",
        currentPassword: "当前密码",
        currentPasswordPlaceholder: "输入当前密码",
        currentPasswordRequired: "请输入当前密码。",
        currentPasswordIncorrect: "当前密码不正确。",
        newPassword: "新密码",
        newPasswordPlaceholder: "至少 8 位",
        confirmPassword: "确认新密码",
        confirmPasswordPlaceholder: "再次输入新密码",
        passwordHintNew: "只有在你需要账号/邮箱 + 密码登录时，才需要补设本地密码。",
        passwordHintExisting: "你已经启用了密码访问。如果需要轮换凭据，可以在这里更新。",
        openPasswordCreate: "添加本地密码",
        openPasswordChange: "修改密码",
        closePasswordEditor: "收起密码表单",
        savePassword: "保存密码",
        savingPassword: "保存中...",
        passwordSaved: "密码已更新",
        passwordMismatch: "两次输入的密码不一致。",
        passwordTooShort: "密码长度至少为 8 位。",
        passwordRequired: "密码和确认密码不能为空。",
        passwordUnauthorized: "请重新登录后再修改密码。",
        logout: "退出登录",
      },
      preferences: {
        title: "偏好设置",
        language: "显示语言",
        languageNote: "选择你偏好的界面语言。",
        theme: "主题",
        themeLight: "浅色",
        themeDark: "深色",
        themeSystem: "跟随系统",
      },
      runtimeConfig: {
        title: "Runtime 连接",
        host: "主机地址",
        hostPlaceholder: "http://127.0.0.1",
        port: "端口",
        testConnection: "测试连接",
        testing: "测试中...",
        connected: "已连接",
        disconnected: "未连接",
        saved: "已保存",
      },
      auditTemplates: {
        title: "审计模板",
        description: "将常用的审计参数保存为模板，创建任务时快速选用。",
        saveCurrent: "保存当前默认值为模板",
        saved: "已保存",
        noTemplates: "还没有保存的模板。",
      },
      aboutSystem: {
        title: "关于系统",
        useCases: "应用场景",
        useCaseItems: [
          { title: "模型上线前的隐私评估", desc: "在模型上线前进行审计，识别成员推断风险。" },
          { title: "数据合规审查的技术支撑", desc: "为隐私审计和合规审查提供量化证据（AUC/ASR/TPR）。" },
          { title: "企业模型治理的风险量化", desc: "量化不同访问权限等级（黑盒/灰盒/白盒）下的隐私风险。" },
          { title: "防御效果评估对比", desc: "对比防御前后的攻击成功率，评估缓解措施的有效性。" },
        ],
        systemBoundary: "系统边界",
        boundaryNote: "DiffAudit 是隐私风险审计平台，不是防御系统。它发现、量化和可视化风险，但不消除风险。",
        framework: "三层审计框架",
        frameworkItems: [
          { tier: "黑盒", desc: "最低权限 — 检测是否存在成员隐私泄露风险。" },
          { tier: "灰盒", desc: "部分权限 — 量化风险强度并评估防御效果。" },
          { tier: "白盒", desc: "完全权限 — 刻画风险上界并评估最强防御措施。" },
        ],
      },
      errorPage: {
        title: "出错了",
        description: "发生了意外错误，请稍后重试，或返回工作台。",
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
      title: "登录 DiffAudit 工作区",
      description: "默认使用账号密码登录。也支持通过 Google 或 GitHub 快速继续。",
      formEyebrow: "工作台访问",
      formTitle: "登录工作台",
      oauthDivider: "或使用以下方式继续",
      passwordDivider: "使用账号密码登录",
      hidePasswordCta: "改用第三方登录",
      providerHint: "Google/GitHub 仅会读取名称、邮箱和头像用于账号访问。",
      registerLink: "需要本地账号？",
      registerCta: "创建一个",
      google: "Google",
      github: "GitHub",
      legalPrefix: "继续即表示你同意",
      privacy: "隐私政策",
      terms: "服务条款",
    },
    registerPage: {
      eyebrow: "本地账号",
      title: "创建本地账户",
      description: "只有在你明确需要独立的本地账号/密码入口时，才使用这个页面。它更适合恢复访问、内部演示或没有 OAuth 的场景。",
      formEyebrow: "本地账号设置",
      formTitle: "创建 DiffAudit 账号",
      oauthDivider: "更倾向 OAuth？",
      passwordDivider: "或创建本地账号",
      providerHint: "如需 Google 或 GitHub，请回到主登录页。",
      loginLink: "已有账号？",
      loginCta: "去登录",
      google: "Google",
      github: "GitHub",
      legalPrefix: "账号访问受",
      privacy: "隐私政策",
      terms: "服务条款",
    },
    loginForm: {
      username: "账号或邮箱",
      password: "密码",
      passwordPlaceholder: "输入密码",
      submit: "登录",
      pending: "登录中...",
      hint: "可使用账号或邮箱登录。",
      error: "登录失败，请检查账号信息。",
      oauthErrors: {
        state: "登录状态已失效，请重新发起登录。",
        config: "当前站点尚未完成第三方登录配置。",
        networkGoogle: "Google 登录暂时不可用，请稍后重试。",
        networkGithub: "GitHub 登录暂时不可用，请稍后重试。",
        token: "第三方登录未返回可用的登录令牌。",
        user: "暂时无法读取第三方账户资料。",
        fallback: "第三方登录失败，请稍后重试。",
      },
      validation: {
        usernameRequired: "用户名不能为空",
        passwordRequired: "密码不能为空",
      },
    },
    registerForm: {
      username: "账号",
      password: "密码",
      passwordPlaceholder: "至少 8 位",
      confirmPassword: "确认密码",
      confirmPasswordPlaceholder: "再次输入密码",
      submit: "创建本地账号",
      pending: "创建中...",
      hint: "这会创建一个本地账号，并直接登录进入工作台。",
      error: "注册失败，请稍后重试。",
      passwordMismatch: "两次输入的密码不一致。",
      validation: {
        usernameRequired: "用户名不能为空",
        passwordRequired: "密码不能为空",
        passwordMinLength: "密码长度至少为 8 位。",
        confirmPasswordRequired: "请确认密码",
      },
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
    exportButton: {
      exporting: "导出中...",
      pdf: "导出为 PDF",
      csv: "导出为 CSV",
    },
    liveJobsPanel: {
      justUpdated: "刚刚更新",
      noSummary: "运行完成后会显示 summary 路径。",
    },
  },
};
