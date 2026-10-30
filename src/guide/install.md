# 安装与部署

## 需要什么

| 组件 | 跑在哪 | 说明 |
|---|---|---|
| 教室端 | 教室里的 Windows 电脑 | 压缩包，解压即用；运行时在 `runtime/` 下，**不需要装 .NET 运行时** |
| 教师端 | Android 手机 / Windows 电脑 | APK，或桌面版的压缩包 |
| 中继服务器 | 任意能上公网的机器 | 只在跨网络时需要；Windows 与 Linux 都有 |

教室端也支持 Linux（发布物里有 `ClassShout.Classroom-linux-x64`），
但 Linux 上需要系统里有 `spd-say` 或 `espeak-ng` 才能用系统语音 ——
没有的话建议在设置里改用 Edge 在线语音，否则教室里不会出声。
托盘、通知、播放与录音各自的依赖见 [Linux 上的教室端](/guide/linux.html)。

## 系统要求

| 平台 | 最低要求 | 跑什么 |
|---|---|---|
| Windows（x64） | **Windows 10 1607** 或更高（Windows 11 也算） | 教室端、教师端桌面版、中继服务器 |
| Linux x64 | 64 位发行版；教室端要有 X11 或 Wayland 会话 | 教室端、中继服务器（**没有教师端**） |
| Android | 手机或平板，arm64 或 x64 | 教师端 |

Windows 那一行不是"建议配置"，是硬门槛：程序建立在 **.NET 10** 上，而 .NET 10 本身不支持
Windows 10 1607 以前的系统。教室里常见的 Windows 7 机器为什么不行，见下一节。

### 为什么不支持 Windows 7

**.NET 10 的运行时从一开始就不认 Windows 7 / 8.1。** 微软在 .NET 7 发布时把这两个系统从支持列表里
拿掉了（.NET 6 是最后一个还列着 Windows 7 SP1 的版本，而 .NET 6 本身在 2024 年 11 月已经停止支持）。
所以在 Windows 7 上，**.NET 主机在跑到我们的代码之前就失败了**，典型报错是
「无法定位程序输入点」（英文系统上是 "The procedure entry point ... could not be located"）。
这不是配置问题，也没有哪个设置能把它打开。

**也不是"加一行 Win7 支持"的事。** 界面用的 FluentAvalonia 2.5 只发 `net10.0` 的程序集；
要支持 Windows 7，得先换掉这个组件库，再把目标框架改到 .NET Framework 4.8（最后一个能在
Windows 7 上跑的运行时）或已经停止支持的 .NET 6，然后重写那些只存在于 .NET Core 里的 API ——
比如 TLS/HTTP 这一层用的 `SocketsHttpHandler` 与 `SslClientAuthenticationOptions`，
在 .NET Framework 上一个都没有。这是一个单独的分支，不是一个构建选项。

**从 v1.19.1 起，发布包里的 Windows 启动脚本会先查系统版本**（也就是解压出来那个以
「启动.cmd」结尾的脚本，例如 `ClassShout.Classroom.exe 启动.cmd`）：低于 Windows 10 时
先打印一段说明再退出，而不是让 .NET 主机崩在一句看不懂的报错上。

> [!tip]
> 教室里的旧机器可以装 Windows 10 / 11，也可以换一台便宜的 x64 Linux 小主机 ——
> Linux 的教室端同样不需要装 .NET（见 [Linux 上的教室端](/guide/linux.html)）。

## 打包（从源码）

```powershell
dotnet build ClassShout.slnx -c Release
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

产物在 `dist/release/`，脚本会把它按"最终附件名"摆好，并生成 `SHA256SUMS.txt`。
`-FrameworkDependent` 现在表示**连 `runtime\` 都不带**：体积最小，但目标机上必须先装好
.NET 10 运行时。
详细参数见 [构建与打包](/dev/build.html)。

## 两种装法：便携版还是安装程序

Windows 的两个应用各有两个文件，选一个就行：

| 文件 | 形态 | 适合 |
|---|---|---|
| `ClassShout.Classroom-win-x64.zip`<br/>`ClassShout.Teacher-win-x64.zip` | **便携版（自包含 / 无依赖）** | 不想在系统里留东西、或者装在 U 盘/共享盘上带着走。解压即用，删目录即卸 |
| `ClassShout.Classroom-win-x64-setup.exe`<br/>`ClassShout.Teacher-win-x64-setup.exe` | **安装程序（同时是更新程序）** | 教室里那台电脑长期使用：装一次，之后双击快捷方式就开，不用记"要先双击启动脚本" |

两者的内容完全一样（自包含，目标机都不用装 .NET），只是**摆放方式不同**：

- 便携版把运行时收在 `runtime\` 下，所以启动时必须由启动脚本先设 `DOTNET_ROOT`；
- 安装版是**平铺**的（运行时就在主程序旁边），快捷方式直接指向主程序，双击就开。

### 用安装程序（推荐给教室）

双击 `setup.exe` → 它问装到哪（回车用默认的 `%LOCALAPPDATA%\ClassShout\应用`）→ 装完会问要不要现在启动。
**不需要管理员权限**：装在当前用户目录下，卸载也走「设置 → 应用 → 已安装的应用」里那一栏。

- **更新**：拿新版的 `setup.exe`，运行时加 `/update`（或者直接双击 setup.exe 覆盖安装也一样）。
  它会自己关掉正在运行的实例、覆盖程序文件、再拉起新版本。**日志与设置都不会被动**。
- **卸载**：「设置 → 应用 → 已安装的应用」里找到它，或者开始菜单里的「卸载 …」。
  卸载只删程序与快捷方式，**不删设置**（设置在本机配置目录，想彻底清干净得手动删 `%LOCALAPPDATA%\ClassShout`）。
- 没有代码签名证书，第一次运行会有 SmartScreen 提示：点「更多信息」→「仍要运行」。

### 用便携版

解压到任意目录，双击里面的「程序名 启动.cmd」。**别直接双击 exe**：不设 `DOTNET_ROOT` 时
它会去找系统里装的那份 .NET，找不到就报 "You must install or update .NET"。
## 部署教室端

1. 把 `ClassShout.Classroom-win-x64.zip` 解压到一个固定目录，例如 `C:\ClassShout\`，
   然后**双击解压根目录里的「ClassShout.Classroom.exe 启动.cmd」**。
   **别直接双击 exe**：启动脚本先设好 `DOTNET_ROOT` 再起主程序；不设它，exe 会去找
   系统里装的那份 .NET，找不到就报 "You must install or update .NET"。
2. 首次启动 Windows 可能弹防火墙提示，**要勾选「专用网络」并允许** ——
   局域网模式下教师端需要连进来（TCP 45900）并靠 UDP 45901 被发现。
3. 在界面右侧填**教室名**（例如「三年二班」），它会出现在教师端列表、弹窗和服务器控制台上。

解压出来的样子（每个应用都一样）：

```
ClassShout.Classroom/
├─ ClassShout.Classroom.exe 启动.cmd    ← 双击这个（Windows）
├─ run.sh                               ← Linux 下跑这个
├─ 使用说明.txt
├─ ClassShout.Classroom.exe             ← 主程序，与它用到的 dll/json 一起就在这一层
├─ runtime/                             ← 私有 .NET 运行时（host/fxr/<版本> + shared/<框架>/<版本>）
└─ logs/                                ← 运行日志落在这里
```

**目标机仍然不需要装 .NET**：运行时就在 `runtime/` 下，启动脚本会先把 `DOTNET_ROOT`
指着它，再起主程序。程序文件（exe 与它用到的 dll/json）也直接在解压根目录里，
不再套一层子目录。

`runtime/` **不能删，也不要单独替换** —— 它是随这版程序一起打出来的，单独换一边版本就对不上。
升级时把新压缩包**整个目录覆盖**过去，运行时跟着一起换。

教室端的数据（教室名、UUID、口令、账号、主题色）不在程序旁边，而在当前 Windows
账户的用户目录里（`%LOCALAPPDATA%\ClassShout\`）。这是有意为之：程序可能被装在
只读位置，而且同一台机器上不同账户应当有各自独立的教室身份。
文件的清单见 [配置文件一览](/reference/config-files.html)。

**运行日志写在软件目录下的 `logs\`**（不是 AppData）—— 按天一个文件、只留 7 天。
装在只读位置时会逐级退到 `CLASSSHOUT_LOG_DIR` 指定的目录、再退到用户数据目录，
退到哪一级会显示在设置页的「关于」里。

**设为开机自启**：教室端 → 设置 → 「后台运行」→ 开机自启。打开后会在启动文件夹里放一个快捷方式。

命令行也能设，教室那台机器不方便点界面时用得上。**命令行下同样要先把 `DOTNET_ROOT`
指到 `runtime\`** —— 启动脚本做的就是这一句：

```powershell
cd C:\ClassShout\ClassShout.Classroom
$env:DOTNET_ROOT = "$PWD\runtime"

.\ClassShout.Classroom.exe --autostart-on       # 开启
.\ClassShout.Classroom.exe --autostart-off      # 关闭
.\ClassShout.Classroom.exe --autostart-status   # 查状态
```

> 需要「无人登录也能跑」或「以最高权限运行」时仍要用**计划任务**（启动文件夹做不到这两点）。
> 用计划任务时请把界面上的「开机自启」保持关闭，否则会被拉起两次。

## 部署教师端

**Android**：

```powershell
adb install -r dist\release\classshout-teacher-<版本>-universal.apk
```

首次启动会申请麦克风权限（语音喊话要用）。拒绝也不影响文字与图片喊话。

**Windows**：把 `ClassShout.Teacher-win-x64.zip` 解压到固定目录，双击**解压根目录里的
`ClassShout.Teacher.Desktop.exe 启动.cmd`**（同样是"脚本先设 `DOTNET_ROOT` 再起 exe"，
别直接双击 exe）。**Android 版与 Windows 版都在这一张卡片里** ——
检查更新时会按你运行的平台挑对应的附件（手机挑 `.apk`、桌面挑那个 zip）。

装好之后连教室：

- **同一局域网**：教师端 →「文字」页 →「同一网络下的教室」→「扫描」→ 点一下扫到的教室，
  连上之后它出现在下面的「这条发给谁」里；
- **跨网络**：教师端 →「设备」页 →「通过服务器连接」→ 填服务器地址（见[中继服务器](/guide/relay.html)）。

扫描扫不到、但地址知道时，用「设备」页「通过局域网连接」里那一栏手输 `IP:端口` ——
扫描搬走之后，那张卡上只剩手输地址这一栏（加一个「连接」按钮），另有一句提示指着下面的扫描入口。

## 部署中继服务器

只在老师的手机与教室不在同一个网络时才需要。把 `ClassShout.RelayServer-linux-x64.tar.gz`
（或 Windows 版）解压到服务器上跑起来，然后两端都填上它的地址。完整流程见
[中继服务器](/guide/relay.html) —— 那里有两个 Linux 上必踩的坑：**解压后要
`chmod +x`**（Windows 打的 tar 不保留可执行位），以及**状态文件路径要显式指定**。

## 三个组件都要升级

新功能（图片、展示参数、定时、分享链接）依赖两端的新协议。
旧版教室端**不会报错**，只是图片收不到、展示参数会退回它自己的默认值 ——
所以升级时请把两端一起升。

> **1.10.0 起产物形式变了**：不再是单个 exe，而是压缩包（解压出**程序文件 + `runtime/`**
> + `logs/` + 启动脚本）。升级方式跟着变成"解压覆盖同一个目录"（`runtime/` 一起覆盖），
> 还是双击那个启动脚本。配置都在用户目录里，日志在软件目录下的 `logs/`，覆盖不会丢东西。

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

**连不上多半是代理的问题**，所以代理是显式的一档。**桌面版三档**：跟随系统 / 不使用 / 自己填地址；
**Android 上只有两档**：「直连（手机端不检测代理）」与「自己填代理地址」——
手机上没有"系统代理"这回事（那是桌面上的注册表、环境变量、IE 设置那一套），
留着那一档只会得到一句"检测不到"，反而让人以为网络出了问题。
旧配置里存的「跟随系统」在 Android 上读出来就是**直连**。

桌面版界面下方会显示**实际解析出来的代理**（「系统代理 → http://127.0.0.1:7890」
或「系统没有配置代理（直连）」）—— 一眼能看出是系统代理没读到，还是地址填错了。

> **桌面版的「跟随系统」直接读 Windows 的系统代理设置**，而不是用 .NET 自带的解析：
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

