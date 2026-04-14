# Docx Export Runbook

简要说明本轮 docx 导出流程，便于 Leader 或其他 Developer 复用。

1. 工具与依赖
   - 统一使用 `pandoc` 生成 docx（版本要求见平台常规依赖清单）。
   - 每次 run 前，以上一次导出的旧件（`Docs/competition-materials/4c-2026/exports/xxxx-初版.docx`）作为 `--reference-doc`，确保样式、页码、页眉页脚一致。

2. 目录与步骤
   - 把所有中间结果导到 `Docs/competition-materials/4c-2026/exports/` 目录，不要直接覆盖 final-candidate；这样方便对比、回滚。
   - 导出完成、确认样式无误后再把对应文件覆盖 `Docs/competition-materials/4c-2026/exports/final-candidate/` 里的最终件。

3. 示例命令模板
   ```bash
   pandoc input.md \
     --reference-doc=Docs/competition-materials/4c-2026/exports/05-code-submission-note-初版.docx \
     -o Docs/competition-materials/4c-2026/exports/05-code-submission-note-复刻.docx
   cp Docs/competition-materials/4c-2026/exports/05-code-submission-note-复刻.docx \
     Docs/competition-materials/4c-2026/exports/final-candidate/代码提交说明.docx
   ```
   - `--reference-doc` 的旧件总是上一次生成的初版/对齐版。
   - 复刻件命名可加后缀 `_复刻`、`_temp` 等便于区分。

4. 适用的五份主 docx
   - `作品信息概要表.docx`
   - `AI工具使用说明.docx`
   - `作品报告.docx`
   - `演示脚本.docx`
   - `代码提交说明.docx`
   这五份是当前会随着 `drafts/` 直接重导的主文档；`研究结果附表.docx` 目前仍作为独立附表保留，不在这轮主草稿重导范围内。

5. 复用建议
   - 有多个 docx 需要同时更新时，统一先把中间件做完，再按命令依次复制到 final-candidate，避免旧件和新件混用。
   - 若导出模板或结构发生变化，先更新 reference doc，再进行下一轮导出。
