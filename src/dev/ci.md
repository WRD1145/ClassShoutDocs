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

从 1.22.0 起，Actions 将判定的版本通过 CLASSSHOUT_RELEASE_VERSION 和 pack.ps1 的 -ReleaseVersion 显式传入每一次发布，包含 Windows、Linux、Android 与安装程序；macOS 试验构建同样传入 Version。构建时将版本写成 C# 常量，客户端显示版本不依赖入口程序集反射。无效或缺失版本直接失败，不生成 0.0.0 产物。Android 的整数 versionCode 仍单独递增，不从语义版本拼接。

1.21.0 的流水线使用 Runner 上生成的 .NET Android debug 密钥，可侧载，但不同构建的密钥可能不同，不能保证覆盖升级。

开发版改为所有 Android ABI、所有版本复用一个固定 keystore。Android 可以使用免费自行生成的自签名证书，无需购买 Windows 代码签名证书。测试时可以用调试签名，但通用密码不等于同一把私钥；不要每次构建重新生成，也不要把公开的通用测试私钥当成发行身份。覆盖升级要求复用相同签名身份，详见 [Android 官方签名说明](https://developer.android.com/studio/publish/app-signing)。

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

以下为本次开发版的新签名流程，1.21.0 发布时尚未采用。正式发行仍使用 GITHUB_TOKEN 的 contents: write 权限；Android 需要以下四项 Actions Secrets，Windows 两项为可选配置：

| Secret | 内容 |
|---|---|
| WINDOWS_SIGNING_PFX_BASE64 | 可选：含私钥及证书链的 Windows 代码签名 PFX，以 Base64 保存 |
| WINDOWS_SIGNING_PASSWORD | 可选：PFX 密码，与 PFX 同时配置或同时留空 |
| ANDROID_SIGNING_KEYSTORE_BASE64 | 持久 Android keystore 的 Base64 |
| ANDROID_SIGNING_KEY_ALIAS | 签名 key alias |
| ANDROID_SIGNING_STORE_PASSWORD | keystore 密码 |
| ANDROID_SIGNING_KEY_PASSWORD | alias 私钥密码 |

当前尚未配置发行用的固定 keystore，真实发布仍需配置这四项 Android Secrets。可用 JDK 的 keytool 一次性生成 RSA 自签名 keystore，长期备份，再把同一文件的 Base64、alias 和密码保存到 Secrets；不要在每次 CI 开始时重新生成。请勿把私钥或密码提交进仓库、发布说明或日志。可选 PFX 方案要求可导出的私钥；硬件或云签名证书需另接相应签名提供程序。

准备步骤读取 ANDROID_SIGNING_KEYSTORE_BASE64，将文件解码到受限 Runner 临时目录，并通过 GITHUB_ENV 传递 ANDROID_SIGNING_KEYSTORE_PATH。打包步骤的 alias 和两个密码环境变量与 Secrets 同名，不再另用缩写变量名。MSBuild 使用 AndroidSigningStorePass=env:ANDROID_SIGNING_STORE_PASSWORD 与 AndroidSigningKeyPass=env:ANDROID_SIGNING_KEY_PASSWORD，只传变量名。

本地打包也使用相同变量。假设签名材料保存在以下目录，先在 PowerShell 中读取本地文件，再调用打包命令；不要把密码替换成命令行字面值：

```powershell
$signingDir = 'D:\安全备份\ClassShout'
$env:ANDROID_SIGNING_KEYSTORE_PATH = Join-Path $signingDir 'classshout-release.keystore'
$env:ANDROID_SIGNING_KEY_ALIAS = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_KEY_ALIAS.txt') -Raw).Trim()
$env:ANDROID_SIGNING_STORE_PASSWORD = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_STORE_PASSWORD.txt') -Raw).Trim()
$env:ANDROID_SIGNING_KEY_PASSWORD = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_KEY_PASSWORD.txt') -Raw).Trim()
pwsh -NoProfile -File scripts/pack.ps1 -Configuration Release -IncludeLinuxServer -Installer -RequireSigning
```

## 统一签名顺序

Android 所有 ABI 包使用同一个固定 keystore，并通过 apksigner 验证证书指纹与 keystore 一致；免费自签名的发行密钥受支持，Android Debug 证书不作为正式发行身份。

校验同时支持 Signer #1、v3.1 的 SDK 范围和 Build-tools 37 的 V3.0 Signer 等签名方案前缀；所有范围及方案的证书必须匹配固定 keystore，且工具报告一个签名者。工具验证失败、未知格式或任一区间换用其他身份都会阻止发布。失败日志仅报告公钥证书指纹，并短期保留待核查的 APK，不上传私钥文件。

Windows 未配置证书时照常打包，明确标记未做 Authenticode 签名，不影响 Android 发布；配置证书后，便携目录、安装程序内部文件和安装程序本身统一用它签名。自有 ClassShout exe / dll 在压缩前签名并校验身份、证书信任和 SHA-256 时间戳，不重新签名第三方运行时。

签名完成后才生成 ZIP / 安装程序和 SHA256SUMS。Linux 包仍使用附件校验清单；SHA-256 校验不是发布者数字签名。macOS 试验产物仍未签名，不进入正式发行附件。

工作流只在 Runner 临时目录解码私钥，限制目录权限；密码通过环境变量及 Android 的 env: 密码来源传递，不进入命令行。Windows 临时导入证书在打包结束时清理，私钥临时文件由 always 步骤清理。

## 缺失材料与验收

正式打包使用 scripts/pack.ps1 -RequireSigning，要求 Android 固定签名，不要求 Windows 证书；使用 -SkipAndroid 时不要求 Android 材料。缺少 Android 必需项或 Windows 可选项只配置了一半，都会在开始打包前失败。只有手动运行同时选择 dry_run 与 allow_unsigned_dry_run，且完全未配置材料时，才允许未固定签名的开发验收包；它不会创建发行版。

从前面的临时 Android 签名切换至固定签名时，已有 APK 通常不能直接覆盖安装，versionCode 递增也不能消除签名不一致。若旧私钥无法恢复，需保留可迁移配置、卸载重装并重新登录；不要误以为新 keystore 能恢复旧身份。此后应长期备份和复用同一 keystore。

脚本语法、YAML、Android 单独配置、缺失材料拒绝、显式验收 dry-run 与清理路径边界可在本地验证；持久 keystore 的真实发行验收须待配置 Secrets 后完成，受信任 Windows 签名只在启用可选证书后验证。
