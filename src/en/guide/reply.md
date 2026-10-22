# Classroom replies (教室回复)

Once the teacher has shouted, a row of reply buttons appears under the shout on the classroom screen —
tap "Got it" (知道了), pick one of the quick replies, type a sentence, or record a short voice clip.
When the reply comes back to the teacher, it **carries the original message's ID**.

## How the classroom replies

Four ways, and which of them show up is decided by the classroom app's settings:

| How | What happens in the classroom | What the teacher receives |
|---|---|---|
| Got it | One tap, done in a second | The classroom name + "知道了" (the content can be edited; that pair is the default) |
| Quick reply | Pick one of the configured phrasings | That sentence itself (placeholders allowed), e.g. "收到", "马上", "没问题" |
| Text | Type a sentence on the spot | The sentence that was typed |
| Voice | Record a short clip, then tap "say it, send it" (说完了，发送); it is sent automatically at the time limit | A replayable clip plus its duration |

The reply buttons only follow **the message currently on screen**: the teacher shouts one, and then this
row appears. With nothing that can be replied to, the whole reply area stays hidden.

## In pop-up-only mode the card can reply too

When the sender picks "Pop-up" (弹窗) as the display mode, the only thing in the classroom is that
screen-edge card (the big-caption area does not light up; see [display settings](/en/guide/display.html)).
The reply area in the main window is effectively hidden then, so **the card carries its own set**:
"Got it" (知道了), the quick replies and "record a voice reply" (录一段语音回复) — still governed by
the same settings as the table below. Text replies stay in the main window: the card only carries
buttons and the preset phrasings, there is no input box.

Two small behaviours changed along with it:

- **Tapping a button on the card no longer dismisses it.** It used to be "a tap anywhere closes it",
  so one tap on "Got it" made the card vanish before anyone could see whether it went out; tapping
  "record a voice reply" was worse — the recording started and the interface was already gone.
  Now only **a tap on empty space** closes it;
- **While the pointer rests on the card it does not auto-dismiss**, and when the pointer leaves the
  dwell time starts over — nobody should have the card taken away while reading that line, tapping a
  button or recording a sentence.

## Whether those four appear is the classroom's decision

It lives in classroom app → Settings → "回复" (replies). Why the classroom side and not the teacher app:
replying is what the person in the classroom does (a student, the class representative, the teacher of the
next lesson), and "how one can reply" depends on the actual situation in that room — some rooms have no
microphone (so voice replies should be off), and some classes only ever need a "Got it". Put it in the
teacher app instead and the same set of buttons would show up in every classroom.

| Setting | Default | Notes |
|---|---|---|
| Allow replies (允许回复) | On | The master switch. Turned off, no reply entry appears on that screen at all |
| Show the "Got it" button (显示「知道了」按钮) | On | The most used one: one second to tap, and the teacher knows the room saw it. The sentence it sends can be edited (see below) |
| Allow text replies (允许文字回复) | On | The classroom types a sentence on the spot |
| Allow voice replies (允许语音回复) | On | Greyed out when this machine has no microphone (Windows needs a recording device, Linux needs `arecord` from `alsa-utils`) |
| Voice time limit (语音时长上限) | 15 seconds | Adjustable from 3 to 60 seconds; it sends automatically at the limit, so nobody in the classroom has to remember to stop it |
| Quick replies (快捷回复) | 收到 / 马上 / 没问题 | **At most 6**: any more and they no longer fit on that screen, or get mis-tapped. Every one of them can be edited (see below) |

### Quick replies: every one is yours to write

The three defaults are only a starting point for a first-time user: most classes can use them,
but "homework is all handed in" or "we are in the lab this lesson" is something only that class knows.
So every row in the list has "Edit" (编辑) and "Delete" (删除):

- **Edit** loads that row's button text and content back into the fields below, and the button
  changes from "Add" (添加) to "Save changes" (保存修改) with "Cancel editing" (取消编辑) next to it.
  It changes that same row and does not take a new slot — otherwise fixing one sentence would mean
  deleting it and adding it again, and it would drop to the end of the list;
- **Delete** removes the row and the ones after it move up.

The `3 / 6` in the top-right corner is how many are in use. The limit is six, not because the file
cannot hold more, but because these buttons sit next to "Got it" on the classroom screen: any more
and they no longer fit, and are easy to mis-tap.

The content can contain placeholders. They are replaced **at the moment someone taps in the classroom**,
so the same `{教室}收到了` goes out differently in every room:

| Write this | Replaced with | Example |
|---|---|---|
| `{教室}` | This classroom's name | 三年二班 |
| `{老师}` | The teacher's name in this classroom (with the subject) | 数学张老师 |
| `{时间}` | The moment of the reply | 14:05 |
| `{原话}` | The shout being replied to | 请把作业收上来 |

The English spellings work too: `{classroom}`, `{teacher}`, `{time}`, `{original}`.
A `{...}` that is not recognised is **left exactly as written** and never silently dropped —
dropping it would leave whoever wrote it with half a sentence and no clue where to fix it.

For example, if the content is `{教室}收到了`, the teacher receives "三年二班收到了"; if it is
`{时间}{原话}已经收了`, they receive "14:05请把作业收上来已经收了".
The four small buttons under the content field are those placeholders; tapping one appends it to
the end of the content — no need to place the cursor somewhere in the field first.

The button text can be written separately; left empty, it uses the content sentence. Chinese
placeholders in the content show up on the button as the words "教室" and "老师" rather than
literal braces.

The sentence the "Got it" button sends can be edited too: the line under the switch defaults to
`{教室}知道了`, accepts the same placeholders, and shows "发出去是：…" (what goes out is: …) live
underneath. Left empty, it falls back to the built-in "classroom name + 知道了". It is kept apart
from the quick replies because this button is about one-second taps: most classes never change it,
but some want it to carry the classroom name.

"Restore the default few" (恢复默认的几条) puts the quick replies back to 收到 / 马上 / 没问题 —
for when you deleted them all and want them back.

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

> Notifications only arrive while the app is **running**: on the desktop, closing the window minimises it
> to the tray (so it keeps running); on Android there is no always-on background service, so once the system
> kills the app you will only find out next time you open it.

## Classroom replies in the web console

Open the server address in a browser and sign in; the teacher view has a "教室回复" panel where you can
read the list and replay the voice clips. Its "**开启桌面通知**" (enable desktop notifications) button makes
the browser raise notifications too — browsers only allow that over **HTTPS**, so the button does nothing
when you opened the console over `http://`.

The web console can only read, not reply: replying is something the person in the classroom does, and
there is no "reply on behalf of the classroom" entry there.
