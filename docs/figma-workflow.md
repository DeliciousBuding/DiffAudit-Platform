# Figma Workflow

这份文档定义 `Platform` 的 Figma 主文件、MCP 连接方式和日常协作规则。

## 主文件

- Figma file: [DiffAudit](https://www.figma.com/design/0JziwogHFGIxDO9zQflTzF/DiffAudit?node-id=0-1&p=f&t=Xj4hEaTDUJD8vJHL-0)
- fileKey: `0JziwogHFGIxDO9zQflTzF`
- 当前本地首页捕获草稿节点：`93:2`

主文件用于：

- 首页与工作台的页面草稿
- 视觉方向对齐
- 页面捕获与结构讨论

## MCP 连接

每个协作者使用自己的 Figma 账号和自己的 MCP 会话。

固定规则：

- 仓库里不保存个人 token、cookie、planKey 或本机配置
- 是否能访问主文件，由 Figma 文件权限决定，不由仓库保证
- 本机 Figma MCP 能用时，优先直接对主文件读写
- 本机 Figma MCP 不可用时，至少在 PR 中附上 Figma 链接或截图

推荐最小检查：

1. 先确认自己登录的是正确的 Figma 账号
2. 确认能打开主文件 `DiffAudit`
3. 确认 MCP 工具能读取或写入该文件
4. 再做页面捕获、草稿更新或节点读取

## 页面捕获

本地页面捕获默认写回主文件，不单独维护长期 `figma-capture` 分支。

推荐流程：

1. 在自己的 feature branch 上完成页面改动
2. 本地启动 `apps/web`
3. 用 Figma MCP 生成 capture ID
4. 将页面捕获到主文件对应草稿节点或新草稿区
5. 在 PR 中写明：
   - Figma 文件链接
   - node id 或页面名
   - 本次捕获对应的本地页面路由

补充规则：

- 捕获只是设计草稿同步，不替代代码 review
- 同一轮改动直接复用当前 feature branch，不额外开长期设计分支
- 如果需要做大幅视觉探索，可以在 Figma 主文件里新建 draft page，但代码仍走普通 feature branch

## 协作规则

- 代码是交付源，Figma 是设计对齐源
- 改页面结构、视觉层级、文案布局时，应同步 Figma
- 纯实现修复且不影响布局时，可以不改 Figma
- 主文件中的最终方向，以当前产品主线页面为准，不保留多套并行视觉口径

## PR 要求

涉及 UI、导航、布局、视觉样式时，PR 至少补一项：

- Figma 链接
- 节点 id
- 本地截图

如果这轮改动已经做了 MCP 捕获，优先写 Figma 链接和节点 id。
