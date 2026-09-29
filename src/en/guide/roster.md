# Roster

The **Roster**（名单）page in the bottom navigation of the teacher app. A roster lives only on **this device** —
it is the teacher's own lesson-prep material, and the server only needs to know "what a given classroom received."
There is no reason for it to hold a complete student roll.

## Import

One student per line, five columns in all:

```
姓名,学号,简写,小组,性别
张三,20250101,小张,A组,男
李四,20250102,,B组,女
王五
```

- **Only the name is required**; just leave the other four fields empty;
- **Spreadsheet files import directly**: `.xlsx` / `.xlsm` / `.xls` as well as `.csv` / `.txt`
  (the "import from file" button on the roster page; on a phone this opens the system file picker).
  Nine out of ten rosters on a teacher's computer are spreadsheets, and "save it as CSV first" is exactly the step
  that goes wrong most easily — the wrong encoding gets picked, or Excel eats the leading zeros of a student ID.
  Reading the spreadsheet directly removes that step;
- **You can copy and paste straight out of Excel** — a header row, blank lines, and quotes are all handled automatically, and a line starting with `#` counts as a comment;
- A line with no name only skips that one line, and tells you **which line number** it was; the whole batch does not fail;
- **The header row is optional**: if a row is recognisably the "姓名" (name) header it is skipped, and if not, the first row is read as a student too;
- A spreadsheet file only reads its **first worksheet**, and uses the **worksheet name as the roster name**
  (that is closer to the content than the file name — if the worksheet is called "三年二班" ("Class 2, Year 3"),
  the roster you get is called "三年二班", not "roster(1)").

### What each of the five columns is for

| Column | Purpose |
|---|---|
| 姓名 (Name) | Required. Without it the line means nothing |
| 学号 (Student ID) | For display and taking attendance. It is often a number in a spreadsheet; importing writes it as an integer (never `20250101.0`) |
| 简写 (Short name) | The short form students use for each other, e.g. "小张" |
| 小组 (Group) | The Call page can tick a whole group in one tap; [random calling](/en/guide/call.html#random-calling) can also draw from one group only |
| 性别 (Gender) | Used only for the range filter of [random calling](/en/guide/call.html#random-calling). `男`/`女`, `男生`/`女生`, `M`/`F`, `1`/`0` are all recognised; anything unrecognised is left empty |

Every student in a roster also carries an **invisible time factor**, which is `0.00` on import.
It is what random calling uses to "let whoever was just called sit out for a while", and it is never shown in the UI
(see [random calling](/en/guide/call.html#random-calling)).

You can import several rosters (a teacher usually teaches several classes) and switch between them in the drop-down.

## Rosters are isolated per classroom, and a head teacher can unify one

Rosters are **isolated per classroom**: a roster imported for Class 2 is never used as Class 3's —
a shout or a call always happens inside one particular classroom, and calling on people must only reach that class.

On top of that, a **head teacher** (班主任) can upload a roster that a classroom **uses as a whole**, and decide
whether to make it mandatory:

| The situation in that classroom | Which roster is actually used |
|---|---|
| The head teacher uploaded one and set it **mandatory** | Always the head teacher's; you do not even get an "import from file" button |
| The head teacher uploaded one, not mandatory | Yours if you imported one; otherwise the head teacher's |
| The head teacher uploaded none | Yours |

The roster page states "which roster this classroom is using" and, when it is mandatory, why
(and who to ask to turn it off). In such a classroom your own roster is **not deleted** — it is merely not in
effect, and it comes back the moment the head teacher turns the switch off.

> Why a "mandatory" switch is needed: there must be exactly **one answer** to which roster a class is called from.
> With two teachers each keeping their own, one of them may be unable to call anyone in that classroom, or may call
> from a list that no longer matches (a transfer student added or not, someone who has moved class).
> The details are in [accounts and permissions](/en/guide/roles.html).

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
