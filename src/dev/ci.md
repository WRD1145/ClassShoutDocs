# 自动发布

仓库里有一条 GitHub Actions 流水线（`.github/workflows/release.yml`，名字叫「自动发布」）：
合并到 `main` 之后，它把三个平台的应用打出来、建发行版、传附件。
手动那条路（`scripts/release.ps1`）一行没动 —— CI 调的是同一个 `scripts/pack.ps1`。

## 它什么时候跑

两种：

- **push 到 `main`**，也就是合并一个 PR。这是日常用的那一种。
- **手动点一下**（Actions 页面的「Run workflow」，即 `workflow_dispatch`），带两个输入：
  - `dry_run`，默认 **true**：只打包，不建发行版；
  - `version`，可留空：留空就读 `Directory.Build.props` 里的 `<Version>`。

同一时间只跑一条：两次合并挨得太近时，后一条排队，而不是两条并行去建发行版。

## 版本号是人的决定

流水线读 `Directory.Build.props` 里的 `<Version>`，拼出标签 `v<版本>`。
如果这个标签**已经有发行版**，它就什么都不做 —— 打包那几步直接被跳过。

版本号**不会**被自动递增，这是有意的：「这次要发什么」是人的决定，不是提交次数的函数。
代价是忘了改版本号就什么都不会发 —— 而这是正确的结果，不是故障。

## 四个作业

```
version（读版本号、找发布说明、查这个标签发过没有）
  ├─ pack（Windows / Linux / Android）→ release（核对 SHA256SUMS、建发行版、传附件）
  └─ pack-macos（并行；只构建教师端，失败不拦发布，不进发行版）
```

- `version` —— 只做判断，不产出任何东西；后面几个作业都靠它的输出。
- `pack` —— 复用 `scripts/pack.ps1`，CI 不另抄一份发布参数。两边一旦分叉，就会出现
  「本地能发、CI 发出来少了点什么」。
- `pack-macos` —— 见下面的平台覆盖。它带 `continue-on-error`：它失败不该拦着别的平台发布。
- `release` —— 先 `sha256sum -c SHA256SUMS.txt`，再逐个断言附件都在（少一个就等于发了半成品），
  最后 `gh release create`。

## 产物与手动发布一致

附件还是那 7 个，名字也一样（附件名一经发布就不再改：README 和历史发行版都按它引用）：

| 附件 | 是什么 |
|---|---|
| `ClassShout.Classroom-win-x64.zip` | 教室端（Windows） |
| `ClassShout.Classroom-linux-x64.tar.gz` | 教室端（Linux） |
| `ClassShout.Teacher-win-x64.zip` | 教师端（桌面） |
| `ClassShout.RelayServer-win-x64.zip` | 中继服务器（Windows） |
| `ClassShout.RelayServer-linux-x64.tar.gz` | 中继服务器（Linux） |
| `classshout-teacher-<版本>-universal.apk` | 教师端（Android，arm64 + x64） |
| `SHA256SUMS.txt` | 校验清单（LF 换行、无 BOM —— 它要在 Linux 上用） |

工作流把 `dist/release` 整个上传，所以那个目录里若还有别的文件，也会一起进发行版。

> 这条踩过一次：附件下载目录原本叫 `assets/`，而仓库里本来就有一个 `assets/`（放应用图标），
> 于是四个 `.ico` / `.png` 混进了 v1.18.1 的附件里。现在下载目录叫 `release-assets/`，
> 附件只有上表那 7 个。

## 发布说明从仓库里读

发行版的说明按这个顺序找：

1. `.github/releases/notes-v<版本>.md`（**提交进仓库**的，CI 读得到）；
2. `artifacts/notes-v<版本>.md`（本地 `release.ps1` 用 `-NotesFile` 指的那份）；
3. 都没有，就用一段很短的占位文字。

第 2 条在 CI 上其实用不上：`artifacts/` 被 `.gitignore` 挡着，runner 上根本看不到它。
所以**想让自动发布带上真正的说明，就把它放进 `.github/releases/`**。
体例和其它发行版一样：Bug 修复 / 新功能 / 回退。

## dry_run：验证流水线

手动触发时 `dry_run` 默认是 **true**：照常打包，产物作为 Actions 附件（`release-assets`）传上去，
**不建发行版**。要验证「这台机器上能不能打出来」时用它。

它还有一处刻意的不同：`dry_run` 时即使这个版本已经发过也照跑 —— 手动点是用来验证流水线的，
不该因为「标签已存在」就什么都不做。

## 平台覆盖（老实说）

| 平台 | 这条流水线做到哪一步 |
|---|---|
| Windows / Linux / Android | 完整产出并发布 |
| macOS | 只构建教师端桌面头（`osx-arm64`，未签名、没有 `.app`），作为 Actions 附件 `macos-unsigned` 供有 Mac 的人试，**不进发行版**；教室端在 macOS 上的播放与朗读还没有对应实现（用的是 Linux 的 `aplay` / `spd-say`） |
| iOS | **没有** iOS 头项目。要它得先加一个 `Avalonia.iOS` 头，再配 Apple 开发者证书与描述文件 —— 那是移植工作，不是 CI 配置 |

## Android 的签名

runner 上没有 keystore，所以打出来的 APK 用的是 .NET Android 的 **debug 密钥**：
能 `adb install` / 侧载，但**不能拿去上架应用商店**。
要在商店发，得自己签 —— 这条流水线不做这件事。

## 踩过的坑

这三个都是「本机能过、干净 runner 上必挂」，也是 `pack.ps1` 现在长成这样的原因：

1. **依赖框架的发布不会下载运行时包。** `pack.ps1` 的 `runtime\` 是拿运行时包拼的，
   而只有自包含发布才拉那套包。本机缓存里有，CI 第一次就挂在「找不到运行时包」。
   现在先对项目做一次 `-p:SelfContained=true` 的 restore，再拼运行时。
2. **runner 的 `tar` 是 Git 的 GNU tar，不是 Windows 的 bsdtar。**
   原来用 `tar -a -c -f <文件>.zip`（按扩展名选 zip），GNU tar 不认这个组合，
   于是**什么也没产出**。Windows 的 zip 现在改用 `Compress-Archive`。
3. **`tar -czf` 会压出残包还返回 0。** 106 MB 的服务器目录压成 0.4 MB，
   退出码仍然是 0。现在 `.tar.gz` 完全在进程里生成（`System.Formats.Tar` + `GZipStream`），
   不依赖任何外部 tar；同时加了一条断言：压缩包不到源目录的 5% 就直接失败。

## 需要配什么

只有一个内置的 `GITHUB_TOKEN`，权限给到 `contents: write`（建标签、建发行版、传附件都要它）。
没有另外配任何 secret。所以想改 CI 的行为，改的是工作流文件本身，不是仓库设置里的一串密钥。
