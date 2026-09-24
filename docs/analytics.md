# Moonpost 访问与行为统计

## 查看入口

- Cloudflare → Workers & Pages → Moonpost → Web Analytics：浏览量、访客与加载体验。后台开关已开启，正式页面已验证注入 Cloudflare beacon。
- Umami → 网站 → Moonpost：访问概况；Events / 事件查看下表的自定义事件，Properties / 属性按 station、outcome 等拆分。实时页面如账户界面提供，可查看近期访问；数据上报与聚合存在延迟，不保证秒级显示。
- 自定义数据关联网站 ID `a41616f5-45df-484f-a774-3d75c24b9b6d`。该 ID 为公开统计标识，不是管理密钥。

## 事件字典

|事件|触发时机|属性|
|---|---|---|
|页面浏览（Umami 标准 pageview）|首次打开或切换到不同路由|规范路径，如 /quiz；页面标题|
|station_view|首次打开或进入不同站点|station；首页为 home|
|activity_start|开始月饼/玉兔游戏；问答/身份测试首次选择；重玩|station、difficulty（如适用）|
|activity_end|游戏结束或测试完成；进行中切换路由/重玩|station、outcome、elapsed_seconds、成绩属性|
|stamp_awarded|首次成功保存某枚邮戳|station|
|wish_save_success|心愿本地保存成功|is_edit、style|
|postcard_export_success|生成 PNG 并发起一次文件下载|template、source：generate/editor/history|
|certificate_claim_success|纪念证领取并本地保存成功|style|
|certificate_export_success|生成并发起一张证书图片下载|side、style|
|sound_toggle|用户切换声音|enabled|

activity_end 的 outcome：completed（限时月饼/问答/身份完成），won/lost（玉兔），abandoned（路由离开或重开）。reason 区分 route_change/restart。elapsed_seconds 为开始至结束的现实经过时间，包含暂停，不是纯游玩时间。浏览器强制关闭可能没有结束事件；不能将缺失事件当作精确的退出时刻。

月饼成绩：score/correct/missed/max_combo/difficulty。知识问答：correct/total。身份：result_id（不记录逐题答案）。玉兔：distance/mooncakes/passports/stage。

下载事件表示程序成功发起下载，不证明系统最终保存成功。证书双面下载为两次文件导出。邮戳按当前浏览器已保存记录去重，清除本地数据后可能重新获得。

## 建议看板

1. 站点热度：station_view，按 station 拆分，分别看事件次数和访客数。
2. 游戏参与：activity_start，按 station 拆分。
3. 完成情况：activity_end，按 station + outcome 拆分。月饼完成仅代表倒计时结束，成绩独立显示。
4. 留念转化：postcard_export_success、certificate_claim_success、certificate_export_success。
5. 游戏漏斗：station_view → activity_start → activity_end，并对每步设置相同 station、最后一步限定 completed/won。不同游戏分开建立，不混算全站通关率。

## 朋友圈来源

推荐分享：
https://moonpost.pages.dev/?utm_source=wechat&utm_medium=moments&utm_campaign=midautumn2026

本次页面生命周期中保留这三个来源字段到事件属性；站内跳转不会丢失。只能使用 1–80 位字母、数字、下划线或短横线；不采集其他查询参数。来源在 Events 的属性中查看，不能依赖被移除查询参数的标准 UTM 报表。链接转发会保留原来源。验证流量使用 utm_source=qa，可在事件分析中排除。

## 性能和数据边界

SDK 动态异步加载，不等待其完成才渲染游戏；加载失败不影响业务。首次加载队列最多80条，成功加载后发送原路由快照。不重试失败请求，避免重复事件。HashRouter 手动发送规范路径且关闭自动 pageview，避免各站都被归到 / 或重复计算。

仅 moonpost.pages.dev 正式域名开启 Umami，本地和预览域名不统计。尊重 Do Not Track。未启用录屏、热图和全量点击自动采集，也不发送姓名、留言正文、照片、答案列表、作品内容或个人作品 ID。启用 Umami 的 Performance 用于加载体验指标。网站当前没有登录，访客统计不能识别具体微信好友，且可能受网络、拦截器等影响。

## 验证

`node scripts/verify-analytics.cjs`：页面去重、延迟 SDK 队列、路由快照、活动生命周期、隐私字段、DNT、本地排除、SDK失败。
`npm run build`：类型与生产构建。
发布后检查 cloud.umami.is 脚本和其上报请求返回成功，再去已登录的后台查看数据。

## 云端信件

- `letter_created`：云端封信成功，属性仅含 template。
- `letter_share_link_copied`：复制好友拆信链接（不代表已在微信实际发送）。
- `mailbox_link_copied`：复制私密入口。
- 拆信/回信页面事件以 `letter_opened`、`reply_sent` 等为准，见页面调用。
- 新页面访问统一归入 `/letter`、`/mailbox`，不上传真实信件路径、收件箱密钥、署名或正文。
