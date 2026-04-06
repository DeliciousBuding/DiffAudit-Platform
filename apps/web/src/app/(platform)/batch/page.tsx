import { BatchConsole } from "@/components/batch-console";
import { PageHeader } from "@/components/page-header";

export default function BatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="批量检测"
        description="演示多张图像加入同一队列后，如何批量执行 REDIFFUSE 成员推断检测并汇总结果。"
      />
      <BatchConsole />
    </div>
  );
}
