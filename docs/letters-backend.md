# 云端信件后端

现有 Cloudflare Pages 承载网页，Pages Functions 提供 `/api/letters` 接口，D1 保存信件与回信。不需要额外购买或运行常驻服务器。生产配置需要名为 `LETTERS_DB` 的 D1 绑定，并执行 `migrations/0001_letters.sql`。未绑定数据库时接口明确返回 503，网页不能将本地保存误报成云端寄出成功。

## 数据与权限

- `letters`：不可修改的明信片快照、可选小尺寸角标图片、寄出时间、请求去重标识、寄件凭证的 SHA-256 摘要。
- `letter_replies`：对应信件的回信昵称、正文与时间。每封信最多 30 封回信。
- `letter_rate_limits`：短期连接 IP 摘要与发送次数；不会保存原始 IP，过期记录在后续写入时清理。
- 公开信件 ID 是 24 字节随机数。持有拆信链接的人可以阅读原信并回信，因此用户只应分享给希望收到信件的人。它不验证收件人的微信身份。
- 私密收件箱依赖独立的随机凭证，只有浏览器/寄件人保留明文，数据库保存摘要。凭证通过 `Authorization: Bearer …` 传给 API，不放在 API 查询字符串内。收件箱链接不可转发给好友；它是访问全部回信及收回原信的权限。
- 回信不会出现在公开拆信接口。只对寄件人开放的 DELETE 接口会删除原信及全部回信，让旧拆信链接失效。
- 此方案没有账号找回机制。寄件人应保存私密收件箱链接；浏览器数据清除且没有备份时，不能仅靠姓名找回。
- 内容在 D1 中是应用可读数据，未实现端到端加密。不要将用户信件正文、凭证或完整拆信链接记录到日志和第三方埋点。

## API 契约

| 请求 | 内容 / 返回 |
| --- | --- |
| `POST /api/letters` | `{card, logo?, ownerSecret, requestId}` → `{id, createdAt}` |
| `GET /api/letters/:id` | `{id, card, logo?, createdAt}`；不含回信与寄件凭证 |
| `POST /api/letters/:id/replies` | `{name, message, requestId}` → `{id, createdAt}` |
| `GET /api/letters/:id/inbox` | Bearer 寄件凭证 → `{letter, replies}` |
| `DELETE /api/letters/:id/inbox` | Bearer 寄件凭证 → `{deleted: true}` |

写入用 `application/json`。错误为 `{error, code}`；正文上限 180 KiB、图片 data URL 上限 160 KiB，仅允许与文件签名一致的 PNG/JPEG/WebP，禁止 SVG。回信昵称最多 20 字，正文最多 500 字。原信按现有四种模板的实际排版限制验证。

`requestId` 使用 UUID；创建按寄件凭证 + 请求 ID 去重，回信按信件 ID + 请求 ID 去重。同一请求 ID 携带不同内容返回 409。客户端应在网络重试时沿用 ID，以免出现重复信件。

当前每连接 IP 每小时最多创建 20 封、每天 120 封；每小时最多回信 40 次、每天 150 次。共享移动网络出口可能共享额度。数据库约束和单条条件插入同时限制重复回信、并发回信总数。所有 JSON 响应禁用缓存并标记不索引。

## 验证

运行 `node scripts/verify-letters-backend.cjs`。测试用内存 SQLite 执行真实迁移与实际 SQL，覆盖未配置数据库、跨域写入拒绝、正文/图片限制、私密凭证隔离、创建与回信去重、30 封回信上限、收回信件、发送限流。Node 24 的 `node:sqlite` 可能显示实验性提示，不影响测试。

上线前还须在 Pages Functions 实际运行环境完成一次不同浏览器身份的“寄出 → 公共链接拆信 → 回信 → 私密链接收信”流程。普通 Vite 预览不运行这些 API，应使用 Wrangler Pages 本地服务或已绑定 D1 的线上 Pages。
