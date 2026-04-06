# Prompt 1: 部署 / 前端 / 服务器端

复制下面整段发给一个专门负责部署和公网前端的 agent：

```text
你现在负责 `DiffAudit-Platform` 的部署、前端收尾和服务器侧运维。不要分发 subagent，不要改本地模型代码，不要改研究仓库实验逻辑。

## 你的唯一目标

维护并推进公网平台：

- 域名：`https://diffaudit.vectorcontrol.tech`
- 代码仓库：当前仓库 `./`
- GitHub：`https://github.com/DeliciousBuding/DiffAudit-Platform`

你只负责：

- Next.js 前端
- 服务器部署
- 公网可用性
- 平台前后端联调
- 访问控制和页面体验

你不要负责：

- sibling `Project` 仓库里的算法复现
- GPU 实验
- 真实模型训练或推理

## 当前已知事实

### 平台代码结构

- `apps/web`: Next.js
- `apps/api-go`: active Go backend gateway
- `apps/api`: legacy FastAPI stub
- `packages/shared`: 共享 prompt 和契约

### 当前公网架构

- `hk`:
  - nginx 入口
  - 反向代理到 `gz2`
- `gz2`:
  - 运行平台 Web 和 `apps/api-go`

### 当前访问控制

现在不是 nginx Basic Auth 了。

当前使用的是平台内置的临时共享登录：

- 登录页：`/login`
- `HttpOnly` Cookie 会话
- Next.js `proxy.ts` 保护页面与 `/api/v1/*`
- 公网入口统一走 Next.js

### 当前共享登录信息

- 用户名：从部署环境变量或安全配置中读取
- 密码：从部署环境变量或安全配置中读取

### 当前关键实现文件

- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/auth/logout/route.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/proxy.ts`

### 服务器当前职责

- `hk` 只做域名入口和 nginx 反代
- `gz2` 跑 `apps/web` 和 `apps/api-go`
- active backend 不应直接暴露在公网入口上

## 你的任务边界

你可以做：

1. 改进登录页、仪表盘、导航、文案和交互
2. 修复部署脚本、systemd、nginx、Cloudflare 相关问题
3. 联通前端到平台 API
4. 给平台增加基本可观测性、错误提示、空状态和加载状态
5. 在不接入复杂用户系统的前提下维护共享登录机制

你不要做：

1. 不要改 sibling `Project` 仓库的攻击算法
2. 不要申请 GPU 跑模型
3. 不要把 portal 的复杂用户体系接进来
4. 不要把真实数据集或模型权重塞进平台仓库

## 工作方式

1. 先检查：
   - `git status`
   - `npm --prefix apps/web run lint`
   - `npm --prefix apps/web run build`
   - `go -C apps/api-go test ./...`
2. 再检查服务器：
   - `hk` nginx 配置
   - `gz2` 上两个 systemd 服务
3. 做最短路径修复，不要做大重构
4. 每次改动后本地验证
5. 小步提交，提交后马上 push

补充：

- `apps/api-go` 是当前 active backend，部署、systemd 和联调默认都以它为准
- `apps/api` 只在明确处理 legacy stub 时单独检查，不作为当前 release gate

## 你需要优先关注的文件

- `README.md`
- `docs/architecture.md`
- `docs/superpowers/specs/2026-04-06-temporary-shared-login-design.md`

## 完成标准

你交付时至少要给出：

1. 当前公网地址是否可访问
2. 登录是否正常
3. 未登录访问 `/audit` 和 `/api/v1/models` 的行为
4. `web` 和 `api` 服务状态
5. 你改了哪些文件
6. 你执行了哪些验证命令

## 输出要求

你的回复必须包含：

- 问题与处理结果
- 修改文件清单
- 验证结果
- 当前遗留风险
```
