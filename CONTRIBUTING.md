# 贡献规范

`Platform` 是多人协作的平台仓库，不是个人 scratch 目录。

目标很直接：

- 前端、后端、共享合同能并行推进
- 根工作树只做集成，不做随手实现
- 文档、CI、本地检查链保持同一口径

## 一、工作方式

默认使用独立 worktree 开发。

要求：

- 不要直接在共享 root worktree 做功能实现
- 一条变更流对应一个分支和一个 worktree
- 合并前先在该 worktree 完成本地验证

具体协作规则见：

- `AGENTS.md`
- `docs/worktree-collaboration.md`
- `docs/merge-playbook.md`

## 二、目录边界

目录职责固定如下：

- `apps/web/`: Next.js 前端
- `apps/api-go/`: 当前有效 Go 网关
- `apps/api/`: legacy FastAPI stub，仅在明确需要时修改
- `packages/`: 共享合同与公共代码
- `docs/`: 架构、交接、部署和协作文档

不要把研究仓库里的算法代码拷进来。

## 三、分支与提交

推荐分支前缀：

- `codex/frontend-*`
- `codex/backend-*`
- `codex/docs-*`
- `codex/ops-*`

推荐 commit 前缀：

- `feat:`
- `fix:`
- `docs:`
- `test:`
- `chore:`

要求：

- 一次提交只解决一个明确问题
- 不要把前端、后端、文档三类大改混在一个 commit
- 能拆就拆，避免大包提交

## 四、Pull Request 规范

推荐流程：

1. 从 `main` 拉新分支
2. 在独立 worktree 完成改动
3. 本地跑检查
4. 提交 PR
5. review 通过后再合并

PR 描述至少写清楚：

- 做了什么
- 为什么做
- 怎么验证
- 风险或后续项

当前 PR 模板位于：

- `.github/PULL_REQUEST_TEMPLATE.md`

## 五、本地检查链

提交前至少运行：

```powershell
python scripts/run_local_checks.py --fast
```

完整检查链：

```powershell
python scripts/run_local_checks.py
```

默认校验项如下：

- `npm --prefix apps/web run lint`
- `npm --prefix apps/web run test`
- `go -C ./apps/api-go test ./...`
- `uv run --directory apps/api ruff check .`
- `uv run --directory apps/api pytest`

完整模式会额外执行：

- `npm --prefix apps/web run build`
- `go -C ./apps/api-go build ./cmd/platform-api`

## 六、本地 hook / pre-commit

仓库当前提供：

- `.pre-commit-config.yaml`
- `scripts/run_local_checks.py`

推荐安装：

```powershell
python -m pip install pre-commit
pre-commit install
```

安装后，提交前会自动执行基础文本检查与最小本地检查链。

## 七、CI 与 GitHub 协作

GitHub Actions 当前会跑三条 gate：

- `web`
- `api-go`
- `api-python`

建议团队协作方式：

- 成员使用分支开发
- 通过 PR 合并
- `main` 开启分支保护
- 代码所有权由 `CODEOWNERS` 统一约束

## 八、Copilot Review 规则

仓库已启用 Copilot code review。

使用规则：

- 默认把 Copilot review 当成自动第一轮代码审查
- 高优先级关注 `apps/web/`、`apps/api-go/`、共享合同和 CI/lockfile 改动
- 对前端重点看行为回归、性能、加载和数据流，不追求样式碎改
- 对后端重点看代理逻辑、接口兼容、错误处理和环境假设
- 对依赖升级重点看 root/workspace lockfile 是否一致、CI 是否保持全绿

仓库级审查指令位于：

- `.github/copilot-instructions.md`
