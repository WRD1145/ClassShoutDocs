# Platform and feature support matrix

There are four ways to run ClassShout, and they are not symmetrical:

| Platform | What exists on that machine |
|---|---|
| Windows x64 | Teacher app (desktop) + classroom app + relay server |
| Linux x64 | Classroom app + relay server (**no teacher app**) |
| Android (arm64 + x64) | Teacher app (**no classroom app**) |
| Web console (WebUI) | The relay server's own browser console — nothing to install |

## How to read this table

A cell says "**whether this platform has that capability**", not "whether the feature can run on those
machines".

- Linux only has the classroom app, so every "sending / managing" row is ❌ on Linux — not because it is
  impossible, but because there is nothing on that machine that sends. Open the web console in a browser
  instead (see [Relay server](/en/guide/relay.html)).
- Android only has the teacher app, so classroom-side rows (read-aloud, tray, ClassIsland) are ❌ on Android.
- ✅ has it; ⚠️ has it, but with an extra condition (written in the cell); ❌ does not have it.

## Shouting

| Feature | Windows x64 | Linux x64 | Android | Web console |
|---|---|---|---|---|
| Text shout | ✅ | ❌ | ✅ | ✅ |
| Voice shout (record a clip and send it) | ✅ | ❌ | ✅ | ❌ Browser recording needs a whole set of its own: microphone permission, an encoding format, a session |
| Image shout | ✅ | ❌ | ✅ | ❌ |
| Read aloud (TTS) | ✅ Windows SAPI | ⚠️ Needs `spd-say` or `espeak-ng`, otherwise use the Edge online voice | ❌ No Android classroom app | ❌ |
| Display settings (font size / dwell / window or pop-up) | ✅ | ❌ The classroom app only shows what the sender specified | ✅ | ✅ All three can be picked; the default is "按教室端默认" (use the classroom's default) |
| Scheduled shout (this device) | ✅ | ❌ | ✅ | ❌ Only in the app, and a local schedule only fires while the app is running |
| Scheduled shout (server) | ✅ | ❌ | ✅ | ❌ The schedule is created in the app; the server sends it when due |

## In class

| Feature | Windows x64 | Linux x64 | Android | Web console |
|---|---|---|---|---|
| Roster (import / edit) | ✅ | ❌ | ✅ | ⚠️ Can paste, upload and view; importing spreadsheets and editing stay in the app |
| Quick Call (components + random calling) | ✅ | ❌ | ✅ | ⚠️ Component assembly and student picking, but no random calling |
| Classroom replies (知道了 / quick / text / voice) | ✅ | ✅ Voice replies need `arecord` from `alsa-utils` | ❌ No Android classroom app | ⚠️ Read-only (see [classroom replies](/en/guide/reply.html)) |

## Classroom app

| Feature | Windows x64 | Linux x64 | Android | Web console |
|---|---|---|---|---|
| System notification (when a classroom reply arrives) | ✅ Tray balloon | ❌ No Linux teacher app is published | ✅ Notification channel + the Android 13 notification permission | ⚠️ The panel's "enable desktop notifications" needs HTTPS |
| Staying in the tray (closing the window hides it) | ✅ | ⚠️ Needs a StatusNotifier / AppIndicator host; GNOME needs an extension (see [the classroom app on Linux](/en/guide/linux.html)) | ❌ | ❌ |
| Start automatically on boot | ✅ A shortcut in the Startup folder | ❌ The switch does not appear; use systemd | ❌ | ❌ |
| Check for updates | ✅ Opens the download address once it finds one | ✅ It can check too; upgrading is unpack-and-overwrite | ✅ Checks the APK and hands it to the system installer | ❌ The server is upgraded by the operator |
| PIN lock | ✅ | ✅ | ❌ | ❌ |
| ClassIsland notification | ✅ | ❌ ClassIsland itself is Windows-only | ❌ | ❌ |

## Network

| Feature | Windows x64 | Linux x64 | Android | Web console |
|---|---|---|---|---|
| Discovering classrooms (UDP broadcast) | ✅ | ❌ It is the side that answers discovery | ✅ | ❌ It only connects to the server, it does not broadcast |
| Direct over the LAN | ✅ | ✅ | ✅ | ❌ Must go through the server |
| Across networks via the server | ✅ | ✅ | ✅ | ✅ |
| Sending to several classes at once | ✅ | ❌ | ✅ | ✅ The broadcast section |

## Architecture and artifacts

| Platform | RID / artifact | Notes |
|---|---|---|
| Classroom app | `win-x64` → `ClassShout.Classroom-win-x64.zip`; `linux-x64` → `ClassShout.Classroom-linux-x64.tar.gz` | Program files at the root, the private runtime under `runtime/`; no .NET runtime has to be installed |
| Teacher app (desktop) | `win-x64` → `ClassShout.Teacher-win-x64.zip` | The same shape (root + `runtime/`); **no Linux package** |
| Teacher app (phone) | `android-arm64` + `android-x64` → `classshout-teacher-<version>-universal.apk` | **The APK is self-contained**: the .NET runtime and the assemblies are inside the package, and nothing else has to be installed on the phone |
| Relay server | `win-x64` → zip; `linux-x64` → `ClassShout.RelayServer-linux-x64.tar.gz` | After unpacking the Linux package, `chmod +x` first — a tar produced on Windows does not keep the executable bit |

- The classroom, desktop teacher and relay server archives all unpack to the same shape:
  **program files at the root, the runtime under `runtime/`**, plus `logs/` and a launch script.
  The launch script sets `DOTNET_ROOT` before starting the program, so "no .NET to install"
  rests on that directory (delete it and the program will not start).
  `pack.ps1 -FrameworkDependent` is the exception: not even `runtime/` is included — the smallest
  size, but the target machine has to have the .NET 10 runtime installed;
- The universal APK carries both ABIs and is about 63 MB; `pack.ps1 -SplitApk` additionally produces one
  package per ABI, about 32 MB each. Most of the size is the managed assemblies with trimming turned off,
  a trade-off made so that Avalonia's XAML reflection keeps working;
- An older version on one side **does not report an error**: images never arrive and display settings fall
  back to that side's own defaults, so both sides should be upgraded together
  (see [Installation and deployment](/en/guide/install.html)).
