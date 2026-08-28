# Task Breakdown

> 目标：DiffAudit Platform 去 Next.js 重构（Vite + React SPA + auth 迁 Go 单二进制），全部测试通过后上线生产并收尾。

## Task Summary

| ID | Task | Phase | Priority | Size | Lane | Batch |
|:---|:-----|:------|:--------:|:----:|:----:|:-----:|
| T1.1 | Vite + React SPA 脚手架与路由骨架 | 1 | P0 | M | A | B1 |
| T1.2 | SEO 静态化（robots/sitemap/og/metadata） | 1 | P2 | S | A | B1 |
| T1.3 | lib 数据层去 Next 化（demo/API 直连） | 1 | P0 | L | A | B1 |
| T1.4 | 路由守卫迁移（RouteGuard + 登录重定向 + legacy） | 1 | P0 | M | A | B1 |
| T1.5 | 页面 & 组件迁移（20 路由 + Next shims） | 1 | P0 | XL | A | B1 |
| T2.1 | Go SQLite schema 1:1 + migrate | 2 | P0 | M | B | B2 |
| T2.2 | Session/cookie 中间件 + /me + /logout | 2 | P0 | M | B | B2 |
| T2.3 | 密码注册/登录/邮箱验证迁 Go | 2 | P0 | L | B | B2 |
| T2.4 | TOTP 2FA + 恢复码迁 Go | 2 | P1 | M | B | B2 |
| T2.5 | WebAuthn passkeys 迁 Go | 2 | P1 | L | B | B2 |
| T2.6 | GitHub/Google OAuth 迁 Go | 2 | P1 | L | B | B2 |
| T2.7 | Auth 契约测试 + 现有 DB 兼容验证 | 2 | P0 | M | B | B2 |
| T3.1 | Dockerfile 重建（Go 单二进制 + embed） | 3 | P0 | M | C | B3 |
| T3.2 | Go 静态服务与 SPA fallback | 3 | P0 | M | C | B3 |
| T3.3 | Vitest 全量跑通 + demo 契约测试 | 3 | P0 | M | C | B3 |
| T3.4 | E2E retarget 并跑通 | 3 | P1 | M | C | B3 |
| T3.5 | 本地检查链与治理文档更新 | 3 | P1 | S | C | B3 |
| T4.1 | 镜像构建发布（immutable tag + provenance） | 4 | P0 | M | D | B4 |
| T4.2 | 生产 compose 升级部署 | 4 | P0 | M | D | B4 |
| T4.3 | 上线验证 + 回滚锚 + STATE/LOG 回写 | 4 | P0 | S | D | B4 |

## Phase 1 — SPA 迁移（Lane A 串行，B1）

### T1.1 Vite + React SPA 脚手架与路由骨架
- **描述**: 引入 Vite 7 + React 19 + TypeScript；迁移 `app/layout.tsx`（字体换 `@fontsource/inter`、ThemeProvider、JsonLd、RouteRecovery）；react-router v7 路由表镜像现有 20 路径；`globals.css`、Tailwind 4 配置、`@` 别名与现有 tsconfig 保持；删除 Next 专属配置（next.config.ts、next-env.d.ts）。
- **验收**: `npm run build:web` 产出 `dist/`；`vite preview` 下 20 路由可达（含 404）；`check:fast` 通过。
- **测试**: 新增 1 个路由表 smoke 单测；现有页面组件测试在新 config 下可运行。
- **S.U.P.E.R**: S U P E R（骨架单目的，不吸附业务）

### T1.2 SEO 静态化
- **描述**: `robots.ts`/`sitemap.ts`/metadata（og/twitter/icon）→ 静态 `robots.txt`、`sitemap.xml`、`index.html` head 模板；og 图片保留 `/brand/`。docs 路由保持 `/docs` 与 `[...slug]` 路径，输出为 SPA 路由。
- **验收**: 生产预览下 `/robots.txt`、`/sitemap.xml` 200 且内容正确；首页 head 含 title/description/og。
- **测试**: 静态文件存在性单测（vitest）。
- **S.U.P.E.R**: P E（契约与平台抽象）

### T1.3 lib 数据层去 Next 化
- **描述**: `api-proxy.ts` 改为浏览器 fetch 直连 Go（`DIFFAUDIT_API_BASE_URL` 或同源）；`demo` 模块改为 client import（`demo-jobs-store`/`demo-snapshot`）；`workspace-source.ts` 保持唯一模式选择器；`locale.ts` client cookie 化；删除 Next API demo/v1 代理路由与 `api-demo` 依赖（保持 `x-platform-locale` 行为）。
- **验收**: demo mode 页面数据与重构前 JSON 结构一致（契约快照测试）；`/api/v1/*` 直连 Go 401/200 语义与中间件一致。
- **测试**: 新增 demo 契约测试（快照对齐）+ api-proxy 单测改造。
- **S.U.P.E.R**: P（端口化）U（单向流）

### T1.4 路由守卫迁移
- **描述**: `proxy.ts` 的守卫逻辑迁 SPA RouteGuard（demo mode 绕过；非 demo 下 `/workspace/**` 未登录 → `/login?redirectTo=`）；`legacy-routes.ts` 迁移表迁入 react-router；`x-platform-locale` cookie 读取逻辑 client 化。
- **验收**: demo mode 下无鉴权全通；非 demo 下访问 `/workspace` 重定向 login 且 redirectTo 保留；legacy 路径 301/308 与原行为一致。
- **测试**: RouteGuard 单测 + 现有 legacy 路由测试迁移。
- **S.U.P.E.R**: S U（单一职责拆两层）

### T1.5 页面 & 组件迁移
- **描述**: 全部 20 路由页面与 185 个 tsx 组件迁移；Next shims：`next/link`→react-router `Link`、`useRouter`→`useNavigate`、`useSearchParams`、`redirect`/`notFound`；删除 `(auth)/(marketing)/(workspace)` 分组与 `app/api/**` 全部 Next 路由；`next-themes` 保留。
- **验收**: 所有页面可渲染；workspace 全流程可走通（demo 模式）；`app/api/**` 删除干净。
- **测试**: 页面组件测试在新路由下全部通过（原 vitest 用例迁移）。
- **S.U.P.E.R**: U P R

## Phase 2 — Auth 迁 Go（Lane B 串行，B2）

### T2.1 Go SQLite schema 1:1 + migrate
- **描述**: `internal/auth` 包：modernc.org/sqlite（纯 Go）驱动；6 表（users/sessions/oauth_accounts/email_verification_tokens/passkeys/two_factor_settings）字段与 drizzle schema 1:1；启动时 migrate（IF NOT EXISTS），直接复用现有 `diffaudit.db`。
- **验收**: 对现有 db 文件启动无 schema 变更错误；表结构与 drizzle 定义列名一致（对照测试）。
- **测试**: migrate 单元测试（新建/既有 DB 两种情况）。
- **S.U.P.E.R**: P E（契约一致、数据可替换）

### T2.2 Session/cookie 中间件
- **描述**: `diffaudit_session` cookie（HttpOnly/SameSite=Lax/Secure 按环境）；`GET /api/auth/me`、`POST /api/auth/logout`；中间件保护 `/api/v1/*`（会话无效 401 JSON 原文 `Authentication required.`）；demo mode 旁路（env+cookie 语义与 proxy.ts 一致）；`x-platform-locale` 透传。
- **验收**: 单测：登录后 /me 返回用户；登出后失效；无 cookie 访问 /api/v1 401。
- **测试**: Go 单测（httptest）。
- **S.U.P.E.R**: S P（端口化契约）

### T2.3 密码注册/登录/邮箱验证
- **描述**: `/api/auth/register`、`/api/auth/login`、`/api/auth/password`、`/api/auth/email`、`/api/auth/email-verification`、`/api/auth/verify-email`；bcrypt（`golang.org/x/crypto/bcrypt`，兼容现有哈希）；email verification token 哈希存储 + 过期；zod 校验规则转 Go 校验（同错误信息）。
- **验收**: 接口 JSON 与 Next 行为一致（字段/错误/状态码）；现有 bcrypt 哈希可直接登录。
- **测试**: Go 单测覆盖注册/登录/验证/重发/错误路径。
- **S.U.P.E.R**: P E

### T2.4 TOTP 2FA + 恢复码
- **描述**: `pquerna/otp`；`/api/auth/two-factor` 开启/关闭/验证；恢复码生成与消费；登录流程带挑战（与 Next 语义一致）；qrcode 生成移 client 或 Go 生成 data URL。
- **验收**: 开启后登录需 TOTP；恢复码可用且一次性。
- **测试**: Go 单测（TOTP 时钟与恢复码消费）。
- **S.U.P.E.R**: P

### T2.5 WebAuthn passkeys
- **描述**: `github.com/go-webauthn/webauthn`；注册/认证端点；counter/backup 语义与 `@simplewebauthn/server` 一致；`/api/auth/login` 等多步挑战语义保留。
- **验收**: 注册后可认证；现有 passkey 表结构一致。
- **测试**: Go 单测（challenge 生成/验证，mock credential）。
- **S.U.P.E.R**: P

### T2.6 GitHub/Google OAuth
- **描述**: `golang.org/x/oauth2`；`/api/auth/github`、`/api/auth/github/callback`、google 同款；`oauth_accounts` 关联；env：`GITHUB_CLIENT_ID/SECRET`、`GOOGLE_CLIENT_ID/SECRET`、`DIFFAUDIT_OAUTH_PROXY_URL` 语义保持不变；无本地 IP/回环配置泄漏。
- **验收**: 回调流程签发 session；账号关联（新/已有关联）；取消/失败返回合理错误。
- **测试**: Go 单测（mock provider 端点）。
- **S.U.P.E.R**: P E

### T2.7 Auth 契约测试 + 现有 DB 兼容
- **描述**: 全部 auth 路由 Go 集成测试（httptest 全流程）；契约对齐：以现有 Next 行为（zod 错误信息/状态码/字段）为基线写测试；现有 `diffaudit.db` 挂载跑通 smoke。
- **验收**: `go test ./...` 全绿；现有 db 冒烟（用户/会话查询正常）。
- **测试**: 本任务即测试。
- **S.U.P.E.R**: P（契约锁定）

## Phase 3 — 构建链与测试走廊（Lane C，B3；依赖 B1+B2 集成）

### T3.1 Dockerfile 重建
- **描述**: 移除 node/tini/start.sh；构建：Go 编译（含 embed 静态资源）→ Alpine 单二进制；OCI labels/provenance 保留；多架构参数不变。
- **验收**: 本地 `docker build` 成功；镜像内无 node/node_modules；`docker run` 直接起服务（无脚本）。
- **测试**: `scripts/verify_image_provenance.py` 通过（在 CI 或本地）。
- **S.U.P.E.R**: E R

### T3.2 Go 静态服务与 SPA fallback
- **描述**: `embed.FS` 提供 SPA dist；`/health`、`/api/*` 前置；`index.html` fallback（非 `/api/*` 未知路径）；gzip；`DIFFAUDIT_PUBLIC_DATA_DIR` 数据面不变。
- **验收**: 容器内 curl `/`、`/workspace`（200 index）、`/api/v1/catalog` 200；未知 /api 404 JSON。
- **测试**: Go 单测（fallback 路由）。
- **S.U.P.E.R**: S U

### T3.3 Vitest 全量跑通 + demo 契约测试
- **描述**: vitest config 迁移（vite 环境）；全量单测通过；demo 契约快照测试落地。
- **验收**: `npm run test:web` 全绿（零跳过）。
- **测试**: 本任务。
- **S.U.P.E.R**: P

### T3.4 E2E retarget 并跑通
- **描述**: playwright `webServer` → `vite preview` + Go gateway（或组合）；4 个 spec（smoke/user-flows/report-flow/i18n-navigation）修复选择器级差异并跑通。
- **验收**: `npm run test:e2e` 全绿。
- **测试**: 本任务。
- **S.U.P.E.R**: P

### T3.5 本地检查链与治理文档更新
- **描述**: `scripts/run_local_checks.py` 移除 Next 检查、补 Vite/Go check；`check_public_boundary.py` 覆盖新文件；治理文档更新：`AGENTS.md`（架构矩阵/构建命令）、`apps/web/DESIGN.md`（路由/组件约定）、`docs/project-structure.md`（web 目录变化）、`deploy/README.md`（新镜像形态）、`CONTRIBUTING.md`。
- **验收**: `npm run check:all` 绿；文档引用无坏链。
- **测试**: N/A（文档/脚本类；有明确的 why）。
- **S.U.P.E.R**: E（治理一致性）

## Phase 4 — 发布上线（Lane D，B4）

### T4.1 镜像构建发布
- **描述**: 构建 `sha-<short-sha>` immutable tag + `main` tag；push GHCR；provenance 验证。
- **验收**: GHCR 可见新 tag；`verify_image_provenance.py` 通过；旧 tag 保留（回滚锚）。
- **测试**: 脚本验证。
- **S.U.P.E.R**: R

### T4.2 生产 compose 升级部署
- **描述**: compose 更新（单服务、去 3000 端口映射、env/卷不变）；拉新镜像、起容器；数据卷/db 不重建。
- **验收**: 容器 healthy；`/health` 200；静态资源 200（**本次事故类**：无 404）。
- **测试**: 部署后 e2e smoke 子集。
- **S.U.P.E.R**: E（环境无关）

### T4.3 上线验证 + 回滚锚 + STATE/LOG 回写
- **描述**: 全链路验证（公网入口、静态、demo API、auth smoke）；回滚锚 = 旧镜像 sha-e7cfa34/4ff1d97 tag；生产事实回写项目 STATE/LOG。
- **验收**: 公网冒烟全绿；回滚命令在回滚锚记录；STATE 更新。
- **测试**: 冒烟脚本。
- **S.U.P.E.R**: R

## 依赖图（摘要）

B1: T1.1 → T1.2 / T1.3 → T1.4 → T1.5（lane A 串行）
B2: T2.1 → T2.2 → T2.3 / T2.4 / T2.5 / T2.6 → T2.7（lane B 串行）
B3: T1.5 + T2.7 → T3.1 / T3.2 → T3.3 → T3.4 → T3.5（集成后 lane C）
B4: T3.5 → T4.1 → T4.2 → T4.3

**合并策略**: B1 产出 PR1（web 重构，demo 可跑）；B2 产出 PR2（auth）；B3 产出 PR3（构建链+测试）；B4 为上线操作（compose/deploy 模板进 PR4，生产应用按 runbook）。
