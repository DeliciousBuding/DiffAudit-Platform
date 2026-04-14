# 4C 代码包索引

## 1. 目录收口理由
- `Research/`：含所有研究主线代码、实验脚本、资产模板与 smoke 验证，最大化可复现性。测试脚本、workspaces/ 记录、docs/ 内的再现状态与路线说明也是评审在场时的依据。  
- `Platform/`：承载用户端 Next.js、Go 网关、共享契约、部署/协作文档，配套 dev/test/build 验证确保前后端一体交付。  
- `Services/Local-API/`：提供本地审计服务、合同注册库、Runner 资源与 HTTP contract 描述，是前端与 Research 之间的集成边界。  
- `Docs/competition-materials/4c-2026/`：统一收纳赛道规则、模板与交付草稿，确保竞赛材料与代码包同步发布，避免材料散落在其他目录中而影响评审查询。

## 2. 非主提交内容
- `LocalOps/`（及其 `paper-resource-scheduler`、`feishu` 子域）：纯运维/调度逻辑，不包含可执行的攻防/前后端代码，不在 4C 交付包中。  
- `Archive/`：历史 Agent 配置与旧工程/清理记录，属于参考归档，应在主包外保留。  
- `Docs/` 中除 `competition-materials/4c-2026` 以外的内容偏向长期资料或非决赛材料，可按需单独更新，不纳入本次主提交。

## 3. 启动说明入口
- **Research** `D:\Code\DiffAudit\Research\README.md`：先启动 `conda env create -f environment.yml` → `conda activate diffaudit-research` → `python scripts/verify_env.py`。Quick Start 提供 `python -m diffaudit run-smoke ...`、`plan-*`、`dry-run-*` 等命令，所有研究线路的 smoke/mainline 都可从该 README 找到。  
- **Platform** `D:\Code\DiffAudit\Platform\README.md`：前端用 `npm --prefix apps/web install && npm --prefix apps/web run dev`，Go 网关用 `npm run dev:api`，`README` 里也列出 `npm run test/lint/build` 与 `go -C apps/api-go test ./...` 的验证链路和常用环境变量。  
- **Services/Local-API** `D:\Code\DiffAudit\Services\Local-API\README.md`：推荐用 `powershell -ExecutionPolicy Bypass -File .\run-local-api.ps1`（或 `go run ./cmd/local-api --host 127.0.0.1 --port 8765`），README 还有 Docker build/run、环境变量、HTTP contract 与 runner 配置的说明。  
- **Docs/competition-materials/4c-2026** `README.md`：清晰划分 `rules/`（规则/官方材料）、`templates/`（模板）、`drafts/`（赛前草稿）、`exports/`（导出版本）；把决赛材料集中在这里便于评委直接读取和打包。

## 4. 验证态分支快照
- `Research` 目前在 `codex/competition-mainline-sync-20260414`，README/脚本与实验目录仍在同步中，该分支尚未合入 `main`。  
- `Platform` 目前在 `recording-helper` 分支，apps/web 与 docs 下有大批变更；提交前需确认该分支的验证状态。  
- `Services/Local-API` 目前在 `codex/portable-mainline`，涉及配置、registry、runner、文档等的更新，该分支也没有合入 `main`。
