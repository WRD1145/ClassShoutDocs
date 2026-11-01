# 插件开发

本文对应 **ClassShout 1.21.0 / 扩展 API v1**，供编写 ClassShout 本机进程插件及 HTTP IPC 客户端使用。[可运行示例](https://github.com/WRD1145/ClassShout/blob/v1.21.0/examples/plugins/hello.ps1)与[IPC 客户端](https://github.com/WRD1145/ClassShout/blob/v1.21.0/scripts/classshout-ipc.ps1)均在主仓库中。

## 选择扩展方式

| 方式 | 如何连接 | 适用场景 |
|---|---|---|
| 进程插件 | 宿主启动程序，经标准输入输出交换 UTF-8 JSONL，不需要 IPC 令牌 | 随 ClassShout 启动的本机自动化 |
| HTTP IPC | 外部程序访问回环 HTTP，需要 Bearer 令牌且启用 IPC | 已独立运行的脚本或第三方应用 |

两种方式共享业务接口，但授权范围和传输限制不同。进程插件可在 `IpcEnabled: false` 时独立工作。当前不是 DLL 插件加载器，没有事件订阅、UI 注入、插件商店或安装包 SDK；不要把 DLL 直接填进 `Executable`。此页也不是 ClassIsland 插件开发文档：读取 ClassIsland 实时课表的桥接插件见[ClassIsland 联动](/guide/classisland.html)。

## 教室端与教师端

| 项目 | 教室端 | 桌面教师端 |
|---|---|---|
| 配置文件 | `extensions.json` | `teacher-extensions.json` |
| HTTP 地址 | `http://127.0.0.1:45903` | `http://127.0.0.1:45904` |
| 配置入口 | 设置 → 本机 IPC 与插件 | 设备 → 教师端本机 IPC 与插件 |
| 喊话目标 | 本机教室，不要求中继在线 | 当前已连接的教室，沿用 LAN 或中继通道 |
| 状态字段 | `classroom`、`muted`、`volume`、`apiVersion` | `connected`、`classroom`、`apiVersion`、`role: "teacher"` |
| 回执保留 | 当前进程中的扩展记录 | 当前会话最近 100 条投递记录，淘汰后返回 410 |

Android 不运行这版桌面 IPC 或进程插件。配置目录以界面显示为准；Windows 默认 `%LOCALAPPDATA%\ClassShout`，设置 `CLASSSHOUT_DATA_DIR` 可覆盖。两端即使共用目录，配置文件和令牌也彼此独立。

## 注册与生命周期

先在对应端点击一次「保存并应用扩展设置」（教师端为「保存并应用教师端扩展」），生成配置文件。保留现有 `Token`、`IpcEnabled` 和其他条目，将以下对象加入 **`Plugins` 数组**，不要用它替换整个文件。字段大小写按示例保留。

```json
{
  "Id": "hello",
  "Executable": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
  "Arguments": [
    "-NoProfile",
    "-File",
    "D:\\ClassShoutPlugins\\hello.ps1"
  ],
  "Enabled": true
}
```

`Executable` 必须是已存在的绝对可执行路径；参数逐项填写，不经 shell 拼接。示例需要已安装 PowerShell 7；请按 `Get-Command pwsh` 的结果修改路径，并把示例脚本放到对应位置。工作目录是可执行文件所在目录，而不是脚本目录，脚本访问资源请使用 `$PSScriptRoot` 或绝对路径。

`Id` 为 1–64 个 ASCII 字母、数字、点、横线或下划线，同一端内保持唯一。只读取数组前 16 项，包括禁用项。`Enabled` 默认为 false；保存文件后回到界面再次应用，或重启宿主。重新应用会先停止旧插件，再启动启用的条目；界面的 IPC 开关决定最终 `IpcEnabled` 值。

退出宿主或重新应用时，插件进程树会被终止。插件自行退出、通信失败或命令超时后不自动重启；修复后手动重新应用。禁用插件时设 `Enabled: false` 并应用。长驻插件应持续读取 stdin，不要依赖弹出控制台或关闭设置窗口来结束。

## JSONL 通信协议

插件向 **stdout** 写一行请求并刷新缓冲，从 **stdin** 读一行响应。使用不带 BOM 的 UTF-8，每条 JSON 以换行结束；同一个进程内建议串行请求、串行读取响应。宿主没有单独的请求关联 ID 或主动推送事件，不要并发写多条请求后假设响应能按自定义编号匹配。

```json
{"method":"POST","path":"/v1/shouts","body":{"id":"demo-1","text":"请准备上课。","speak":false}}
{"method":"GET","path":"/v1/receipts/demo-1","body":{}}
```

上面是两条独立请求；实际程序必须先读取提交响应，再查询回执。`method`、`path`、`body` 必填，方法使用 `GET` / `POST`；即使 GET 也提供 `body: {}`。宿主返回 `{ "status": 整数, "body": 对象 }`，例如：

```json
{"status":202,"body":{"id":"demo-1","accepted":true,"duplicate":false}}
{"status":200,"body":{"id":"demo-1","stage":"displayed","failure":null,"timeline":[{"stage":"sent","at":"2026-11-01T11:00:00+00:00","detail":null},{"stage":"displayed","at":"2026-11-01T11:00:01+00:00","detail":null}]}}
```

以上回执是格式示例，实际时间和阶段由执行情况决定。插件 stdout 不得写欢迎语、进度或普通日志；这些输出会被当成命令。stderr 会被持续排空，但不会自动写入 ClassShout 日志。需要持久调试时，插件自行写到受控文件，不记录密钥。

## 接口与返回状态

| 请求 | 行为 |
|---|---|
| `GET /v1/status` | 查询当前端状态，不等于已完成投递 |
| `POST /v1/shouts` | `{ "id": "唯一标识", "text": "文字", "speak": false }`；`speak` 可省略，默认 false；使用不打断模式 |
| `GET /v1/receipts/消息标识` | 查询本调用来源的回执；标识放进 URL 前进行路径段编码 |
| `POST /v1/stop` | **仅 HTTP IPC 可用**；进程插件调用返回 404 |

`id` 长度为 1–80 字符，`text` 为 1–10000 字符，均不可为空白；还必须满足下面的传输长度限制。首次接收通常返回 202，相同来源、相同 id 和相同内容重试返回 200、`duplicate: true`；内容或 `speak` 不同返回 409。更换教师端连接的教室不会让旧 id 重新发送。

| 状态 | 含义 |
|---|---|
| 200 / 202 | 查询或幂等重试成功 / 已接收；均不能代替执行回执 |
| 400 | JSON、必填字段、长度或 HTTP 请求格式无效 |
| 401 | HTTP IPC 令牌缺失或不匹配；进程插件不使用这个令牌 |
| 404 | 接口不支持，或当前来源找不到该消息 |
| 409 | id 内容冲突，或教师端尚未连接教室；结合 `body.error` 判断 |
| 410 | 教师端回执已被最近 100 条列表淘汰 |
| 429 | 本次进程运行的扩展消息达到 1000 条上限，需重启宿主 |
| 502 | 教师端尝试发送失败，应查询同一 id 的回执 |

标识命名空间按 HTTP IPC、每个插件 Id 隔离；插件不能查询其他插件或 IPC 提交的消息。1000 条额度按当前端全体扩展共享。重新应用扩展不会清空该进程的去重表；重启后去重及回执不保留。

## 正确处理送达回执

`stage` 为 `sent`、`delivered`、`displayed`、`completed` 或 `failed`。`timeline` 中每项有 `stage`、`at` 和可空 `detail`，失败原因同时放在 `failure`。时间包含时区；不要要求每条消息都经历全部中间阶段。

纯展示消息等到 `displayed` 即可；`speak: true` 的消息应等 `completed` 才算朗读完成。先判断 `failed` 并记录原因。朗读可能排队，不要在取得 `displayed` 后就把“朗读完毕”报给调用方。

可按示例间隔 200 ms 查询，实际业务应设置合理的轮询和整体超时。宿主通信超时或连接断开不等于消息没有执行，尤其教师端网络发送可能仍在进行；先查询或使用同一 id 重试，不要未经确认就换新 id 重发。404、410 或宿主重启后无法单凭本地回执确认历史执行情况。

## 可运行的最小插件

将下列内容保存为 UTF-8 的 `hello.ps1`，按注册示例启动。它会发送一条**真实**的纯展示喊话，并最多轮询约 6 秒；教师端必须先连接测试教室。这个演示的短轮询不适合等待长语音完成。

```powershell
# JSON 行插件示例：stdout 只写协议，诊断请写 stderr；不需要 IPC 令牌。
$ErrorActionPreference='Stop'
[Console]::InputEncoding=[Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$OutputEncoding=[Console]::OutputEncoding
$id=[guid]::NewGuid().ToString('N')
@{method='POST';path='/v1/shouts';body=@{id=$id;text='ClassShout 示例插件已启动。';speak=$false}} | ConvertTo-Json -Compress -Depth 5 | Write-Output
$accepted=[Console]::ReadLine() | ConvertFrom-Json
if($accepted.status -notin 200,202){exit 1}
for($n=0;$n -lt 30;$n++){
    @{method='GET';path=('/v1/receipts/'+$id);body=@{}} | ConvertTo-Json -Compress | Write-Output
    $receipt=[Console]::ReadLine() | ConvertFrom-Json
    if($receipt.body.stage -in 'displayed','completed'){exit 0}
    if($receipt.body.stage -eq 'failed'){exit 1}
    Start-Sleep -Milliseconds 200
}
exit 2
```

Windows 默认控制台编码可能不是 UTF-8，所以示例显式设置输入、输出和 PowerShell 管道编码。其他语言同样需要 UTF-8、每行一次 flush，并将调试日志与协议输出分开。示例返回 0 表示观察到上屏或完成，1 表示拒绝或失败，2 表示演示等待超时；不能把退出码 2 推断为绝对未执行。

## HTTP IPC 调试与自检

HTTP IPC 需要在对应界面启用。使用该配置文件的 `Token` 作为 `Authorization: Bearer ...`，只从可信本机程序调用；不要把令牌写入文档、插件参数或网页。进程插件不需要先开启这个端口。仓库客户端会读取令牌，默认操作为查询状态：

```powershell
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Text "请准备上课" -Id demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Receipt demo-1
```

`-Role Classroom` 调用教室端；自定义目录加 `-DataDirectory`。HTTP 响应直接是业务对象，不再包裹 JSONL 的 `status` / `body`；业务状态从 HTTP 状态码读取。HTTP 不支持分块正文，请发送明确的 `Content-Length`。错误 Origin、非回环 Host 和重复请求头会被拒绝；不要通过浏览器调用或将端口映射到公网。

修改宿主实现后可在主仓库执行以下检查；教师端扩展冒烟会启动隔离的真实教室端，测试发消息和回执，请在测试环境运行：

```powershell
dotnet build ClassShout.DesktopOnly.slnf -c Release
dotnet run --project tools/ClassShout.EndToEnd -c Release --no-build -- --extensions
pwsh -File scripts/smoke-teacher-extensions.ps1
pwsh -File scripts/regress.ps1
```

## 限制与故障排查

| 现象 | 检查方法 |
|---|---|
| 插件没启动 | 核对当前端配置文件、Enabled、绝对路径、Id、数组前 16 项及宿主插件日志；确认保存后已应用 |
| 中文损坏或通信立即停止 | 检查 stdin/stdout UTF-8、无 BOM、换行和 flush；删除 stdout 普通日志 |
| 启动后又退出 | 每条命令处理限时 5 秒；超时会停止通信并终止插件进程树，查看宿主日志与插件自有日志 |
| 202 后没有声音 | 默认 speak=false；改为 true 后等待 completed，检查教室静音、TTS 与音量 |
| 查不到回执 | 核对插件 Id、消息 Id 和调用来源；教师端可能已淘汰记录，重启也会清空 |
| 迁移后没有插件 | 配置备份不导出插件清单或令牌，需在新设备重新审核路径并显式启用 |

JSONL 每行最多 8192 个宿主字符（不是 UTF-8 字节），包含完整请求 JSON；因此业务层 10000 字上限不代表单行插件可以发送这么多字。HTTP 请求头最多 8192 字节、正文最多 32 KiB、单连接限时 5 秒，最多 4 个并发连接；超出连接额度会关闭连接。没有音频、图片、课表写入或定时接口。

进程插件是**可信本机程序**，仍有当前系统用户权限。API 不提供登录或中继令牌，不等于操作系统阻止它读取本机文件；进程隔离及消息命名空间都不是安全沙箱。只启用经过审核的可执行程序，不把这些限制当作执行不可信代码的保证。
