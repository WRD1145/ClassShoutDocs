# The classroom app on Linux

The classroom app ships a Linux build too (`ClassShout.Classroom-linux-x64.tar.gz`; unpack it and run
`run.sh`). Same code, same interface — the differences are a handful of system dependencies: two of them
depend on the **desktop environment**, two on **which packages are installed**.

For which features each platform supports, see the
[platform and feature support matrix](/en/reference/platforms.html).

Linux packages are available for x64 and ARM64. Choose `x64` for Intel/AMD PCs and `arm64` for 64-bit ARM systems. Updates follow the running application architecture; switching architecture requires a manual installation.

## Choose an installation and update format

Linux desktops now use FluentAvalonia like Windows. Android retains its touch-oriented layout.

| Format | Install/run | Update |
|---|---|---|
| tar.gz | Extract into a writable directory; run `./ClassShout.Classroom` or `./run.sh` | Use “Download update and restart” to install the dedicated `-update.zip` |
| AppImage | Run `chmod +x ClassShout.Classroom-linux-x64.AppImage`, then open it | Download the newer AppImage, quit, and replace the old file |
| deb | On Debian/Ubuntu: `sudo apt install ./ClassShout.Classroom-linux-x64.deb` | Install the newer deb with apt |
| rpm | On Fedora: `sudo dnf install ./ClassShout.Classroom-linux-x64.rpm` | Install the newer rpm with dnf |

New packages include the .NET runtime. deb/rpm add desktop menu entries. On Arch, use tar.gz or AppImage rather than installing deb/rpm directly.
If FUSE is unavailable, try `APPIMAGE_EXTRACT_AND_RUN=1 ./ClassShout.Classroom-linux-x64.AppImage`.

Update archives contain complete application files and the required runtime, rather than binary deltas. The application checks the release SHA-256 and per-file manifest, exits the old process, and replaces files. Replacement failures roll back changes.
Settings, bells, logs, and plugins are preserved. Keep the machine powered during updates. Older builds without this updater require one manual upgrade first.
System packages remain managed by apt/dnf, and AppImages do not attempt to modify their read-only mount.

## Run the self-check first

```bash
tar xzf ClassShout.Classroom-linux-x64.tar.gz
cd ClassShout.Classroom
./ClassShout.Classroom --diagnose
```

New packages run directly from their extracted directory; `run.sh` changes into that directory first. Older packages containing a separate `runtime/` directory must still use their bundled `run.sh`.

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

## Make Linux speech sound more natural

### With internet access: choose Edge online speech

Open classroom “Settings → Audio → Speech engine”, select “Edge online speech”, refresh voices, pick a Chinese neural voice, and preview it.
Start at the default rate, then adjust for the classroom speakers. Short sentences with punctuation are usually clearer than uninterrupted text.
Check the actual engine status: connection failures trigger a system-voice fallback, so a mechanical voice does not necessarily mean settings were lost.
Installing `espeak-ng` or `speech-dispatcher` alone does not add neural voices; they primarily provide an offline fallback.

### Offline: run a local Piper neural voice

[Piper](https://github.com/OHF-Voice/piper1-gpl) can synthesize locally without sending each announcement to a cloud service.
This example targets the **Piper 1.4.2 HTTP API**. Preview the model first; the third-party engine and models are not bundled with ClassShout.
Model installation needs internet access; synthesis can work offline afterwards. If dependencies lack wheels for Arch’s current Python, use a compatible Python 3.12 virtual environment.

```bash
mkdir -p ~/.local/share/classshout-piper/voices
python3 -m venv ~/.local/share/classshout-piper/venv
source ~/.local/share/classshout-piper/venv/bin/activate
python -m pip install 'piper-tts[http]==1.4.2'
cd ~/.local/share/classshout-piper/voices
python -m piper.download_voices zh_CN-huayan-medium
python -m piper.http_server -m zh_CN-huayan-medium --host 127.0.0.1 --port 5000
```

Leave that terminal running. In another terminal, verify synthesis and playback:

```bash
curl --fail http://127.0.0.1:5000/ -H 'Content-Type: application/json' \
  -d '{"text":"同学们请安静，现在开始上课。","voice":"zh_CN-huayan-medium","rate":0,"format":"wav"}' \
  -o /tmp/classshout-piper-test.wav
aplay /tmp/classshout-piper-test.wav
```

Select “Third-party HTTP speech” in ClassShout. Set the endpoint to `http://127.0.0.1:5000/`, voice to `zh_CN-huayan-medium`, leave the key empty, save, and preview.
You may keep system fallback enabled; check the actual engine status. This Piper version uses `length_scale` and ignores ClassShout’s `rate`. Set `--length-scale` when launching the service: below 1 is faster, above 1 is slower.
Check the [matching API documentation](https://github.com/OHF-Voice/piper1-gpl/blob/v1.4.2/docs/API_HTTP.md) when upgrading because HTTP routes can change.

### Other third-party speech services

ClassShout POSTs JSON containing `text`, `voice`, `rate`, and `format`. The response must be raw **16-bit PCM WAV**, not MP3, a download URL, or Base64 inside JSON.
Providers with another API need an adapter; pasting an arbitrary TTS endpoint is insufficient.
Responses are limited to 8 MiB with a 30-second timeout. Use HTTPS for online services and do not enable plaintext key transmission just to bypass connection errors.
If WAV synthesis succeeds but playback fails, check `aplay`, `paplay`, output device, and volume separately.

## Which desktop environments work

The application selects its bundled HarmonyOS Sans SC as the default font before creating its first window, so the Chinese interface does not depend on the system default font or its cache.
If an older build fails at startup with `Could not create glyphTypeface`, `Font family: $Default`, or an empty default-font error, use a complete application package containing the font-startup fix.
The bundled font covers ordinary text; emoji and characters it does not contain still require system fonts.

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
