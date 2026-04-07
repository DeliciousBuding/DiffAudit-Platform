import { AuditConsole } from "@/components/audit-console";
import { PageHeader } from "@/components/page-header";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="图像成员推断检测"
        description="上传单张图像，配置检测参数，并查看成员推断结果。"
      />
      <AuditConsole />
    </div>
  );
}
