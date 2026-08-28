import { Suspense, cache, use } from "react";

import { type Locale } from "@/components/language-picker";
import { WorkspacePageFrame } from "@/components/workspace-frame";
import { clientLocale } from "@/lib/locale";
import {
  getWorkspaceCatalogData,
  getWorkspaceAttackDefenseData,
} from "@/lib/workspace-source";
import { WORKSPACE_COPY } from "@/lib/workspace-copy";

import { ModelAssetsClient } from "./ModelAssetsClient";

const loadModelAssets = cache(() =>
  Promise.all([
    getWorkspaceCatalogData(),
    getWorkspaceAttackDefenseData(),
  ]),
);

function ModelAssetsLoaded({ locale }: { locale: Locale }) {
  const [catalog, attackDefense] = use(loadModelAssets());

  const copy = WORKSPACE_COPY[locale].modelAssetsPage;

  if (!catalog) {
    return (
      <WorkspacePageFrame
        title={copy.title}
        titleClassName="text-xl"
      >
        <p className="text-sm text-muted-foreground">{copy.emptyNav}</p>
      </WorkspacePageFrame>
    );
  }

  const modelCount = catalog?.tracks.reduce((sum, t) => sum + t.entries.length, 0) ?? 0;
  const categoryCount = catalog?.tracks.length ?? 0;

  return (
    <WorkspacePageFrame
      title={copy.title}
      titleClassName="text-xl"
    >
      {/* Model count summary */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{copy.tabModels}</span>
        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium">{modelCount} {copy.modelsCount}</span>
        <span className="mx-1 text-border">|</span>
        <span>{categoryCount} {copy.categoriesCount}</span>
      </div>

      <ModelAssetsClient
        catalog={catalog}
        attackDefense={attackDefense}
        copy={copy}
        locale={locale}
      />
    </WorkspacePageFrame>
  );
}

export default function ModelAssetsPage() {
  const locale = clientLocale();

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/20" />}>
      <ModelAssetsLoaded locale={locale} />
    </Suspense>
  );
}
