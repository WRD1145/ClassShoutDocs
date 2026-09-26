# Roster

The **Roster**（名单）page in the bottom navigation of the teacher app. A roster lives only on **this device** —
it is the teacher's own lesson-prep material, and the server only needs to know "what a given classroom received."
There is no reason for it to hold a complete student roll.

## Import

One student per line:

```
姓名,学号,简写,小组
张三,20250101,小张,A组
李四,20250102,,B组
王五
```

- **Only the name is required**; just leave the other three fields empty;
- **You can copy and paste straight out of Excel** — a header row, blank lines, and quotes are all handled automatically, and a line starting with `#` counts as a comment;
- A line with no name only skips that one line, and tells you **which line number** it was; the whole batch does not fail.

You can import several rosters (a teacher usually teaches several classes) and switch between them in the drop-down.

## Label format: Name (student ID, short name, group)

Whenever a student appears in a shout, this is always the format, and **only the fields you actually filled in go inside the parentheses**:

| What's in the roster | What the classroom shows |
|---|---|
| 张三,20250101,小张,A组 | 张三（20250101，小张，A组） |
| 李四,20250102,,B组 | 李四（20250102，B组） |
| 王五 | 王五 |

Why those parenthetical fields exist: there is only one line of text on that screen in the classroom.
The teacher calls on people by name, students call each other by short name, and taking attendance means matching student IDs —
so carry everything that was filled in, and one glance is enough to confirm whether the person being called is you.

Why fields you left empty simply are not shown: a screen full of empty parentheses both takes up room and looks like something has broken.

## "Call this student"（叫这位）

Clicking "Call this student" in a roster **drops that student into the "Text"（文字）page**, which is the most direct way to call on someone.
To call several students at once, or to build a sentence out of a template, go to [Quick call](/en/guide/call.html).
