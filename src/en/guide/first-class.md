# Getting your first class running

Do these in order and you end up with a class you can actually use.

## 1. The classroom app connects to a server (only needed across networks)

Classroom app → "Settings" (设置) → "Cross-LAN shout" (跨局域网喊话) → fill in the server
address (for example `https://relay.example.com`) → "Connect to server" (连接服务器).

On the first connection it registers on the server and generates a password, and this
classroom's **UUID** and **password** appear in the interface, each with a one-click copy.

> A classroom on the same LAN does not need this step: the teacher app discovers it
> automatically as soon as it opens.

**Both of these are read-only in the classroom app**: you can see them and copy them, but
there is no "Regenerate" (重新生成) button.
The machine in the classroom is shared by the teacher on duty and the students, and "reset"
really means "this computer becomes a different classroom from now on" — every teacher app
already bound to it stops working, and the password has to be copied out to every subject
teacher all over again.
One accidental tap and you are sending the password around one more time, and that cost is
completely out of proportion to what the word "reset" makes people expect.
If you really do need to start over (say this machine has moved to another classroom), do it
from the server console.

## 2. The teacher registers an account

Teacher app → "Devices" (设备) page → no account? switch to Register → fill in the username
(3–20 characters, starting with a letter), email, **name**, **subject taught** (optional),
password → Register and sign in.

- The **name** shows up in the pop-up on the classroom app, so use your real name.
- Once **subject taught** is filled in, what the classroom sees as the source is
  "Math Teacher Zhang" — several teachers come to the same classroom to shout in one day, and
  a name on its own often does not tell you who it is.
  If the same teacher teaches different subjects in different classes, fill in one default at
  registration and then, in the "Subject taught" card on the Devices page, **fill in one per
  class** (leave it empty = use the default one).

## 3. Give the class to the teacher

Two paths, pick one:

| Path | How it is done | Best for |
|---|---|---|
| **Assignment binding** (recommended) | An admin opens the console and signs in with admin → "Classrooms" (教室) page → find that class → **Authorize to teacher (授权给老师)** | Schools that manage everything centrally |
| Password binding | Copy the classroom app's UUID and password to the teacher, who enters them in the "Bind classroom" (绑定教室) card | No console, or just using it temporarily |
| **Share link** | In the console tick a few classes → "Share selected classes" (分享选中的班级) → send the link to the teacher | Handing over several classes at once, and not wanting passwords circulating in a chat app |

The share-link path is the least work: the teacher opens the link (or pastes it into the
teacher app), those classes are added to their account, and after that one tap binds them.
See [share link](/en/guide/share.html).

## 4. The teacher binds a classroom

- Classes that arrived through an authorization or a share link: just tap them in "Classes
  assigned by admin" (管理员分配的班级);
- Password binding: enter the UUID and password in the "Bind classroom" card and tap
  "Bind classroom".

Once binding succeeds the classroom name appears in the top bar. **A classroom you have bound
is stored on this device**, and a "Saved classrooms" (已保存的教室) section appears below the
card — one tap switches over to it (the password is stored along with it).

> There is a trade-off here that has to be stated plainly: **the password is stored in plain
> text on the teacher app's own machine**.
> It was deliberately not stored before, on the grounds that "keeping it in the teacher's head
> is safer" — but that reason does not hold up in the face of "one teacher teaches several
> classes": the password is the only credential for binding, and if it is not stored you have
> to go and ask an admin for it again every time you switch classes, which makes the feature
> as good as not built.
> The cost is that whoever takes this device can bind these classrooms and shout into them;
> but the same file already stores the login token (which is equally a credential that can
> shout), so the newly added exposure is in fact very small.
> If you do not want one of them, remove it from the list and the password is deleted along
> with it.

## 5. Verify it works

The teacher sends a text shout. The classroom should speak it aloud, a notice card should pop
up at the edge of the screen, and the teacher app's top bar shows the current link
("LAN direct" (局域网直连) on the same subnet, "Public relay" (公网中继) across networks).

If nothing happens, see [troubleshooting](/en/reference/troubleshooting.html).
