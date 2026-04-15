# 证据等级体系规范

> Sprint 6.2.4 — 证据等级（Evidence Level）和准入等级（Admission Level）统一规范
> 基于现有 catalog.json 和 summary.json 实际字段归纳

## 1. 证据等级（Evidence Level）

证据等级描述一个审计合同**产出结果的可信度**，从低到高：

| 等级 | 值 | 含义 | 条件 |
|------|-----|------|------|
| L0 | `catalog` | 合同已注册，无实质证据 | catalog.json 有条目，无 summary |
| L1 | `workspace-raw` | 有原始工作区数据，未验证 | 存在 workspace 目录，未通过 checks |
| L2 | `workspace-verified` | 工作区数据验证通过 | workspace 通过基础 checks（数据集、checkpoint 存在） |
| L3 | `runtime-mainline` | 运行时主链路执行通过 | Runner 完整执行，metrics 产出，artifacts 检查通过 |
| L4 | `admitted` | 证据被正式接纳 | L3 + admission_status = "admitted" |
| L5 | `best-summary` | 当前最佳结果 | L4 + 被 catalog 标记为 best_workspace |

### 1.1 证据等级流转

```
catalog → workspace-raw → workspace-verified → runtime-mainline → admitted → best-summary
 (L0)       (L1)             (L2)                  (L3)             (L4)        (L5)
```

不是所有合同都会走完全部等级。`best-summary` 级别的合同一定是 `admitted`。

## 2. 准入等级（Admission Level）

准入等级描述一个证据**被系统接纳的程度**：

| 等级 | 值 | 含义 |
|------|-----|------|
| `draft` | 草稿，未进入正式接纳流程 |
| `system-intake-ready` | 满足系统准入条件，等待审查 |
| `admitted` | 已被正式接纳 |
| `deprecated` | 曾被接纳，但已被更新结果替代 |

### 2.1 准入状态（Admission Status）

| 值 | 含义 |
|---|------|
| `pending` | 等待审查 |
| `under-review` | 审查中 |
| `admitted` | 已接纳 |
| `rejected` | 被拒绝 |
| `superseded` | 被更新结果替代 |

### 2.2 来源验证（Provenance Status）

| 值 | 含义 |
|---|------|
| `unverified` | 未验证来源 |
| `workspace-verified` | 工作区来源已验证 |
| `benchmark-verified` | 基准测试已验证 |
| `peer-reviewed` | 同行评审通过 |

## 3. 前端展示规则

| 证据等级 | 前端标签 | 颜色 | 可创建任务 |
|---------|---------|------|-----------|
| `catalog` | "合同已注册" | gray | 否 |
| `workspace-raw` | "数据待验证" | yellow | 否 |
| `workspace-verified` | "数据已验证" | blue | 是 |
| `runtime-mainline` | "主链路就绪" | green | 是 |
| `admitted` | "已接纳" | green | 是 |
| `best-summary` | "最佳结果" | gold | 是 |

## 4. 合同与证据的关系

一个 `contract_key` 可以对应多个证据（多次实验运行），但只有：
- 一个 `best_workspace`（最新或最佳的证据）
- 一个 `best_summary_path`（对应的 summary 路径）

在 `catalog.json` 中：
```json
{
  "contract_key": "black-box/recon/sd15-ddim",
  "evidence_level": "best-summary",
  "admission_level": "system-intake-ready",
  "admission_status": "admitted",
  "provenance_status": "workspace-verified",
  "best_workspace": "experiments/recon-runtime-mainline-ddim-public-100-step30",
  "best_summary_path": ".../summary.json"
}
```

在 `summary.json` 中：
```json
{
  "contract_key": "black-box/recon/sd15-ddim",
  "raw": {
    "evidence_level": "runtime-mainline",
    "provenance_status": "workspace-verified"
  }
}
```

**注意**：summary.json 中的 `evidence_level` 是 Runner 执行时标记的原始值，
catalog.json 中的 `evidence_level` 是系统最终认定的综合等级。

## 5. JSON Schema

```json
{
  "evidence_level": {
    "type": "string",
    "enum": ["catalog", "workspace-raw", "workspace-verified", "runtime-mainline", "admitted", "best-summary"]
  },
  "admission_level": {
    "type": "string",
    "enum": ["draft", "system-intake-ready", "admitted", "deprecated"]
  },
  "admission_status": {
    "type": "string",
    "enum": ["pending", "under-review", "admitted", "rejected", "superseded"]
  },
  "provenance_status": {
    "type": "string",
    "enum": ["unverified", "workspace-verified", "benchmark-verified", "peer-reviewed"]
  }
}
```
