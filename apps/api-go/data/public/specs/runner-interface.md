# Runner 接口规范

> 定义 Runner 输入、输出和进度报告格式。
> 本规范根据 Recon、PIA、GSA 三类 Runner 的公开接口归纳。

## 1. Runner 入口约定

### 1.1 入口文件

每个 Runner 的入口必须是 `runners/{name}-runner/run.py`。

### 1.2 入口模式

Runner 入口文件必须遵循以下模式（参考 pia-runner/gsa-runner）：

```python
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "shared" / "src"
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from diffaudit.cli import main  # noqa: E402

if __name__ == "__main__":
    raise SystemExit(main())
```

**禁止**：在 run.py 中实现业务逻辑。所有逻辑放在 `runners/shared/src/diffaudit/attacks/`。

### 1.3 CLI 子命令

每个 Runner 注册一个或多个子命令到 `diffaudit.cli`：

| 子命令 | 说明 |
|--------|------|
| `run-recon-artifact-mainline` | Recon 制品主链路 |
| `run-recon-runtime-mainline` | Recon 运行时主链路 |
| `run-pia-runtime-mainline` | PIA 运行时主链路 |
| `run-gsa-runtime-mainline` | GSA 运行时主链路 |

子命令命名约定：`run-{attack_family}-{mode}-mainline`

## 2. 输入规范

### 2.1 通用必需参数

所有 Runner 子命令必须接收：

| 参数 | 类型 | 说明 |
|------|------|------|
| `--workspace` | string | 工作区目录（创建/写入 summary.json） |
| `--repo-root` | string | Runner 代码仓库根目录 |

### 2.2 Track 特定参数

**Recon (black-box)**：
- `--target-member-dataset` — 目标成员数据集路径
- `--target-nonmember-dataset` — 目标非成员数据集路径
- `--shadow-member-dataset` — Shadow 成员数据集路径
- `--shadow-nonmember-dataset` — Shadow 非成员数据集路径
- `--target-model-dir` — 目标模型目录
- `--shadow-model-dir` — Shadow 模型目录
- `--backend` — 模型后端（默认 `stable_diffusion`）
- `--scheduler` — 调度器（默认 `default`）

**PIA (gray-box)**：
- `--config` — YAML 配置文件路径
- `--member-split-root` — 成员分割根目录
- `--device` — 设备（默认 `cpu`）
- `--max-samples` — 最大样本数（默认无限制）
- `--batch-size` — 批次大小（默认 `64`）
- `--adaptive` — 启用自适应采样
- `--adaptive-query-repeats` — 自适应查询重复次数

**GSA (white-box)**：
- `--assets-root` — 资产根目录
- `--resolution` — 分辨率（默认 `32`）
- `--ddpm-num-steps` — DDPM 步数（默认 `20`）
- `--sampling-frequency` — 采样频率（默认 `2`）
- `--attack-method` — 攻击方法编号（默认 `1`）
- `--prediction-type` — 预测类型（默认 `epsilon`）

### 2.3 输入验证

每个 Runner 必须在执行前验证：
1. 工作区目录可写（不存在则创建）
2. 必需参数对应的路径存在
3. Runner 代码仓库必需文件存在

## 3. 输出规范

### 3.1 summary.json

所有 Runner 必须在 `--workspace` 目录下生成 `summary.json`，遵循 `runner-output-spec.md` 的 schema。

### 3.2 标准输出

Runner 执行完毕后，必须向 stdout 输出 summary.json 的 JSON 内容：

```python
print(json.dumps(payload, indent=2, ensure_ascii=True))
```

### 3.3 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 成功，summary.json 的 status = "ready" |
| `1` | 失败，summary.json 的 status != "ready" |
| `2` | 参数错误或未识别的子命令 |

## 4. 进度报告

### 4.1 执行中报告

Runner 执行过程中，必须向 stdout 输出进度信息（非 JSON 格式）：

```
Running inference: 80%|████████  | 24/30 [00:02<00:00, 12.10it/s]
```

这些进度信息**不**被 Runtime-Server 解析为结构化数据，但会被捕获到 stdout/stderr tail 中。

### 4.2 完成报告

完成时通过 summary.json 报告最终状态：
- `status`：`"ready"` / `"running"` / `"failed"` / `"blocked"` / `"error"`
- `evidence_level`：Runner 执行时标记的原始证据等级
- `metrics`：核心指标（auc, asr, tpr_at_1pct_fpr 等）
- `checks`：所有验证检查结果

### 4.3 自适应采样报告

支持自适应采样的 Runner（PIA/GSA）必须在 summary.json 中包含：

```json
{
  "adaptive_check": {
    "enabled": true,
    "status": "completed",
    "metrics": { },
    "query_repeats": 3,
    "aggregation": "mean",
    "score_std": { }
  }
}
```

## 5. 错误处理

| 错误类型 | Runner 行为 |
|---------|------------|
| 参数缺失 | 退出码 2，不生成 summary.json |
| 路径不存在 | 生成 summary.json，status = "blocked"，退出码 1 |
| 执行异常 | 生成 summary.json，status = "error"，退出码 1 |
| 指标计算失败 | 生成 summary.json，status = "error"，metrics = {} |

## 6. Runner 实现清单

| Runner | 入口 | 攻击模块 | 状态 |
|--------|------|---------|------|
| recon-runner | `runners/recon-runner/run.py` | `diffaudit.attacks.recon` | ✅ 已标准化 |
| pia-runner | `runners/pia-runner/run.py` | `diffaudit.attacks.pia` | ✅ 已标准化 |
| gsa-runner | `runners/gsa-runner/run.py` | `diffaudit.attacks.gsa` | ✅ 已标准化 |
