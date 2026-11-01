# 本机 IPC 接口

本页只描述外部程序使用的 HTTP IPC。插件 SDK、依赖注入与程序集隔离另见[插件开发](/dev/plugins.html)，不需要启用 IPC。协议版本为 1；[下载 OpenAPI 3.0 文档](/ipc.openapi.json)。

## 地址与配置

| 端 | 地址 | 当前开发版配置 | 1.21.0 旧配置 |
|---|---|---|---|
| 教室端 | http://127.0.0.1:45903 | classroom-ipc.json | extensions.json |
| 桌面教师端 | http://127.0.0.1:45904 | teacher-ipc.json | teacher-extensions.json |

开发版已将 IPC 与插件配置、启停分开，旧版升级自动保留令牌和开关。本文端口、HTTP 路由和响应格式兼容 1.21.0。Android 不开放桌面 IPC。目录以设置界面显示为准，Windows 默认 `%LOCALAPPDATA%\ClassShout`，可用 CLASSSHOUT_DATA_DIR 覆盖。

在「本机 IPC」中开启并保存 IPC 设置。默认关闭，只监听回环，不是公网或浏览器 API；保存 IPC 不会重启插件。

## 鉴权与请求规则

每个请求必须包含 `Authorization: Bearer Token`，Token 从对应端的 IPC 配置文件读取。两端凭据独立。不要把真实令牌提交到仓库、写进网页或发给插件；新托管插件使用类型化注入服务。

HTTP/1.1，每个连接处理一个请求后关闭；路径和方法按下表原样填写。带正文时发送 Content-Length，不支持 Transfer-Encoding 分块。JSON 使用 UTF-8；应用请求头最多 8192 字节、正文最多 32 KiB、连接限时 5 秒、同时最多 4 个连接。超过并发额度会关闭连接，不保证返回 HTTP 状态码。

拒绝跨站 Origin、非回环 Host、重复请求头及非法长度；不要反向代理或把端口映射到公网。Origin 为非空时被拒绝，即使带正确令牌。

## 查询状态

`GET /v1/status`，无正文。教室端返回本机接收信息；教师端返回当前连接信息。200 只代表接口调用成功，不代表某条喊话完成。

```json
{"classroom":"三年二班","muted":false,"volume":80,"apiVersion":1}
{"connected":true,"classroom":"三年二班","apiVersion":1,"role":"teacher"}
```

上面分别为两个端的响应，不是一个 JSON 响应中的两行。

## 发送文字

`POST /v1/shouts`，Content-Type: application/json; charset=utf-8。

```json
{"id":"demo-1","text":"请准备上课。","speak":false}
```

Id 为 1–80 字符，text 为 1–10000 字符，均不可全为空白；正文还受 32 KiB 限制。speak 默认 false，使用不打断模式。教室端本机执行；教师端向当前连接的教室发送，不会自动连接或向全部教室广播。

```json
{"id":"demo-1","accepted":true,"duplicate":false}
```

首次接收返回 202；同一调用来源、相同 id / text / speak 的重试返回 200 且 duplicate=true；相同 id 不同内容返回 409。更换当前教室不会让同一 id 再次发送。202 和 200 都必须结合执行回执判断结果。

## 查询执行回执

`GET /v1/receipts/消息标识`，URL 中的标识先进行路径段编码。

```json
{"id":"demo-1","stage":"displayed","failure":null,"timeline":[{"stage":"sent","at":"2026-11-01T11:00:00+00:00","detail":null},{"stage":"displayed","at":"2026-11-01T11:00:01+00:00","detail":null}]}
```

stage 为 sent / delivered / displayed / completed / failed。纯展示以 displayed 为完成，朗读等 completed；失败读取 failure。timeline 的 at 带时区，中间阶段可能跳过。请求超时不表示绝对未执行，先查询相同 id，避免盲目生成新 id 重发。

去重和回执不跨宿主重启保留；每端所有扩展共享 1000 条去重记录。教师端回执还受最近 100 条投递列表限制，淘汰返回 410。404 / 410 不能用来证明历史从未执行。

## 停止当前消息

`POST /v1/stop`，可不带正文。教室端返回 `{ "stopped": true }`；教师端返回 `{ "requested": true }`，仅说明已请求当前教室停止，不是远端完成回执。这个 HTTP 接口可以影响当前播放，插件 SDK 不暴露全局停止能力。

## 状态码与故障

| HTTP 状态 | 说明 |
|---|---|
| 200 / 202 | 查询或幂等重试成功 / 已接收 |
| 400 | JSON、字段、长度、Origin、Host 或请求格式无效 |
| 401 | 令牌缺失或错误 |
| 404 | 不支持的接口或找不到当前来源消息 |
| 409 | Id 内容冲突，或教师端尚未连接教室 |
| 410 | 教师端回执已从最近列表淘汰 |
| 429 | 当前进程扩展消息额度耗尽，需重启 |
| 500 | 宿主执行异常 |
| 502 | 教师端网络发送失败，查询同 id 回执确认 |

错误体为 `{ "error": "原因" }`。接口令牌相同也不能读取插件命名空间中的回执。诊断导出不包含真实令牌；日志和自动化脚本也应避免输出凭据。

## 调用示例

在主仓库中使用 PowerShell 7 客户端。它按端读取新配置，未迁移时兼容旧文件，不把令牌输出到终端：

```powershell
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Text "请准备上课" -Id demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Receipt demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Stop
```

改为 -Role Classroom 调用教室端，自定义目录使用 -DataDirectory。发送及停止命令会影响真实教室，请先在测试教室验收。
