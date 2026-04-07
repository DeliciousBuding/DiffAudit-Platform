"use client";

import { ChangeEvent, useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  createMockAuditResult,
  DemoAuditResult,
  formatBytes,
  progressSteps,
} from "@/lib/demo-data";

type MethodState = {
  id: string;
  label: string;
  tone: "primary" | "warning" | "info";
  enabled: boolean;
};

function resultTone(result: DemoAuditResult): "success" | "warning" {
  return result.isMember ? "warning" : "success";
}

export function AuditConsole() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [model, setModel] = useState("Stable Diffusion 1.5");
  const [distanceFunction, setDistanceFunction] = useState("SSIM");
  const [diffusionStep, setDiffusionStep] = useState(200);
  const [averageN, setAverageN] = useState(10);
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8780/api/audit");
  const [apiStatus, setApiStatus] = useState("未连接。当前使用演示数据；接入后端后替换此地址。");
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [result, setResult] = useState<DemoAuditResult | null>(null);
  const [methods, setMethods] = useState<MethodState[]>([
    { id: "blackbox", label: "黑盒 / Likelihood", tone: "primary", enabled: true },
    { id: "whitebox", label: "白盒 / DDIM Inversion", tone: "info", enabled: true },
    { id: "graybox", label: "灰盒 / Attention Map", tone: "warning", enabled: false },
  ]);

  const enabledMethods = useMemo(
    () => methods.filter((method) => method.enabled).map((method) => method.label),
    [methods],
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function toggleMethod(methodId: string) {
    setMethods((current) =>
      current.map((method) =>
        method.id === methodId ? { ...method, enabled: !method.enabled } : method,
      ),
    );
  }

  function testConnection() {
    setApiStatus("无法连接后端，当前使用演示数据。");
  }

  async function startAudit() {
    if (!selectedFile) {
      window.alert("请先上传一张目标图像");
      return;
    }

    setRunning(true);
    setResult(null);
    setCompletedSteps([]);
    setActiveStep(0);

    for (let index = 0; index < progressSteps.length; index += 1) {
      setActiveStep(index);
      await new Promise((resolve) => window.setTimeout(resolve, 680));
      setCompletedSteps((current) => [...current, progressSteps[index].id]);
    }

    const nextResult = createMockAuditResult(Math.random() > 0.45, {
      fileName: selectedFile.name,
      model,
      distanceFunction,
      diffusionStep,
      averageN,
    });

    setResult(nextResult);
    setActiveStep(-1);
    setRunning(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-6">
        <SectionCard
          eyebrow="Image Audit"
          title="图像成员推断检测"
          description="围绕 REDIFFUSE 路线展示一次完整的扩散模型隐私审计流程：上传图像、配置参数、执行检测并查看成员推断结果。"
        >
          <label className="block cursor-pointer rounded-[28px] border border-dashed border-primary/25 bg-primary/6 px-6 py-12 text-center transition hover:border-primary/45 hover:bg-primary/8">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {!selectedFile ? (
              <>
                <div className="text-base font-semibold">拖拽或点击上传目标图像</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  支持 PNG / JPG / WEBP，最大 10MB
                </div>
              </>
            ) : (
              <>
                <div className="mono text-sm font-semibold text-primary">{selectedFile.name}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatBytes(selectedFile.size)} · {selectedFile.type || "image/*"}
                </div>
                <div className="mt-4 text-xs text-muted-foreground underline underline-offset-4">
                  重新选择文件
                </div>
              </>
            )}
          </label>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                目标模型
              </label>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="w-full rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-[hsl(220_13%_14%/0.88)]"
              >
                <option>Stable Diffusion 1.5</option>
                <option>Stable Diffusion 2.1</option>
                <option>Stable Diffusion XL</option>
                <option>DDIM（自训练）</option>
                <option>自定义 checkpoint</option>
              </select>
            </div>
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                距离函数
              </label>
              <select
                value={distanceFunction}
                onChange={(event) => setDistanceFunction(event.target.value)}
                className="w-full rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-[hsl(220_13%_14%/0.88)]"
              >
                <option>SSIM</option>
                <option>L2 norm</option>
                <option>ResNet-18 分类器</option>
                <option>LPIPS</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                扩散步数 t
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={50}
                  value={diffusionStep}
                  onChange={(event) => setDiffusionStep(Number(event.target.value))}
                  className="w-full accent-primary"
                />
                <span className="mono w-10 text-right text-sm text-primary">{diffusionStep}</span>
              </div>
            </div>
            <div>
              <label className="mono mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                平均次数 n
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={averageN}
                  onChange={(event) => setAverageN(Number(event.target.value))}
                  className="w-full accent-primary"
                />
                <span className="mono w-10 text-right text-sm text-primary">{averageN}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-white/45 p-5 dark:bg-white/5">
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              启用检测方法
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {methods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => toggleMethod(method.id)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    method.enabled
                      ? method.tone === "primary"
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : method.tone === "info"
                          ? "border-sky-500/25 bg-sky-500/10 text-sky-500"
                          : "border-amber-500/25 bg-amber-500/10 text-amber-500"
                      : "border-border bg-background/60 text-muted-foreground"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-white/45 p-5 dark:bg-white/5">
            <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              后端 API 端点
            </div>
            <div className="mt-4 flex gap-3">
              <input
                type="text"
                value={apiEndpoint}
                onChange={(event) => setApiEndpoint(event.target.value)}
                className="w-full rounded-2xl border border-input bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:bg-[hsl(220_13%_14%/0.88)]"
              />
              <button
                type="button"
                onClick={testConnection}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                测试连接
              </button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{apiStatus}</div>
          </div>

          <button
            type="button"
            onClick={startAudit}
            disabled={running}
            className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? "检测中..." : "开始检测"}
          </button>
        </SectionCard>

        {(running || result) ? (
          <SectionCard eyebrow="Progress" title="检测进度">
            <div className="space-y-3">
              {progressSteps.map((step, index) => {
                const done = completedSteps.includes(step.id);
                const active = activeStep === index;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 border-b border-border py-3 last:border-b-0 ${
                      active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`mono flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : done
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background/60"
                      }`}
                    >
                      {done ? "✓" : index + 1}
                    </div>
                    <div className="flex-1 text-sm">{step.title}</div>
                    <StatusBadge tone={step.tag === "白盒" ? "info" : step.tag === "综合" ? "warning" : "primary"}>
                      {step.tag}
                    </StatusBadge>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ) : null}
      </div>

      <div className="space-y-6">
        <SectionCard eyebrow="Result" title="输出内容">
          {result ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`text-2xl font-semibold ${result.isMember ? "text-amber-500" : "text-emerald-500"}`}>
                    {result.verdictText}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{result.verdictSubtext}</div>
                </div>
                <StatusBadge tone={resultTone(result)}>{result.riskLevel}</StatusBadge>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>成员置信度</span>
                  <span className="mono">{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background/70">
                  <div
                    className={`h-2 rounded-full ${result.isMember ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`}
                    style={{ width: `${Math.round(result.confidence * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricTile label="重建距离 D(x,x̂)" value={result.distance.toFixed(3)} />
                <MetricTile label="SSIM 相似度" value={result.ssim.toFixed(3)} />
                <MetricTile label="耗时" value={`${result.elapsedSeconds.toFixed(1)}s`} />
              </div>

              <table className="w-full text-sm">
                <tbody>
                  <DetailRow label="目标模型" value={result.model} />
                  <DetailRow label="扩散步数 t" value={String(result.diffusionStep)} />
                  <DetailRow label="平均次数 n" value={String(result.averageN)} />
                  <DetailRow label="距离函数" value={result.distanceFunction} />
                  <DetailRow label="启用方法" value={enabledMethods.join(" / ")} />
                  <DetailRow label="阈值" value={result.threshold.toFixed(3)} />
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div>成员风险分数</div>
              <div>成员 / 非成员判定</div>
              <div>重建距离与 SSIM 指标</div>
              <div>模型、步数、平均次数与方法说明</div>
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Current route" title="第一版展示术语">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>REDIFFUSE 作为当前重点审计路线</li>
            <li>黑盒 Likelihood + 白盒 DDIM Inversion 为核心演示方法</li>
            <li>灰盒 Attention Map 作为可扩展的补充方法</li>
            <li>演示模式：未连接后端时使用演示数据</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/45 p-4 text-center dark:bg-white/5">
      <div className="mono text-xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-3 text-muted-foreground">{label}</td>
      <td className="py-3 text-right mono text-xs text-foreground">{value}</td>
    </tr>
  );
}
