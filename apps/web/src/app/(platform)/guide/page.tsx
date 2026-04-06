import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

const steps = [
  "第一层：模型层（Stable Diffusion / DDIM / 自训练 checkpoint）",
  "第二层：审计引擎（REDIFFUSE / Inversion / Attention）",
  "第三层：本平台（仪表盘 / 热力图 / 报告导出）",
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="接入指南"
        description="明确平台展示层、审计引擎与模型层之间的职责边界，并给出真实 API 联调的接口约定。"
      />

      <SectionCard eyebrow="① 三层架构示意" title="三层架构示意">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-3xl border border-border bg-white/45 p-4 dark:bg-white/5">
              <div className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <div className="text-sm leading-7 text-muted-foreground">{step}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="② 后端接口约定（给算法同学）"
          title="审计引擎 API"
          description="算法同学只需要用 FastAPI 实现统一接口，前端即可直接联调。"
        >
          <pre className="overflow-x-auto rounded-2xl border border-border bg-background/70 p-4 text-xs leading-6 text-muted-foreground">
{`POST /api/audit
Content-Type: multipart/form-data

{
  "image": <file>,
  "model": "sd15",
  "diffusion_step": 200,
  "average_n": 10,
  "methods": ["blackbox", "whitebox"]
}

{
  "is_member": true,
  "confidence": 0.82,
  "distance": 0.043,
  "ssim": 0.91,
  "elapsed_s": 6.2,
  "threshold": 0.05
}`}
          </pre>
        </SectionCard>

        <SectionCard
          eyebrow="③ 前端替换真实 API"
          title="前端联调说明"
          description="联调时把 API 地址填到页面输入框，保持字段名一致即可。"
        >
          <pre className="overflow-x-auto rounded-2xl border border-border bg-background/70 p-4 text-xs leading-6 text-muted-foreground">
{`async function callAPI(file, params) {
  const fd = new FormData();
  fd.append("image", file);
  fd.append("model", params.model);
  fd.append("diffusion_step", params.t);
  fd.append("average_n", params.n);
  const r = await fetch(document.getElementById("apiep").value, {
    method: "POST",
    body: fd,
  });
  return r.json();
}

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])`}
          </pre>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="④ 部署方式"
        title="演示版部署方式"
        description="演示 HTML 可以独立运行，也可以用简单静态服务启动；联调时填入后端地址并点击测试连接。"
      >
        <pre className="overflow-x-auto rounded-2xl border border-border bg-background/70 p-4 text-xs leading-6 text-muted-foreground">
{`# 演示模式可直接双击 HTML 打开
# 联调时填入后端地址，点击“测试连接”

python -m http.server 5500
# 然后访问 http://<你的IP>:5500/diffaudit.html`}
        </pre>
      </SectionCard>
    </div>
  );
}
