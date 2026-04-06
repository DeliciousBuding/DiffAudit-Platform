# Prompt 2: 本地 API

复制下面整段发给一个专门负责本地 API 和平台联调的 agent：

```text
你现在负责 `DiffAudit` 的本地 API 这一条线。你的任务是把本地研究仓库里的可复现能力，整理成稳定的本地服务接口，供平台调用。不要改服务器部署，不要改公网入口，不要负责前端页面。

## 你的唯一目标

在本机把“研究仓库能力 -> 可调用本地 API”这条链路打通。

重点是：

- 本地运行
- 接口清晰
- 输出稳定
- 能被 `DiffAudit-Platform` 后端或前端代理层调用

## 仓库与路径

### 研究仓库

- `D:\Code\DiffAudit\Project`

### 平台仓库

- `D:\Code\DiffAudit\Platform`

你主要改动应落在研究仓库，必要时少量修改平台仓库的 API 契约或联调文档。

## 当前研究主线

当前黑盒主线是：

- 论文：`Black-box Membership Inference Attacks against Fine-tuned Diffusion Models`
- 方法：`recon`
- 最强公开证据：
  - `D:\Code\DiffAudit\Project\experiments\recon-runtime-mainline-ddim-public-25-step10\summary.json`
  - `auc = 0.768`
  - `asr = 0.52`
  - `tpr_at_1pct_fpr = 0.96`

当前三条模型覆盖情况：

- `Stable Diffusion + DDIM`: 已有 runtime-mainline 证据
- `Kandinsky v2.2`: 只有更小规模 smoke / partial 证据
- `DiT-XL/2`: 只有 sample-smoke 证据

## 你的任务边界

你负责：

1. 梳理研究仓库当前已有 CLI / Python 接口
2. 设计最小本地 API 形态
3. 先打通 `recon` 主线的查询 / 提交 / 状态 / 结果接口
4. 尽量复用现有 `summary.json`、workspace、artifact 结构
5. 给平台仓库写清楚调用方式

你不要负责：

1. 不要改 `hk` / `gz2` 服务器
2. 不要动 Cloudflare / nginx
3. 不要做前端页面工作
4. 不要盲目新开一套和研究仓库脱节的执行系统

## 第一性原理要求

先搞清楚：

- 现在研究仓库到底已经有哪些可复用入口
- 哪些结果是“已完成实验”，哪些是“可提交新任务”
- 哪些信息最适合抽成 API，而不是继续暴露成路径和脚本

不要先写一堆框架代码，再去想接口是不是对的。

## 推荐最短路径

优先做一个最小 API 集合：

1. `GET /health`
2. `GET /api/v1/models`
3. `GET /api/v1/experiments/recon/best`
4. `GET /api/v1/experiments/{workspace}/summary`
5. `POST /api/v1/audit/jobs`
   - 先允许“只提交受控的本地任务类型”
6. `GET /api/v1/audit/jobs/{job_id}`

如需新接口，必须先说明为什么现有五六个不够。

## 你需要先阅读

- `D:\Code\DiffAudit\Project\README.md`
- `D:\Code\DiffAudit\Project\ROADMAP.md`
- `D:\Code\DiffAudit\Project\src\diffaudit`
- `D:\Code\DiffAudit\Project\experiments\blackbox-status\summary.json`
- `D:\Code\DiffAudit\Project\experiments\recon-runtime-mainline-ddim-public-25-step10\summary.json`
- `D:\Code\DiffAudit\Platform\apps\api`

## 数据与接口原则

1. 不要复制大文件进平台仓库
2. 不要把研究结果硬编码到前端
3. 优先返回：
   - `status`
   - `paper`
   - `method`
   - `backend`
   - `scheduler`
   - `workspace`
   - `metrics`
   - `artifact_paths`
4. 路径型字段保留绝对路径，方便本机调试

## 如果你需要运行实验

只有在接口设计必须依赖真实产物时才运行。

如果要跑 GPU：

1. 必须先阅读并遵守：
   - `D:\Code\DiffAudit\LocalOps\paper-resource-scheduler\gpu-request-rules.md`
   - `D:\Code\DiffAudit\LocalOps\paper-resource-scheduler\agent-usage-prompt.md`
2. 按要求申请 GPU
3. 结束后释放 GPU

如果不需要 GPU，就不要占用 GPU。

## 文档与同步要求

你一旦改变了本地 API 契约或研究主线状态，必须同步更新：

- 平台仓库里的 API 说明
- 研究仓库里的状态文档
- 如涉及研究进度变化，按本机要求同步 Feishu 文档

## 完成标准

你交付时至少要给出：

1. 本地 API 入口在哪里
2. 当前已经打通的接口列表
3. 平台如何调用这些接口
4. 哪些接口只读，哪些会触发任务
5. 验证命令与返回示例
6. 如果还没接 GPU 任务，也要明确说明
```
