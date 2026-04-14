# Demo Preflight Checklist

1. 启动顺序（照着做，确保请求路径都连通）：
   - 先在 `Services/Local-API` 目录运行 `run-local-api.ps1 -WorkspaceRoot D:\Code\DiffAudit` 并保持窗口常驻（监听 127.0.0.1:8765）。
   - 在 `Platform` 根下依次执行 `npm run dev:api`、`npm run dev:web`，先起 proxy，再起 Next.js，保证 `/api/v1/*` 实际指向 Local API。
2. 登录态前提：
   - 用 `/api/auth/register`+`/api/auth/login` 拿到 `diffaudit_session` Cookie，录屏/截图时同一浏览器和脚本都要使用这个值；若脚本运行失败先确认 cookie 仍有效。
3. 最小 demo 闭环（演示必须有这三个节点）：
   - 有一个 job template 在 Local API 里：必要时按 `Services/Local-API/LOCAL-INTEGRATION.md` 提供的 curl 把 job template 放入 `/api/v1/audit/jobs`。
   - 在 `/workspace/audits` 页面点击某个推荐的 contract 的 `Create job`，等待成功提示，确保 job 被写入 running jobs grid。
   - 展示 running jobs list 中的新增项；确认 grid 在 toast 消失后仍保持新 job 、刷新也能看到。
4. 录屏/截图产出路径：
   - 视频：`Platform/apps/web/public/recordings/audits-demo.webm`（Playwright `capture_audit_recording.py` 覆盖）。
   - 截图：`Platform/apps/web/public/screenshots/{audits-recommended-running.png,audits-running-job.png}`，先读 `public/screenshots/README.md` 再重拍。
5. 若须重录/重拍，先检查：
   - Local API、`npm run dev:api`、`npm run dev:web` 三个窗口都在跑，并且日志没报 500。
   - `diffaudit_session` 没过期；脚本/浏览器都用同一个 cookie。
   - `apps/web/public/recordings` 和 `public/screenshots` 目录状态 clean，确保新产物不会冲掉未提交的资产；先在 `recording-assets-status.md` 里确认最新分支/PR。
6. 未合入 `main` 的分支/PR 边界：
   - 当前 Platform 录屏相关工作都在 `recording-helper`，PR 地址 `https://github.com/DeliciousBuding/DiffAudit-Platform/pull/new/recording-helper`，目标 `main`。
   - 任何 demo 产出在提交前先确保本分支跑过验证并列入提交说明，让 Leader 统一收口。

更新 asset 或脚本时，记得一并在 `recording-assets-status.md` 中说明，以便 Leader 知道交付范围。
