# 贡献规范

`Platform` 使用双人轻量协作流。

## 默认流程

1. 从 `main` 拉短分支
2. 在当前工作树完成改动
3. 运行本地验证
4. push 分支
5. 提交 PR
6. 1 个 review 后 squash merge

## 目录职责

- `apps/web/`: 单站前端
- `apps/api-go/`: 当前有效网关
- `packages/`: 共享契约与提示
- `docs/`: 当前有效文档

## 最低验证

```powershell
npm --prefix apps/web run test
npm --prefix apps/web run lint
npm --prefix apps/web run build
```

如果改了 Go 网关，再补：

```powershell
go -C apps/api-go test ./...
```
