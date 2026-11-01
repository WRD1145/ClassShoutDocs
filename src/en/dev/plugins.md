# Plugin development

This guide targets **ClassShout 1.21.0 / extension API v1** and covers local process plugins and HTTP IPC clients. The main repository contains a [runnable example](https://github.com/WRD1145/ClassShout/blob/v1.21.0/examples/plugins/hello.ps1) and an [IPC client](https://github.com/WRD1145/ClassShout/blob/v1.21.0/scripts/classshout-ipc.ps1).

## Choose an extension transport

| Transport | Connection | Intended use |
|---|---|---|
| Process plugin | Host launches the executable; UTF-8 JSONL over stdin/stdout; no IPC token | Local automation launched with ClassShout |
| HTTP IPC | External program calls loopback HTTP; requires IPC enabled and a Bearer token | Independently running scripts and applications |

Both transports share business routes but differ in authorization and size limits. Process plugins work independently with `IpcEnabled: false`. This is not a DLL loader: there is no event subscription, UI injection, plugin marketplace or package SDK. Do not put a DLL directly in `Executable`. ClassIsland bridge development is separate; see [ClassIsland integration](/en/guide/classisland.html) for the live schedule bridge.

## Classroom and teacher hosts

| Item | Classroom | Desktop teacher |
|---|---|---|
| Configuration | `extensions.json` | `teacher-extensions.json` |
| HTTP address | `http://127.0.0.1:45903` | `http://127.0.0.1:45904` |
| UI entry | Settings → local IPC and plugins | Devices → teacher local IPC and plugins |
| Shout target | Local classroom; no relay required | Currently connected classroom through LAN or relay |
| Status fields | `classroom`, `muted`, `volume`, `apiVersion` | `connected`, `classroom`, `apiVersion`, `role: "teacher"` |
| Receipt retention | Extension records in the current process | Latest 100 session deliveries; evicted receipts return 410 |

Android does not run these desktop IPC servers or process plugins. Use the configuration directory shown in the UI. Windows defaults to `%LOCALAPPDATA%\ClassShout`; `CLASSSHOUT_DATA_DIR` overrides it. Each role has its own file and token even when sharing a directory.

## Registration and lifecycle

Click the relevant save/apply extensions button once to generate its configuration file. Preserve existing `Token`, `IpcEnabled` and other entries. Add the following object to the existing **`Plugins` array**, rather than replacing the entire file. Preserve the field casing shown.

```json
{
  "Id": "hello",
  "Executable": "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
  "Arguments": [
    "-NoProfile",
    "-File",
    "D:\\ClassShoutPlugins\\hello.ps1"
  ],
  "Enabled": true
}
```

`Executable` must be an existing absolute executable path. Arguments are passed separately without shell concatenation. This example requires PowerShell 7: adjust the executable according to `Get-Command pwsh` and place the script at the configured path. The working directory is the executable's directory, not the script's; use `$PSScriptRoot` or absolute resource paths.

`Id` contains 1–64 ASCII letters, digits, dots, hyphens or underscores and should be unique within the host. Only the first 16 array entries are read, including disabled entries. `Enabled` defaults to false. Apply the settings again or restart after editing. Applying stops old plugins before starting enabled entries; the UI's IPC checkbox determines the final `IpcEnabled` value.

Host shutdown and reapplication terminate the plugin process tree. Exited plugins, communication failures and command timeouts are not automatically restarted; fix the issue and apply again. To disable a plugin, set `Enabled: false` and apply. Persistent plugins should keep reading stdin rather than depending on a console window or Settings window closure.

## JSONL protocol

The plugin writes and flushes one request line to **stdout**, then reads one response line from **stdin**. Use UTF-8 without a BOM and terminate each JSON document with a newline. Serialize request/response exchanges within a process. There is no separate request correlation ID or unsolicited event stream; do not assume custom IDs will match concurrent responses.

```json
{"method":"POST","path":"/v1/shouts","body":{"id":"demo-1","text":"请准备上课。","speak":false}}
{"method":"GET","path":"/v1/receipts/demo-1","body":{}}
```

These are two separate requests; read the submission response before querying its receipt. `method`, `path` and `body` are required. Use `GET` / `POST` and include `body: {}` even for GET. The host returns `{ "status": integer, "body": object }`, for example:

```json
{"status":202,"body":{"id":"demo-1","accepted":true,"duplicate":false}}
{"status":200,"body":{"id":"demo-1","stage":"displayed","failure":null,"timeline":[{"stage":"sent","at":"2026-11-01T11:00:00+00:00","detail":null},{"stage":"displayed","at":"2026-11-01T11:00:01+00:00","detail":null}]}}
```

The receipt above illustrates the schema; actual times and stages depend on execution. Never print banners, progress or ordinary logs to stdout: they become protocol commands. The host drains stderr but does not automatically retain it in ClassShout logs. Write persistent debug output to a controlled file without credentials.

## Routes and response statuses

| Request | Behavior |
|---|---|
| `GET /v1/status` | Current host state; not proof of completed delivery |
| `POST /v1/shouts` | `{ "id": "unique-id", "text": "message", "speak": false }`; speak is optional and defaults to false; non-interrupting delivery |
| `GET /v1/receipts/message-id` | Receipt for this caller's message; encode the ID as a URL path segment |
| `POST /v1/stop` | **HTTP IPC only**; process plugins receive 404 |

`id` must contain 1–80 characters and `text` 1–10000 characters; neither can be whitespace-only. Transport limits below also apply. Initial acceptance normally returns 202. Repeating the same caller, ID and content returns 200 with `duplicate: true`; changing text or speak returns 409. Switching the teacher's connected classroom does not resend an existing ID.

| Status | Meaning |
|---|---|
| 200 / 202 | Successful query or idempotent retry / accepted; neither replaces execution receipts |
| 400 | Invalid JSON, required fields, length or HTTP request format |
| 401 | Missing or incorrect HTTP IPC token; process plugins do not use it |
| 404 | Unsupported route or message absent from this caller's scope |
| 409 | Conflicting ID content or teacher not connected; inspect `body.error` |
| 410 | Teacher receipt evicted from the latest 100 deliveries |
| 429 | Host-wide extension limit of 1000 messages in this process reached; restart required |
| 502 | Teacher send attempt failed; query the receipt using the same ID |

HTTP IPC and each plugin Id use separate message namespaces. A plugin cannot query another plugin's or HTTP IPC's messages. The 1000-message limit is shared across extensions in that host. Reapplying extensions does not clear the process deduplication table; restarting clears deduplication and receipts.

## Handle delivery receipts correctly

`stage` is `sent`, `delivered`, `displayed`, `completed` or `failed`. Each timeline entry contains `stage`, `at` and nullable `detail`; failures also populate `failure`. Timestamps include a time zone. Do not require every message to pass through every intermediate stage.

For display-only messages, `displayed` is sufficient. With `speak: true`, wait for `completed` before reporting speech completion. Check `failed` and retain its reason first. Speech may queue: `displayed` does not mean narration has finished.

The example polls every 200 ms; choose suitable polling and overall timeouts for your application. A communication timeout or disconnection does not prove that execution never happened, particularly while a teacher network send remains in flight. Query first or retry with the same ID instead of blindly generating a new ID. A 404, 410 or host restart cannot establish historical execution from local receipts alone.

## Minimal runnable plugin

Save this as UTF-8 `hello.ps1` and register it as shown above. It submits a **real** display-only shout and polls for about six seconds. Connect the teacher to a test classroom first. This short demonstration timeout is unsuitable for long narration.

```powershell
# JSON 行插件示例：stdout 只写协议，诊断请写 stderr；不需要 IPC 令牌。
$ErrorActionPreference='Stop'
[Console]::InputEncoding=[Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$OutputEncoding=[Console]::OutputEncoding
$id=[guid]::NewGuid().ToString('N')
@{method='POST';path='/v1/shouts';body=@{id=$id;text='ClassShout 示例插件已启动。';speak=$false}} | ConvertTo-Json -Compress -Depth 5 | Write-Output
$accepted=[Console]::ReadLine() | ConvertFrom-Json
if($accepted.status -notin 200,202){exit 1}
for($n=0;$n -lt 30;$n++){
    @{method='GET';path=('/v1/receipts/'+$id);body=@{}} | ConvertTo-Json -Compress | Write-Output
    $receipt=[Console]::ReadLine() | ConvertFrom-Json
    if($receipt.body.stage -in 'displayed','completed'){exit 0}
    if($receipt.body.stage -eq 'failed'){exit 1}
    Start-Sleep -Milliseconds 200
}
exit 2
```

Windows console defaults may not be UTF-8, so the example explicitly sets stdin, stdout and PowerShell pipeline encoding. Other languages also need UTF-8, flushing after each line and separation of logs from protocol output. Exit code 0 means display/completion was observed, 1 means rejection/failure, and 2 means the demonstration wait expired; code 2 does not prove non-execution.

## HTTP IPC debugging and checks

Enable HTTP IPC in the relevant UI and use that file's `Token` as `Authorization: Bearer ...`. Call it only from trusted local programs; never embed the token in documentation, plugin arguments or a webpage. Process plugins do not need the port enabled. The repository client reads the token; its default operation queries status:

```powershell
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Text "请准备上课" -Id demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Receipt demo-1
```

Use `-Role Classroom` for the classroom host and `-DataDirectory` for an overridden directory. HTTP returns the business object directly, without JSONL's status/body wrapper; read the HTTP status code. Chunked request bodies are unsupported: send an explicit Content-Length. Invalid Origin, non-loopback Host and duplicate headers are rejected. Do not call it from a browser or expose the port publicly.

After changing the host implementation, run these checks from the main repository. The teacher extension smoke test starts an isolated real classroom and verifies sending and receipts; use a test environment:

```powershell
dotnet build ClassShout.DesktopOnly.slnf -c Release
dotnet run --project tools/ClassShout.EndToEnd -c Release --no-build -- --extensions
pwsh -File scripts/smoke-teacher-extensions.ps1
pwsh -File scripts/regress.ps1
```

## Limits and troubleshooting

| Symptom | What to check |
|---|---|
| Plugin never starts | Correct role file, Enabled, absolute path, Id, first 16 entries and host plugin logs; apply after editing |
| Garbled Chinese or immediate communication failure | UTF-8 stdin/stdout, no BOM, newline and flush; remove ordinary stdout logs |
| Plugin starts then exits | Each command has a five-second deadline; timeout stops communication and terminates the process tree; inspect host and plugin-owned logs |
| 202 but no sound | Speak defaults to false; set true, wait for completed, and check classroom mute, TTS and volume |
| Receipt unavailable | Verify plugin Id, message Id and caller scope; teacher history may evict it, and restart clears it |
| Migration did not restore plugins | Backups exclude plugin lists and tokens; review paths and explicitly enable plugins on the new device |

Each JSONL line is limited to 8192 host characters, not UTF-8 bytes, including the complete request JSON. The business limit of 10000 text characters therefore does not fit in a single plugin request. HTTP headers are limited to 8192 bytes and bodies to 32 KiB, with a five-second connection deadline and at most four concurrent connections; excess connections are closed. There are no audio, image, schedule-writing or scheduling routes.

Process plugins are **trusted local programs** with the current OS user's permissions. The API does not provide login or relay tokens, but the OS does not prevent a plugin from reading local files. Process separation and message namespaces are not security sandboxes. Enable reviewed executables only; these restrictions do not make untrusted code safe.
