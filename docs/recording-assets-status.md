# 录屏资产与工程状态说明

> 工作区范围：`Platform`。所需的分支/PR/资产信息都聚合在这里，方便 Leader 直接引用提交包说明。

## 1. 录屏资产目录

- `apps/web/public/recordings/audits-demo.webm`：Playwright 自动化记录的 `/workspace/audits` 全流程视频，覆盖推荐合同、运行作业、点击 `Create job`、网格刷新和提示。使用 `capture_audit_recording.py` 生成，每次重拍都覆盖这里。
- `apps/web/public/recordings/README.md`：当前录屏产出说明与最短再现步骤。
- `apps/web/scripts/capture_audit_recording.py`：Playwright 脚本，接受环境变量 `DIFFAUDIT_SESSION`、启动 Chromium、打开 `/workspace/audits`、点击 `Create job`、并把最新录屏移动为 `audits-demo.webm`。
- `docs/recording-prep.md`：最全的前置准备（Local API 启动、`npm run dev:api`/`dev:web`、账号注册/登录、选定 `Create job`、截图/录屏脚本提示），也是重拍时必须复查的清单。

## 2. 分支与推送状态（当前工作区）

- 当前分支：`recording-helper`（在 `D:\Code\DiffAudit\Platform` 中通过 `git branch --show-current` 确认）。
- 录屏相关目录 `apps/web/public/recordings` 在 `git status apps/web/public/recordings` 下保持 clean，说明当前录屏素材没有未提交的更改。
- 远端仓库：`https://github.com/DeliciousBuding/DiffAudit-Platform.git`（`git remote -v` 输出）。
- PR 入口：`https://github.com/DeliciousBuding/DiffAudit-Platform/pull/new/recording-helper`，目标为 `main`，请在提交说明中列出本文件与录屏一并交付。

## 3. PR 入口与提交流程

- 所有更改都遵循 `Platform/CONTRIBUTING.md` 中的协作流：从 `main` 拉短分支、完成改动（含本文件）、跑本地验证、推分支、再发 PR、1 个 review 后 squash 回 `main`。
- `docs/figma-workflow.md` 指出，若录屏更新涉及 UI、布局或视觉（例如新页面、截图、录屏 UI 变化），在 PR 描述中补上 Figma 链接、节点 ID 和必要截图，确保 Leader/Design 可直接对照。
- PR 入口就是 Platform 仓库的 GitHub Pull Request 页面，填入本分支、目标 `main`，并在 checklist 中注明本文件与录屏资产已经准备好。

## 4. 重拍录屏的最短步骤

1. `Services/Local-API/run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit`（保持窗口打开，监听 `127.0.0.1:8765`）。
2. 在 `D:\Code\DiffAudit\Platform` 目录依次执行：
   - `npm run dev:api`（确保 `/api/v1/*` 指向 Local API）。
   - `npm run dev:web`（Next.js 服务 `http://localhost:3000`）。
3. 使用 POST `/api/auth/login`（或 `register` + `login`）取得 `diffaudit_session` Cookie，并把值导出为环境变量：
   ```powershell
   cd Platform\apps\web
   set DIFFAUDIT_SESSION=<cookie-value>
   python scripts\capture_audit_recording.py
   ```
4. 脚本运行结束后，`public/recordings/audits-demo.webm` 会被替换为最新录屏；如需附带截图，可按 `docs/recording-prep.md` 中的截图命令补录 `audits-recommended-running.png` 与 `audits-running-job.png`。
5. 验证视频、README、scripts 三者内容是否同步，必要时更新 `docs/recording-prep.md` 以反映新流程，再提交或补签 PR。

> 以上步骤即为录屏资产从准备、生成、到说明的全链路，方便 Leader 收口。若未来要在提交包清单中揭示本资产，可直接引用本页。
