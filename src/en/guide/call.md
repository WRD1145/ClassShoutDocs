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

## Selecting students

- The list can be displayed by three kinds of identifier: **name / student ID / short name**;
- **Students who haven't filled in that field won't show up under that one** — otherwise you'd select an entry that displays as blank,
  send out a message with no student ID, and the teacher would only find out once they're in the classroom;
- You can tick an entire group with a single tap;
- There's a **preview** line on the page, so take one look before you send.

The display parameters for what gets sent (window/pop-up, font size, dwell time, read aloud) are the same set as the ones currently on the "Text" page —
we deliberately don't keep a second set, otherwise the same app would send out different font sizes depending on which of the two routes you used.

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

- When nothing has been synced yet, that part of the page says to go and sync in the app,
  instead of leaving you staring at an empty list wondering why;
- The web is read-only: **editing rosters and templates still happens only in the app** — the
  web is for *using* them, not managing them;
- A preview may leave the classroom unticked (it composes a sample using your default subject),
  but actually sending requires ticking a classroom.
