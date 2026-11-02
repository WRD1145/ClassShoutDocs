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

Version 1.22.0 and later has a separate local IPC card and classroom-ipc.json. It listens on 127.0.0.1:45903, defaults to disabled and requires a token. See the standalone [IPC API documentation](/en/reference/ipc.html) for authentication, routes and OpenAPI. Legacy extensions.json is retained and migrated without changing credentials.

## Plugin management

Version 1.23.0 moves plugins into a separate Plugins tab in Settings, removing the expanded list from General. Unlock protected settings in General first. Switching tabs or closing Settings neither stops/restarts plugins nor changes IPC.

Version 1.22.0 and later separately manages local packages, search, details, enable/disable, restart and uninstall. New plugins use DI and independent assembly load contexts without enabling IPC; installation defaults to disabled. Registration uses classroom-plugins.json. See [Plugin development](/en/dev/plugins.html) for the SDK, manifest and example. Enable trusted code only; assembly isolation is not a security sandbox.

## Local bells

The Bells card supports adding, editing, disabling, deleting and previewing schedules. Click Save bells after editing. Plans are stored in bells.json on the classroom machine and use a locally synthesized tone without a teacher or relay connection. Use HH:mm. Weekday bits from Monday to Sunday are 1, 2, 4, 8, 16, 32 and 64; add them to select days (31 for weekdays, 127 for every day).

The machine must remain awake with the classroom app running. Missed schedules are not replayed after shutdown or sleep. Overlapping bells are skipped with a log entry while another bell plays. The start notification can be disabled and bell volume is independent. Save and playback failures are logged.


## Connection diagnostics

Open “Connection diagnostics and configuration migration” in Settings to test the classroom listener, relay health endpoint, TTS and today's ClassIsland schedule. Each component has its own result and explanation. Relay health does not confirm account authorization or message delivery, and speakers still need a listening test. System speech checks engine availability; Edge checks the voice endpoint only. Third-party TTS synthesizes a short test sentence and validates the WAV without playback; service charges may apply.

The sanitized report contains component results, fixed explanations, timings and a timestamp. It excludes addresses, accounts, credentials, response bodies and raw logs. Errors never include echoed server content. Health probes strictly validate HTTPS certificates regardless of the relaxed certificate option.

## Configuration backup and migration

Save your settings first, then export a configuration backup. Classroom backups contain bell rules and embedded audio, quick-reply components, and TTS engine, voices, volume, rate and fallback preferences. Backups contain your custom text and audio; store them appropriately.

Login data, classroom identity, server settings, IPC tokens and executable plugin lists are excluded. Third-party TTS credentials and endpoint addresses are also excluded because addresses can contain credentials. Select a backup on the destination computer, review the overwrite preview and confirm import. **Restart the application before use.** Existing destination addresses, credentials and login data are preserved. On a new computer, enter the TTS endpoint and key again; missing system voices fall back to a local default. Import never enables plugins.

Import replaces applicable settings rather than merging lists. Other-role sections are ignored. Files must use a supported format version and be at most 16 MiB; unknown fields and invalid components are rejected. Files are replaced atomically; a write failure restores earlier replaced files. If permissions prevent restoration, an explicit rollback failure is shown.

If speech settings are PIN-protected, unlock them before importing. Protection is checked again at confirmation, even if the preview was already open. Connection diagnostics remain available.
