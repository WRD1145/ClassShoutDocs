# One-tap binding with a share link

Telling a teacher "you teach these classes" used to leave only two routes: an administrator
authorizes them one by one in the console, or you copy the UUID and password out for them.
The first means a lot of clicking; the second means letting the password circulate around a
chat app.

Now there is a third: on the administrator's "Classrooms" (教室) page, tick a few classes →
"Share selected classes" (分享选中的班级) → you get a link, and you just send it to the
teacher.

## What the teacher sees

Open the link and you get a web page that lists those classes, plus an
"**Open with the ClassShout teacher app**" (用 ClassShout 教师端打开) button. Tapping it
launches the teacher app (`classshout://`) and adds those classes to the teacher's account
under "Classes assigned by admin" (管理员分配的班级) — after that, one tap binds them.

If the teacher app isn't installed, or the button does nothing, you can also paste the link
into the "Devices" (设备) page of the teacher app → "Bind with a share link" (用分享链接绑定).
All three forms are accepted:

- the full web link `https://你的服务器/share/xxxx`
- the app link `classshout://claim?token=…&server=…` (it carries the server address with it)
- a bare token on its own (the kind you pick out of a chat log and copy)

## Three constraints

The link itself is a **credential**: whoever holds it can bind themselves to those classes.
So:

1. **It has an expiry time** (7 days by default);
2. **An administrator can revoke it** (delete the record and it is gone);
3. **Redeeming it requires signing in first** — that way there is always a record of who
   bound these classes, rather than it spreading anonymously.

The link **contains no password**: what it does is "authorize these classrooms to this
account", and from there the teacher still walks the authorization path that already exists.

## One class can be shared too

Tick one class and the link you get is a single-class link, used in exactly the same way.
Tick none and you share them all — at the start of term, "give this teacher all of these
classes" is the most common way it gets used.
