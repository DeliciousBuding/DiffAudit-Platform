import { WorkspacePage } from "@/components/workspace-page";

export default function WorkspaceSettingsPage() {
  return (
    <WorkspacePage
      eyebrow="Settings"
      title="把团队、密钥和偏好收进一个稳定的设置页。"
      description="设置页承载团队信息、接入密钥和个人偏好，是统一工作台的稳定配置入口。"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "团队",
            copy: "维护团队名称、协作角色和默认工作区口径。",
          },
          {
            title: "密钥",
            copy: "集中记录平台接入所需的 API key、服务端地址与权限边界。",
          },
          {
            title: "偏好",
            copy: "保存默认语言、页面偏好与报告展示方式。",
          },
        ].map((section) => (
          <section key={section.title} className="surface-card p-6">
            <div className="caption">{section.title}</div>
            <h2 className="mt-3 text-[24px] font-[450] leading-tight">{section.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.copy}</p>
          </section>
        ))}
      </div>
    </WorkspacePage>
  );
}
