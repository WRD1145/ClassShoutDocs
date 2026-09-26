# 安装与部署

## 需要什么

| 组件 | 跑在哪 | 说明 |
|---|---|---|
| 教室端 | 教室里的 Windows 电脑 | 单文件 exe，双击即用，**不需要装 .NET 运行时** |
| 教师端 | Android 手机 / Windows 电脑 | APK 或单文件 exe |
| 中继服务器 | 任意能上公网的机器 | 只在跨网络时需要；Windows 与 Linux 都有 |

教室端也支持 Linux（发布物里有 `ClassShout.Classroom-linux-x64`），
但 Linux 上需要系统里有 `spd-say` 或 `espeak-ng` 才能用系统语音 ——
没有的话建议在设置里改用 Edge 在线语音，否则教室里不会出声。

## 打包（从源码）

```powershell
dotnet build ClassShout.slnx -c Release
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

产物在 `dist/release/`，脚本会把它按"最终附件名"摆好，并生成 `SHA256SUMS.txt`。
详细参数见 [构建与打包](/dev/build.html)。

## 部署教室端

1. 把 `ClassShout.Classroom-win-x64.zip` 解压到一个固定目录，例如 `C:\ClassShout\`，
   双击里面的**「ClassShout.Classroom.exe 启动.cmd」**即可。
2. 首次启动 Windows 可能弹防火墙提示，**要勾选「专用网络」并允许** ——
   局域网模式下教师端需要连进来（TCP 45900）并靠 UDP 45901 被发现。
3. 在界面右侧填**教室名**（例如「三年二班」），它会出现在教师端列表、弹窗和服务器控制台上。

解压出来的样子（每个应用都一样）：

```
ClassShout.Classroom/
├─ ClassShout.Classroom.exe 启动.cmd    ← 双击这个（Windows）
├─ run.sh                               ← Linux 下跑这个
├─ 使用说明.txt
├─ logs/                                ← 运行日志落在这里
└─ app/                                 ← 程序本体（exe 与全部依赖）
```

**为什么程序本体在 `app\` 里、DLL 不能单独再分一个文件夹**：
.NET 的运行时宿主文件（`hostpolicy.dll` / `hostfxr.dll` / `coreclr.dll` /
`System.Private.CoreLib.dll` …）**必须与 exe 同级**，而它们占了文件数的一大半；
把其余程序集挪进 `lib\` 再改写 `deps.json` 会让应用直接崩在
`hostpolicy.dll not found`（实测过）。所以能收拾的是**界面**：顶层只有启动脚本、
说明和 `logs\`，两百多个程序文件全部待在 `app\` 里。

教室端的数据（教室名、UUID、口令、账号、主题色）不在程序旁边，而在当前 Windows
账户的用户目录里（`%LOCALAPPDATA%\ClassShout\`）。这是有意为之：程序可能被装在
只读位置，而且同一台机器上不同账户应当有各自独立的教室身份。
文件的清单见 [配置文件一览](/reference/config-files.html)。

**运行日志写在软件目录下的 `logs\`**（不是 AppData）—— 按天一个文件、只留 7 天。
装在只读位置时会逐级退到 `CLASSSHOUT_LOG_DIR` 指定的目录、再退到用户数据目录，
退到哪一级会显示在设置页的「关于」里。

**设为开机自启**：教室端 → 设置 → 「后台运行」→ 开机自启。打开后会在启动文件夹里放一个快捷方式。

命令行也能设，教室那台机器不方便点界面时用得上：

```powershell
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-on       # 开启
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-off      # 关闭
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-status   # 查状态
```

> 需要「无人登录也能跑」或「以最高权限运行」时仍要用**计划任务**（启动文件夹做不到这两点）。
> 用计划任务时请把界面上的「开机自启」保持关闭，否则会被拉起两次。

## 部署教师端

**Android**：

```powershell
adb install -r dist\release\classshout-teacher-<版本>-universal.apk
```

首次启动会申请麦克风权限（语音喊话要用）。拒绝也不影响文字与图片喊话。

**Windows**：把 `ClassShout.Teacher-win-x64.zip` 解压到固定目录，双击里面的
`ClassShout.Teacher.Desktop.exe`。**Android 版与 Windows 版都在这一张卡片里** ——
检查更新时会按你运行的平台挑对应的附件（手机挑 `.apk`、桌面挑那个 zip）。

## 部署中继服务器

只在老师的手机与教室不在同一个网络时才需要。把 `ClassShout.RelayServer-linux-x64.tar.gz`
（或 Windows 版）解压到服务器上跑起来，然后两端都填上它的地址。完整流程见
[中继服务器](/guide/relay.html) —— 那里有两个 Linux 上必踩的坑：**解压后要
`chmod +x`**（Windows 打的 tar 不保留可执行位），以及**状态文件路径要显式指定**。

## 三个组件都要升级

新功能（图片、展示参数、定时、分享链接）依赖两端的新协议。
旧版教室端**不会报错**，只是图片收不到、展示参数会退回它自己的默认值 ——
所以升级时请把两端一起升。

> **1.10.0 起产物形式变了**：不再是单个 exe，而是压缩包（解压出 `app/` + `logs/` +
> 启动脚本）。升级方式跟着变成"解压覆盖同一个目录"，还是双击那个启动脚本。
> 配置都在用户目录里，日志在软件目录下的 `logs/`，覆盖不会丢东西。

## 检查更新（以及 GitHub 慢的时候怎么办）

教室端与教师端的设置页最后都有一张「版本与更新」：显示当前版本，
点「检查更新」就去问一次有没有新版本；查到了可以直接打开下载地址，
也可以打开完整的发行版页面。

**GitHub 在校园网里常常慢到不能用**，所以镜像源是一份可以增删的列表，
内置了六条：

| 内置镜像 | 走哪套接口 |
|---|---|
| 直连 GitHub | `api.github.com` |
| **Gitee 码云（li-hansen136）** | `gitee.com/api/v5`，仓库是码云上那份镜像 |
| ghproxy.net / gh-proxy.com / ghfast.top | GitHub 的 API + 下载地址走代理前缀 |
| kkgithub | `api.kkgithub.com` + 域名替换 |

点「一键检测全部镜像」会**并发**把每条都测一遍（六条约 200 毫秒全部回来，
而不是一条一条等），列出通不通、耗时、查到的最新版本，并自动切到最快的那条。
每条也能自己加（名字 / GitHub 还是 Gitee / API 地址 / 仓库 / 下载模板）、自己删；
内置的删不掉 —— 它们是"一条都不剩"时的兜底。

**连不上多半是代理的问题**，所以代理是显式的一档：跟随系统 / 不使用 / 自己填地址。
界面下方会显示**实际解析出来的代理**（「系统代理 → http://127.0.0.1:7890」
或「系统没有配置代理（直连）」）—— 一眼能看出是系统代理没读到，还是地址填错了。

> **「跟随系统」直接读 Windows 的系统代理设置**，而不是用 .NET 自带的解析：
> 后者只要发现任何代理环境变量就会选"只看环境变量"的实现，而它按 URL 的 scheme
> 取变量（https 请求只看 `HTTPS_PROXY`）。代理软件常常只设了 `HTTP_PROXY`，
> 于是 https 请求一个都不走代理 —— 表现就是"浏览器能开、应用连不上"。
> 如果你的代理是特殊的（比如只监听 socks），可以直接选「自己填代理地址」，
> 写 `http://127.0.0.1:7890` 或 `socks5://127.0.0.1:1080`。

> 检查**只在你按下按钮时发生**，不做后台轮询 —— 每次开应用都去外面问一次
> "有没有新版本"，对一台放在教室里的机器没有任何必要。
> 设置存在本机（见[配置文件一览](/reference/config-files.html)），两端各存各的。

服务器的版本号在 `/api/health` 里，升级完 `curl` 一下就知道新版本部署上去了没有：

```bash
curl -s https://relay.example.com/api/health
# {"ok":true,"service":"ClassShout.RelayServer","version":"1.9.0",...}
```

