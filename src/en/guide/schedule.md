# Scheduled notifications

On the "Text" page, under "Scheduled notifications", pick a date and a time and hit
"Schedule this shout". When the time comes, that entry (content + display parameters +
target classes) is sent automatically. In the pending list you can see the time, a
content summary, how many classes it goes to, and who scheduled it — and you can cancel
it at any moment.

**All parameters are frozen the moment the shout is created**: a teacher who scheduled
something in the morning has long since changed the font size and the target classes
several times by the afternoon, and what they want is "the shout the way it was when I
set it up".

## Two sending paths

| Path | When it is used | Reliability |
|---|---|---|
| **Server-side schedule** | The default once you are logged in | The task lives on the server, and the server sends it itself when the time comes — **it still goes off if the phone is off or shut down for the weekend** |
| On-device schedule | Not logged in, the server refused it, or no target class was chosen | It is only sent on time while the app is running |

The card spells out which of the two paths this particular entry takes. When the server is
unavailable, **it automatically falls back to the on-device schedule and says why** —
a silent downgrade would leave the teacher expecting "it fires even when everything is
off", and then they would miss a whole reminder.

Cancelling works the same way on both sides: the entries handed to the server are cancelled
on the server. If you only delete the local display and leave the server-side entry in
place, it will still go off when the time comes, while the interface no longer shows it at
all.

## Scheduled voice

The content can be text, or it can be a voice clip:

1. Tap "Record a voice clip" (60 seconds max; it stops automatically at the limit);
2. Once recorded you can "Re-record", or go straight to "Schedule this voice clip";
3. When the time comes, the classroom app plays that audio back exactly as a voice shout.

The audio is pushed at **real-time pace** (one slice every 100 milliseconds), which is the
same data stream the classroom app sees when the teacher holds the button down and speaks
live. Dumping it all in at once would play too, but that would introduce into the classroom
app an input mode that only ever shows up for scheduled voice — and that kind of branch is
exactly the kind that tends to break on real devices.

## Three boundaries

They are written on the interface as well:

1. **An offline classroom gets nothing** (the same rule as for a shout to all classes). The
   criterion is the last-activity time on the classroom record (within 90 seconds): the
   message queue has a historical cap, so a message sent to a classroom that is already
   shut down may be received at its next boot as a "temporary notice" from hours ago — and
   that kind of lateness is worse than never arriving.
2. **Anything missed by more than three minutes is not re-sent.** "Reminder to hand in
   homework five minutes before class ends" means nothing ten minutes past its expiry, and
   an automatic re-send would only blurt out something irrelevant in the middle of the next
   lesson. Expired entries are only marked so a human can see them.
3. **A schedule cannot bypass authorization**: you can only schedule into classes that
   "an administrator has authorized you for", otherwise it is a side door.

## Other behaviour

- An on-device task that failed to send **stays in the pending list** (instead of
  disappearing), so the teacher can see it and retry it by hand;
- At the scheduled moment, sends within the same round are not concurrent: sending goes
  over the network and can be slow enough to span several check cycles, and running two
  rounds concurrently would send the same task twice;
- The on-device pending list holds at most 20 entries, and on the server at most 30 per
  person — it is there for "the few things left over today", not as a calendar;
- Tasks on the server live in the server's `relay-schedule.json`, with voice stored
  separately in `relay-schedule-audio/`; the two must be backed up together. See
  [relay server](/en/guide/relay.html).
