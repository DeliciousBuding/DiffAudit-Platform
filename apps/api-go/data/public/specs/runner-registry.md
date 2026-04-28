# 合同-to-Runner 映射注册表

> 定义 contract_key 到 Runner 实例的映射关系。
> 本规范根据公开 Runner 目录结构归纳。

## 1. 映射规则

合同通过 `contract_key` 的第一段（track）和第二段（attack_family）决定 Runner：

```
contract_key = "{track}/{attack_family}/{target_key}"
                    ↓              ↓
              track 路由      attack_family 路由
```

## 2. 当前注册表

| contract_key 前缀 | track | attack_family | Runner | 脚本 | 语言 |
|---|---|---|---|---|---|
| `black-box/recon/*` | black-box | recon | recon-runner | `runners/recon-runner/run.py` | Python |
| `gray-box/pia/*` | gray-box | pia | pia-runner | `runners/pia-runner/run.py` | Python |
| `white-box/gsa/*` | white-box | gsa | gsa-runner | `runners/gsa-runner/run.py` | Python |
| `*/secmi/*` | any | secmi | *(未实现)* | - | - |

## 3. 共享模块

所有 Runner 共用 `runners/shared/src/diffaudit/`：

| 模块 | 说明 |
|------|------|
| `diffaudit/cli.py` | 命令行接口（参数解析、自适应采样集成） |
| `diffaudit/config.py` | 配置管理（默认参数、可覆盖项） |
| `diffaudit/attacks/recon.py` | Recon 攻击实现 |
| `diffaudit/attacks/pia.py` | PIA 攻击实现 |
| `diffaudit/attacks/gsa.py` | GSA 攻击实现 |
| `diffaudit/attacks/pia_adapter.py` | PIA 适配器 |
| `diffaudit/attacks/adaptive.py` | 自适应采样模块 |

## 4. Runner 接口约定

每个 Runner 必须：

1. 接收 `contract_key` 作为输入标识
2. 读取对应目录下的模型和数据资产
3. 执行攻击逻辑
4. 产出 `summary.json`（符合 runner-output-spec.md 的 schema）
5. 在 summary 中回写 `contract_key`, `track`, `attack_family`, `metrics`, `artifact_paths`

## 5. JSON 格式注册表

```json
{
  "version": "1.0.0",
  "runners": [
    {
      "name": "recon-runner",
      "track": "black-box",
      "attack_families": ["recon"],
      "contract_key_pattern": "black-box/recon/{target_key}",
      "script": "runners/recon-runner/run.py",
      "language": "python",
      "shared_module": "runners/shared/src/diffaudit/attacks/recon.py",
      "description": "Reconstruction-based membership inference attack"
    },
    {
      "name": "pia-runner",
      "track": "gray-box",
      "attack_families": ["pia"],
      "contract_key_pattern": "gray-box/pia/{target_key}",
      "script": "runners/pia-runner/run.py",
      "language": "python",
      "shared_module": "runners/shared/src/diffaudit/attacks/pia.py",
      "description": "Privacy leakage via attribute inference attack"
    },
    {
      "name": "gsa-runner",
      "track": "white-box",
      "attack_families": ["gsa"],
      "contract_key_pattern": "white-box/gsa/{target_key}",
      "script": "runners/gsa-runner/run.py",
      "language": "python",
      "shared_module": "runners/shared/src/diffaudit/attacks/gsa.py",
      "description": "Gradient-based shadow model attack"
    }
  ]
}
```

## 6. 扩展规则

新增 Runner 时：
1. 在注册表中添加条目
2. 在 `runners/` 下创建 `*-runner/` 目录
3. 实现 `run.py`，遵循 runner-output-spec.md 的 output schema
4. 在 `runners/shared/src/diffaudit/attacks/` 下实现攻击逻辑
5. 在 catalog.json 中添加对应 contract_key 条目
