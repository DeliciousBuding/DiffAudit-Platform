# GitHub Settings Baseline

这份文档定义 `Platform` 的轻量协作 GitHub 基线。

## 一、仓库定位

- 仓库：`Platform`
- 类型：单站网站 + Go 网关工程仓
- 当前可见性：`private`
- 目标：保证双人协作、必要验证和主线收口保持简单清楚

## 二、仓库级设置

- Visibility: `private`
- Issues: `on`
- Projects: `on`
- Wiki: `off`
- Discussions: `off`
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
- Require branch up to date: `on`
- Require 1 approval: `on`
- Require CODEOWNERS review: `off`
- Dismiss stale reviews: `on`
- Require conversation resolution: `on`
- Enforce for admins: `on`
- Allow force pushes: `off`
- Allow deletions: `off`
- Require last push approval: `off`

## 四、Copilot Review 基线

- `Use custom instructions when reviewing pull requests`: `on`
- 仓库级指令文件：`.github/copilot-instructions.md`

高优先级关注面：

- `apps/web/`
- `apps/api-go/`
- 共享合同
- root/workspace lockfile
- CI、依赖、接口与集成风险

## 五、安全设置基线

- Dependency graph: `on`
- Dependabot alerts: `on`
- Dependabot security updates: `on`
- Secret scanning: `on`
- Push protection: `on`

## 六、关联文档

- `AGENTS.md`
- `CONTRIBUTING.md`
- `.github/copilot-instructions.md`
