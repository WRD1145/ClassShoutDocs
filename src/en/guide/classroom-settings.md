# Classroom app settings overview

The classroom app's settings live in a separate window (click the gear in the top-right corner). The screen
in the classroom is there for the students to look at, so settings don't take over the main interface.

| Card | What it covers |
|---|---|
| Settings password (设置口令) | This machine's PIN, and which items have to be unlocked separately (see [PIN protection](/en/guide/pin.html)) |
| Classroom info (教室信息) | The classroom name — it shows up in the teacher app's list, in pop-ups and on the server console |
| Read-aloud settings (朗读设置) | Volume, speed, read-aloud engine (system voice / Edge online voice), voice, and preview |
| Transcription (语音转文字) | See [captions](/en/guide/transcript.html) |
| Cross-LAN shouts (跨局域网喊话) | Relay server address, connect/disconnect, this classroom's UUID and password |
| How shouts display by default (喊话默认怎么显示) | Which preset is used when the sender didn't specify one (display style / font size / dwell time) |
| Shout pop-ups (喊话弹窗) | See [on-screen pop-ups](/en/guide/notification.html) |
| Running in the background (后台运行) | Whether closing the window hides it to the tray, and whether it starts automatically on boot |
| Online teacher apps (在线教师端) | The list of teacher apps currently connected to this classroom |
| Personalization (个性化) | Theme color (8 presets, or type in your own `#RRGGBB`) |
| Version and updates (版本与更新) | Check for updates (检查更新), mirror (see [Install and deployment](/en/guide/install.html)) |
| About (关于) | Version number, runtime environment, diagnostics, developer mode |

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
