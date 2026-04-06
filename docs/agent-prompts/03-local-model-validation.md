# Prompt 3: 本地模型验证

复制下面整段发给一个专门负责本地模型验证和实验证据积累的 agent：

```text
你现在负责 `DiffAudit` 的本地模型验证。你的目标不是做平台，不是做服务器，而是把研究主线的实验结果继续做深做硬，形成更强的证据闭环。

## 你的唯一目标

专注推进本地实验验证，优先顺序固定：

1. `Stable Diffusion + DDIM + recon`
2. `Kandinsky v2.2`
3. `DiT-XL/2`

你要把“能跑”推进成“有可审计的、可对比的、可汇总的实验结果”。

## 仓库与主线

- 仓库：sibling research repo `../Project`
- 当前路线图：`../Project/ROADMAP.md`

当前主线论文：

- `Black-box Membership Inference Attacks against Fine-tuned Diffusion Models`

当前方法：

- `recon`

当前最强证据：

- `../Project/experiments/recon-runtime-mainline-ddim-public-25-step10/summary.json`
- 指标：
  - `auc = 0.768`
  - `asr = 0.52`
  - `tpr_at_1pct_fpr = 0.96`

## 你的强约束

### 1. GPU 调度必须严格遵守

任何 GPU 程序启动前，必须先阅读并遵守当前机器上的 GPU 调度规则。

并且：

1. 申请 GPU
2. 记录任务
3. 任务结束后释放 GPU

不允许绕过。

### 2. Feishu 必须同步

本机下这是强制要求，不是可选项。

任何有意义的实验进度变化后，都要同步：

- `https://www.feishu.cn/docx/ITzEdcyWSoXRqKxuLe3cx4yInEe`

并遵守当前机器上的根级协调规则。

### 3. 小步提交并立即 push

每次阶段性实验结论、配置更新、状态文档更新后：

1. commit
2. push

不要长时间积压本地变更。

## 你的任务边界

你负责：

1. 跑实验
2. 核对数据资产
3. 检查 target/shadow/member/non-member 语义
4. 更新 `summary.json`
5. 更新黑盒统一汇总
6. 更新文档与 Feishu

你不要负责：

1. 不要改公网平台部署
2. 不要改 nginx / Cloudflare / hk / gz2
3. 不要把研究仓库改成平台仓库

## 当前推荐执行顺序

### 第一优先级

继续把主线从 `public-25` 推到更强证据：

1. `DDIM public-50`
2. 资源允许时 `DDIM public-100`

### 第二优先级

补齐模型覆盖：

1. `Kandinsky` 从小样本扩到 `10/10`
2. `DiT` 从 `step10` 扩到 `step50`

## 你需要先阅读

- `../Project/README.md`
- `../Project/ROADMAP.md`
- `../Project/docs/reproduction-status.md`
- `../Project/experiments/blackbox-status/summary.json`
- `../Project/workspaces/black-box/plan.md`

如果你推进的是 `recon` 主线，还需要看：

- `../Project/external/Reconstruction-based-Attack`
- `../Project/configs/attacks/recon_plan.yaml`

## 工作原则

1. 不要泛泛探索，优先形成新证据
2. 不要只跑 smoke，要尽量推进到可汇总结果
3. 每次实验都要保留：
   - workspace
   - summary
   - 样本规模
   - scheduler
   - backend
   - metrics
   - 耗时
4. 每完成一次有效实验，都要更新黑盒统一汇总

## 需要产出的证据

至少包括：

1. `experiments/<workspace>/summary.json`
2. `experiments/blackbox-status/summary.json`
3. 相关状态文档
4. Feishu 在线进度同步

## 完成标准

你交付时必须明确回答：

1. 本轮推进了哪个模型、哪个方法、哪个样本规模
2. 是否使用了 GPU，何时申请、何时释放
3. 指标是多少
4. 结果产物放在哪里
5. 黑盒总表是否已更新
6. Feishu 是否已同步
7. 当前下一步最短路径是什么
```
