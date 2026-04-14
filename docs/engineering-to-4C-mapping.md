# 工程交付对 4C 材料的映射说明

1. **契约驱动的 job 流**  
   - Demo/闭环位置：code-submission-note 中的 `job-template -> create job -> jobs list` 三阶段跑通流程。  
   - 工程证据：`Runtime-Server/LOCAL-INTEGRATION.md` 的 job 模板、`Platform/docs/code-submission-note.md` 中的 API 路径与成功响应示例、`demo-preflight-checklist.md` 里同步的运行顺序与登录要求。  
   - 最后提交前边界：确保 `diffaudit_session` Cookie、Runtime Server + API 代理都持续可用，且 demo 录屏中暴露的 job payload schema 与最终 docx 中 traceability 记录一致。

2. **演示资产与可重放录屏**  
   - Demo/闭环位置：`Platform/apps/web/public/recordings/audits-demo.webm` 与截图 `audits-recommended-running.png`/`audits-running-job.png` 直观展示闭环三步骤。  
   - 工程证据：`Platform/docs/code-submission-note.md` 里列出的 capture 脚本与 `recording-assets-status.md` 的状态说明；`demo-preflight-checklist.md` 里的 asset 清理、cookie 和运行窗口要求。  
   - 最后提交前边界：重导主 docx 前需确认上述录屏/截图目录 clean，避免覆盖尚未纳入提交的资产，重新 run capture 脚本时同步刷新 `recording-assets-status.md`。

3. **工程预提交一致性**  
   - Demo/闭环位置：pre-submit-engineering-verdict 文档已确认前述工作流可视为工程包；pre-submit-signoff 简短表明 checklist 全部通过。  
   - 工程证据：上述两个预提交文档直接可被 4C 材料引用，说明 Platform + Runtime Server 状态已满足工程预提交要求。  
   - 最后提交前边界：唯一剩余动作是补真实成员信息、重导主 docx 并刷新 hash/traceability，所以提交清单需明确该点避免误解。
