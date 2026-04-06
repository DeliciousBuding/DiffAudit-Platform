import { AuditConsole } from "@/components/audit-console";
import { PageHeader } from "@/components/page-header";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="图像成员推断检测"
        description="围绕 REDIFFUSE 演示图像上传、参数配置、黑盒/白盒/灰盒方法选择、模拟进度与成员推断结果。"
      />
      <AuditConsole />
    </div>
  );
}
