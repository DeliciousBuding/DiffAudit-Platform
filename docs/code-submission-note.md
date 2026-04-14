# 4C Code Submission Note

> 目标读者：Leader 需将此段落直接引用到 `code-submission-note` 或最终交付清单，用于说明 Platform + Local-API 的工程交付状态。

## 1. 最低运行前提

1. 启动 Local API 服务（脚本会派生 `Research/` 等路径，参见 `Services/Local-API/README.md` 与 `Services/Local-API/LOCAL-INTEGRATION.md`）：
   ```powershell
   powershell -ExecutionPolicy Bypass -File Services\Local-API\run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit
   ```
   保持该窗口对外暴露 `127.0.0.1:8765`，前端与记录脚本均依赖此运行时。
2. 同一工作区中，以 `D:\Code\DiffAudit\Platform` 为根先后启动 API 代理和前端：
   ```powershell
   npm run dev:api
   npm run dev:web
   ```
   API 代理 (`dev:api`) 必须先起，以便 `/api/v1/*` 在刷新时可即时路由到 Local API。
3. 登录链路：通过 `/api/auth/register`+`/api/auth/login` 获取 `diffaudit_session` Cookie（记录脚本/截图脚本依赖，参见 `docs/recording-prep.md` 中的步骤 2）。

## 2. Demo 闭环步骤（`job-template -> create job -> jobs list`）

1. 通过 curl 或前端的 `Get job template` 按钮查询活跃合同，例如 `black-box/recon/sd15-ddim`；模板地址说明见 `Services/Local-API/LOCAL-INTEGRATION.md`。
2. 直接把模板 body post 到 `/api/v1/audit/jobs`；服务应返回 `202` 与委派 job_id，说明契约驱动的 job payload 校验通过。
3. 访问 `/api/v1/audit/jobs`（或刷新 `/workspace/audits` Grid）确认刚刚入队的 job 出现在 running jobs 列表。以上 3 步在 `LOCAL-INTEGRATION.md` 中的例程可重放，确保前后端闭环链路可复现。

## 3. 录屏/截图资产路径与状态

1. 主录屏：`Platform/apps/web/public/recordings/audits-demo.webm`，由 `Platform/apps/web/scripts/capture_audit_recording.py` 在 `DIFFAUDIT_SESSION` 环境变量下生成；当前说明详见 `docs/recording-assets-status.md`。
2. 截图：`Platform/apps/web/public/screenshots/{audits-recommended-running,audits-running-job}.png`，由 `capture_audit_screenshots.py` 生成，且同样由 `docs/recording-prep.md` 描述截图命令与复拍核查步骤。
3. 提交包中请一并附上 `docs/recording-assets-status.md`、`public/recordings/audits-demo.webm` 以及相关 manifest/README，Leader 可复用该文档直接告知 4C 审核组哪一页 asset 覆盖了哪个流程。

## 4. 尚未合入 main 的分支 / PR 注意事项

1. Platform 当前工作树处于 `recording-helper` 分支（远端 PR：https://github.com/DeliciousBuding/DiffAudit-Platform/pull/new/recording-helper），该分支包含记录与录屏相关的脚本更新、`apps/web` 入口页重构等改动；`docs/recording-assets-status.md` 即与此分支一起提交，Leader 提交清单时请注明该 PR 仍待 review。
2. Local API 当前在 `codex/portable-mainline` 分支，涉及 `README.md`、registry、config、runner README 等多份调整以及 `run-local-api.ps1` 脚本；如果需要将该枝杈同步到 `main`，需手动确认 `go test ./...`、runner Docker 构建等验证通过后再合并，否则 4C 包中只引用该状态说明。

附录：所有调度说明与镜像信息都散见于 `Services/Local-API/README.md`、`Local-API/LOCAL-INTEGRATION.md` 以及 `Platform/docs/recording-prep.md`，Leader 可按需附上对应链接。
