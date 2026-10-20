# The classroom app on Linux

The classroom app ships a Linux build too (`ClassShout.Classroom-linux-x64.tar.gz`; unpack it and run
`run.sh`). Same code, same interface — the differences are a handful of system dependencies: two of them
depend on the **desktop environment**, two on **which packages are installed**.

For which features each platform supports, see the
[platform and feature support matrix](/en/reference/platforms.html).

## Run the self-check first

```bash
tar xzf ClassShout.Classroom-linux-x64.tar.gz
./app/ClassShout.Classroom --diagnose
```

It only prints, it does not start the interface, one line per backend:

```
平台：Linux
音频播放：可用（aplay 或 paplay）
系统朗读：不可用 —— 找不到 spd-say、espeak-ng 或 espeak。
在线朗读：Edge 在线语音（需要能访问 speech.platform.bing.com）
托盘图标：由 Avalonia 提供；Linux 上需要桌面环境的通知区域支持。
```

When the player is missing, that line spells out the install command itself
(`apt install alsa-utils（或 pulseaudio-utils）`).

> [!tip]
> **Almost every "there is no sound on Linux" case is visible on this one screen**: no `alsa-utils`,
> no speech synthesis, or no route to Edge — all three show up in the interface as the same
> "no sound". One self-check beats digging through the logs.

## Which desktop environments work

The program itself does not care which desktop you run: as long as there is an X11 or Wayland session it
draws its window, and font sizes, pop-ups and images behave the same. **Two things do care**:

- **The tray icon** (closing the window hides it to the tray, right-click → "Quit") needs a
  StatusNotifier / AppIndicator host. GNOME does not ship one: install the
  "AppIndicator and KStatusNotifierItem Support" extension and log in again. KDE Plasma, XFCE, MATE,
  Cinnamon and Budgie have one built in.
- **Desktop notifications** need a notification daemon. Every mainstream desktop has one; a machine with
  no desktop session usually does not, and there `notify-send` simply shows nothing (it does not report an
  error, so "the notification never appeared" is easily mistaken for a bug in the app).

| Desktop environment | Tray | Notifications | Read aloud | Playback | Notes |
|---|---|---|---|---|---|
| GNOME | ⚠️ | ✅ | ✅ | ✅ | Tray needs the AppIndicator extension; log in again after installing it |
| KDE Plasma | ✅ | ✅ | ✅ | ✅ | Works out of the box |
| XFCE | ✅ | ✅ | ✅ | ✅ | Works out of the box |
| MATE | ✅ | ✅ | ✅ | ✅ | Works out of the box |
| Cinnamon | ✅ | ✅ | ✅ | ✅ | Works out of the box |
| Budgie | ✅ | ✅ | ✅ | ✅ | Works out of the box |
| Other desktops (Deepin / UKUI / Pantheon, …) | ⚠️ | ✅ | ✅ | ✅ | Notifications are there; the tray depends on whether a StatusNotifier host is installed |
| No desktop session (i3 / sway, SSH, a systemd service) | ❌ | ❌ | ⚠️ | ✅ | No notification daemon; read-aloud needs speech-dispatcher or espeak-ng; `aplay` talks to ALSA directly and still works |

**The "Read aloud" column means system voice** (`spd-say` / `espeak-ng`). The Edge online voice has
nothing to do with the desktop environment — it only needs the classroom machine to reach the internet,
so for the rows that are ⚠️ or ❌ just switch to the Edge online voice in the classroom app's settings.

## What audio and speech need

| Purpose | Needs | Notes |
|---|---|---|
| Playing shout audio, replaying voice replies | `alsa-utils` (`aplay`) or `pulseaudio-utils` (`paplay`) | One of the two is enough. `aplay` is preferred: it talks to ALSA directly and does not depend on the PulseAudio in a desktop session — the classroom machine is often a headless long-running process |
| System read-aloud | `spd-say` (from speech-dispatcher) or `espeak-ng` | Without either, the system-voice option stays silent; switch to the Edge online voice |
| Recording a voice reply | `alsa-utils` (`arecord`) | The classroom app records a reply through `arecord`; without it "allow voice replies" is greyed out in the settings |

```bash
sudo apt install alsa-utils espeak-ng
```

These packages are in the official repositories of the usual distributions; `aplay` / `arecord` usually
come along with the sound-card driver anyway.

## Three things Linux cannot do

| Not possible | Why |
|---|---|
| ClassIsland integration | ClassIsland itself is Windows-only — there is nothing to deliver to, so that path simply does not exist on Linux |
| Windows SAPI voices | On Linux system voice goes through `spd-say` / `espeak-ng` with a different voice list; none of the Windows voice names can be selected |
| UIA forced topmost | It relies on Windows' UIAccess and window-band mechanism, which have no counterpart elsewhere |

## Leave autostart to systemd

The "start automatically on boot" switch in the classroom app's settings only appears on Windows (it works
by dropping a shortcut into the Startup folder), and the three `--autostart-*` command-line switches also
answer with "not supported" on Linux.

On Linux, use a systemd user service or the desktop's own autostart entry to point at `run.sh`.
Note that it needs to **draw a window**: the service needs `DISPLAY` or `WAYLAND_DISPLAY` —
otherwise the process starts but its window never appears in any session.
