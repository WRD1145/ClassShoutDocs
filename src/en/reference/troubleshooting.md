# Troubleshooting

Find your symptom.

## The teacher app can't find the classroom app

1. Are the two devices on the same subnet (some campus networks isolate clients);
2. Does the classroom computer's firewall allow **TCP 45900 / UDP 45901** (on first launch you have to tick "Private network");
3. Did the classroom app close its window without staying in the tray — that amounts to quitting;
4. Try a manual connection with `IP:port`: if it connects, the problem is in the implementation; if it doesn't, the problem is the network.

## You filled in the server address and Test connection always fails

- Address format: `192.168.1.10:8080` is fine and `http://` is added automatically; only the http and https protocols are supported;
- Is the server really listening on that port (on the server, run `curl http://127.0.0.1:8080/api/health`);
- Is the reverse proxy actually forwarding it out;
- **On Android, if you entered `http://` (not https), cleartext traffic has to be allowed in the app already** —
  the release build is configured for it; if you edited `network_security_config.xml` yourself, check that step.

## The shout went out but the classroom app does nothing

- What does the link in the teacher app's top bar say ("LAN direct" (局域网直连) or "Public relay" (公网中继))? No link means it never connected;
- Is the classroom app **muted** — while muted, neither text nor voice shouts play (they are only logged);
- Is there a record of it in the classroom app log (a record means it arrived, and the problem is in the playback/display part).

## Shouts don't show up in ClassIsland

1. Under "Notification method" (提示方式), did you pick the option that includes ClassIsland;
2. Is the plugin installed? In ClassIsland's "Reminders" settings, is the "ClassShout shout" (ClassShout 喊话) provider enabled?
3. Does `classshout-bridge.log` in the plugin folder have any content (**if the file isn't there, there was no exception**);
4. Is there a "delivery to ClassIsland failed" line in the classroom app log (it is only logged the first few times and every 20th time).

> This delivery goes over the loopback address. We once stepped on a trap: when `HTTP_PROXY`
> was set on the machine, the request got picked up by the proxy and re-encoded as chunked,
> while the plugin at the time only understood Content-Length,
> so it read an empty body and called it a 400 — the shout never appeared, and neither end had a log.
> Now the classroom app explicitly disables the proxy for this delivery, and the plugin understands both transfer encodings.

## Images won't send

- Is the image too big (the limit is 8 MiB per image, and it is automatically compressed to a 1600-pixel longest edge before sending);
- On the relay link chunks are 10 KB each, so it gets slow on a bad network, but it shouldn't fail;
- Is there an "image wasn't fully received" in the log — that means a chunk was lost along the way.

## A scheduled notification didn't go off

- **Was the app running at the time** — the on-device schedule only fires while the app is running;
- Did you **miss it by more than three minutes**: then it is only marked, not sent late (this is intentional, see [Scheduled notifications](/en/guide/schedule.html));
- Is this entry still in the pending list (a shout that failed to send is kept, and you can see why).

## A share link won't open

- Has the link expired (7 days by default);
- You tapped it and the teacher app didn't come up: the desktop build registers the `classshout://` protocol automatically;
  on Android, if the browser blocks it, copy the link out and paste it into "Bind with a share link" (用分享链接绑定) on the "Devices" (设备) page;
- It says "please log in first": this is intentional — claiming a link requires being logged in, otherwise there is no way to tell who bound what.

## The classroom app makes no sound

1. The system volume and the default playback device;
2. Which speech engine is selected: the system voice needs a voice installed on the machine (on Linux you need `spd-say` or `espeak-ng`);
3. With the Edge online voice selected, the classroom computer has to be able to reach the internet; when it can't, it falls back to the system voice automatically (the log will say so);
4. Verify just this one item with "Preview the current voice" (试听当前语音) in the settings.

## After the classroom app restarts, the teacher has to bind again

The classroom app's UUID and password are persistent and don't change across restarts.
If they really did change, someone regenerated the identity (done on the console), or the Windows
account was switched — because the configuration is stored per account.
