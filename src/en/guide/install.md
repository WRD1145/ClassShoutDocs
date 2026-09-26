# Installation and deployment

## What you need

| Component | Runs on | Notes |
|---|---|---|
| Classroom app | The Windows PC in the classroom | Single-file exe, double-click and go, **no .NET runtime installation required** |
| Teacher app | Android phone / Windows PC | APK or single-file exe |
| Relay server | Any machine that can reach the public internet | Only needed across networks; available for both Windows and Linux |

The classroom app supports Linux too (the release includes `ClassShout.Classroom-linux-x64`),
but on Linux the system needs `spd-say` or `espeak-ng` for system voice to work —
if neither is there, switch to the online Edge voice in settings, otherwise the classroom will stay silent.

## Packaging (from source)

```powershell
dotnet build ClassShout.slnx -c Release
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

The artifacts land in `dist/release/`; the script arranges them under their "final attachment
names" and generates `SHA256SUMS.txt`.
See [Build and packaging](/en/dev/build.html) for the full set of options.

## Deploying the classroom app

1. Unzip `ClassShout.Classroom-win-x64.zip` into a fixed directory, for example `C:\ClassShout\`,
   then double-click **`ClassShout.Classroom.exe 启动.cmd`** inside it.
2. On first launch Windows may show a firewall prompt, and **you have to tick "Private networks"（专用网络）and allow it** —
   in LAN mode the teacher app needs to connect in (TCP 45900) and to be discovered over UDP 45901.
3. On the right-hand side of the interface fill in the **classroom name** (for example "Grade 3 Class 2");
   it appears in the teacher app's list, in the pop-up and in the server console.

What the unzipped folder looks like (the same for every app):

```
ClassShout.Classroom/
├─ ClassShout.Classroom.exe 启动.cmd    ← 双击这个（Windows）
├─ run.sh                               ← Linux 下跑这个
├─ 使用说明.txt
├─ logs/                                ← 运行日志落在这里
└─ app/                                 ← 程序本体（exe 与全部依赖）
```

**Why the program itself sits in `app\` and the DLLs can't be split into a separate folder**:
the .NET runtime host files (`hostpolicy.dll` / `hostfxr.dll` / `coreclr.dll` /
`System.Private.CoreLib.dll` …) **must sit next to the exe**, and they account for more than
half of the file count; moving the remaining assemblies into `lib\` and rewriting `deps.json`
makes the app crash outright with `hostpolicy.dll not found` (we tested it). So the only thing
that can be tidied is the **face of the release**: the top level holds just the launch script,
the readme and `logs\`, while the two hundred–odd program files all stay inside `app\`.

The classroom app's data (classroom name, UUID, password, account, theme colour) does not live
next to the program but in the user folder of the current Windows account
(`%LOCALAPPDATA%\ClassShout\`). That is deliberate: the program may well be installed in a
read-only location, and different accounts on the same machine ought to have their own separate
classroom identities.
For the list of files see [Configuration files](/en/reference/config-files.html).

**Run logs are written to `logs\` under the app folder** (not AppData) — one file per day,
kept for 7 days only. Installed in a read-only location it falls back level by level: first to
the directory named by `CLASSSHOUT_LOG_DIR`, then to the user data folder, and which level it
ended up at is shown under "About"（关于）on the settings page.

**Setting it to start with Windows**: classroom app → Settings → "Run in background"（后台运行）→
"Start with Windows"（开机自启）. Turning it on drops a shortcut into the Startup folder.

You can set it from the command line as well, which comes in handy when clicking through the
interface on that classroom machine is inconvenient:

```powershell
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-on       # 开启
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-off      # 关闭
.\ClassShout.Classroom\app\ClassShout.Classroom.exe --autostart-status   # 查状态
```

> When you need it to "run without anyone logged in" or "run with the highest privileges", you
> still have to use a **scheduled task** (the Startup folder can do neither of those).
> With a scheduled task, leave "Start with Windows" in the interface switched off, otherwise it
> gets launched twice.

## Deploying the teacher app

**Android**:

```powershell
adb install -r dist\release\classshout-teacher-<版本>-universal.apk
```

On first launch it asks for microphone permission (voice shouts need it). Refusing it does not
affect text and image shouts.

**Windows**: unzip `ClassShout.Teacher-win-x64.zip` into a fixed directory and double-click
`ClassShout.Teacher.Desktop.exe` inside it. **The Android and Windows builds both live in this
one card** — when checking for updates it picks the attachment that matches the platform you are
running on (the phone takes the `.apk`, the desktop takes that zip).

## Deploying the relay server

Only needed when the teacher's phone and the classroom are not on the same network. Unzip
`ClassShout.RelayServer-linux-x64.tar.gz` (or the Windows build) onto the server, get it running,
then fill in its address on both ends. The full walkthrough is in
[Relay server](/en/guide/relay.html) — it covers the two traps you will definitely hit on Linux:
**`chmod +x` after unzipping** (a tar built on Windows does not preserve the executable bit), and
**the state file path has to be given explicitly**.

## All three components have to be upgraded

New features (images, display parameters, scheduling, share links) depend on the new protocol at
both ends. An old classroom app **will not report an error**; it simply never receives images,
and display parameters fall back to its own defaults — so please upgrade both ends together.

> **From 1.10.0 the artifacts changed shape**: no longer a single exe, but an archive (unzipping
> to `app/` + `logs/` + a launch script). Upgrading therefore becomes "unzip over the same
> directory", still double-clicking that launch script.
> Settings all live in the user folder and logs in `logs/` under the app folder, so overwriting
> loses nothing.

## Checking for updates (and what to do when GitHub is slow)

The settings page of both the classroom and the teacher app ends with a "Version and updates"（版本与更新）
card: it shows the current version, and pressing "Check for updates"（检查更新）goes and asks once
whether a newer version exists; if one is found you can open the download URL directly, or open
the complete releases page.

**GitHub is often so slow on a campus network that it is unusable**, so mirrors are a list you can
add to and delete from, with six built in:

| Built-in mirror | Which API it uses |
|---|---|
| Direct GitHub | `api.github.com` |
| **Gitee (li-hansen136)** | `gitee.com/api/v5`, the repository being the mirror copy on Gitee |
| ghproxy.net / gh-proxy.com / ghfast.top | GitHub's API + download URLs go through a proxy prefix |
| kkgithub | `api.kkgithub.com` + domain substitution |

Pressing "Test all mirrors"（一键检测全部镜像）tests every entry **concurrently** (all six come
back in about 200 milliseconds, instead of waiting on them one at a time), lists whether each one
is reachable, how long it took and the latest version it found, and automatically switches to the
fastest one. You can also add your own entries (name / GitHub or Gitee / API URL / repository /
download template) and delete them; the built-in ones cannot be deleted — they are the fallback
for when "not a single one is left".

**Failing to connect is usually a proxy problem**, so the proxy is an explicit choice: follow the
system / don't use one / enter an address yourself. Below it the interface shows the **proxy it
actually resolved** ("System proxy → http://127.0.0.1:7890" or "No proxy configured on the system
(direct connection)") — so you can tell at a glance whether the system proxy was not picked up, or
whether the address was typed wrong.

> **"Follow system" reads the Windows system proxy settings directly**, instead of using .NET's
> own resolution: the latter switches to an "environment variables only" implementation as soon as
> it finds any proxy environment variable, and that one picks the variable by the URL's scheme
> (https requests look only at `HTTPS_PROXY`). Proxy tools often set only `HTTP_PROXY`, so not a
> single https request goes through the proxy — which shows up as "the browser can open it, the
> app can't connect". If your proxy is unusual (listening on socks only, say), just choose
> "Enter a proxy address yourself"（自己填代理地址）and write `http://127.0.0.1:7890` or
> `socks5://127.0.0.1:1080`.

> The check **happens only when you press the button**, with no background polling — asking the
> outside world "is there a new version?" every time the app starts serves no purpose at all on a
> machine sitting in a classroom.
> Settings are stored on the local machine (see [Configuration files](/en/reference/config-files.html)),
> each end keeping its own.

The server's version number is in `/api/health`; after an upgrade one `curl` tells you whether the
new version actually went live:

```bash
curl -s https://relay.example.com/api/health
# {"ok":true,"service":"ClassShout.RelayServer","version":"1.9.0",...}
```
