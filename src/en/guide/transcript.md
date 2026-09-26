# Transcription (captions)

The classroom app recognises incoming **voice shouts** as text, puts it into the
big-caption area of that classroom screen as captions, and records it in the run log.
When the classroom speakers are hard to make out, or when there is a hearing-impaired
student in the class, seeing the words is the only way they are really heard.

It is configured in the **classroom app**: Settings (设置) → Transcription (语音转文字).

| Item | Description |
|---|---|
| Endpoint | Defaults to `https://api.openai.com/v1`. Any service compatible with `/v1/audio/transcriptions` can be filled in, for example a self-hosted whisper service |
| Key | Stored only on this classroom computer; it is never uploaded and never written to the log |
| Model / language | Defaults to `whisper-1` / `zh`; leave the language empty and the service decides for itself |

## Why it is configured in the classroom app, not on the teacher's phone

The audio is only played out once it has streamed to that classroom computer, so putting
recognition here means what gets recognised is the segment that **actually played** in the
classroom. Recognising on the phone would recognise the sound coming into the teacher's own
microphone — what the classroom actually played out, and whether anyone could make it out,
is something the phone simply does not know.

## How it behaves

- **Transcription is an "extra" step**: a dead network or a wrongly entered key each just
  write one log entry. They do not affect the shout's audio, and no pop-up interrupts the
  people in the classroom.
- **The captions stay on screen for 60 seconds**, then it goes back to standby.
- A single shout transcribes at most the **first 5 minutes**: the transcription endpoint
  takes the whole audio file, and anything longer would have to sit in memory.
- The transcription arrives a few seconds later than the audio. If a new shout comes in
  during that window, the old one is **only written to the log** and no longer touches the
  big-caption area — otherwise the words the new teacher is speaking right now would be
  pushed off the screen by the previous one's late-arriving captions.

## It also delivers to ClassIsland

Once recognition succeeds it delivers one more notification, with the recognised words in
the body. See [Integrating with ClassIsland](/en/guide/classisland.html).
