import { headers } from "next/headers";

import { WorkspacePageFrame } from "@/components/workspace-frame";
import { resolveLocaleFromHeaderStore } from "@/lib/locale";
import {
  getWorkspaceCatalogData,
  getWorkspaceAttackDefenseData,
} from "@/lib/workspace-source";

import { ModelAssetsClient } from "./ModelAssetsClient";

export const dynamic = "force-dynamic";

export default async function ModelAssetsPage() {
  const locale = resolveLocaleFromHeaderStore(await headers());
  const [catalog, attackDefense] = await Promise.all([
    getWorkspaceCatalogData(),
    getWorkspaceAttackDefenseData(),
  ]);

  const copy =
    locale === "zh-CN"
      ? {
          eyebrow: "模型资产",
          title: "模型资产",
          description:
            "集中管理已纳入审计的模型、数据集与环境版本，保留资产安全与合规可追溯。",
          tabModels: "模型",
          nav: "模型导航",
          bestEvidence: "最佳证据",
          emptyNav: "暂无模型资产。",
          emptyTimeline: "请从左侧选择一个模型。",
          emptyEvidence: "暂无证据数据。",
          noSearchResults: "未找到匹配的模型。",
          clearSearch: "清除搜索",
          addModelDisabled: "该功能暂不可用",
          attack: "攻击",
          defense: "防御",
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR@1%",
          source: "来源",
          runtime: "运行时",
          evidenceLevel: "证据等级",
          workspace: "工作区",
          systemGap: "系统差距",
          addModel: "新增模型",
          searchModels: "搜索模型...",
          modelsCount: "个模型",
          categoriesCount: "访问模式",
          tabTimeline: "版本历史",
          tabEvidence: "审计证据",
          trackBlackBox: "黑盒审计 / Recon",
          trackGrayBox: "灰盒审计 / PIA",
          trackWhiteBox: "白盒审计 / GSA",
          availabilityLabels: { ready: "就绪", partial: "部分可用", planned: "规划中" } as Record<string, string>,
          evidenceLevelLabels: { mainline: "主线", catalog: "目录", challenger: "挑战者" } as Record<string, string>,
          addModelTitle: "新增模型",
          editModelTitle: "编辑模型",
          modelName: "模型名称",
          modelNamePlaceholder: "输入模型名称",
          modelTrack: "访问模式",
          modelTrackPlaceholder: "选择访问模式",
          modelDescription: "描述",
          modelDescriptionPlaceholder: "输入模型描述（可选）",
          cancel: "取消",
          submit: "确认",
          edit: "编辑",
          delete: "删除",
          deleteModelTitle: "删除模型",
          deleteModelConfirm: "确定要删除该模型吗？此操作不可撤销。",
          deleteModelAction: "确认删除",
          demoModeNote: "演示模式：所有变更仅保存在本地。",
          uploadFile: "上传文件",
          uploadDragDrop: "点击或拖拽文件到此处上传",
          uploadComplete: "上传完成",
          uploadProgress: "上传中...",
        }
      : {
          eyebrow: "Model Assets",
          title: "Model Assets",
          description:
            "Manage auditable models, datasets, and runtime versions with traceable safety context.",
          tabModels: "Models",
          nav: "Model Navigation",
          bestEvidence: "Best Evidence",
          emptyNav: "No model assets available.",
          emptyTimeline: "Select a model from the navigation.",
          emptyEvidence: "No evidence data available.",
          noSearchResults: "No matching models found.",
          clearSearch: "Clear search",
          addModelDisabled: "This feature is not yet available",
          attack: "Attack",
          defense: "Defense",
          auc: "AUC",
          asr: "ASR",
          tpr: "TPR@1%",
          source: "Source",
          runtime: "Runtime",
          evidenceLevel: "Evidence level",
          workspace: "Workspace",
          systemGap: "System gap",
          addModel: "Add Model",
          searchModels: "Search models...",
          modelsCount: "models",
          categoriesCount: "Access modes",
          tabTimeline: "Version History",
          tabEvidence: "Audit Evidence",
          trackBlackBox: "Black-box audit / Recon",
          trackGrayBox: "Gray-box audit / PIA",
          trackWhiteBox: "White-box audit / GSA",
          availabilityLabels: { ready: "Ready", partial: "Partial", planned: "Planned" } as Record<string, string>,
          evidenceLevelLabels: { mainline: "Mainline", catalog: "Catalog", challenger: "Challenger" } as Record<string, string>,
          addModelTitle: "Add Model",
          editModelTitle: "Edit Model",
          modelName: "Model Name",
          modelNamePlaceholder: "Enter model name",
          modelTrack: "Access mode",
          modelTrackPlaceholder: "Select access mode",
          modelDescription: "Description",
          modelDescriptionPlaceholder: "Enter description (optional)",
          cancel: "Cancel",
          submit: "Confirm",
          edit: "Edit",
          delete: "Delete",
          deleteModelTitle: "Delete Model",
          deleteModelConfirm: "Are you sure you want to delete this model? This action cannot be undone.",
          deleteModelAction: "Confirm Delete",
          demoModeNote: "Demo mode: all changes are local.",
          uploadFile: "Upload file",
          uploadDragDrop: "Click or drag file here to upload",
          uploadComplete: "Upload complete",
          uploadProgress: "Uploading...",
        };

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
