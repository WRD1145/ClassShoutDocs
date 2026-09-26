# Every shout carries its own display settings

"How this one is displayed" **travels with each individual shout**, not as a global setting —
a head teacher who wants one sentence to fill the whole screen and a subject teacher who only
wants a small corner notice are both perfectly normal cases.

| Item | Options | Default |
|---|---|---|
| Display style | Window (fills the classroom's big-caption area) / Pop-up (a notice card at the edge of the screen) | Window |
| Font size | Small / Medium / Large / Extra large | Medium |
| Dwell time | 10 seconds / 20 seconds / 30 seconds / 1 minute / Stays on screen | 20 seconds |
| Read aloud | On / Off | On |

Once you have chosen, the app remembers it, and it is still there the next time you open it —
a teacher who habitually uses "extra-large text + stays on screen" while going over exam papers
should not have to pick it all over again every lesson.

## The classroom app also has its own set of defaults

Under classroom app → Settings → "How shouts display by default" you can set "which preset to use
when the sender did not specify one". The two sets of values mind their own business:

- The set in the teacher app is **what this teacher used last time**, stored on that teacher's own device;
- The set in the classroom app is **which preset to use when nobody specified one**, stored on the machine in the classroom.

That way, shouts sent from an older teacher app still show up sensibly instead of showing nothing at all.

## A few implementation trade-offs

- **"Stays on screen" and "not specified" use different values** (0 and a negative number) to tell
  each other apart. Mix them up and a shout whose sender never picked a dwell time would sit on the
  screen forever — which is the last default behaviour anyone wants in a classroom.
- **Content is not taken away while it is still being read aloud**: if the dwell time runs out but the
  sentence has not finished, the app waits for the read-aloud to end before removing it, otherwise the
  classroom would get "the voice is still talking but the words are already gone".
  The reverse also holds: once it has finished reading but the dwell time has not yet elapsed, the
  content stays put.
- **Pop-up mode does not light up the big-caption area**: whoever picked the pop-up wants exactly one
  thing — "don't take over the screen".
- The same font size preset uses **two different pixel values** in the classroom's big-caption area and
  in a pop-up (the mapping is decided centrally by Core): a pop-up occupies only one corner of the
  screen, and the size used in the big-caption area would simply overflow it.
