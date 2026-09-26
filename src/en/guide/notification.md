# On-screen pop-up

When the classroom app receives a shout, it pops a small card up at the **edge of the screen**,
showing the teacher's name, the time and the content of the shout (an image shout brings its image along).

Two deliberate design choices:

- **It doesn't steal focus**: while the teacher is screen-mirroring or working, a notification
  shouldn't shove the current window out of the way;
- **It stays out of Alt+Tab**: it's a notification, not an application window.

## What you can set (classroom app → Settings (设置) → Shout pop-up (喊话弹窗))

| Option | Description |
|---|---|
| Pop-up on/off (是否弹窗) | Turn it off and the big-caption area is all you get |
| Position (出现位置) | Any of the four corners |
| Notification method (提示方式) | ClassShout pop-up only / ClassIsland reminder only / Show in both places |
| Always-on-top level (置顶档位) | Not on top / Normal on top / Forced on top (re-asserted periodically) |
| Duration (停留时长) | How many seconds before it disappears on its own; 0 means it doesn't disappear automatically |

Duration has a second layer: **the sender can specify how long this one stays**
(see [Display options](/en/guide/display.html)), and when they do, the sender's value wins.
If the sender chose "show only in the big-caption area", the pop-up isn't involved at all.

## Why "UIA on top" is greyed out

Windows has a "window band" (窗口段) mechanism, and an ordinary always-on-top window can't cover
things sitting in a higher band (the Start menu, Task Manager, the notification center, and so on).
To cover those you have to hold a **UIAccess** token, and Windows requires UIAccess programs to be
**digitally signed and installed in a secure directory** (such as `Program Files`), otherwise the
program simply won't start at all.

The unsigned portable build can't reach that layer. Listing this item and spelling out
"not available yet" is better than hiding it — it makes clear that the capability isn't
something we forgot to build, but something that has a precondition.
