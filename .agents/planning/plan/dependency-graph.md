# Dependency Graph

```mermaid
flowchart TD
    subgraph B1["Batch B1 — web SPA (PR1)"]
        T11[T1.1 Vite 脚手架/路由骨架] --> T12[T1.2 SEO 静态化]
        T11 --> T13[T1.3 lib 去 Next 化]
        T13 --> T14[T1.4 路由守卫迁移]
        T14 --> T15[T1.5 页面&组件迁移]
    end
    subgraph B2["Batch B2 — auth 迁 Go (PR2)"]
        T21[T2.1 SQLite schema+migrate] --> T22[T2.2 Session 中间件]
        T22 --> T23[T2.3 密码注册登录]
        T23 --> T24[T2.4 TOTP 2FA]
        T23 --> T25[T2.5 WebAuthn]
        T23 --> T26[T2.6 OAuth]
        T24 --> T27[T2.7 契约测试]
        T25 --> T27
        T26 --> T27
    end
    subgraph B3["Batch B3 — 构建链 (PR3)"]
        T31[T3.1 Dockerfile 重建] --> T32[T3.2 静态服务+fallback]
        T33[T3.3 Vitest 全量+demo 契约] --> T34[T3.4 E2E retarget]
        T35[T3.5 检查链+治理文档]
    end
    subgraph B4["Batch B4 — 上线"]
        T41[T4.1 镜像发布] --> T42[T4.2 生产部署] --> T43[T4.3 验证+回滚锚]
    end

    T15 --> T31
    T27 --> T31
    T32 --> T34
    T34 --> T35
    T35 --> T41
```

## Lane 与合并风险

| Lane | 内容 | 文件域 | 合并风险 |
|:-----|:-----|:-------|:---------|
| A | 前端迁移 | `apps/web/src/**`、`package.json` | 低（独享） |
| B | Go auth | `apps/api-go/**`、`go.mod` | 低（独享） |
| C | 构建/测试 | `Dockerfile`、`docker/**`、`playwright.config.ts`、`scripts/**` | 基线集成后低 |
| D | 发布 | `deploy/**`、compose | 低 |

B1/B2 可并行；B3 需 B1+B2 集成基线；B4 在 B3 绿后。
