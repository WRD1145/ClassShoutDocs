# Project structure

```
src/
├─ ClassShout.Core/           协议、网络、音频抽象、配置读写（纯 .NET，不依赖 Avalonia）
│  ├─ Protocol/               消息模型、JSON 编解码、分帧、展示参数与能力
│  ├─ Net/                    TCP 服务端/客户端、UDP 发现
│  ├─ Audio/                  PCM 工具、WAV 封装、语音转文字客户端、Edge TTS
│  └─ Remote/                 中继契约、账号、本地设置、学生名单、呼叫模板、
│                             任教科目规则、服务器定时契约
├─ ClassShout.Design/         MD3 设计系统：令牌、控件主题、配色算法、共享控件
├─ ClassShout.Classroom/      教室端界面与编排
├─ ClassShout.Teacher/        教师端共享 UI 层（桌面与 Android 共用）
├─ ClassShout.Teacher.Desktop/桌面头：窗口、NAudio 采集、协议注册
├─ ClassShout.Teacher.Android/Android 头：Activity、AudioRecord、intent-filter
└─ ClassShout.RelayServer/    中继服务器（ASP.NET Core minimal API + 自带 WebUI）
tools/
├─ ClassShout.EndToEnd/       端到端回归工具
└─ ClassShout.DesignPreview/  渲染校验（把真实界面导出成 PNG）
```

## The layout of a release artifact

Each app is packed into a single archive, and unpacking it gives the same four things:

```
ClassShout.Classroom/
├─ ClassShout.Classroom.exe 启动.cmd    ← 双击这个（Linux 是 run.sh）
├─ 使用说明.txt
├─ logs/                                ← 运行日志
└─ app/                                 ← 程序本体（exe 与全部依赖）
```

Putting the application itself into `app/` is not about looking tidy — it's because **the DLLs
cannot be given a directory of their own**: .NET's runtime host files (`hostpolicy.dll` /
`hostfxr.dll` / `coreclr.dll` / `System.Private.CoreLib.dll` …) have to sit next to the exe, and
they make up more than half of the file count. We tried moving the remaining assemblies into
`lib\` and rewriting the paths in the `targets` section of `deps.json`; the app crashed outright
with `hostpolicy.dll not found`. So the layer we can actually sort out is the UI layer.
Besides forwarding arguments, the startup script also points `CLASSSHOUT_LOG_DIR` at the `logs/`
folder beside it.

## Layering principles

- **Core does not depend on Avalonia.** As soon as everything unrelated to the UI — protocol,
  audio utilities, configuration read/write — lives in there, the relay server, the end-to-end
  tools and the design preview can all share it. Once that line is broken, tests have to drag a
  whole UI framework around with them.
- **Platform differences are contained inside the platform layer.** Working out "why did the
  player fail to start" on the classroom app means telling Windows' `MmException` apart from a
  failed process launch on Linux — that judgement is kept inside `ClassroomPlatform`, and the view
  models only ask "did it work, and why", so the UI layer doesn't grow a string of conditional
  compilation.
- **There is only one copy of the teacher app UI.** `ClassShout.Teacher` is the shared UI layer;
  the desktop head and the Android head each inject platform capabilities such as "microphone
  capture" and "the app went to the background", and no platform checks show up in the UI code.
- **View models only orchestrate.** The classroom app's main view model is responsible for "what
  came in, what should happen, what the UI shows"; network I/O lives in `ClassroomServer`,
  speaking lives in the speech synthesizer, and playback lives in the player — the three know
  nothing about each other.

## Where state lives

All runtime state and configuration live in the user data folder (see
[Configuration files at a glance](/en/reference/config-files.html)), not in the app folder — the
app may be installed in a read-only location. The self-check tool uses the `CLASSSHOUT_DATA_DIR`
environment variable to point the whole data folder at a temporary directory, so it never touches
the user's real configuration.
