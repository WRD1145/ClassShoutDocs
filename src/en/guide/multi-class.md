# Sending to several classes at once

Teachers who teach several classes shouldn't have to go classroom by classroom. On the "Text" (「文字」) page,
under "Who is this going to" (「这条发给谁」), tick a few classes and that one shout goes out to every one of them
at the same time.

- By default only the **currently bound** classroom is ticked, and it carries a "Currently bound" (「当前绑定」) badge;
- Your ticks survive a list refresh (go to the "Devices" (「设备」) page, switch to another classroom and come back —
  the ticks are not lost);
- The whole block is hidden when you have only one classroom saved — with a single classroom, "choosing" means nothing;
- The send result reports honestly "which classes did not get it", so when something fails you can see straight away
  which class it was.

## Voice shouts go only to the currently bound classroom

Sound comes out of one particular classroom's speakers, so playing it to several classes at once makes no sense.
That is why "Who is this going to" only affects text (and text-on-image) shouts.

## How it does it

Multi-class sending binds **on demand** for each target: at the moment of sending it takes a valid token, then keeps
it around for reuse afterwards, instead of having the teacher app hold five long polls open at the same time (that
would be five times the connections and heartbeats).

- If the token has expired (the relay server was restarted), it re-binds automatically once and then sends —
  if it gave up after a single try, multi-class shouts would keep failing after a server restart until somebody
  manually switched classes once by hand.
- Sending is **serial**, one classroom after another, not concurrent: for three or five classes, serial costs only a
  few hundred milliseconds more, but the log order stays clear and a failure points straight at which classroom it was.
- Signing out tears down these temporary bindings along with everything else.
