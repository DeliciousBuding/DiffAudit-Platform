# 账号系统实现方案

## 目标
- 独立的登录页和注册页（不再在首页内嵌登录卡片）
- 支持用户名密码注册/登录 + GitHub OAuth 登录
- 设计风格与现有站点统一

## 技术选型

| 层 | 方案 | 理由 |
|---|---|---|
| 数据库 | SQLite + better-sqlite3 | 零外部依赖，文件级，适合当前阶段 |
| ORM | drizzle-orm + drizzle-kit | 轻量、类型安全、SQLite 支持好 |
| 密码 | bcryptjs | 纯 JS 实现，无 native 编译问题 |
| Session | 随机 token + sessions 表 | 简单可控，httpOnly cookie |
| GitHub OAuth | 手动实现（3 个 API 调用） | 避免引入 next-auth 重依赖 |

## 数据库 Schema

```
users
  id            TEXT PRIMARY KEY (uuid)
  username      TEXT UNIQUE NOT NULL
  email         TEXT UNIQUE
  password_hash TEXT          -- NULL for纯 OAuth 用户
  avatar_url    TEXT
  created_at    INTEGER NOT NULL

sessions
  id            TEXT PRIMARY KEY (uuid)
  user_id       TEXT NOT NULL → users.id
  token         TEXT UNIQUE NOT NULL
  expires_at    INTEGER NOT NULL
  created_at    INTEGER NOT NULL

oauth_accounts
  id                  TEXT PRIMARY KEY (uuid)
  user_id             TEXT NOT NULL → users.id
  provider            TEXT NOT NULL  -- "github"
  provider_account_id TEXT NOT NULL
  created_at          INTEGER NOT NULL
  UNIQUE(provider, provider_account_id)
```

## 文件改动清单

### 新增

1. `src/lib/db/index.ts` — SQLite 连接
2. `src/lib/db/schema.ts` — Drizzle schema（users / sessions / oauth_accounts）
3. `src/lib/db/seed.ts` — 可选：把环境变量里的旧共享账号迁移为第一个用户
4. `drizzle.config.ts` — Drizzle Kit 配置
5. `src/middleware.ts` — 正式的 Next.js middleware，替代 proxy.ts
6. `src/app/api/auth/register/route.ts` — 注册接口
7. `src/app/api/auth/github/route.ts` — 跳转 GitHub 授权
8. `src/app/api/auth/github/callback/route.ts` — GitHub 回调，创建/关联账号
9. `src/app/(auth)/layout.tsx` — 认证页共享布局（居中、品牌标识、语言切换）
10. `src/app/(auth)/login/page.tsx` — 独立登录页
11. `src/app/(auth)/register/page.tsx` — 独立注册页
12. `src/components/register-form.tsx` — 注册表单
13. `src/components/oauth-button.tsx` — GitHub 登录按钮（可复用给其他 provider）

### 修改

14. `src/lib/auth.ts` — 重写：基于 DB 的 session 校验，保留 path 判断逻辑
15. `src/app/api/auth/login/route.ts` — 改为查 DB、bcrypt 比对、写 sessions 表
16. `src/app/api/auth/logout/route.ts` — 删 sessions 表记录 + 清 cookie
17. `src/components/login-form.tsx` — 加 GitHub 按钮、加"没有账号？去注册"链接
18. `src/components/logout-button.tsx` — 文案从"退出共享会话"改为"退出登录"
19. `src/components/marketing-home.tsx` — 去掉内嵌登录卡片，"登录"按钮改为跳转 /login
20. `src/lib/workspace-copy.ts` — 加注册页文案
21. `package.json` — 加 better-sqlite3、drizzle-orm、drizzle-kit、bcryptjs 依赖

### 删除

22. `src/proxy.ts` — 逻辑合并到 middleware.ts
23. `src/app/(marketing)/login/` — 登录页移到 (auth) 路由组

## 页面设计

### 登录页 `/login`
```
┌─────────────────────────────────┐
│         [BrandMark]             │
│                                 │
│  ┌───────────────────────────┐  │
│  │  登录 DiffAudit            │  │
│  │                           │  │
│  │  [用户名输入框]            │  │
│  │  [密码输入框]              │  │
│  │  [登录按钮]                │  │
│  │                           │  │
│  │  ─────── 或 ───────       │  │
│  │                           │  │
│  │  [GitHub 登录按钮]         │  │
│  │                           │  │
│  │  没有账号？注册 →          │  │
│  └───────────────────────────┘  │
│                                 │
│  [语言切换]                     │
└─────────────────────────────────┘
```

### 注册页 `/register`
```
┌─────────────────────────────────┐
│         [BrandMark]             │
│                                 │
│  ┌───────────────────────────┐  │
│  │  创建 DiffAudit 账号       │  │
│  │                           │  │
│  │  [用户名输入框]            │  │
│  │  [邮箱输入框]              │  │
│  │  [密码输入框]              │  │
│  │  [确认密码输入框]          │  │
│  │  [注册按钮]                │  │
│  │                           │  │
│  │  ─────── 或 ───────       │  │
│  │                           │  │
│  │  [GitHub 注册按钮]         │  │
│  │                           │  │
│  │  已有账号？登录 →          │  │
│  └───────────────────────────┘  │
│                                 │
│  [语言切换]                     │
└─────────────────────────────────┘
```

居中单列布局，surface-card 容器，portal-input / portal-pill 组件，与站点风格一致。

## GitHub OAuth 流程

1. 用户点击"使用 GitHub 登录"
2. → `GET /api/auth/github` → 302 到 `github.com/login/oauth/authorize?client_id=...&redirect_uri=...&state=...`
3. 用户在 GitHub 授权
4. → GitHub 回调 `GET /api/auth/github/callback?code=...&state=...`
5. 后端用 code 换 access_token，再用 token 拿 GitHub 用户信息
6. 查 oauth_accounts 表：
   - 已关联 → 直接登录，创建 session
   - 未关联 → 自动创建 user + oauth_account，创建 session
7. Set cookie，redirect 到 /workspace

需要的环境变量：`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`

## 实施顺序

1. 安装依赖，建库建表
2. 重写 auth.ts + middleware.ts
3. 实现注册/登录 API
4. 实现 GitHub OAuth API
5. 创建 (auth) 布局 + 登录页 + 注册页
6. 改造首页，去掉内嵌登录
7. 更新文案（中英双语）
8. Lint + Build 验证
