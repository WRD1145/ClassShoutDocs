# 构建与打包

## 依赖

- **.NET 10 SDK**（仓库的 `global.json` 指定版本与 rollForward 策略）
- Android 部分需要 Android SDK（`AndroidApiLevel` 在 `Directory.Build.props` 里）
- 版本号写在 `Directory.Build.props` 的 `<Version>` 里，一处改、所有项目跟着变

## 构建

```powershell
# 全部（含 Android）
dotnet build ClassShout.slnx -c Release

# 只做桌面：没装 Android SDK 时用这个
dotnet build ClassShout.DesktopOnly.slnf -c Release
```

教室端是双目标（`net10.0-windows;net10.0`），单独构建某一边时要显式指定框架：

```powershell
dotnet build src/ClassShout.Classroom/ClassShout.Classroom.csproj -f net10.0-windows
```

## 打包

```powershell
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

产出到 `dist/release/`，按"最终附件名"摆好，并生成 `SHA256SUMS.txt`：

| 资产 | 说明 |
|---|---|
| `ClassShout.Classroom.exe` | 教室端（Windows，自包含） |
| `ClassShout.Classroom-linux-x64` | 教室端（Linux） |
| `ClassShout.Teacher.Desktop.exe` | 教师端桌面头 |
| `classshout-teacher-<版本>-universal.apk` | 教师端 Android（arm64 + x64） |
| `ClassShout.RelayServer-win-x64.exe` / `-linux-x64` | 中继服务器 |
| `SHA256SUMS.txt` | 校验清单（**LF 换行、无 BOM** —— 它要能在 Linux 上用） |

脚本会在缺资产时直接报错，而不是安静地产出一份少东西的发布。

## 发布

```powershell
pwsh -File scripts/release.ps1 -Version v1.7.0 -NotesFile notes.md -Proxy http://127.0.0.1:7890
```

它做四件事：打包 → 推分支与标签 → 建发行版并上传附件 → **逐个核对**附件数量与名字。

上传几百兆被中断是常事，所以它是**可续传**的：

- 标签与发行版已存在就复用（不会因为"标签已存在"直接失败）；
- 同名且大小一致的附件跳过，大小不符的先删再传；
- 最终以"发行版上实际有什么"为准，而不是"我传了什么"。

发布说明的体例：**Bug 修复 / 新功能 / 回退**三段，每条形如「说明 · 提交 · 相关提议」。

## ClassIsland 插件是另一个仓库

[WRD1145/ClassShoutCiPlugin](https://github.com/WRD1145/ClassShoutCiPlugin) 单独打包、单独发布
（`.cipx` 附件）。它**不作为主程序的发布资产**：装不装它由学校自己决定，
而它的版本节奏与主程序无关。它有自己的 `scripts/package.ps1` 与 `scripts/release.ps1`。

插件市场的 Tag 必须严格是 `a.b.c.d`（例如 `1.0.2.0`），带 `v` 前缀或不完整的 Tag
会被索引生成器直接忽略，而发布时没有任何反馈 —— 所以发布脚本把这一条挡在最前面。
