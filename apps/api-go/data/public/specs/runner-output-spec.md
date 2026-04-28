# Runner 输出格式规范（summary.json Unified Schema）

> 定义所有 Runner 执行后产生的 summary.json 统一 schema。
> 本规范根据 Recon、PIA、GSA 三类公开 summary 文件归纳。

## 1. 顶层结构

所有 Runner 产生的 summary.json 必须包含以下顶层字段：

```json
{
  "contract_key": "black-box/recon/sd15-ddim",
  "track": "black-box",
  "attack_family": "recon",
  "method": "recon",
  "target_key": "sd15-ddim",
  "status": "ready",
  "mode": "runtime-mainline",
  "paper": "BlackBox_Reconstruction_ArXiv2023",
  "backend": "stable_diffusion",
  "scheduler": "ddim",
  "workspace": "experiments/recon-runtime-mainline-ddim-public-100-step30",
  "summary_path": ".../summary.json",
  "metrics": { },
  "artifact_paths": { },
  "raw": { }
}
```

## 2. 通用必需字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `contract_key` | string | 执行使用的合同标识 |
| `track` | string | 攻击路线 |
| `attack_family` | string | 攻击族 |
| `method` | string | 具体攻击方法名 |
| `target_key` | string | 目标模型/数据集 |
| `status` | enum | `"ready"`, `"running"`, `"failed"` |
| `mode` | string | 执行模式（如 `runtime-mainline`） |
| `workspace` | string | 工作区相对路径 |
| `summary_path` | string | summary.json 自身路径 |

## 3. 通用可选字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `paper` | string | 参考论文标识 |
| `backend` | string/null | 模型后端 |
| `scheduler` | string/null | 调度器 |
| `raw` | object | 完整原始输出（包含 checks, commands, runtime 细节） |

## 4. Metrics 统一 Schema

每个 summary 必须有 `metrics` 对象。以下为 **通用指标**（所有 track 共有）：

| 指标 | 类型 | 说明 |
|------|------|------|
| `auc` | number | AUC 值（0-1） |
| `asr` | number | 攻击成功率（0-1） |
| `tpr_at_1pct_fpr` | number | FPR=1% 时的 TPR |

### 4.1 Track 特定指标

**Recon (black-box)**：
```json
{
  "auc": 0.849,
  "asr": 0.51,
  "tpr_at_1pct_fpr": 1.0
}
```

**PIA (gray-box)**：
```json
{
  "auc": 0.841339,
  "asr": 0.786133,
  "tpr_at_1pct_fpr": 0.058594,
  "tpr_at_0_1pct_fpr": 0.011719,
  "member_score_mean": -12.561312,
  "nonmember_score_mean": -32.127502,
  "threshold": -19.268509
}
```

**GSA (white-box)**：
```json
{
  "auc": 0.998192,
  "asr": 0.9895,
  "tpr_at_1pct_fpr": 0.987,
  "tpr_at_0_1pct_fpr": 0.432,
  "shadow_train_size": 4200,
  "target_eval_size": 2000
}
```

### 4.2 Metrics JSON Schema

```json
{
  "type": "object",
  "required": ["auc", "asr", "tpr_at_1pct_fpr"],
  "properties": {
    "auc": { "type": "number", "minimum": 0, "maximum": 1 },
    "asr": { "type": "number", "minimum": 0, "maximum": 1 },
    "tpr_at_1pct_fpr": { "type": "number", "minimum": 0, "maximum": 1 },
    "tpr_at_0_1pct_fpr": { "type": "number", "minimum": 0, "maximum": 1 },
    "member_score_mean": { "type": "number" },
    "nonmember_score_mean": { "type": "number" },
    "threshold": { "type": "number" },
    "shadow_train_size": { "type": "integer" },
    "target_eval_size": { "type": "integer" }
  },
  "additionalProperties": true
}
```

## 5. Artifact Paths 统一 Schema

| 字段 | 类型 | 说明 |
|------|------|------|
| `summary` | string | summary.json 路径（必须） |

**Recon** 特有：
- `score_artifact_dir`: 评分文件目录
- `artifact_mainline_summary`: 主链路 summary

**PIA** 特有：
- `scores`: 评分文件路径
- `adaptive_scores`: 自适应评分路径

**GSA** 特有：
- `shadow_specs`: shadow model 规格数组
- `target_member_gradients`: 目标成员梯度
- `target_nonmember_gradients`: 目标非成员梯度

## 6. Raw 对象

`raw` 是 Runner 原始输出的完整副本，包含：

| 字段 | 说明 |
|------|------|
| `checks` | 验证检查（数据集、checkpoint、artifacts 是否就绪） |
| `runtime` | 运行时参数（设备、步数、batch size 等） |
| `commands` | 实际执行的命令及 returncode、stdout/stderr tail |
| `cost` | 成本信息（PIA：查询次数、耗时等） |
| `quality` | 质量指标（PIA：FID、LPIPS 等） |
| `defense` | 防御配置 |
| `artifacts` | 详细 artifact 信息（Recon） |
| `evidence_level` | 证据等级 |
| `provenance_status` | 来源验证状态 |
| `status` | 状态 |
| `workspace_name` | 工作区名称 |
| `notes` | 备注说明 |

## 7. Runner 验证规则

1. summary.json 必须能被 JSON 解析
2. `contract_key` 必须匹配合同注册格式
3. `metrics.auc` 和 `metrics.asr` 必须在 [0,1] 范围内
4. `status` 必须是 `ready`/`running`/`failed` 之一
5. `artifact_paths.summary` 必须指向自身
