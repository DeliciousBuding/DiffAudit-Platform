import { ReactNode } from "react";

type StateShellProps = {
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function StateShell({
  children,
  loading = false,
  error,
  empty = false,
  emptyTitle = "暂无数据",
  emptyDescription = "当前页面还没有可展示内容。",
}: StateShellProps) {
  if (loading) {
    return (
      <div className="surface-card flex min-h-[240px] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="spinner" />
        <div>
          <div className="text-lg font-semibold">同步页面数据</div>
          <div className="mt-2 text-sm text-muted-foreground">正在准备当前视图。</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-card flex min-h-[240px] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="mono rounded-full bg-destructive/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-destructive">
          Error
        </div>
        <div>
          <div className="text-lg font-semibold">页面加载失败</div>
          <div className="mt-2 text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="surface-card flex min-h-[240px] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="mono rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Empty
        </div>
        <div>
          <div className="text-lg font-semibold">{emptyTitle}</div>
          <div className="mt-2 text-sm text-muted-foreground">{emptyDescription}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
