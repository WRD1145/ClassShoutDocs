# Local IPC API

This page covers HTTP IPC for external programs only. [Plugin development](/en/dev/plugins.html) separately documents dependency injection and assembly isolation and does not require IPC enabled. The protocol version is 1; [download the OpenAPI 3.0 specification](/ipc.openapi.json).

## Addresses and configuration

| Host | Address | Development configuration | 1.21.0 legacy file |
|---|---|---|---|
| Classroom | http://127.0.0.1:45903 | classroom-ipc.json | extensions.json |
| Desktop teacher | http://127.0.0.1:45904 | teacher-ipc.json | teacher-extensions.json |

Version 1.22.0 and later separates IPC/plugin configuration and lifecycle and migrates existing tokens and switches. Ports, HTTP routes and response schemas remain compatible with 1.21.0. Android does not expose desktop IPC. Use the directory shown in Settings; Windows defaults to `%LOCALAPPDATA%\ClassShout`, overridden by CLASSSHOUT_DATA_DIR.

Enable IPC and save in its own settings card. It defaults to disabled and listens on loopback only; it is not a public or browser API. Applying IPC settings does not restart plugins.

## Authentication and request rules

Every request needs Authorization: Bearer Token, read from that host's IPC file. Credentials are independent between roles. Never commit actual tokens or put them in webpages or plugins; managed plugins use injected typed services.

Use HTTP/1.1; the server handles one request per connection and closes it. Match paths/methods below exactly. Send Content-Length for request bodies; chunked Transfer-Encoding is unsupported. JSON is UTF-8. Headers are limited to 8192 bytes, bodies to 32 KiB, each connection to five seconds and concurrency to four connections. Excess connections are closed without a guaranteed HTTP response.

Cross-site Origin, non-loopback Host, duplicate headers and invalid lengths are rejected. Never proxy or expose the port publicly. Nonempty Origin is rejected even with a correct token.

## Query status

GET /v1/status has no body. Classroom status describes its local receiver; teacher status describes its current connection. A 200 is not proof of execution for any message.

```json
{"classroom":"三年二班","muted":false,"volume":80,"apiVersion":1}
{"connected":true,"classroom":"三年二班","apiVersion":1,"role":"teacher"}
```

These illustrate the two separate hosts, not two lines in a single response.

## Send text

POST /v1/shouts with Content-Type: application/json; charset=utf-8.

```json
{"id":"demo-1","text":"请准备上课。","speak":false}
```

ID length is 1–80 characters and text 1–10000; neither may be whitespace-only, and the 32 KiB body limit still applies. Speak defaults to false and delivery is non-interrupting. Classroom executes locally; teacher sends to its currently connected classroom without auto-connecting or broadcasting to every classroom.

```json
{"id":"demo-1","accepted":true,"duplicate":false}
```

Initial acceptance returns 202. The same caller/id/text/speak retry returns 200 with duplicate=true; different content under the same ID returns 409. Switching classrooms does not resend an existing ID. Both 200 and 202 require execution receipts to establish results.

## Query execution receipts

GET /v1/receipts/message-id; encode the ID as a URL path segment.

```json
{"id":"demo-1","stage":"displayed","failure":null,"timeline":[{"stage":"sent","at":"2026-11-01T11:00:00+00:00","detail":null},{"stage":"displayed","at":"2026-11-01T11:00:01+00:00","detail":null}]}
```

Stage is sent/delivered/displayed/completed/failed. Display-only completion is displayed; narration completion is completed. Inspect failure on failure. Timeline timestamps contain a time zone and intermediate stages may be omitted. Timeout does not prove non-execution: query the same ID before generating another.

Deduplication and receipts do not survive host restart; all extensions in a host share a 1000-message deduplication limit. Teacher receipts are additionally limited to the latest 100 deliveries and return 410 after eviction. A 404/410 is not proof of historical non-execution.

## Stop the current message

POST /v1/stop may omit the body. Classroom returns stopped:true; teacher returns requested:true, meaning a stop request was submitted to its current classroom, not a remote completion receipt. HTTP stop can affect current playback; the plugin SDK does not expose global stop.

## Status codes and failures

| HTTP status | Meaning |
|---|---|
| 200 / 202 | Successful query/idempotent retry / accepted |
| 400 | Invalid JSON, fields, length, Origin, Host or request format |
| 401 | Missing/incorrect token |
| 404 | Unsupported route or unknown caller-scoped message |
| 409 | Conflicting content under an ID or disconnected teacher |
| 410 | Teacher receipt evicted from recent deliveries |
| 429 | Process extension quota exhausted; restart required |
| 500 | Host execution exception |
| 502 | Teacher network send failed; query the same ID |

Errors have an error string. Sharing an IPC token does not grant access to plugin-scoped receipts. Diagnostic exports exclude real tokens; logs and scripts should do so too.

## Client example

Use the repository's PowerShell 7 client. It reads the role's new IPC file, falls back to legacy files before migration and does not print tokens:

```powershell
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Text "请准备上课" -Id demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Receipt demo-1
pwsh -File scripts/classshout-ipc.ps1 -Role Teacher -Stop
```

Use -Role Classroom for the classroom host and -DataDirectory for custom storage. Sending and stopping affect a real classroom; validate in a test classroom first.
