# Communication protocol

## Ports

| Port | Protocol | Purpose |
|---|---|---|
| 45900 | TCP | Classroom app listening port: the handshake, control messages, and both audio and image chunks all go over this one connection |
| 45901 | UDP | The classroom app listens for broadcasts here; the teacher app relies on them for automatic discovery |
| 45902 | TCP (loopback) | The classroom app's entry point for delivering to the ClassIsland plugin on the same machine, bound to `127.0.0.1` only |

Control messages and audio/images **share a single TCP connection**, told apart by the type byte in the frame
header — that avoids extra ports and out-of-order problems.

## Framing

```
[4 字节大端长度][1 字节类型][负载]
```

The length field includes the type byte. A single frame's payload is capped at 1 MiB (a defence against a bogus
length triggering a huge allocation).

Types: `1 = control (JSON)`, `2 = audio chunk (raw PCM)`, `3 = image chunk`.

## Control messages

JSON, told apart by the `type` field. The main ones:

| type | Direction | Description |
|---|---|---|
| `hello` | Teacher app → classroom app | Handshake, carrying the client name and protocol version |
| `textShout` | Teacher app → classroom app | A text shout, carrying speech rate, volume, whether to interrupt, and the display parameters |
| `audioStart` / `audioEnd` | Teacher app → classroom app | The two ends of a voice stream, with audio chunks in between |
| `imageStart` / `imageEnd` | Teacher app → classroom app | The two ends of the three-part image sequence, with image chunks in between |
| `stop` | Teacher app → classroom app | Stop immediately |
| `status` | Classroom app → teacher app | Running state (standby/speaking/playing/muted/volume) and a **capability declaration** |
| `ack` / `error` / `bye` | Both directions | Receipt, error, disconnect |

### Protocol version and capabilities

The handshake carries a protocol version, and a mismatch is rejected explicitly with a prompt to upgrade —
the whole point of a version number is "the wire format may have changed."

On top of that, the classroom app reports in `status` which capabilities it has (images, display parameters).
The teacher app uses that to disable the options it cannot actually use: letting someone pick an option and then
failing to deliver it to the other side is far worse than disabling it from the start.
An older classroom app does not send this field, and the teacher app treats it as "basic capabilities only."

## Audio

16 kHz mono 16-bit PCM, one chunk every 20 milliseconds (640 bytes).

Over the relay path, the client first accumulates 100 milliseconds and then sends one HTTP request —
sending directly would mean 50 requests per second, and the server cannot take that. On the server the chunks are
base64-encoded and put into an envelope for forwarding.

## Images

The same three-part shape as audio: an announcement (with the total byte count, caption text, and display
parameters) → a number of chunks → a finish-up.

- 48 KiB per chunk on the LAN, 10 KiB per chunk over the relay;
- why the relay chunks are smaller: the server caps a single request body at 16 KiB, and base64 inflates it by
  another third;
- a single image is capped at 8 MiB — the classroom app pre-allocates its buffer according to the byte count in
  the announcement, so without a cap we would be letting the other side decide how much memory we allocate.

The computer in the classroom assembles the image as it arrives and only displays it once everything has arrived.

## Relay link

Neither the teacher app nor the classroom app connects to the other side directly; each of them talks to the
server:

- teacher app sends a shout: an ordinary HTTP POST;
- both ends receive messages: **long polling** (a round waits at most 25 seconds);
- the server only forwards; it does not understand the content.

### Event envelope

One flat structure (`kind` plus the fields), rather than a separate type for each kind of event:
what runs over this line is high-frequency audio chunks, so every extra layer of polymorphic parsing is extra
cost — and since the server only forwards, this states "the server does not need to understand the business"
more clearly.

### Authentication

| Who | Token | How it is carried |
|---|---|---|
| Classroom app | Issued by the server after registration | Request header `X-Relay-Token` |
| Teacher app | Issued after binding to a classroom (the binding lives in memory, so it must be redone after a server restart) | Path parameter |
| Account login | Issued after login/registration | Request header `X-Auth-Token` |

Tokens travel in request headers rather than the query string: the query string ends up in access logs, and
something like a password has no business being kept in a log.
