# Installation and deployment

## What you need

| Component | Runs on | Notes |
|---|---|---|
| Classroom app | The Windows PC in the classroom | An archive: unpack and go; the runtime sits in `runtime/`, so **no .NET runtime installation required** |
| Teacher app | Android phone / Windows PC | APK, or an archive for the desktop build |
| Relay server | Any machine that can reach the public internet | Only needed across networks; available for both Windows and Linux |

The classroom app supports Linux too (the release includes `ClassShout.Classroom-linux-x64`),
but on Linux the system needs `spd-say` or `espeak-ng` for system voice to work —
if neither is there, switch to the online Edge voice in settings, otherwise the classroom will stay silent.
For what the tray, notifications, playback and recording each need, see
[the classroom app on Linux](/en/guide/linux.html).

## System requirements

| Platform | Minimum | Runs |
|---|---|---|
| Windows (x64) | **Windows 10 1607** or later (Windows 11 included) | Classroom app, desktop teacher app, relay server |
| Linux x64 | A 64-bit distribution; the classroom app needs an X11 or Wayland session | Classroom app, relay server (**no teacher app**) |
| Android | Phone or tablet, arm64 or x64 | Teacher app |

The Windows row is a hard floor, not a "recommended configuration": the apps are built on **.NET 10**,
and .NET 10 itself does not support anything older than Windows 10 1607. For why the Windows 7 machines
common in classrooms cannot run them, see the next section.

### Why Windows 7 is not supported

**.NET 10's runtime never recognised Windows 7 / 8.1 to begin with.** Microsoft dropped both from the
supported OS lists when .NET 7 shipped (.NET 6 was the last release that still listed Windows 7 SP1,
and .NET 6 itself has been out of support since November 2024). So on Windows 7 the **.NET host fails
before any of our code runs** — typically with "无法定位程序输入点", or "The procedure entry point ...
could not be located" on an English system. It is not a configuration problem, and no setting turns it on.

**Nor is it a one-line change to "add Win7".** The UI stack is FluentAvalonia 2.5, which ships **only
`net10.0` assets**; supporting Windows 7 would mean replacing that component library, retargeting to
.NET Framework 4.8 (the last runtime that runs on Windows 7) or to the EOL .NET 6, and rewriting the
parts that rely on .NET Core-only APIs — the TLS/HTTP layer, for instance, uses `SocketsHttpHandler`
and `SslClientAuthenticationOptions`, and neither exists on .NET Framework. That is a separate branch,
not a build option.

**From v1.19.1 the packaged Windows launcher checks the OS version first** (the script ending in
`启动.cmd`, for example `ClassShout.Classroom.exe 启动.cmd`): on anything below Windows 10 it
prints a short explanation and exits, instead of letting the .NET host crash with an unreadable error.

> [!tip]
> An old classroom PC either gets Windows 10 / 11 put on it, or is replaced by a cheap x64 Linux box —
> the Linux classroom build needs no .NET either (see [the classroom app on Linux](/en/guide/linux.html)).

## Packaging (from source)

```powershell
dotnet build ClassShout.slnx -c Release
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

The artifacts land in `dist/release/`; the script arranges them under their "final attachment
names" and generates `SHA256SUMS.txt`.
`-FrameworkDependent` now means **not even `runtime\` is included**: the smallest possible size,
but the target machine has to have the .NET 10 runtime installed first.
See [Build and packaging](/en/dev/build.html) for the full set of options.

## Deploying the classroom app

1. Unzip `ClassShout.Classroom-win-x64.zip` into a fixed directory, for example `C:\ClassShout\`,
   then **double-click `ClassShout.Classroom.exe 启动.cmd` in the unpacked root**.
   **Do not double-click the exe directly**: the launch script sets `DOTNET_ROOT` before starting
   the program, and without it the exe looks for the .NET installed on the system and fails with
   "You must install or update .NET" when it cannot find one.
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
├─ ClassShout.Classroom.exe             ← 主程序，与它用到的 dll/json 一起就在这一层
├─ runtime/                             ← 私有 .NET 运行时（host/fxr/<版本> + shared/<框架>/<版本>）
└─ logs/                                ← 运行日志落在这里
```

**The target machine still does not need .NET installed**: the runtime sits in `runtime/`, and the
launch script points `DOTNET_ROOT` at it before starting the program. That is also why the program
files (the exe and the dll/json it uses) sit directly in the unpacked root, with no extra directory
level in between.

You **must not delete `runtime/` and must not replace it on its own** — it is built together with
this version of the program, and swapping just one side leaves the versions mismatched. To upgrade,
**overwrite the whole directory** with the new archive, runtime included.

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
interface on that classroom machine is inconvenient. **From the command line you also have to point
`DOTNET_ROOT` at `runtime\`** — that is exactly the line the launch script runs:

```powershell
cd C:\ClassShout\ClassShout.Classroom
$env:DOTNET_ROOT = "$PWD\runtime"

.\ClassShout.Classroom.exe --autostart-on       # 开启
.\ClassShout.Classroom.exe --autostart-off      # 关闭
.\ClassShout.Classroom.exe --autostart-status   # 查状态
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
**`ClassShout.Teacher.Desktop.exe 启动.cmd` in the unpacked root** (the same "script sets
`DOTNET_ROOT`, then starts the exe" story — do not double-click the exe itself).
**The Android and Windows builds both live in this one card** — when checking for updates it picks
the attachment that matches the platform you are running on (the phone takes the `.apk`, the desktop
takes that zip).

Connecting to a classroom once it is installed:

- **Same LAN**: teacher app → "Text" (文字) page → "Classrooms on this network" (同一网络下的教室)
  → "Scan" (扫描) → tap a classroom that was found, and once connected it shows up in
  "Who is this going to" (这条发给谁) below;
- **Across networks**: teacher app → "Devices" (设备) page → "Connect through a server"
  (通过服务器连接) → fill in the server address (see [relay server](/en/guide/relay.html)).

When the scan finds nothing but you know the address, type `IP:port` into the field on the
"Connect over the LAN" (通过局域网连接) card on the Devices page — with the scan moved out, that card
keeps just the typed-address field (and its Connect button), plus a line of text pointing at the scan
below.

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

> **From 1.10.0 the artifacts changed shape**: no longer a single exe, but an archive (unpacking
> to **the program files + `runtime/`** + `logs/` + a launch script). Upgrading therefore becomes
> "unzip over the same directory" (`runtime/` included), still double-clicking that launch script.
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

**Failing to connect is usually a proxy problem**, so the proxy is an explicit choice. **The desktop
build offers three**: follow the system / don't use one / enter an address yourself; **on Android
there are only two**: "Direct (the phone does not detect a proxy)"（直连（手机端不检测代理））and
"Enter a proxy address yourself"（自己填代理地址）— a phone has no such thing as a "system proxy"
(that is the registry / environment variables / IE settings on a desktop), and keeping that option
would only ever answer "not detected", making it look as if the network were broken. An old "follow
system" setting reads as **direct** on Android.

On the desktop build the interface shows below it the **proxy it actually resolved** ("System proxy
→ http://127.0.0.1:7890" or "No proxy configured on the system (direct connection)") — so you can
tell at a glance whether the system proxy was not picked up, or whether the address was typed wrong.

> **On the desktop build, "Follow system" reads the Windows system proxy settings directly**, instead
> of using .NET's own resolution: the latter switches to an "environment variables only" implementation
> as soon as it finds any proxy environment variable, and that one picks the variable by the URL's
> scheme (https requests look only at `HTTPS_PROXY`). Proxy tools often set only `HTTP_PROXY`, so not
> a single https request goes through the proxy — which shows up as "the browser can open it, the
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
