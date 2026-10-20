# Classroom replies (教室回复)

Once the teacher has shouted, a row of reply buttons appears under the shout on the classroom screen —
tap "Got it" (知道了), pick one of the quick replies, type a sentence, or record a short voice clip.
When the reply comes back to the teacher, it **carries the original message's ID**.

## How the classroom replies

Four ways, and which of them show up is decided by the classroom app's settings:

| How | What happens in the classroom | What the teacher receives |
|---|---|---|
| Got it | One tap, done in a second | The classroom name + "知道了" (the content is assembled from components; that pair is the default) |
| Quick reply | Pick one of the preset phrasings | That sentence itself, e.g. "收到", "马上", "没问题" |
| Text | Type a sentence on the spot | The sentence that was typed |
| Voice | Record a short clip, then tap "say it, send it" (说完了，发送); it is sent automatically at the time limit | A replayable clip plus its duration |

The reply buttons only follow **the message currently on screen**: the teacher shouts one, and then this
row appears. With nothing that can be replied to, the whole reply area stays hidden.

## Whether those four appear is the classroom's decision

It lives in classroom app → Settings → "回复" (replies). Why the classroom side and not the teacher app:
replying is what the person in the classroom does (a student, the class representative, the teacher of the
next lesson), and "how one can reply" depends on the actual situation in that room — some rooms have no
microphone (so voice replies should be off), and some classes only ever need a "Got it". Put it in the
teacher app instead and the same set of buttons would show up in every classroom.

| Setting | Default | Notes |
|---|---|---|
| Allow replies (允许回复) | On | The master switch. Turned off, no reply entry appears on that screen at all |
| Show the "Got it" button (显示「知道了」按钮) | On | The most used one: one second to tap, and the teacher knows the room saw it |
| Allow text replies (允许文字回复) | On | The classroom types a sentence on the spot |
| Allow voice replies (允许语音回复) | On | Greyed out when this machine has no microphone (Windows needs a recording device, Linux needs `arecord` from `alsa-utils`) |
| Voice time limit (语音时长上限) | 15 seconds | Adjustable from 3 to 60 seconds; it sends automatically at the limit, so nobody in the classroom has to remember to stop it |
| Quick replies (快捷回复) | 收到 / 马上 / 没问题 | **At most 6**: any more and they no longer fit on that screen, or get mis-tapped |

These settings live in this machine's `classroom-reply.json` and hold no credentials
(see [Config files at a glance](/en/reference/config-files.html)).

## A reply carries the original message's ID

Every shout has an ID, and that ID **is the moment it was sent** (`yyyyMMddHHmmssfff`, for example
`20261020233225123`). The reply carries it back unchanged, which is the only way the teacher can tell
"which sentence this 'Got it' is about" — the teacher app's list says exactly that: "回的是 23:32:25 那条"
(in reply to the one at 23:32:25).

A reply has an ID of the same kind (also a send timestamp), so after sending, the classroom app says
"已回复（14:05:03）：收到" (replied at 14:05:03: 收到) — and "14:05:03" is the moment **this reply** went
out, not the original shout's.

Using a timestamp instead of a random string makes two things free: **the send time is readable straight
from the log**, and **the same message has the same identity on both paths** (the teacher app generates it
once, and the server and the classroom app carry it along unchanged).

## On the teacher's side: the reply list and system notifications

"Classroom replies" in the teacher app is one card: newest first, at most 50 kept, an unread badge on the
navigation icon, and opening the card marks them as read. Voice replies can be replayed with one tap.

A **system notification** pops up as well when a reply arrives — the teacher is usually doing something
else and will not be staring at this page:

| Platform | How the notification appears |
|---|---|
| Android | The notification channel "教室回复"; from Android 13 it also needs the `POST_NOTIFICATIONS` permission, which is asked for once |
| Windows | A tray balloon (from Windows 10 on it lands in the notification centre in the bottom-right corner) |
| Linux | `notify-send` |

Being connected to the same classroom over both the direct LAN link and the relay at once is normal, so
the same reply can arrive twice, once on each path — replies are de-duplicated by their own ID and the
duplicate is swallowed. One reply producing two notifications would make it look as if the room replied
twice.

## Classroom replies in the web console

Open the server address in a browser and sign in; the teacher view has a "教室回复" panel where you can
read the list and replay the voice clips. Its "**开启桌面通知**" (enable desktop notifications) button makes
the browser raise notifications too — browsers only allow that over **HTTPS**, so the button does nothing
when you opened the console over `http://`.

The web console can only read, not reply: replying is something the person in the classroom does, and
there is no "reply on behalf of the classroom" entry there.
