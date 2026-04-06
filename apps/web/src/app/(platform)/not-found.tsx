import { StateShell } from "@/components/state-shell";

export default function NotFoundPage() {
  return (
    <StateShell
      empty
      emptyTitle="页面不存在"
      emptyDescription="当前平台壳只搭了核心页面骨架，请从侧边导航或底部导航切换到已有页面。"
    >
      <div />
    </StateShell>
  );
}
