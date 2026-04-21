# DiffAudit Platform GZ2 RUNBOOK

这个文件是 `gz2` 公网运行时的现场入口。

只要要改 `gz2` 上的 DiffAudit Platform，不管是代码、服务、环境变量还是发布动作，必须先读完：

1. `AGENTS.md`
2. `RUNBOOK.md`
3. `docs/public-runtime-runbook.md`
4. `docs/public-runtime-handoff.md`

## 1. 当前运行真相

- 公网域名：`https://diffaudit.vectorcontrol.tech`
- 公网链路：`Cloudflare -> hk -> gz2`
- `gz2` 工作树：`/home/ubuntu/projects/diffaudit/platform-web`
- 前端服务：`diffaudit-platform-web.service`
- 前端监听：`0.0.0.0:3000`
- 前端环境：`/etc/diffaudit-platform-web.env`
- API 服务：`diffaudit-platform-api.service`
- API 监听：`127.0.0.1:8780`
- API 环境：`/etc/diffaudit-platform-api.env`
- API tracked 二进制：`/home/ubuntu/projects/diffaudit/platform-web/apps/api-go/bin/platform-api-linux-amd64`
- 展示态 snapshot：`apps/api-go/data/public/*`
- Runtime 控制面上游：`DIFFAUDIT_RUNTIME_BASE_URL`

## 2. 改动前强制检查

先确认自己真的在动当前 live runtime，而不是旧目录或脏进程：

```bash
cd /home/ubuntu/projects/diffaudit/platform-web
git status --short
systemctl cat diffaudit-platform-web.service
systemctl cat diffaudit-platform-api.service
systemctl status diffaudit-platform-web.service --no-pager
systemctl status diffaudit-platform-api.service --no-pager
ss -ltnp | grep ':3000'
ss -ltnp | grep ':8780'
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/login
curl -I http://127.0.0.1:3000/workspace
```

必须确认：

- `web` 服务的 `WorkingDirectory` 指向 `/home/ubuntu/projects/diffaudit/platform-web`
- `3000` 端口只被当前 `systemd` 拉起的 `next-server` 占用
- `8780` 端口只被当前 `systemd` 拉起的 `platform-api` 占用

## 3. 常见坑

- 不要假设公网旧页面一定是 Cloudflare 缓存。先看 `gz2` 本机返回体。
- 不要只看源码和 `.next`。必须核对实际监听 `3000` 的进程。
- 如果 `systemctl restart diffaudit-platform-web.service` 后页面没变，优先排查是否有孤儿 `next-server` 继续占着 `3000`。
- 不要在 `gz2` 上留下根目录 `public/` 这类临时发布残留。
- 不要让 `apps/api-go/bin/platform-api` 这种现场二进制副本持续漂在仓库外。优先使用 tracked 的 `platform-api-linux-amd64`。

## 4. 前端发布流程

```bash
cd /home/ubuntu/projects/diffaudit/platform-web/apps/web
rm -rf .next
npm run build
sudo systemctl restart diffaudit-platform-web.service
sleep 5
curl -s http://127.0.0.1:3000/ | head
curl -s http://127.0.0.1:3000/login | head
```

然后再做公网验证：

```bash
curl -I https://diffaudit.vectorcontrol.tech/
curl -I https://diffaudit.vectorcontrol.tech/login
curl -I https://diffaudit.vectorcontrol.tech/workspace
```

## 5. API / Snapshot 发布流程

如果改了 `apps/api-go`：

```bash
cd /home/ubuntu/projects/diffaudit/platform-web
go -C apps/api-go test ./...
```

如果改了展示态数据：

```bash
cd /home/ubuntu/projects/diffaudit/platform-web
npm run publish:public-snapshot
```

如果现场 `Runtime` 控制面暂时不在线：

- 允许发布脚本复用已有 `catalog/models/summaries` snapshot
- 允许直接从 `Research/workspaces/implementation/artifacts/unified-attack-defense-table.json` 同步 admitted `attack-defense-table`
- 不允许把“发布期 fallback”误读成“请求期 fallback”；线上读路仍然只能读 `apps/api-go/data/public/*`

发布后至少检查：

```bash
curl -s -D - http://127.0.0.1:8780/api/v1/catalog
curl -s -D - http://127.0.0.1:8780/api/v1/evidence/attack-defense-table
curl -s -D - http://127.0.0.1:8780/api/v1/models
```

## 6. 交接最低要求

任何动过 `gz2` 的 agent 停止前必须写清：

- 改的是哪台机器：`gz2`
- 改的是哪个工作树：`/home/ubuntu/projects/diffaudit/platform-web`
- 重启了哪些服务
- 改动后本机和公网各自如何验证
- 是否留下未提交文件、未跟踪文件或临时构建物
