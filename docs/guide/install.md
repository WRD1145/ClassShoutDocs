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

1. 把 `ClassShout.Classroom.exe` 拷到教室电脑上一个固定目录，例如 `C:\ClassShout\`。
2. 双击运行。首次启动 Windows 可能弹防火墙提示，**要勾选「专用网络」并允许** ——
   局域网模式下教师端需要连进来（TCP 45900）并靠 UDP 45901 被发现。
3. 在界面右侧填**教室名**（例如「三年二班」），它会出现在教师端列表、弹窗和服务器控制台上。

教室端的配置不在 exe 旁边，而在当前 Windows 账户的用户目录里（`%LOCALAPPDATA%\ClassShout\`）。
这是有意为之：程序可能被装在只读位置，而且同一台机器上不同账户应当有各自独立的教室身份。
文件的清单见 [配置文件一览](/reference/config-files.html)。

**设为开机自启**：教室端 → 设置 → 「后台运行」→ 开机自启。打开后会在启动文件夹里放一个快捷方式。

命令行也能设，教室那台机器不方便点界面时用得上：

```powershell
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

**Windows**：直接双击 `ClassShout.Teacher.Desktop.exe`。

## 部署中继服务器

只在老师的手机与教室不在同一个网络时才需要。最少做法是把 `ClassShout.RelayServer-linux-x64`
（或 Windows 版）拷到服务器上跑起来，然后两端都填上它的地址。

它首次启动会生成 `relay-config.json`，里面有管理员账号与随机口令，
控制台要用它登录。完整流程见 [中继服务器](/guide/relay.html)。

## 三个组件都要升级

新功能（图片、展示参数、定时、分享链接）依赖两端的新协议。
旧版教室端**不会报错**，只是图片收不到、展示参数会退回它自己的默认值 ——
所以升级时请把两端一起升。

## 检查更新（以及 GitHub 慢的时候怎么办）

教室端与教师端的设置页最后都有一张「版本与更新」：显示当前版本，
点「检查更新」就去问一次有没有新版本；查到了可以直接打开下载地址，
也可以打开完整的发行版页面。

**GitHub 在校园网里常常慢到不能用**，所以镜像源可以自己定：

| 字段 | 作用 |
|---|---|
| GitHub API 地址 | 查"最新的是哪一版"走这里；镜像自带 API 时填镜像的（如 `https://api.kkgithub.com`） |
| 下载地址模板 | 把原始下载地址换成镜像地址；留空＝直连 |

模板支持两个占位符，覆盖常见镜像的两种做法：

- `{url}` —— 整段原始地址，用于"前缀式"镜像：`https://ghproxy.net/{url}`；
- `{path}` —— 去掉 `https://github.com/` 之后的部分，用于"换域名式"镜像：
  `https://kkgithub.com/{path}`。

预置了几个常用的（直连 / ghproxy.net / gh-proxy.com / ghfast.top / kkgithub），
下拉选一个就会把这两个字段一并填好；镜像挂了就换一个，或者把模板清空回到直连。

> 检查**只在你按下按钮时发生**，不做后台轮询 —— 每次开应用都去外面问一次
> "有没有新版本"，对一台放在教室里的机器没有任何必要。
> 设置存在本机（见[配置文件一览](/reference/config-files.html)），两端各存各的。

服务器的版本号在 `/api/health` 里，升级完 `curl` 一下就知道新版本部署上去了没有：

```bash
curl -s https://relay.example.com/api/health
# {"ok":true,"service":"ClassShout.RelayServer","version":"1.9.0",...}
```

