# Milestones

| Milestone | 目标 | 出口条件 | 漂移阈值 (annotate/25%/40%) |
|:----------|:-----|:---------|:---------------------------|
| Phase 1: SPA 迁移 | Web 面脱离 Next：Vite+React SPA，demo 面全功能 | `npm run build:web` + `vite preview` 20 路由 + 单测绿（T1.1-T1.5） | 1/2/2 |
| Phase 2: Auth 迁 Go | 12 auth 路由 Go 化，schema 1:1，现有 DB 兼容 | `go test ./...` 绿 + 契约测试（T2.1-T2.7） | 1/2/3 |
| Phase 3: 构建链 | 单二进制容器 + 测试走廊全绿 | 镜像 build 过、`test:web`/`test:e2e`/`check:all` 绿（T3.1-T3.5） | 1/2/2 |
| Phase 4: 上线 | 生产替换 + 验证 + 回滚锚 | 公网冒烟全绿、STATE/LOG 回写（T4.1-T4.3） | 1/1/1 |

Adaptive state 维护在 MASTER.md（§ Adaptive State）。
