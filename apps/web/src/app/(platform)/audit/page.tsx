import { AuditConsole } from "@/components/audit-console";
import { PageHeader } from "@/components/page-header";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="图像成员推断检测"
        description="上传图像、配置参数、执行成员推断检测并查看结果。"
      />
      <AuditConsole />
    </div>
  );
}
