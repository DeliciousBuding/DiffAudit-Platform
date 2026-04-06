export type DemoAuditResult = {
  isMember: boolean;
  verdictText: string;
  verdictSubtext: string;
  confidence: number;
  distance: number;
  ssim: number;
  elapsedSeconds: number;
  threshold: number;
  riskLevel: "高风险" | "中风险" | "低风险";
  fileName: string;
  model: string;
  distanceFunction: string;
  diffusionStep: number;
  averageN: number;
};

type DemoAuditOptions = {
  rng?: () => number;
  fileName: string;
  model: string;
  distanceFunction: string;
  diffusionStep: number;
  averageN: number;
};

export const progressSteps = [
  { id: "upload", title: "图像预处理与上传", tag: "黑盒" },
  { id: "inversion", title: "DDIM Inversion 重建误差计算", tag: "白盒" },
  { id: "variation", title: "多次 Variation 检测取平均", tag: "黑盒" },
  { id: "distance", title: "计算距离函数与阈值判断", tag: "白盒" },
  { id: "verdict", title: "生成成员推断结论", tag: "综合" },
] as const;

export const dashboardStats = [
  { label: "总检测次数", value: "47", sub: "本月 +12", iconLabel: "47", tone: "primary" as const },
  { label: "成员检出", value: "18", sub: "占比 38.3%", iconLabel: "18", tone: "warning" as const },
  { label: "高风险图像", value: "6", sub: "需要重点关注", iconLabel: "06", tone: "warning" as const },
  { label: "平均耗时", value: "7.2s", sub: "每次检测", iconLabel: "7S", tone: "info" as const },
] as const;

export const recentDetections = [
  { file: "portrait_001.png", confidence: "87%", verdict: "成员", tone: "warning" as const },
  { file: "landscape_2k.jpg", confidence: "23%", verdict: "非成员", tone: "success" as const },
  { file: "artwork_final.png", confidence: "91%", verdict: "成员", tone: "warning" as const },
  { file: "photo_edit.jpg", confidence: "18%", verdict: "非成员", tone: "success" as const },
  { file: "scan_001.tiff", confidence: "76%", verdict: "成员", tone: "warning" as const },
] as const;

export const batchSeedItems = [
  "celeba_public_25_target_member",
  "celeba_public_25_target_non_member",
  "celeba_public_25_shadow_member",
  "celeba_public_25_shadow_non_member",
];

export function formatBytes(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function createMockAuditResult(
  isMember: boolean,
  options: DemoAuditOptions,
): DemoAuditResult {
  const rng = options.rng ?? Math.random;
  const confidence = isMember ? 0.62 + rng() * 0.28 : 0.1 + rng() * 0.22;
  const distance = isMember ? 0.018 + rng() * 0.025 : 0.068 + rng() * 0.07;
  const ssim = isMember ? 0.87 + rng() * 0.1 : 0.52 + rng() * 0.28;
  const elapsedSeconds = 4.5 + rng() * 7;

  let riskLevel: DemoAuditResult["riskLevel"] = "低风险";
  if (isMember && confidence > 0.8) {
    riskLevel = "高风险";
  } else if (isMember) {
    riskLevel = "中风险";
  }

  return {
    isMember,
    verdictText: isMember ? "⚠ 判定：训练集成员" : "✓ 判定：非训练集成员",
    verdictSubtext: isMember
      ? "该图像极可能出现在模型训练数据中，存在版权侵用风险。"
      : "该图像未被检出为训练集成员，当前风险较低。",
    confidence,
    distance,
    ssim,
    elapsedSeconds,
    threshold: 0.05,
    riskLevel,
    fileName: options.fileName,
    model: options.model,
    distanceFunction: options.distanceFunction,
    diffusionStep: options.diffusionStep,
    averageN: options.averageN,
  };
}
