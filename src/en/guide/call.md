# Quick Call

The "Call" (呼叫) page in the bottom navigation: assemble what you want to shout out of **components**, pick the students, and send it all at once.
The difference between it and the "Text" (文字) page is this: on the Text page you type it out by hand every time, whereas the Call page is for "the same set of words shouted over and over to different people".

## Components

| Component | Output |
|---|---|
| Text (文字) | The fixed content you write, e.g. " 来 " ("come"), " 办公室" ("office"), "：" (":") |
| Student (name) (学生（姓名）) | This student's name |
| Student (short name) (学生（简写）) | His short name (outputs nothing if it isn't filled in) |
| Student (student ID) (学生（学号）) | His student ID (outputs nothing if it isn't filled in) |
| Group members (小组成员) | **Every member** of the group he belongs to, separated by enumeration commas (、) |
| Random calling (随机叫人) | The few who were drawn, separated by enumeration commas (see [random calling](#random-calling) below) |
| Teacher name (教师名字) | Your own name (including the subject you teach, e.g. "数学张老师", that is, subject + surname + "teacher") |

**Tap once** and the component is appended to the end of the assembly area; you can also **drag it straight over** (on desktop; drag-and-drop support on phones is limited, so just tap).
Components in the assembly area can be moved left and right and deleted; the content of a "Text" component can be edited right where it sits.

## Two assembly rules

1. **Components are concatenated in order, and no spaces are added automatically.** Spaces are carried by the "Text" component itself —
   if you want "张三 来 数学张老师 办公室" ("Zhang San, come to Teacher Zhang's office"), you write " 来 " and " 办公室" inside the text components;
   whereas "张三" + "：请到办公室" (Zhang San + ": please come to the office") needs the punctuation tight against the name. Adding spaces automatically would turn the latter into "张三 ：".
2. **When "Group members" is included, students are merged into one sentence per group**, and it lists **all** the people from that group in the full roster
   (not just the few you ticked) — when a teacher calls three people at once, what the classroom needs is
   one sentence like "请 张三、李四 来 数学张老师 办公室" ("Zhang San and Li Si, please come to Teacher Zhang's office"), not three nearly identical shouts flashing one after another.
   Students who aren't in any group each count as a group of their own, and won't be merged into the same shout.

## Templates

The components you've assembled can be saved as a template (save / new / delete). One "Come to the office" (来办公室) template is provided by default —
a blank component panel gives a first-time user no hint whatsoever.

When you've made changes and haven't saved them yet, "(unsaved) xxx" （未保存）xxx shows up in the dropdown: we'd rather have one extra entry
than quietly drop the components the teacher just dragged in.

## Which classroom it goes to (exactly one)

On the Call page you **pick one classroom first**, then pick students — and only one:

- the names, groups and randomly drawn students in the sentence all come from **one particular roster**, and rosters
  are isolated per classroom (see [roster](/en/guide/roster.html)). Calling three classrooms at once means only one
  of them gets the "right" student;
- random calling also records "who was just called" (the time factor), and that is recorded on that roster —
  sending to three classrooms at once throws away the factor bookkeeping for the other two.

So this is not "multi-select is not implemented yet", it is **deliberately a single choice**:
a control that looks selectable but produces a wrong result is worse than one that is missing.

> The Text and Voice pages are the opposite: they share one "sendable classrooms" list, so ticking three classrooms
> sends to three (see [shouting to several classrooms](/en/guide/multi-class.html)).

## Selecting students

- The list can be displayed by three kinds of identifier: **name / student ID / short name**;
- **Students who haven't filled in that field won't show up under that one** — otherwise you'd select an entry that displays as blank,
  send out a message with no student ID, and the teacher would only find out once they're in the classroom;
- You can tick an entire group with a single tap;
- There's a **preview** line on the page, so take one look before you send.

The display parameters for what gets sent (window/pop-up, font size, dwell time, read aloud) are the same set as the ones currently on the "Text" page —
we deliberately don't keep a second set, otherwise the same app would send out different font sizes depending on which of the two routes you used.

## Random calling

The "**random calling**" (随机叫人) component in the component palette is a different way of using the page: instead of picking students yourself,
you **draw them from a range**. Put it in a template and the page switches to random mode (the student list gives way to the settings below).

One template is provided by default:

```
请 [随机叫人] 来回答这个问题      ("[random] please come and answer this question")
```

### The range

| Setting | Meaning |
|---|---|
| Group (小组) | Draw only from this one group; "不限" (no limit) means the whole class |
| Gender (性别) | Draw only from the boys / the girls; students whose gender is blank are never drawn in either of those two modes |
| Count (人数) | How many to draw at once, 1 by default, 10 at most |
| Cooldown (冷却) | How long the time factor takes to decay from full back to 0, **40 minutes** by default (about one lesson); 20 / 40 / 60 / 90 minutes are offered |

All four live only on **this device**: they are the temporary choices of "how I want to draw in this lesson",
and, like the roster, there is no reason for them to travel to the server.

### The odds: an invisible time factor

Every student carries a "time factor" that the UI never shows. The rules are:

- It is `0.00` on import, with a ceiling of `1.00`;
- **The smaller the factor, the likelier the draw**: weight = `1 − factor`, with a floor of `5%` —
  someone just called is not completely out of the running (otherwise two draws in a row could never land on them);
- **Being drawn once resets the factor to somewhere between `0.95` and `1.00`** (just called → the odds are pushed to their lowest);
- After that it decays **linearly** back to 0, and the decay window is the "cooldown" above.

Why not plain randomness: plain randomness produces results that are plainly unfair, like "the same student three times in one lesson",
whereas what the teacher wants is "everyone does get called, but whoever was just called takes a breather first".

> The factor is **computed**, not continuously rewritten by a timer: what is stored is "the factor value + the moment it was written",
> and the current value falls out of a single subtraction. So closing the app, suspending the machine, or even changing the system clock
> cannot make these weights go stale.

### A few details

- **A preview does not draw anybody**: in random mode the preview only states which range will be drawn from —
  it does not draw once for real and does not touch anyone's factor. The real draw happens at the moment you press send;
- After sending, the page states **who was drawn** ("抽到：张三", "drew: Zhang San"), and the classroom shouts that sentence out;
- The students drawn are **recorded and written to disk immediately** (the factor and the moment) — recording it is the whole point;
  draw without recording and "just called" means nothing;
- When the template contains other components as well, the interpretation is fixed:
  **name / short name / student ID take the first student drawn** (so you can write "张三 请回答"), and
  **group members takes the groups those students belong to** (deduplicated);
- If the range contains nobody (say that group has no gender filled in and you asked for boys only), no empty message goes out —
  the page tells you the range is empty.

> Random calling is currently available **in the app only**. The web call section composes sentences from components and ticked students;
> it has no random mode — the time factors and the record of "who was just called" live on the teacher's own device,
> the server does not have that state, and putting it on the web would mean half of it being recorded in each of two places.

## Calling from the web

Once you're signed in to your server account, open the server address in a browser: the
**teacher view has a "Call" (呼叫) section** too — pick a template, tick the students, press
"preview what will be shouted" to take a look, then press "send the call".

Its rules are the same as the app's — because both sides run the **same composition code**
(component order, spacing, group merging and the subject in the source name all match),
rather than one being a rewrite of the other.

What that needs is the roster being on the server, and the roster normally only lives on the
teacher's own device, so sync it once before the first use:

> The app's "Roster" page → the button at the bottom, "sync the roster to the server (for web calling)".
> It syncs **the roster you're currently on** plus every call template; after you change the
> roster, just press it again.
> What crosses over is the name, student ID, short name, group and gender; the **time factor is not part of it**.

- When nothing has been synced yet, that part of the page says to go and sync in the app,
  instead of leaving you staring at an empty list wondering why;
- The web is read-only: **editing rosters and templates still happens only in the app** — the
  web is for *using* them, not managing them;
- A preview may leave the classroom unticked (it composes a sample using your default subject),
  but actually sending requires ticking a classroom.
