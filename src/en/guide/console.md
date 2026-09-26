# Admin console (WebUI)

The server comes with an admin interface of its own, at the server's root address by default
(for example `https://relay.example.com`).
Log in with an administrator account.

By the way: this console **needs no frontend build whatsoever** — it is a static page the server
hands out directly, so at deployment time all you have to do is get the server running.

## Teachers can log into this page and shout too

Same address, same login box: an **administrator** lands on the console described below,
while a **teacher** lands on the "Shout + My classes"（喊话 + 我的班级）page — a teacher does not
necessarily have the app installed, nor a phone with them; standing at the classroom computer,
they can open the page and send a shout.

- Only the classes the **administrator has authorized for them** are listed (classes without
  authorization are not even visible);
- You can tick one or several classes and send to them all at once, with the result reported
  classroom by classroom;
- Sending to a class you are not authorized for is **explicitly rejected**, rather than quietly
  going out;
- The source is still computed by the server (the subject is taken per class), and the client
  cannot fill in its own name;
- When a classroom is offline the message queues up, and is delivered once it comes online.

## The three tabs

| Tab | What it can do |
|---|---|
| Overview（概览） | Registered classroom count, user count, number of currently online teacher apps |
| Classrooms（教室） | See each class's online status, shout to a single classroom, **group shout**, authorize a teacher, **share the selected classes**, delete a registration record |
| Users（用户） | Add an account (you can fill in the subject taught), bulk import a CSV, reset the password, deactivate/activate, **change the subject taught**, view class authorizations |

## The "Subject taught"（任教科目）column

The subject in the user list is what the teacher filled in at registration, and an administrator
can also fill it in for them when creating an account.
It gets prefixed onto the shout source — what the classroom sees is "Mr. Zhang (Math)".

It has a column of its own because **teachers with the same name are very common in one school**:
from the name alone you cannot tell "which classroom should this account be authorized for".
The teacher dropdown in the authorization dialog carries the subject too.

**The subject can be filled in after registration as well**: "Change subject"（改科目）on that row.
The subject is optional on the registration page, teachers often leave it blank on the spot, and
the teacher app has no "edit profile" page afterwards — without filling it in, this teacher's
shout source will be nothing but a name forever. The change takes effect **immediately**; you do
not have to wait for the teacher to reopen the teacher app.
Leaving it blank clears it.

**The same teacher can teach different subjects in different classes**: besides the default
subject, that dialog also lists **every class this teacher is authorized for**, each with an input
box that may be left blank (blank = use the default subject).
A computer science teacher who teaches IT to three classes and covers math for one of them fills
it in exactly this way.

The source seen in the classroom follows **the class this particular shout is going to**, and that
computation happens on the server — so a client cannot impersonate its own name. Teachers can
change it themselves too, in the "Subject taught" card in the teacher app; the change is stored in
the account and comes back when they log in on another phone; when both sides are editing at once,
the copy on the server wins.

## What "Online teachers"（在线教师）shows

That column in the classroom list shows the **number of currently online teacher apps** (a request
within the last minute and a half), with the historical binding count in small text after it.

These two numbers are not the same thing: the binding token stays in the server's memory, so after
a teacher closes their phone that binding still counts — showing only the binding count would make
an administrator think someone is still using the classroom, when in fact there is nobody at all.

## Group shout

Sends to **every online classroom** at once. "Online" is judged by the last activity time on the
classroom record (within 90 seconds), and the classroom app long-polls continuously (at most 25
seconds per round), with every poll refreshing that time on the server.

**Offline classrooms are deliberately left out**: the message queue has a historical cap, and a
message sent to a classroom that is already shut down might be received as a "temporary notice"
from hours ago the next time it powers on — that kind of late arrival is worse than not receiving
it at all.
When not a single classroom is online, the console says plainly "nothing sent", rather than vaguely
reporting success.

## Bulk importing teacher accounts

CSV, one per line: `username,email,name,password[,subject]` — fill in at least one of username and
email, and the subject may be left blank.
**You can copy and paste straight from Excel**; a header row, blank lines and quotes are all
handled automatically.

> Quotes really are honored: Excel automatically adds quotes when a field contains a comma
> (`"Mr. Zhang, Math Department"`), and splitting naively on commas shifts every following column —
> the name keeps only its first half, the subject gets pushed out, and nothing looks wrong in the UI.

> Each row is handled independently: a row that fails validation only skips that row, **the whole
> batch does not fail**.
> Failed rows stay in the dialog with their line numbers, and once fixed you can import again.

## Shouting to a single classroom

The "Shout"（喊话）button on a row goes through exactly the same forwarding path as the teacher app,
except that the source shows as `admin (console)`, so the pop-up on the classroom app makes clear
who said it.
