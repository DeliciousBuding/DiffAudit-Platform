import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatCard } from "@/components/stat-card";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="合规报告"
        description="围绕审计对象信息、检测结果摘要、法规符合性评估与防御建议，生成可读的扩散模型数据合规审计报告。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="成员推断结论" value="成员" sub="模拟结果" iconLabel="VR" tone="warning" />
        <StatCard label="成员置信度" value="82%" sub="REDIFFUSE v1.0" iconLabel="CF" tone="primary" />
        <StatCard label="重建距离" value="0.043" sub="D(x,x̂)" iconLabel="DX" tone="info" />
        <StatCard label="SSIM 相似度" value="0.910" sub="重建质量指标" iconLabel="SS" tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard eyebrow="1. 审计对象信息" title="审计对象信息">
          <table className="w-full text-sm">
            <tbody>
              <DetailRow label="目标模型" value="Stable Diffusion 1.5" />
              <DetailRow label="待检图像" value="未指定（演示模式）" />
              <DetailRow label="检测方法" value="黑盒 Likelihood + 白盒 DDIM Inversion" />
              <DetailRow label="算法版本" value="REDIFFUSE v1.0" />
            </tbody>
          </table>
        </SectionCard>

        <SectionCard eyebrow="2. 检测结果摘要" title="检测结果摘要">
          <table className="w-full text-sm">
            <tbody>
              <DetailRow label="成员推断结论" value="成员（Member）" />
              <DetailRow label="成员置信度" value="82%" />
              <DetailRow label="重建距离 D(x,x̂)" value="0.043000" />
              <DetailRow label="SSIM 相似度" value="0.9100" />
              <DetailRow label="风险等级" value="高风险" />
            </tbody>
          </table>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="3. 法规符合性评估" title="法规符合性评估">
          <table className="w-full text-sm">
            <tbody>
              <DetailRow label="《生成式AI管理办法》第4条" value="可能不符合（数据来源待核查）" />
              <DetailRow label="数据来源合规性" value="存在疑似未授权使用风险" />
              <DetailRow label="知识产权侵权风险" value="存在侵权可能，建议法务复查" />
            </tbody>
          </table>
        </SectionCard>

        <SectionCard eyebrow="4. 防御建议" title="防御建议">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Diffence 推理扰动：在推理阶段加入轻微高斯扰动，降低成员推断成功率。</li>
            <li>LoRA 差分隐私微调：对敏感数据使用差分隐私训练，减小成员与非成员误差分布差异。</li>
            <li>影子模型对比验证：建立无敏感数据的影子模型，定期对比成员推断分布。</li>
          </ul>
        </SectionCard>
      </div>
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
