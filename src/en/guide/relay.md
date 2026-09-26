# Relay server

## When you need it

- The teacher and the classroom are on the **same Wi-Fi** → you don't need one. Open the teacher app and it discovers the classroom app automatically (UDP broadcast).
- The teacher is at home / on another campus and the classroom is at school → you do need one. Just connect both ends to the same relay server.

The link priority is **LAN > server**: on the same subnet latency is lower, and it doesn't use up public bandwidth either.
When both are available, the LAN is used automatically.

## Deployment

The server is self-contained (there are builds for both Windows and Linux, and **from 1.10.0 it is an archive rather than a single file**).
The minimal approach:

```bash
# Linux：解压到 /opt/classshout，--strip-components=1 去掉压缩包里那层目录，
# 让 app/ 与 logs/ 直接落在 /opt/classshout 下
sudo mkdir -p /opt/classshout
sudo tar -xzf ClassShout.RelayServer-linux-x64.tar.gz -C /opt/classshout --strip-components=1

# ⚠ Windows 上打的 tar 不保留 Unix 权限位，解压出来的可执行文件是 0666。
#   不补这一步，systemd 会报 status=203/EXEC（Permission denied）。
sudo chmod +x /opt/classshout/app/ClassShout.RelayServer /opt/classshout/run.sh

cd /opt/classshout
./run.sh --urls "http://0.0.0.0:8080"     # 或直接 ./app/ClassShout.RelayServer
```

The first start generates `relay-config.json` in the **current working directory**, holding the administrator account and a random password —
you need it to sign in to the console. **It is also written to the startup log**, so if you forget the password, look in those two places.
Logs live in `logs/` (`run.sh` points `CLASSSHOUT_LOG_DIR` at that sibling directory) — one file per day,
keeping only the last 7 days, directory mode 0700 and file mode 0600.

What they record is **events**, not every single request: startup, teacher sign-in, class authorization, who sent what shout in which lesson,
whether a scheduled shout went out. The framework's own Information level (including every long-polling request) is kept at warnings and above only —
otherwise a single evening would fill the disk, and none of it is worth anything for troubleshooting. Values such as passwords are masked as
"(redacted)"（已隐去） before being written to the file: showing the password in the UI is by design, landing it on disk is a different exposure.

> If you can't find yesterday's entries, first check whether `logs/classshout-YYYY-MM-DD.log` is there,
> and where `CLASSSHOUT_LOG_DIR` (the `Environment=` line in the unit) points —
> if the path is wrong, the files land in the app folder or the user data folder.

> To upgrade, overwrite only `app/`: the state files stay outside (see below), so program and data never touch each other.
> By default the server looks for state files in "the directory the program lives in", so once you put the program in a subdirectory,
> you must set the state paths explicitly with environment variables in the systemd unit (see [state files](#state-files)),
> otherwise the startup self-check refuses to start with `status=78` and says in the log which item is unavailable.

> In production, put it behind a reverse proxy (Caddy / Nginx) with HTTPS —
> what runs over the relay is teacher accounts and shout content.

## State files

The server keeps its state in the app folder (environment variables can move it elsewhere; **when the program sits in a subdirectory you must set it explicitly**):

| File | Contents | Sensitivity |
|---|---|---|
| `relay-config.json` | Administrator account and password (**plaintext**) | Medium |
| `relay-users.json` | Teacher accounts (passwords as PBKDF2 hashes, includes subjects taught) | **High** |
| `relay-state.json` | Classroom registration records | Medium |
| `relay-bindings.json` | Class authorization table (which teacher may use which class) | Medium |
| `relay-shares.json` | Share links | Medium |
| `relay-schedule.json` | **Scheduled shouts a teacher has queued on the server** | **High** |
| `relay-schedule-audio/` | Audio for scheduled voice shouts (a few tens of seconds is about 1 MB) | **High** |

Every one of those locations can be moved elsewhere with an environment variable: `CLASSSHOUT_CONFIG`, `CLASSSHOUT_USER_STATE`,
`CLASSSHOUT_RELAY_STATE`, `CLASSSHOUT_BINDING_STATE`, `CLASSSHOUT_SHARE_STATE`,
`CLASSSHOUT_SCHEDULE_STATE`, `CLASSSHOUT_SCHEDULE_AUDIO`.
`CLASSSHOUT_SCHEDULE_TICK_MS` is the check interval for scheduled jobs (5000 milliseconds by default).

Backup means copying these files away — **don't forget `relay-schedule.json` and `relay-schedule-audio/`**:
missing them is a particularly sneaky failure — the server comes up and everything looks fine, only the schedules the teacher set up disappear
without a sound, while the teacher's side still believes they are there. **And tighten permissions wherever the files live**:
by default `relay-config.json` holds a plaintext password, and other accounts on the same machine should not be able to read it.

## Server-side schedules

Schedules a teacher sets up after signing in live on the server, and the server sends them out itself when the time comes —
the teacher can close the phone, even shut it down for the weekend, and the classroom still rings. See [scheduled shouts](/en/guide/schedule.html).


## Onboarding flow

1. Classroom app → Settings → "Cross-LAN shout"（跨局域网喊话）→ enter the address → connect to the server → get this classroom's UUID and password.
2. The teacher registers an account (teacher app → Devices page).
3. Give the class to the teacher: authorize it in the console, or use a [share link](/en/guide/share.html), or just copy the password.
4. The teacher binds the classroom.

## Multiple classes

One server can carry many classrooms, isolated from one another: each classroom only receives the shouts addressed to it.
A teacher can bind several classrooms and switch between them in the teacher app.

## Accounts and permissions on the server

- **Built-in administrator**: the account and password are in `relay-config.json`, and by default it is available for every class
  (no per-class authorization needed). It is the only account that can change its own password in the console.
- **Teacher accounts**: teachers register themselves in the teacher app; whether they may use a given class is authorized by the administrator in the console.
- The server **deliberately does not distinguish** "account does not exist" from "wrong password" — that could be used to enumerate accounts.
