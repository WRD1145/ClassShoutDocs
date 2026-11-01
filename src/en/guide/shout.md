# Shouts: text, voice, and quick phrases

## Text shouts

Type your content on the Text (文字) page → tap Send. The classroom reads it aloud
with the system TTS, and at the same time puts the words up in the classroom's large-text
area (or in a pop-up, depending on how this particular shout is set to display).

- **Quick phrases (常用语)**: the things you say over and over in class ("Everyone please
  be quiet" and so on) — one tap fills them in. The factory set is eight phrases that work
  for any subject; tap **Edit (编辑)** in the top-right corner and you can add, remove, and
  change them — swap in the few you actually say every day, stored on this device, see below.
- **Recent shouts**: whatever you have sent stays on this device (100 at most), and one tap
  fills it back into the input box — "say that again" is the most common thing you need in class.
- **Send queue**: when you fire off several in a row they go out one after another in order,
  and the interface shows "how many are still ahead of this one". The parameters (speech rate,
  font size, target class…) are locked in **at the moment you tap Send**; if you change settings
  afterwards, those earlier shouts do not change along with them.

## Maintaining quick phrases yourself

Tap Edit on the Quick phrases row to enter edit mode: every entry turns into an input box with a
delete button on its right, and below them are "Add one (新增一条)" and "Restore defaults
(恢复默认)". **Nothing is saved until you tap Done (完成)**.

Saving tidies the list up along the way: leading and trailing whitespace is trimmed, empty lines
are dropped, duplicates are kept only once, anything over-long is truncated to 40 characters, and
at most 24 entries are kept. After the tidy-up the interface switches to the version that was
actually stored, so "what you see" is "what was saved".

- **Deleting them all does not put the defaults back automatically.** An empty list is something
  you stated explicitly, and it will still be empty the next time you open it; if you want the
  factory eight back, tap "Restore defaults" in edit mode.
- The cap of 24 is because the list is squeezed in underneath the input box: quick phrases exist
  for when you are "too lazy to type", so they should not be more work than typing.
- They are stored on this device (`%LOCALAPPDATA%\ClassShout\teacher-phrases.json`), so switching
  to another phone does not bring them along — see
  [List of configuration files](/en/reference/config-files.html).

## Voice shouts

Hold to talk, release to send. The classroom app **plays it in real time** (16 kHz mono PCM,
20-millisecond chunks) instead of waiting for the recording to finish — the moment the teacher
opens their mouth, the classroom is already making sound.

- Only one stream of sound at a time: a voice shout interrupts any read-aloud in progress.
- If the phone goes to the background or the screen locks, it wraps up on its own, so the
  microphone is not held open the whole time.

## Should this shout be read aloud?

Text shouts are read aloud by default. Turn off **voice announcement (语音播报)** under "How this
shout is displayed (这条怎么显示)" and it only puts the words up without making a sound — handy in
class when you do not want to interrupt your own explanation.

## What a voice shout delivers to ClassIsland

When ClassIsland is also running in the classroom, a voice shout delivers two notifications: one
"voice message" when the voice starts, and then, once the transcription comes back, another one
carrying the recognized words. See
[Integrating with ClassIsland](/en/guide/classisland.html) for details.

## Teacher local IPC

The development desktop teacher Devices page provides its own IPC card, teacher-ipc.json and 127.0.0.1:45904. Calls send to the currently connected classroom and explicitly reject disconnected sends. Its credentials are independent from classroom IPC; legacy teacher-extensions.json is migrated. See the separate [IPC API documentation](/en/reference/ipc.html) for routes and OpenAPI.

## Teacher plugin management

The development plugin card provides installed entries, search, details, local package installation, enable/disable, restart and uninstall, using teacher-plugins.json. New DLL plugins receive typed host services through DI and own an independent load context and service scope. They do not depend on IPC being enabled. Android does not load desktop plugins. See [Plugin development](/en/dev/plugins.html).

## Delivery receipts

The text page lists up to 100 deliveries from the current session; the voice page shows the latest one. Expand the status to view its timestamped timeline: sent, delivered to classroom, displayed, and read or played to completion. Delivery requires classroom confirmation; display is reported after a rendering pass. Each classroom has a separate delivery record.

Connection failures, server rejection, muting, decoding and playback failures include a reason. Delivery confirmation and display-only messages time out after 45 seconds. Speech and audio completion allow up to 10 minutes, so recording or queued speech is not mistaken for a short timeout. Non-interrupting speech is queued and completed against each original message ID. Receipts are not yet persisted across app restarts. Older classroom versions without execution receipts will time out.


## Connection diagnostics and configuration migration

The teacher Devices page provides one-click tests and sanitized report export for the classroom connection, relay health, TTS and ClassIsland, with the verification scope stated for each. Relay binding still requires delivery receipts to confirm classroom execution. The teacher never treats its own speech engine or ClassIsland instance as the classroom's. Diagnose and audition TTS on the classroom computer; after login and binding, the ClassIsland check reads the bound classroom's live schedule.

Teacher backups migrate local favorite phrases. They exclude login tokens, bindings, server addresses, IPC credentials and plugin lists. Export bells, quick replies and TTS settings from the classroom instead. Import shows an overwrite preview, replaces applicable settings only after confirmation, and requires an application restart. Existing destination login data and credentials are preserved. See [classroom migration details](/en/guide/classroom-settings.html#configuration-backup-and-migration) for scope and limits.
