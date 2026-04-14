# DiffAudit Platform Roadmap

## 当前基线

- 首页继续以线上 `portal` 版式为视觉母体
- 整站保持一个品牌语气，不再回到 demo 化卡片壳
- 路由固定为：
  - `/`
  - `/login`
  - `/trial`
  - `/workspace`
  - `/workspace/audits`
  - `/workspace/reports`
  - `/workspace/settings`

## 2026 Q2 重点

### 0. 公网运行面收口

- 把公网读路径固定为：
  - `apps/web -> apps/api-go -> gz2 snapshot`
- 把 `Runtime` 收回控制面：
  - `job-template`
  - `jobs list`
  - `create job`
  - `job detail`
- 工作台默认展示页不再依赖跨机 `Runtime` 在线
- 完成 `apps/api-go/data/public` 的 snapshot 发布流程与运行手册
- 让 `apps/api-go` 在公网运行时真正归位，而不是只留在仓库和文档里

### 1. 首页与品牌

- 把首页文案稳定在中英双语结构里，后续补齐英文精修稿
- 保持稀疏、清醒、可讲清楚风险边界的首页气质
- 补一个正式的产品图标方案：
  - app icon
  - favicon
  - workspace 内小尺寸品牌符号
- 把顶部导航、下拉面板、页脚说明都统一到同一套品牌细节

### 2. 工作台体验

- 工作台首页聚焦待办、最近审计、关键指标
- 审计流程页继续收口成真实产品流：
  - 创建任务
  - 跟踪运行
  - 查看结果
- 报告页强化导出和汇总表达
- 设置页补齐团队、密钥、偏好三块结构

### 3. 视觉系统

- 固定品牌 token：
  - 字体
  - 圆角
  - 按钮层级
  - 表面材质
  - 导航与下拉交互
- 首页和工作台共用同一套品牌语言，避免“两套站”的观感
- 先把核心组件收齐，再扩大页面覆盖面

### 4. Figma 协作

- 主设计文件固定为：
  - `https://www.figma.com/design/0JziwogHFGIxDO9zQflTzF/DiffAudit?node-id=0-1&p=f&t=Xj4hEaTDUJD8vJHL-0`
- 设计更新先落 Figma，再回仓库同步
- 代码侧大改首页、导航、品牌组件前，先在 Figma 留草稿节点
- 具体捕获与同步流程见 `docs/figma-workflow.md`

## 近期待办

- 做出第一版正式小图标方向
- 补齐首页英文精修稿
- 把工作台四个主页面统一到首页同一套视觉语法
- 为关键页面建立 Figma 对应 frame 命名规则
- 给首页和工作台建立定期设计 review 节点

## 验收口径

- 新页面上线前，先过本地 `test / lint / build`
- 品牌改动必须同时检查首页、登录页、工作台是否仍然是一套语言
- Figma 和代码要能互相找到对应页面，不留无主草稿
