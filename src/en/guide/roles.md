# Accounts and permissions: teacher / head teacher / administrator

An account on the server has one of three levels: **teacher &lt; head teacher &lt; administrator**.
The only thing that differs is **who decides which classroom belongs to whom**.

| Role | What it can do |
|---|---|
| Teacher | Shout to the classrooms authorised to them; manage **their own** roster and call templates |
| Head teacher (班主任) | Everything a teacher can, plus **the classrooms they head**: grant and revoke other teachers, and upload the roster that classroom uses as a whole (optionally making it mandatory) |
| Administrator | Every classroom; create accounts, change roles, reset passwords, delete classrooms, share links |

A head teacher **cannot touch classrooms they do not head**: one teacher can head Class 2 while being an ordinary
subject teacher for Class 3 — so "being the head teacher" is recorded **per binding**, not only on the account.
The role on the account decides whether someone is *eligible* to head a classroom at all.

## Appointing a head teacher

In the console's "classroom grants" section the administrator ticks "**make this teacher the head of the classroom**":

- a classroom may have several head teachers (a year-group managing a class together is common practice);
- ticking it also upgrades that account's role to head teacher — one step instead of two
  (change the role, then tick the box), and one fewer way to end up with "I ticked it and still cannot manage anything";
- changing the role back to teacher does **not** silently delete their head-teacher bindings: that is a different
  piece of data ("which classrooms"), and an implicit cascade would leave people wondering where a grant went.

## The head teacher's "My classrooms"

After a head teacher signs in on the web, the teacher view gains a "**My classrooms**" section:

- it lists only the classrooms **they head** (the whole section is hidden when there are none);
- each classroom shows: online state, which teachers currently have access, whether a shared roster exists, and whether it is mandatory;
- they can **grant a teacher access to that classroom** and **revoke** it (only ordinary subject teachers —
  appointing head teachers stays with the administrator, otherwise a head teacher could pull in a "head-teacher
  companion" and the two could cover for each other);
- they can upload that classroom's **shared roster** and decide whether to make it mandatory.

## Who owns a roster

Rosters are **isolated per classroom**: a teacher with three classes has three separate rosters.
On top of that, a head teacher can upload a roster for a classroom that **the whole class uses**:

| Situation | Which roster the classroom actually uses |
|---|---|
| The head teacher uploaded one and set it **mandatory** | Always the head teacher's; subject teachers do not even get an upload box |
| The head teacher uploaded one, not mandatory | A subject teacher's own roster if they have one; otherwise the head teacher's |
| The head teacher uploaded none | The subject teacher's own |
| Neither | Empty — the UI says plainly "this classroom has no roster yet" |

Why a "mandatory" switch exists: there must be exactly **one answer** to "which roster is this class called from".
When two teachers each keep their own, one of them may be unable to call anyone in that classroom,
or may call from a list that no longer matches (a transfer student added or not, someone who has moved class).

> In a classroom with a mandatory roster, a subject teacher's own roster is **not deleted** — it is simply not in
> effect. The moment the head teacher turns the switch off, it takes effect again.

## What the client gets: "which classrooms can I shout to"

After signing in, the teacher app asks the server once, carrying its own **account ID**:

```
GET /api/teacher/classrooms
X-Auth-Token: <login token>
```

The server replies with JSON: the bound classrooms, their **online state**, my role in each one, and which roster
that classroom should use. The client merges this with the classrooms it discovered on the LAN into one
"sendable classrooms" list — so "who can I send to" has a single answer in the UI, instead of being split across
"the LAN one" and "the ones on the server" with no way to tell them apart.

> The account ID is **self-reported** by the client: the server compares it with the account in the token and
> rejects a mismatch. It is never an authorisation input (authorisation only ever looks at the token), but sending
> it has two real benefits — a packet capture shows at a glance who sent the request, and the "looks signed in but
> the token expired" state surfaces immediately as a 403.
