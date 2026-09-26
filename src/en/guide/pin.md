# Per-item PIN protection

The computer in the classroom is shared, so anyone walking past can change the configuration on a whim,
or even shut the whole classroom app down.
"Settings → Settings password (设置 → 设置口令)" offers two layers of protection, and you can turn on
just one of them:

| Layer | What it covers |
|---|---|
| Entering settings requires a PIN (进入设置需要 PIN) | It is verified once before the settings window opens; the window locks again once it is closed |
| These items need their own PIN (这几项要单独输 PIN) | The ticked items show up greyed out in settings, and changing them needs the PIN |
| Quitting the program also needs a PIN (退出程序也需要 PIN) | "Quit" (退出) in the tray menu asks for the PIN first |

Six items can be protected individually: read-aloud settings (朗读设置), **transcription and the key
(语音转文字与密钥)**, cross-LAN shouts and classroom identity (跨局域网与教室身份), shout display and pop-ups
(喊话展示与弹窗), classroom info (教室信息), and running in the background with start-on-boot
(后台运行与开机自启).

## Two typical ways to use it

- Afraid students will poke around → turn on only "entering settings requires a PIN";
- Everything else should stay editable by the teacher on duty, but **the key, the classroom identity and
  quitting** must not be changed on a whim → turn the first layer off and tick only those items.

## A few deliberate design choices

- **Verify once and everything is allowed through** (for that one visit to settings); it does not ask again
  once per item — that would only drive people to write the PIN on a sticky note and stick it to the side of
  the computer. Closing the window locks it again, and the unlocked state is **never written to disk**.
- **Changing the PIN does not clear the items you ticked**: the user only wanted a different password, and
  if the scope of protection were silently reset to the defaults, they would get no warning at all.
- **With no PIN enabled, everything is allowed through**, even if the configuration file still carries the
  items ticked last time.
- **Quit protection is off by default**. The machine in the classroom is shared, and "shutting the shout
  software down" is exactly the thing someone walking past is most likely to do, and with the most direct
  consequences (the whole classroom disappears from every teacher's list, with no notice whatsoever).

## What it can stop

What it stops is "casual meddling" — **not "someone who has their hands on this machine"**:
the configuration sits on this machine, so anyone who can read the file can simply delete it and get around
the PIN. This is written on the interface too, so that a school does not take it for an account password.
