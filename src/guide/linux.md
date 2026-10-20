# Linux 上的教室端

教室端也出 Linux 包（`ClassShout.Classroom-linux-x64.tar.gz`，解压后跑 `run.sh`）。
同一套代码、同一套界面，差别只在几条系统依赖上 —— 其中两条依赖**桌面环境**，
两条依赖**装了什么包**。

各端到底支持哪些功能，见[平台与功能支持矩阵](/reference/platforms.html)。

## 先跑一遍自检

```bash
tar xzf ClassShout.Classroom-linux-x64.tar.gz
./app/ClassShout.Classroom --diagnose
```

只打印、不起界面，一行一个后端：

```
平台：Linux
音频播放：可用（aplay 或 paplay）
系统朗读：不可用 —— 找不到 spd-say、espeak-ng 或 espeak。
在线朗读：Edge 在线语音（需要能访问 speech.platform.bing.com）
托盘图标：由 Avalonia 提供；Linux 上需要桌面环境的通知区域支持。
```

缺播放器时，那一行会直接把安装命令写出来（`apt install alsa-utils（或 pulseaudio-utils）`）。

> [!tip]
> **Linux 上的"不发声"几乎都能在这一屏看出来**：没装 `alsa-utils`、没有语音合成、连不上 Edge ——
> 三种原因在界面上的表现是同一个"不发声"。先跑一次自检，比翻日志快。

## 哪些桌面环境能用

程序本身不挑桌面：只要有 X11 或 Wayland 会话，窗口就画得出来，字号、弹窗、图片都一样。
**挑桌面的是两件事**：

- **托盘图标**（关窗口缩到托盘、右键「退出」）需要一个 StatusNotifier / AppIndicator 宿主。
  GNOME 默认不带，要装「AppIndicator and KStatusNotifierItem Support」扩展并重新登录一次；
  KDE Plasma、XFCE、MATE、Cinnamon、Budgie 自带。
- **桌面通知**需要一个通知守护进程。主流桌面都带一个；没有桌面登录的常驻机器上通常没有，
  那时 `notify-send` 什么也不会显示（它不会报错，所以"通知没出现"很容易被当成程序的问题）。

| 桌面环境 | 托盘 | 通知 | 朗读 | 播放 | 说明 |
|---|---|---|---|---|---|
| GNOME | ⚠️ | ✅ | ✅ | ✅ | 托盘要装 AppIndicator 扩展，装完要重新登录 |
| KDE Plasma | ✅ | ✅ | ✅ | ✅ | 开箱即用 |
| XFCE | ✅ | ✅ | ✅ | ✅ | 开箱即用 |
| MATE | ✅ | ✅ | ✅ | ✅ | 开箱即用 |
| Cinnamon | ✅ | ✅ | ✅ | ✅ | 开箱即用 |
| Budgie | ✅ | ✅ | ✅ | ✅ | 开箱即用 |
| 其他桌面（Deepin / UKUI / Pantheon 等） | ⚠️ | ✅ | ✅ | ✅ | 通知都有；托盘取决于有没有装 StatusNotifier 宿主 |
| 没有桌面会话（i3 / sway、SSH、systemd 服务） | ❌ | ❌ | ⚠️ | ✅ | 没有通知守护进程；朗读要装 speech-dispatcher 或 espeak-ng；`aplay` 直接对 ALSA 说话，照样出声 |

**表里「朗读」那一列说的是系统语音**（`spd-say` / `espeak-ng`）。
Edge 在线语音与桌面环境无关，只要求教室那台机器能访问外网 ——
所以朗读是 ⚠️ 或 ❌ 的那几行，在教室端设置里改用 Edge 在线语音就行。

## 音频与朗读要装什么

| 用途 | 要装 | 说明 |
|---|---|---|
| 播放喊话语音、回放语音回复 | `alsa-utils`（`aplay`）或 `pulseaudio-utils`（`paplay`） | 有一个就够。优先用 `aplay`：它直接对 ALSA 说话，不依赖桌面会话里的 PulseAudio —— 教室那台机器常常是无桌面登录的常驻进程 |
| 系统朗读 | `spd-say`（来自 speech-dispatcher）或 `espeak-ng` | 都没有时系统语音这一档不出声，建议改用 Edge 在线语音 |
| 语音回复的录音 | `alsa-utils`（`arecord`） | 教室端录一段回复走 `arecord`；找不到它时设置里的「允许语音回复」是灰的 |

```bash
sudo apt install alsa-utils espeak-ng
```

这几个包都在常见发行版的官方仓库里；`aplay` / `arecord` 一般随声卡驱动一起就装上了。

## Linux 上做不到的三件事

| 做不到 | 为什么 |
|---|---|
| ClassIsland 联动 | ClassIsland 本身只有 Windows 版 —— 没有可以投递的对象，插件那一路在 Linux 上不存在 |
| Windows 的 SAPI 音色 | Linux 上系统语音走 `spd-say` / `espeak-ng`，音色表是另外一套，Windows 那些音色名一个也选不到 |
| UIA 强制置顶 | 靠的是 Windows 的 UIAccess 与「窗口段」机制，别的系统上没有对应物 |

## 开机自启交给 systemd

教室端设置里那条「开机自启」只在 Windows 上出现（它靠启动文件夹里的快捷方式），
命令行那三个 `--autostart-*` 开关在 Linux 上也会直接回一句"不支持"。

Linux 上要开机自启，用 systemd 用户服务或桌面自启项把 `run.sh` 指过去即可。
注意它是要**画界面**的：服务里得有 `DISPLAY` 或 `WAYLAND_DISPLAY` ——
否则进程起来了，窗口却不在任何会话里。
