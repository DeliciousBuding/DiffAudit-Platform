# GitHub Settings Baseline

这份文档定义 `Platform` 工程仓库的 GitHub 后台设置基线。

## 一、仓库定位

- 仓库：`Platform`
- 类型：平台前后端仓库
- 当前可见性：`public`
- 目标：保证前后端、CI、依赖、接口和发布行为按工程仓库标准收口

## 二、仓库级设置

- Visibility: `public`
- Issues: `on`
- Projects: `on`
- Wiki: `off`
- Discussions:
  - 推荐值：`off`
  - 备注：需要继续在网页端核对是否真正关闭
- Merge methods:
  - `squash`: `on`
  - `merge commit`: `off`
  - `rebase`: `off`
- Auto-merge: `on`
- Automatically delete head branches: `on`
- Always suggest updating pull request branches: `on`
- Web commit signoff required: `off`
- Release immutability: `on`

## 三、`main` 保护基线

- Require pull request: `on`
- Required status checks:
  - `web`
  - `api-go`
  - `api-python`
- Require branch up to date: `on`
- Require 1 approval: `on`
- Require CODEOWNERS review: `on`
- Dismiss stale reviews: `on`
- Require conversation resolution: `on`
- Enforce for admins: `on`
- Allow force pushes: `off`
- Allow deletions: `off`
- Require last push approval:
  - 推荐值：`on`
  - 备注：会提高 owner 快速收口小型文档 PR 的成本

## 四、Copilot Review 基线

统一要求：

- `Use custom instructions when reviewing pull requests`: `on`
- 仓库级指令文件：
  - `.github/copilot-instructions.md`

平台仓库适合开启更积极的 Copilot review 自动化。

Copilot review 的高优先级关注面：

- `apps/web/`
- `apps/api-go/`
- `apps/api/`
- 共享合同
- root/workspace lockfile
- CI、依赖、接口、性能与集成风险

## 五、安全设置基线

- Dependency graph: `on`
- Dependabot alerts: `on`
- Dependabot security updates: `on`
- Secret scanning: `on`
- Push protection: `on`

补充建议：

- version updates 更适合保持开启
- 依赖升级宜按周治理，而不是长期积压

## 六、自动合并

- `Allow auto-merge`: `on`

前提：

- 通过 `main` 的 required checks
- 满足 review 规则
- 合并方式统一走 `squash`

## 七、当前需要人工继续核对的项

- `Discussions` 是否已真正关闭
- Copilot 默认分支自动 review ruleset 是否按你的预期启用

## 八、关联文档

- `CONTRIBUTING.md`
- `.github/copilot-instructions.md`
