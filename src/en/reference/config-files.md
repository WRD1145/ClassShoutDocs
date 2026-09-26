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
| `classroom.json` | Classroom name, UUID, password, server address | **Yes** (password) |
| `classroom-notification.json` | Pop-up settings and the default display parameters for shouts | No |
| `classroom-speech.json` | Speech settings (engine, voice, volume, rate) | No |
| `classroom-stt.json` | The transcription endpoint address and **key** | **Yes** (key) |
| `settings-lock.json` | The PIN's derived value and salt, and which items are protected | **Yes** (derived value, no plaintext) |
| `appearance.json` | Theme color (both apps share the same format) | No |

## Teacher app

| File | Contents | Holds credentials |
|---|---|---|
| `teacher.json` | Server address, login token, saved classrooms (**including passwords**), subjects taught (default + per class) | **Yes** |
| `teacher-display.json` | The display parameters used last time | No |
| `teacher-schedule.json` | Local scheduled shouts (pending + recently processed) | No |
| `schedule-audio/` | WAV files for local scheduled voice (deleted once sent or cancelled) | No |
| `teacher-rosters.json` | Rosters (there may be several) | No |
| `teacher-calls.json` | Call templates (the sets assembled from components) | No |
| `teacher-phrases.json` | Quick phrases (the row of one-tap phrases on the text page) | No |
| `shout-history.json` | The content of the last 100 shouts | No |
| `appearance.json` | Theme color | No |
| `developer.json` | The developer mode switch (unlocked by tapping the version number 10 times in a row) | No |
| `update.json` | Check-for-updates settings (mirror list, proxy, the result of the last check) | No |
| `log.json` | Log verbosity (**both apps share the same format**, see below) | No |

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
