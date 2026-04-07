import { StateShell } from "@/components/state-shell";

export default function NotFoundPage() {
  return (
    <StateShell
      empty
      emptyTitle="页面不存在"
      emptyDescription="请从侧边导航或底部导航进入已开放页面。"
    >
      <div />
    </StateShell>
  );
}
