# Config files at a glance

Every local setting lives in the user data folder, not next to the program —
the program may be installed in a read-only location, and different accounts on the same
machine should have their own separate identities.

- Windows: `%LOCALAPPDATA%\ClassShout\`
- Linux: `~/.local/share/ClassShout/` (or `$XDG_DATA_HOME`)
- The environment variable `CLASSSHOUT_DATA_DIR` can point somewhere else (portable installs
  and self-checks both rely on it)

## Classroom app

| File | Contents | Holds credentials |
|---|---|---|
| `classroom.json` | Classroom name, UUID, password, server address, and the "accept untrusted TLS connections" switch | **Yes** (password) |
| `classroom-notification.json` | Pop-up settings and the default display parameters for shouts | No |
| `classroom-speech.json` | Speech settings (engine, voice, volume, rate) | No |
| `classroom-stt.json` | The transcription endpoint address and **key** | **Yes** (key) |
| `classroom-reply.json` | Reply settings (quick replies, "got it", the text/voice switches, the voice time limit) | No |
| `settings-lock.json` | The PIN's derived value and salt, and which items are protected | **Yes** (derived value, no plaintext) |
| `appearance.json` | Theme color and light/dark (both apps share the same format, see below) | No |

### `classroom-reply.json`

All reply settings live in this one file. The key names are PascalCase exactly as the app writes
them (`Enabled`, `QuickReplies`); copy them as they are when editing by hand. A key whose casing
does not match is treated as an unknown field and skipped — the app does not report an error, the
change just has no effect.

| Field | Type | Default | Meaning |
|---|---|---|---|
| `Enabled` | Boolean | `true` | Master switch. When off, no reply entry appears on that classroom screen |
| `ShowAcknowledge` | Boolean | `true` | Whether the "Got it" (知道了) button is shown |
| `AcknowledgeTemplate` | String | `{教室}知道了` | The sentence "Got it" sends; placeholders are allowed. Empty falls back to `AcknowledgeComponents` (by default the classroom name + "知道了") |
| `AllowText` | Boolean | `true` | Allows a typed text reply in the classroom |
| `AllowVoice` | Boolean | `true` | Allows voice replies; turn it off in a room without a microphone |
| `VoiceMaxSeconds` | Integer | `15` | Voice time limit in seconds. Clamped to 3–60 on load and on save |
| `QuickReplies` | Array | 收到 / 马上 / 没问题 | The quick replies, at most 6; extras are dropped when loading or saving |

Each entry in `QuickReplies`:

| Field | Type | Meaning |
|---|---|---|
| `Id` | String | Identifies this entry; editing uses it to find the original row |
| `Label` | String | The button text; when empty, the assembled content is used |
| `Components` | Array | The components the reply is assembled from |
| `Components[].Kind` | String | Component kind: `text`, `classroom`, `teacher`, `time`, `original` |
| `Components[].Text` | String | The text when `Kind` is `text`; may contain `{教室}`, `{老师}`, `{时间}`, `{原话}` |

A component whose `Kind` is not `text` ignores `Text`: `classroom`, `teacher`, `time` and `original`
take the classroom name, the teacher's name, the reply time and the original shout respectively —
the same values as the placeholders. A `{...}` that is not recognised is left as written, not dropped.

> `AcknowledgeComponents` is the component form used since 1.15.0; it is only consulted when
> `AcknowledgeTemplate` is empty. Normally you edit the template and never touch it.

## Teacher app

| File | Contents | Holds credentials |
|---|---|---|
| `teacher.json` | Server address, login token, saved classrooms (**including passwords**), subjects taught (default + per class), and the "accept untrusted TLS connections" switch | **Yes** |
| `teacher-display.json` | The display parameters used last time | No |
| `teacher-schedule.json` | Local scheduled shouts (pending + recently processed) | No |
| `schedule-audio/` | WAV files for local scheduled voice (deleted once sent or cancelled) | No |
| `teacher-rosters.json` | Rosters (there may be several, **each classroom using its own**). Besides name / student ID / short name / group / gender, each student also carries the invisible **time factor** and the moment it was written (used by [random calling](/en/guide/call.html#random-calling)) | No |
| `teacher-calls.json` | Call templates (the sets assembled from components), plus random calling's range and cooldown (group / gender / count / decay minutes) | No |
| `teacher-phrases.json` | Quick phrases (the row of one-tap phrases on the text page) | No |
| `shout-history.json` | The content of the last 100 shouts | No |
| `appearance.json` | Theme color and light/dark | No |
| `developer.json` | The developer mode switch (unlocked by tapping the version number 10 times in a row) | No |
| `update.json` | Check-for-updates settings (mirror list, proxy, the result of the last check) | No |
| `log.json` | Log verbosity (**both apps share the same format**, see below) | No |

## Personalization (`appearance.json`)

The theme color and the light/dark choice both live in this one file, and both apps use the same format
(the teacher app uses the same one on Android and on desktop). Key names are still PascalCase; a
lowercase `theme` is treated as an unknown field and skipped — the app does not report an error, the
change just has no effect.

| Field | Type | Meaning |
|---|---|---|
| `SeedColor` | String | The seed for the theme color, `#RRGGBB`. Both the light and the dark palette are derived from it |
| `Theme` | Integer | Light/dark: `0` follow the system (default), `1` light, `2` dark |

An out-of-range `Theme` value (say, hand-edited to `3`) is treated as `0`, follow the system — a corrupted
setting should not leave the interface in a palette that is hard to read.

> Light/dark changes the whole palette, not just the background: primary, containers, outlines and text
> all switch with it, because light and dark are two palettes derived from the same `SeedColor`. To change
> only the colour, edit `SeedColor` in one place and both palettes follow.

## Runtime logs

Logs are **written to `logs/` under the app folder by default** (not the user data folder) —
"where the logs are" and "where the app is" are the same thing, and whoever is looking for
the logs is most likely standing in front of that machine. One file per day, and only the
last 7 days are kept.

When installed in a read-only location it falls back step by step, and which step it landed
on is shown under "About" on the settings page:

1. The environment variable `CLASSSHOUT_LOG_DIR` (the launcher script in the archive points
   it at `logs/` under the app folder);
2. `logs/` under the program folder;
3. `logs/` under the user data folder (it is in the table below too).

| File | Contents |
|---|---|
| `logs/classshout-2026-09-26.log` | That day's runtime log (what you see in the UI is written here as well) |

Each line carries its level and source: `2026-09-26 19:14:09 [信息 网络] 已连上教室`.

### Verbosity (`log.json`)

Both apps have a level dropdown on their runtime-log card. Changing it takes effect and is
saved to `log.json` immediately:

| Level | What gets logged |
|---|---|
| `Trace` | Every broadcast, every frame sent and received — the most detailed, and the log grows fast |
| `Debug` | The details of connecting, discovery and retries. **This is the level to use when investigating "the scan finds no classroom" or "did this one actually go out?"** |
| `Info` (default) | Normal operations and their results |
| `Warning` | Warnings and errors only |
| `Error` | Errors only |

Anything below the selected level is **neither shown in the UI nor written to disk**.
An unrecognised level falls back to `Info` — a corrupted setting should not make the logs
disappear entirely.

> Why the switch exists: at the default level you cannot see "which address the broadcast
> went to and who answered", and that is the whole set of clues for connectivity problems —
> but recording all of it all the time turns the log into a running commentary.
> The server's log uses the environment variable `CLASSSHOUT_LOG_LEVEL` for the same set of
> levels (see [Relay server](/en/guide/relay.html)).

> The subjects taught stored in `teacher.json` are only a **cache** (the direct-over-LAN path
> does not go through the server, so the teacher app has to supply the name itself); the
> authoritative copy lives on the server account.

> `teacher.json` holds plaintext passwords, and `classroom-stt.json` holds an API key.
> These two files belong to the category of "if this device is taken away, those credentials
> go with it" — that is a deliberate trade-off (see the explanation in
> [Getting your first class running](/en/guide/first-class.html)),
> but treat them as credentials: do not bake the whole folder into a backup image and then
> share it publicly.

## Relay server

See the state file table in [Relay server](/en/guide/relay.html).
