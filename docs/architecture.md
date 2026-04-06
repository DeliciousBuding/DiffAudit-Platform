# DiffAudit Platform Architecture

## 文档目标

这份文档是 `Platform`、`Services/Local-API`、`Project` 三侧共享的统一三线契约。

它只回答四件事：

1. 黑盒 / 灰盒 / 白盒在系统里怎么被同一套模型表示
2. 哪些实体和字段是平台侧后续工作的统一约束
3. 最小 API 应该朝哪个方向收敛
4. 后续 agent 应该按什么顺序落地，而不是各写一套接口

这不是研究细节文档，也不是前端交互稿。

## 当前边界

三仓职责固定如下：

- `Project`
  - 研究代码、实验执行、`summary.json`、实验 workspace
  - 三线证据的 source of truth
- `Services/Local-API`
  - 本地 HTTP 控制面
  - 读取 `Project` 证据、暴露只读接口、提交受控任务
- `Platform`
  - 前端、平台网关、共享契约文档
  - 不复制研究执行逻辑，不重写研究结果

因此，平台层只做两件事：

1. 发现能力：知道当前三线有哪些可展示、可读取、可执行的合同项
2. 消费证据：读取最佳证据或任务状态，而不是自己解释实验目录

## 第一性原理约束

统一三线不等于把三条线伪装成“已经一样可运行”。

当前真实状态是：

- 黑盒已经有正式证据主线，且 `recon` 是第一优先级
- 灰盒已有 `PIA` / `SecMI` 的可运行准备和 smoke 结果，但还不是平台默认执行主线
- 白盒还处于研究准备态，缺 checkpoint / gradient / activation 访问条件

所以统一契约必须表达“同构描述，不同成熟度”，不能表达成“三线都已有同级运行入口”。

## 统一系统模型

### 1. 统一维度

三线统一后，所有能力都用同一组维度描述：

- `track`
  - 攻击线归属：`black-box` / `gray-box` / `white-box`
- `attack_family`
  - 方法族：`recon` / `variation` / `clid` / `pia` / `secmi` / 未来白盒方法
- `target_key`
  - 目标模型键：`sd15-ddim` / `kandinsky-v22` / `dit-xl2-256` / 未来更多模型
- `mode`
  - 当前证据或执行模式：`runtime-mainline` / `artifact-summary` / `runtime-smoke` / `dry-run-smoke` / `sample-smoke`
- `availability`
  - 合同项成熟度：`ready` / `partial` / `planned`
- `evidence_level`
  - 当前最强证据层级：`best-summary` / `catalog` 等聚合态标签

### 2. 合同项

平台看到的最小合同单元不是“模型”，也不是“任务类型”，而是：

`contract_key = <track>/<attack_family>/<target_key>`

示例：

- `black-box/recon/sd15-ddim`
- `black-box/recon/kandinsky-v22`
- `black-box/clid/sd15-ddim`
- `gray-box/pia/sd15-ddim`

这样做的原因很直接：

- 同一个 `target_key` 可能有多条攻击线
- 同一个 `attack_family` 可能覆盖多个目标模型
- `job_type` 只表达怎么执行，不表达这份能力在三线里的语义位置

### 3. 三类核心对象

后续 agent 统一围绕三类对象工作：

1. `catalog_entry`
   - 描述某个 `contract_key` 现在是否存在、成熟度如何、最佳证据在哪里
2. `evidence_summary`
   - 描述某个实验 workspace 的事实结果，来自 `Project/experiments/*/summary.json`
3. `audit_job`
   - 描述一次受控提交任务的控制面状态，来自 `Local-API` 的 jobs 目录和状态接口

不要再把“最佳证据摘要”和“任务执行记录”混成一个对象。

## 核心实体定义

### `catalog_entry`

用途：

- 给前端或平台网关发现“当前支持什么”
- 给后续 agent 判断某条线是只读证据、还是已经能提交任务

推荐字段：

| 字段 | 含义 |
| --- | --- |
| `key` | 合同键，等于 `<track>/<attack_family>/<target_key>` |
| `track` | `black-box` / `gray-box` / `white-box` |
| `attack_family` | 方法族 |
| `target_key` | 目标模型键 |
| `label` | 面向 UI 的稳定名称 |
| `paper` | 论文或来源标识 |
| `backend` | 研究运行后端，如 `stable_diffusion` / `kandinsky_v22` / `dit` |
| `scheduler` | 采样器，如 `ddim`，没有就为 `null` |
| `availability` | `ready` / `partial` / `planned` |
| `evidence_level` | 当前能拿出的最佳证据层级 |
| `best_summary_path` | 最佳证据的 `summary.json` 路径，没有就为 `null` |
| `best_workspace` | 最佳证据 workspace，没有就为 `null` |

规则：

- `catalog_entry` 是能力目录，不是运行结果
- `availability` 表达“能否进入平台消费”，不等于“论文已经复现完成”
- `best_summary_path` 允许为空；为空时说明该合同项还没有正式证据入口

### `evidence_summary`

用途：

- 作为平台展示页、报告页、后续自动化同步的唯一事实载体

统一必备字段：

| 字段 | 含义 |
| --- | --- |
| `status` | `ready` / `blocked` / `failed` / 其他明确状态 |
| `track` | 攻击线 |
| `method` | 当前 summary 的方法名，和 `attack_family` 对齐 |
| `paper` | 论文或来源标识 |
| `mode` | 当前 evidence 的执行层级 |
| `workspace` | 产物 workspace |
| `artifact_paths.summary` | 当前 summary 自身路径 |
| `notes` | 明确结论边界、假设、阻塞 |

统一建议字段：

| 字段 | 含义 |
| --- | --- |
| `device` | `cpu` / `cuda:0` 等 |
| `metrics` | 原始指标对象 |
| `checks` | 关键前置检查是否通过 |
| `runtime.backend` | 运行后端 |
| `runtime.scheduler` | 采样器 |
| `assets` 或 `runtime_assets` | 资产说明 |

平台消费时，统一提取的 headline 字段固定为：

- `status`
- `track`
- `method`
- `paper`
- `mode`
- `workspace`
- `summary_path`
- `backend`
- `scheduler`
- `metrics.auc`
- `metrics.asr`
- `metrics.tpr_at_1pct_fpr`
- `artifact_paths`
- `raw`

说明：

- 黑盒 `recon` 可以直接提供 `auc / asr / tpr_at_1pct_fpr`
- 灰盒或白盒若指标结构不同，允许在 `metrics` 下保留原始结构
- 平台层只抽 headline 字段，不抹平研究细节

### `audit_job`

用途：

- 表达一次受控提交任务的排队、运行、完成、失败状态

推荐字段：

| 字段 | 含义 |
| --- | --- |
| `job_id` | 任务 ID |
| `job_type` | 执行形态，如 `recon_artifact_mainline` |
| `contract_key` | 该任务归属的合同项 |
| `status` | `queued` / `running` / `completed` / `failed` |
| `workspace_name` | 目标 workspace 名，不是绝对路径 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |
| `payload` | 原始请求体 |
| `summary_path` | 成功后生成的 summary 路径 |
| `metrics` | 完成后可抽取的 headline 指标 |
| `error` | 失败原因 |
| `stdout_tail` | 末尾标准输出 |
| `stderr_tail` | 末尾标准错误 |

规则：

- `job_type` 表达执行策略，不表达三线归属
- 三线归属由 `contract_key` 表达
- `workspace_name` 必须保持单段目录名，不能直接传路径

## 统一字段规范

后续 agent 不要继续混用下面几组名字：

| 禁止继续扩散的双命名 | 统一名称 |
| --- | --- |
| `access_level` / `track` | `track` |
| `method` / `attack_family` | 聚合层用 `attack_family`，summary 内保留 `method` |
| `model_key` / `target_key` | `target_key` |
| `workspace` / `workspace_name` | summary 用 `workspace`，job 用 `workspace_name` |

具体约束：

- 聚合目录对象统一使用 `track`、`attack_family`、`target_key`
- 单个实验 summary 保留研究仓库现有 `method`，不强行改写历史产物
- 控制面任务对象禁止再退回旧 stub 的 `model_key + audit_method + image_name` 形态

## 最小 API 方向

### API 根原则

最小 API 只服务两类需求：

1. 发现合同项与读取证据
2. 提交受控任务并查询状态

不要再围绕“上传一张图即统一三线审计”设计接口。

### 必须保留的只读根

1. `GET /health`
   - 控制面存活检查
2. `GET /api/v1/catalog`
   - 三线统一能力目录的主入口
3. `GET /api/v1/experiments/{workspace}/summary`
   - 读取任意 workspace 的统一 evidence summary

说明：

- `GET /api/v1/models` 可以继续存在，但它只是模型列表，不是三线合同根
- `GET /api/v1/experiments/recon/best` 继续作为当前黑盒主线快捷入口
- 后续不要为 `pia`、`secmi`、白盒方法继续复制一批 `.../best` 专用路由

### 必须保留的控制面根

1. `GET /api/v1/audit/jobs`
2. `POST /api/v1/audit/jobs`
3. `GET /api/v1/audit/jobs/{job_id}`

`POST /api/v1/audit/jobs` 的最小方向是：

```json
{
  "job_type": "recon_artifact_mainline",
  "contract_key": "black-box/recon/sd15-ddim",
  "workspace_name": "api-job-001",
  "artifact_dir": "D:/.../score-artifacts"
}
```

关键约束：

- `contract_key` 必须进入提交体，避免第二条线接入后继续靠 `job_type` 猜语义
- `job_type` 只描述执行入口，不描述攻击线
- 只允许白名单任务类型，不能把研究 CLI 暴露成通用远程执行器

### 最短消费路径

平台页面或后续 agent 获取“某条线当前最佳证据”的最短路径固定为：

1. 调 `GET /api/v1/catalog`
2. 选中目标 `contract_key`
3. 读取 `best_workspace` 或 `best_summary_path`
4. 调 `GET /api/v1/experiments/{workspace}/summary`
5. 从 summary 中提取 headline 字段做展示

不要让前端自己扫描目录、拼路径、推断 scheduler 或 method。

## 三线映射到当前仓库现状

截至 `2026-04-06`，统一合同应按下面方式理解：

### 黑盒

当前正式纳入目录的主方法：

- `recon`
- `variation`
- `clid`

当前第一优先合同项：

- `black-box/recon/sd15-ddim`

原因：

- `Project/ROADMAP.md` 明确黑盒主线优先
- `Project/experiments/blackbox-status/summary.json` 已经形成黑盒统一总表
- `Local-API` 已经实现 `recon` 最佳证据读取和受控 job 提交

### 灰盒

当前应纳入统一目录，但只按“准备态或 smoke 态”暴露：

- `gray-box/pia/<target_key>`
- `gray-box/secmi/<target_key>`

约束：

- 可以进入 `catalog`
- 可以暴露 `best_summary_path`
- 在没有正式 workspace 产出和稳定 summary 之前，不要给平台默认“开始执行”按钮

### 白盒

当前只进入统一模型，不进入默认执行面：

- `white-box/<future-family>/<target_key>`

约束：

- `catalog` 可以有 planned 条目
- `availability` 必须忠实表达为 `planned` 或 `partial`
- 在 checkpoint / gradient / activation 访问条件未具备前，不允许伪造统一执行接口

## 落地顺序

后续 agent 必须按这个顺序推进，不要跳步扩接口。

### Phase 1: 锁定黑盒主线为统一合同样板

目标：

- 把现有 `recon` 主线用作三线合同的第一个成型样板

必须完成：

- `catalog` 明确输出 `contract_key`
- `recon` 的最佳证据继续以 `Project/experiments/blackbox-status/summary.json` 为 source of truth
- 平台读取路径统一为 `catalog -> summary`

### Phase 2: 把灰盒纳入同一目录，不提前承诺可执行

目标：

- 让平台能看见灰盒当前做到哪一步

必须完成：

- `pia` / `secmi` 进入 `catalog`
- 条目标明 `availability` 和 `evidence_level`
- 只读展示只依赖 summary，不新增专用灰盒控制器

### Phase 3: 只有在研究侧形成稳定 workspace + summary 后，才开放第二条任务线

目标：

- 在不重写控制面的前提下接入一条灰盒正式任务

必须满足：

- 研究侧已有稳定 CLI 入口
- 产物落到 workspace
- summary 字段满足本文的 `evidence_summary` 约束
- job 创建体能用 `contract_key + job_type + workspace_name` 唯一表达

### Phase 4: 白盒只在资产条件满足后进入执行面

目标：

- 保证平台对外陈述不超过研究真实成熟度

必须满足：

- 白盒有真实可访问资产条件
- summary schema 已固定
- 至少有一条白盒方法形成稳定 evidence path

## 明确不做的事

- 不在 `Platform` 复制研究代码或实验目录
- 不为每条线各造一套 `best`、`run`、`result` 专用路由
- 不继续扩展旧 stub 的 `model_key + audit_method + image_name` 合同
- 不把旧 demo 页的“单图上传即统一审计”文案当作真实系统模型

## 给后续 agent 的直接执行规则

如果你后续要改平台契约、网关或联调文档，先检查下面四条：

1. 你改的是 `catalog_entry`、`evidence_summary`，还是 `audit_job`
2. 你的字段是在表达 `track`、`attack_family`、`target_key`，还是在错误复用 `job_type`
3. 你的接口是在发现证据，还是在提交任务
4. 你的改动有没有把灰盒 / 白盒伪装成已经与黑盒同成熟度

如果答不清这四条，就不要继续加接口。
