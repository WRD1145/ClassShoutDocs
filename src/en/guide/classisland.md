# Integrating with ClassIsland

The computer in the classroom usually also runs [ClassIsland](https://github.com/ClassIsland/ClassIsland)
(timetable / bells), and that is what students look at all day long. So Settings (设置) →
Shout pop-up (喊话弹窗) → Notification method (提示方式) gives you three choices:

| Option | Behavior |
|---|---|
| ClassShout pop-up only (default) | Just ClassShout's own pop-up |
| ClassIsland reminder only | Handed to ClassIsland, going through its own reminder channel (mask / sound / read-aloud all follow its settings) |
| Show in both places | Each channel shows its own copy |

The ClassIsland side needs a companion plugin, **in a repository of its own**:
[WRD1145/ClassShoutCiPlugin](https://github.com/WRD1145/ClassShoutCiPlugin) (GPL v3).
The attachment is a `.cipx`; just drop it into `Plugins` under the ClassIsland data directory.

## How delivery works

```
ClassShout 教室端 ──POST http://127.0.0.1:45902/shout──▶ 插件 ──▶ ClassIsland 提醒
```

It binds to the loopback address only, so other machines on the same subnet can't reach it.
If the plugin isn't installed or ClassIsland isn't running, delivery fails, but that
**doesn't affect the shout itself**: the classroom app logs only the first few attempts and
then one entry every 20, so the log doesn't flood and bury the real exceptions.

## What each kind of shout delivers

| Shout | Mask | Body |
|---|---|---|
| Text | Teacher Zhang shout | The words the teacher sent |
| Voice (when it starts) | Teacher Zhang voice message | Voice message |
| Voice (once the transcription arrives) | Teacher Zhang voice message | Voice message + line break + Transcription: … |
| Image | Teacher Zhang image message | The caption that comes with the image (a reminder can't hold an image; the image is shown in the big-caption area of the classroom app) |

**A new shout replaces the previous one**: reminders are queued, and without actively
cancelling the previous one, the entry carrying the transcription would only appear after
the previous reminder's mask and body finish playing (the body defaults to twenty seconds)
— by which time the shout is long over. That is how it works in the classroom anyway: when
the teacher shouts something new, the previous one stops.

> The delivered payload carries a `kind` field (`text` / `voice` / `voiceTranscript` / `image`),
> and the plugin uses it to decide what to put on the mask. Older plugin versions don't know
> it and treat it as a text shout — which doesn't stop the shout from being received.
