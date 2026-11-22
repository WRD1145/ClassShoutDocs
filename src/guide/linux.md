# Linux 上的教室端

教室端也出 Linux 包（`ClassShout.Classroom-linux-x64.tar.gz`，解压后跑 `run.sh`）。
同一套代码、同一套界面，差别只在几条系统依赖上 —— 其中两条依赖**桌面环境**，
两条依赖**装了什么包**。

各端到底支持哪些功能，见[平台与功能支持矩阵](/reference/platforms.html)。

Linux 教室端提供 x64 和 ARM64 两套包。普通 Intel/AMD 电脑选择 `x64`；64 位树莓派等 ARM 设备选择 `arm64`，文件名中的架构必须与系统一致。自动更新跟随当前程序架构，跨架构切换请手动安装。

## 安装与更新选哪个包

Linux 桌面使用 FluentAvalonia 主题，与 Windows 保持一致；Android 保留适合触控的布局。

| 格式 | 用法 | 更新方式 |
|---|---|---|
| tar.gz | 解压到可写目录，运行 `./ClassShout.Classroom` 或 `./run.sh` | 在设置中点击「下载更新并重启」，使用专用 `-update.zip` |
| AppImage | `chmod +x ClassShout.Classroom-linux-x64.AppImage`，然后运行该文件 | 下载新版 AppImage，退出后替换旧文件 |
| deb | Debian/Ubuntu 使用 `sudo apt install ./ClassShout.Classroom-linux-x64.deb` | 下载新版 deb，再用 apt 安装 |
| rpm | Fedora 使用 `sudo dnf install ./ClassShout.Classroom-linux-x64.rpm` | 下载新版 rpm，再用 dnf 安装 |

新包自带 .NET 运行时。deb/rpm 会安装桌面菜单入口；不要把 deb/rpm 直接安装到 Arch，Arch 请用 tar.gz 或 AppImage。
AppImage 需要系统支持 FUSE；不可用时可用 `APPIMAGE_EXTRACT_AND_RUN=1 ./ClassShout.Classroom-linux-x64.AppImage`。

更新包是完整程序文件集，不是差分补丁，仍包含必要运行时。应用会先校验发行版 SHA-256 和包内文件清单，再退出旧进程并替换；替换失败会回滚已改动的文件。
配置、铃声、日志与插件不在更新覆盖范围中。更新时请保持供电；第一次从没有自动更新功能的旧版升级，仍需手动安装一次。
系统安装包不会绕过包管理器写 `/opt`；AppImage 也不会尝试修改只读挂载目录。

## 先跑一遍自检

```bash
tar xzf ClassShout.Classroom-linux-x64.tar.gz
cd ClassShout.Classroom
./ClassShout.Classroom --diagnose
```

新包主程序位于解压目录中，可直接运行；`run.sh` 会先切换到程序目录再启动。旧版带独立 `runtime/` 的包仍需用它附带的 `run.sh`。

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

## 让 Linux 朗读更自然

### 能联网：先选 Edge 在线语音

在教室端打开「设置 → 语音 → 朗读引擎」，选「Edge 在线语音（更自然，需要外网）」，刷新音色列表，选择中文神经网络音色并试听。
语速先用默认值，再根据教室扩音效果微调；短句和正确标点通常比一长串没有停顿的文字更清楚。
看「当前实际在用」确认没有回落到系统语音：在线服务不可用时会回退，听起来机械不一定是设置没保存。
仅安装 `espeak-ng` 或 `speech-dispatcher` 不会自动把声音变成神经网络音色，它们主要是断网保底。

### 要离线：可用 Piper 本地神经语音

[Piper](https://github.com/OHF-Voice/piper1-gpl) 在本机运行，不要求把每条喊话送到云端。
下面按 **Piper 1.4.2 的 HTTP 接口** 配置，模型效果请先试听；Piper 与音色模型由第三方维护，不随 ClassShout 安装。
安装模型时需要网络，文件齐全后可离线合成。若当前 Arch Python 没有对应依赖轮子，请使用支持该包的 Python 3.12 虚拟环境。

```bash
mkdir -p ~/.local/share/classshout-piper/voices
python3 -m venv ~/.local/share/classshout-piper/venv
source ~/.local/share/classshout-piper/venv/bin/activate
python -m pip install 'piper-tts[http]==1.4.2'
cd ~/.local/share/classshout-piper/voices
python -m piper.download_voices zh_CN-huayan-medium
python -m piper.http_server -m zh_CN-huayan-medium --host 127.0.0.1 --port 5000
```

让这个终端保持运行，另开终端先检查服务：

```bash
curl --fail http://127.0.0.1:5000/ -H 'Content-Type: application/json' \
  -d '{"text":"同学们请安静，现在开始上课。","voice":"zh_CN-huayan-medium","rate":0,"format":"wav"}' \
  -o /tmp/classshout-piper-test.wav
aplay /tmp/classshout-piper-test.wav
```

然后在教室端选「第三方 HTTP 语音」，服务地址填 `http://127.0.0.1:5000/`，音色填 `zh_CN-huayan-medium`，密钥留空，保存后试听。
可保留「失败时回退系统语音」，并观察实际引擎状态。上述版本的 Piper 使用 `length_scale` 调速，忽略 ClassShout 的 `rate`；要调语速，在启动服务时加 `--length-scale`，小于 1 更快、大于 1 更慢。
HTTP 路径随 Piper 版本可能改变，升级时核对[对应版本接口文档](https://github.com/OHF-Voice/piper1-gpl/blob/v1.4.2/docs/API_HTTP.md)。

### 使用其他第三方语音服务

ClassShout 发送 `text`、`voice`、`rate`、`format` 的 JSON，要求返回原始 **16 位 PCM WAV**；不是 MP3、音频下载链接或 JSON 包装的 Base64。
不符合这个接口的云服务或本地模型需要适配层，不能只把任意 TTS API 地址粘进来。
合成结果限制为 8 MiB，超时 30 秒。在线服务使用 HTTPS；不要为了消除连接错误而随意允许明文发送密钥。
若 WAV 能生成却播不出声，先检查 `aplay`、`paplay`、系统输出设备与音量，这与音色模型是两件事。

## 哪些桌面环境能用

程序在创建第一个窗口前就使用随包提供的 HarmonyOS Sans SC 默认字体，中文界面不依赖系统默认字体或字体缓存。
如果旧版启动时出现 `Could not create glyphTypeface`、`Font family: $Default` 或默认字体为空的异常，请换用包含字体启动修复的完整程序包。
普通文字可使用内置字体；表情及内置字体未覆盖的字符仍需系统字体补充。

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
