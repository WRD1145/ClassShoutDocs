# 项目结构

```
src/
├─ ClassShout.Core/           协议、网络、音频抽象、配置读写（纯 .NET，不依赖 Avalonia）
│  ├─ Protocol/               消息模型、JSON 编解码、分帧、展示参数与能力
│  ├─ Net/                    TCP 服务端/客户端、UDP 发现
│  ├─ Audio/                  PCM 工具、WAV 封装、语音转文字客户端、Edge TTS
│  └─ Remote/                 中继契约、账号、本地设置、学生名单、呼叫模板
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

## 分层原则

- **Core 不依赖 Avalonia**。协议、音频工具、配置读写这些与界面无关的东西一放进去，
  就能被服务器、端到端工具与设计预览共用。这条线一旦破，测试就得拖着一整套 UI 框架跑。
- **平台差异收在平台层里**。教室端判断"播放器为什么启动失败"要区分 Windows 的
  `MmException` 与 Linux 的进程启动失败 —— 这种判断收在 `ClassroomPlatform` 里，
  视图模型只问"成没成、为什么"，免得界面层长出一串条件编译。
- **教师端 UI 只有一份**。`ClassShout.Teacher` 是共享 UI 层，桌面头与 Android 头
  各自注入"麦克风采集"与"应用进入后台"这类平台能力，界面代码不出现平台判断。
- **视图模型只做编排**。教室端的主视图模型负责"收到什么、该干什么、界面显示什么"，
  网络收发在 `ClassroomServer`、朗读在语音合成器、播放在播放器，三者互不知道对方存在。

## 状态放哪

所有运行时状态与配置都在用户数据目录（见[配置文件一览](/reference/config-files.html)），
不在程序目录 —— 程序可能装在只读位置。自检工具靠环境变量
`CLASSSHOUT_DATA_DIR` 把整个数据目录指到临时目录，因此不会碰使用者真实的配置。
