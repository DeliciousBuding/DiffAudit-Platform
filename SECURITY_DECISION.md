# 安全漏洞处理决策

> 日期: 2026-04-15
> 决策人: 产品经理（Claude Opus）
> 背景: 距离 4C 比赛截止还有 4 天

## 漏洞状态

### ✅ 已修复
1. **Next.js DoS 漏洞 (GHSA-q4gf-8mx6-v5v3)**
   - 严重程度: High (CVSS 7.5)
   - 状态: 已修复（升级到 16.2.3）
   - 影响: 生产环境安全
   - 修复时间: 2026-04-14

### ⚠️ 已知风险（接受）
2. **esbuild CORS 漏洞 (GHSA-67mh-4wv8-2f99)**
   - 严重程度: Medium (CVSS 5.3)
   - 状态: 开放（接受风险）
   - 影响范围: 仅开发环境
   - 来源: drizzle-kit 传递依赖

## 风险接受理由

### 技术分析
1. **影响范围有限**
   - 仅影响开发服务器（`npm run dev`）
   - 不影响生产构建（`npm run build`）
   - 不影响生产部署

2. **攻击条件苛刻**
   - 需要攻击者知道开发者本地 IP 和端口
   - 需要开发者同时访问恶意网站
   - 需要开发服务器暴露到网络（使用 --host）
   - 我们的开发服务器默认只监听 localhost

3. **修复成本高**
   - 需要降级 drizzle-kit（0.31.10 → 0.18.1）
   - 这是一个 breaking change
   - 可能破坏数据库迁移功能
   - 需要完整回归测试

### 时间约束
- 当前: 2026-04-15
- 截止: 2026-04-19（4 天后）
- 优先级: 演示流畅 > 开发环境安全

### 决策
**接受此风险，不进行修复**

理由：
1. 不影响比赛演示和评审
2. 不影响生产部署安全
3. 修复可能引入新问题
4. 时间应该用于演示准备

## 缓解措施

### 开发环境最佳实践
1. ✅ 开发服务器默认只监听 localhost
2. ✅ 不使用 `--host 0.0.0.0` 暴露到网络
3. ✅ 开发时不访问不可信网站
4. ✅ 使用防火墙保护开发机器

### 后续计划
- 比赛结束后（2026-04-20+）评估 drizzle-kit 升级路径
- 监控 drizzle-kit 是否发布兼容新版本 esbuild 的更新
- 考虑替代方案（如果 drizzle-kit 长期不更新）

## 审批

- [x] 技术负责人: Claude Opus
- [x] 产品经理: Claude Opus  
- [ ] 团队负责人: 待确认

## 参考

- Dependabot Alert #7: https://github.com/DeliciousBuding/DiffAudit-Platform/security/dependabot/7
- esbuild Advisory: https://github.com/advisories/GHSA-67mh-4wv8-2f99
- npm audit 报告: 见上文

---

**结论**: 当前配置安全可控，专注于演示准备。
