# Classroom app settings overview

The classroom app's settings live in a separate window (click the gear in the top-right corner). The screen
in the classroom is there for the students to look at, so settings don't take over the main interface.

| Card | What it covers |
|---|---|
| Settings password (设置口令) | This machine's PIN, and which items have to be unlocked separately (see [PIN protection](/en/guide/pin.html)) |
| Classroom info (教室信息) | The classroom name — it shows up in the teacher app's list, in pop-ups and on the server console |
| Read-aloud settings (朗读设置) | Volume, speed, read-aloud engine (system voice / Edge online voice), voice, and preview |
| Transcription (语音转文字) | See [captions](/en/guide/transcript.html) |
| Replies (回复) | How the classroom can answer the teacher: "got it" (知道了), quick replies, text, voice, and the voice time limit (see [classroom replies](/en/guide/reply.html)) |
| Cross-LAN shouts (跨局域网喊话) | Relay server address, connect/disconnect, this classroom's UUID and password |
| How shouts display by default (喊话默认怎么显示) | Which preset is used when the sender didn't specify one (display style / font size / dwell time) |
| Shout pop-ups (喊话弹窗) | See [on-screen pop-ups](/en/guide/notification.html) |
| Running in the background (后台运行) | Whether closing the window hides it to the tray, and whether it starts automatically on boot |
| Online teacher apps (在线教师端) | The list of teacher apps currently connected to this classroom |
| Personalization (个性化) | Light/dark (follow the system / light / dark) and theme color (8 presets, or type in your own `#RRGGBB`) |
| Version and updates (版本与更新) | Check for updates (检查更新), mirror (see [Install and deployment](/en/guide/install.html)) |
| About (关于) | Version number, runtime environment, diagnostics, developer mode |

## Connecting to the relay server on startup

The classroom PC is switched on every morning and nobody walks over to press "connect to the server"; and whenever it is
not connected, that lesson's shouts quietly go nowhere — with no hint in the classroom at all. So after **one successful
connection** the app remembers it: from then on every start connects by itself.

The switch lives in the relay card (**启动时自动连接**, "connect on startup"). It turns itself on after the first
successful connection; turn it off there if you really never want it.

Pressing "disconnect" by hand does **not** turn it off: that only means "not this time" (a network being serviced, say),
and the next start connects again.

A failed attempt shows no dialog — the reason lands in the log and on that card, exactly as with a manual connect.
The connection starts after the window is up rather than blocking startup: waiting for the server would leave the
classroom app blank for a few seconds, which looks like a hang.
## Light/dark: follow the system / light / dark

The "Personalization" (个性化) card now holds two things: on top, three radio buttons for "Light/dark"
(明暗) — follow the system, light, dark; below them, the theme color swatches that were there before
(8 presets, or type in your own `#RRGGBB`). In the teacher app it is the same card on the "Devices" (设备)
page, with the same contents.

The default is **follow the system**. This is a change from older versions: light/dark used to be
hard-coded to light in `App.axaml`, so a machine whose OS is in dark mode still showed the light theme,
and there was nowhere in the app to change it. Such a machine now starts dark; to get the old look back,
pick "Light" (浅色) once and it is remembered from then on.

Changes apply immediately, with no restart. "Follow the system" really does follow the system: when the
OS switches between dark and light, the app switches with it on the spot, without going back into
settings to tap anything again.

### Why the default is now "follow the system"

Hard-coding light was originally about readability for classroom projection and phone screens in bright
light — that reasoning has not changed, the problem was the "hard-coded" part: the OS was already dark,
the app stayed bright, and the user could not change it. So the default is now follow the system, handing
the choice back; the sentence "light is clearer for projection and bright light" stays as a one-line hint
under the picker instead of being decided on everyone's behalf.

Both `Theme` and `SeedColor` live in `appearance.json`, and the classroom app and the teacher app
(Android and desktop alike) use the same format, so the choice survives a restart. Field details are in
[Config files at a glance](/en/reference/config-files.html).

> What changes is not just the background. The light and the dark palette are both derived from the one
> theme color, so switching light/dark also switches primary, containers, outlines and text; conversely,
> changing the theme color changes both palettes, without setting them twice.

## Where developer mode is

At the very bottom of the settings page, inside "About", **click the version number 10 times in a row** (the
count restarts if the gap between two clicks is longer than 1.5 seconds; at the 5th click it tells you how many
clicks are still missing). Once it unlocks, three extra items appear: font fallback diagnostics, open the config
folder, and copy diagnostics — all of them are for troubleshooting, and you don't need them day to day. To turn
it off: delete `developer.json` from this machine's config folder.

**The version number line in the "Version and updates" card recognizes the same gesture.** Two places in the
interface show the version number, and people will click the line they notice first; if only one of the two
could be tapped open, users would assume developer mode is gone. Both places share the same rules, so once you
unlock from either entry point, the developer content in the other one expands immediately along with it.

It is exactly the same in the teacher app, on the "Devices" (设备) page.

## Closing the window is not quitting

Clicking the close button doesn't quit the app — it hides it into the notification area, where it keeps
receiving shouts. A casual click on the × in the classroom shouldn't cut the whole class off. To quit
completely, right-click the tray icon and choose "Quit" (退出).

## Why the classroom identity is read-only

In the "Cross-LAN shouts" card you can see this classroom's **UUID** and **password**, and both can be copied
with one click, but **there is no "regenerate" button**.

The machine in the classroom is shared by the teacher on duty and the students, and what "reset" really means is
"from now on this computer is a different classroom": every teacher app that was already paired stops working,
and the password has to be copied out again for every subject teacher. One slip of the finger and the password
has to go out to everyone all over again — a cost completely out of proportion to the way the word "reset"
feels.

If you really do need to start over (say, this machine has been moved to another classroom), do it on the
server console — there you can see how far the impact reaches, and you can notify everyone in one go.

## Running the classroom app on Linux

The classroom app can run on Linux too, but **system read-aloud requires `spd-say` or `espeak-ng` to be present
on the system**. If neither is there, a reminder line is written into the log at startup, and the recommendation
is to switch to the Edge online voice in the read-aloud settings — otherwise there will be no sound in the
classroom.

For what the tray, desktop notifications, playback and recording each need installed, see
[the classroom app on Linux](/en/guide/linux.html).

## Third-party HTTP speech

Select the third-party HTTP engine, enter a complete endpoint, optional voice and Bearer key, choose system-voice fallback, save, then preview. Keys are stored locally in `classroom-speech.json`; do not share this file or its configuration directory.

This is a generic ClassShout adapter protocol, not automatic compatibility with every vendor. The service accepts POST JSON containing `text`, `voice`, `rate` (-10 to 10) and `format: "wav"`, and returns raw **16-bit PCM WAV**. Other vendor formats need a conversion service. Local offline synthesis servers are supported. Sending a key over HTTP requires explicit opt-in; HTTPS validates certificates and redirects are disabled.

Each request allows 30 seconds, 10000 text characters and an 8 MiB response. Existing queues and per-message receipts remain in use. Completion is reported after playback; cancellation, timeout or decoding failures cancel or fail the operation, with system speech used when fallback is enabled.

## Local IPC

The first version exposes local execution in the **classroom app**. Enable local HTTP IPC in settings and save/apply. It is disabled by default and listens only on `127.0.0.1:45903`. Every request requires `Authorization: Bearer <Token>` using the token in local `extensions.json`. Do not expose this token to web pages or other users.

| Method and path | Purpose |
|---|---|
| `GET /v1/status` | Classroom name, mute state and volume |
| `POST /v1/shouts` | Submit `{ "id": "unique-id", "text": "message", "speak": false }` |
| `GET /v1/receipts/message-id` | Delivery, display, speech completion or failure timeline |
| `POST /v1/stop` | Stop the current shout |

HTTP 202 confirms acceptance, not execution. Query receipts to confirm the outcome. Retrying the same identifier and content does not replay it; changed content under the same identifier returns 409. Receipts and deduplication are session-only, limited to 1000 messages, after which submissions return 429. Never expose the endpoint publicly. After a timeout, query the original identifier before retrying.

The repository includes a PowerShell 7 client: `pwsh -File scripts/classshout-ipc.ps1 -Text "Get ready for class" -Id demo-1`, then `pwsh -File scripts/classshout-ipc.ps1 -Receipt demo-1`. Use `-DataDirectory` for custom storage. Cross-site Origin, non-loopback Host and chunked requests are rejected. Limits are 32 KiB per body, 16 connections and five seconds per request; malformed requests may be disconnected.

## Process plugins

The first version supports **trusted local classroom extensions**, without a marketplace, DLL loading or UI extensions. Plugins can submit local text/speech and query their own receipts. They receive no IPC or relay token and cannot issue the global stop command. Separate processes isolate crashes; they are **not an operating-system security sandbox** and run with the current user's permissions.

Edit the `Plugins` array in `extensions.json`, preserving `Token` and `IpcEnabled`. Each entry has `Id`, an absolute `Executable` path, string-array `Arguments`, and explicit `Enabled: true`. Identifiers accept ASCII letters, digits, dots, hyphens and underscores. At most 16 entries are read. Save/apply in settings to reload. Set enabled to false and apply to disable; exited plugins are not automatically restarted.

`examples/plugins/hello.ps1` is a runnable example. On Windows, set `Executable` to the installed `pwsh.exe`; arguments are `-NoProfile`, `-File`, and the script's absolute path. It submits one text message, polls its display receipt, then exits.

The protocol is UTF-8 JSON lines over standard streams. Each stdout line is a command such as `{ "method": "POST", "path": "/v1/shouts", "body": { "id": "demo", "text": "Hello", "speak": false } }`; stdin returns `{ "status": 202, "body": ... }`. GET commands also require `body: {}`. Each plugin has a separate message namespace. Lines are limited to 8192 characters and commands to five seconds. Keep ordinary logs off stdout. Stderr is drained but not automatically logged to avoid exposing sensitive data.

## Local bells

The Bells card supports adding, editing, disabling, deleting and previewing schedules. Click Save bells after editing. Plans are stored in bells.json on the classroom machine and use a locally synthesized tone without a teacher or relay connection. Use HH:mm. Weekday bits from Monday to Sunday are 1, 2, 4, 8, 16, 32 and 64; add them to select days (31 for weekdays, 127 for every day).

The machine must remain awake with the classroom app running. Missed schedules are not replayed after shutdown or sleep. Overlapping bells are skipped with a log entry while another bell plays. The start notification can be disabled and bell volume is independent. Save and playback failures are logged.

