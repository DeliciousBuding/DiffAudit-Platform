# 审计合同（Contract）格式规范

> 定义 contract_key + track + method + parameters 的统一格式。
> 本规范根据公开 snapshot 中的合同条目归纳。

## 1. Contract Key 命名约定

```
contract_key = "{track}/{attack_family}/{target_key}"
```

| 段 | 说明 | 枚举值 | 示例 |
|---|------|--------|------|
| `track` | 攻击路线 | `black-box`, `gray-box`, `white-box` | `black-box` |
| `attack_family` | 攻击族 | `recon`, `pia`, `gsa`, `secmi` | `recon` |
| `target_key` | 目标模型/数据集标识 | 自由字符串，推荐 `{model}-{dataset}` | `sd15-ddim` |

**示例**：`black-box/recon/sd15-ddim`

## 2. 合同条目字段定义

### 2.1 必需字段（Required）

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `contract_key` | string | 唯一标识，格式见上 | `"black-box/recon/sd15-ddim"` |
| `track` | string | 攻击路线 | `"black-box"` |
| `attack_family` | string | 攻击族 | `"recon"` |
| `target_key` | string | 目标模型/数据集 | `"sd15-ddim"` |
| `label` | string | 人类可读名称 | `"Stable Diffusion 1.5 + DDIM"` |
| `availability` | enum | 可用状态 | `"ready"`, `"partial"`, `"unavailable"` |

### 2.2 可选字段（Optional）

| 字段 | 类型 | 说明 |
|------|------|------|
| `backend` | string | 后端模型标识（black-box 专用） |
| `scheduler` | string/null | 调度器（如 `ddim`） |
| `paper` | string | 参考论文标识 |
| `best_workspace` | string | 最佳工作区路径 |
| `best_summary_path` | string/null | 最佳 summary.json 路径 |
| `evidence_level` | string | 证据等级（见 evidence-spec.md） |
| `admission_level` | string | 准入等级 |
| `admission_status` | string | 准入状态 |
| `system_gap` | string | 当前系统与论文/基准的差距说明 |
| `intake_manifest` | string |  intake 清单路径 |
| `provenance_status` | string | 来源验证状态 |

### 2.3 Track 特定字段

**black-box**：额外需要 `backend`（模型后端标识）、`scheduler`（调度器）

**gray-box**：可能需要 `intake_manifest`（数据清单路径）

**white-box**：可能需要 `intake_manifest`（含 shadow model 清单）

## 3. Availability 枚举

| 值 | 含义 | 前端行为 |
|---|------|---------|
| `ready` | 合同可用，有完整证据 | 正常展示，可创建任务 |
| `partial` | 合同部分可用，证据不完整 | 展示但标注"部分可用" |
| `unavailable` | 合同不可用 | 不展示或灰显 |

## 4. 现有合同目录

当前 `catalog.json` 包含 4 个合同：

| contract_key | track | attack | availability | evidence_level |
|---|---|---|---|---|
| `black-box/recon/kandinsky-v22` | black-box | recon | partial | catalog |
| `black-box/recon/sd15-ddim` | black-box | recon | ready | best-summary |
| `gray-box/pia/cifar10-ddpm` | gray-box | pia | ready | best-summary |
| `white-box/gsa/ddpm-cifar10` | white-box | gsa | ready | best-summary |

## 5. JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DiffAudit Audit Contract",
  "type": "object",
  "required": ["contract_key", "track", "attack_family", "target_key", "label", "availability"],
  "properties": {
    "contract_key": {
      "type": "string",
      "pattern": "^(black-box|gray-box|white-box)/(recon|pia|gsa|secmi)/[a-zA-Z0-9_-]+$",
      "description": "Unique contract identifier: {track}/{attack_family}/{target_key}"
    },
    "track": {
      "type": "string",
      "enum": ["black-box", "gray-box", "white-box"]
    },
    "attack_family": {
      "type": "string",
      "enum": ["recon", "pia", "gsa", "secmi"]
    },
    "target_key": {
      "type": "string",
      "description": "Target model/dataset identifier"
    },
    "label": {
      "type": "string",
      "description": "Human-readable contract name"
    },
    "availability": {
      "type": "string",
      "enum": ["ready", "partial", "unavailable"]
    },
    "backend": { "type": "string" },
    "scheduler": { "type": ["string", "null"] },
    "paper": { "type": "string" },
    "best_workspace": { "type": "string" },
    "best_summary_path": { "type": ["string", "null"] },
    "evidence_level": { "type": "string" },
    "admission_level": { "type": "string" },
    "admission_status": { "type": "string" },
    "system_gap": { "type": "string" },
    "intake_manifest": { "type": "string" },
    "provenance_status": { "type": "string" }
  }
}
```
