# Verification

This project has no unit test framework. What it has instead is three things: a **regression script**,
**end-to-end tools** and **render verification**.

## The five regression stages

```powershell
pwsh -File scripts/regress.ps1
```

| Stage | What it tests |
|---|---|
| LAN | Discovery, handshake, text, byte-for-byte verification of the voice stream, image chunking and reassembly, display parameters, scheduling, roster, call assembly, share-link parsing, the send queue, the settings lock |
| Relay | Classroom registration, accounts, binding and authorization, text and voice, images, multi-class shouts, group shouts, share-link redemption, rate limiting |
| Tray | Whether closing the window minimises to the tray, and whether the process keeps receiving shouts |
| Single instance | Whether a second instance only shows a notice instead of seizing the port |
| Front end | Escaping and action wiring on the console pages (every `data-action` has a handler, and there are no redundant branches) |

The relay stage starts a temporary server of its own (a brand-new state directory plus environment
variables) and cleans it up automatically once it is done, so it never touches the instance you have
deployed.

## End-to-end tools

```powershell
# 局域网链路
dotnet run --project tools/ClassShout.EndToEnd

# 中继链路（需要先自行启动服务器）
dotnet run --project src/ClassShout.RelayServer -- --urls "http://127.0.0.1:8090"
dotnet run --project tools/ClassShout.EndToEnd -- --relay http://127.0.0.1:8090
```

**Both of them run the real implementation** (real TCP connections, real framing, a real server), not
a mock — almost everywhere this project goes wrong is in "the agreement between the two ends", and
swapping the middle for something fake would test none of that.

## Render verification

```powershell
dotnet run --project tools/ClassShout.DesignPreview -- artifacts
```

It renders the real UI into PNGs and applies pixel-level criteria (how many colours there are, what
share the dominant colour takes, whether the MD3 tokens hit), and at the same time it runs a few
assertions that have nothing to do with rendering (font fallback, the colour algorithm, configuration
read/write, image compression).

The exported images have to be **really opened and looked at**: the pixel criteria can only tell you
that "something was drawn" — whether the layout has drifted, whether the greyed-out items really are
grey, whether a status badge showed up, only a human can see. When you need to see the parts a
collapsed state hides (the input boxes you get while a switch is off, say, or the greyed-out items
after a dropdown is expanded), add a scenario of its own that expands it and render it once more.

## Two rules of discipline

1. **An assertion has to be able to catch a bug.** After you fix a problem, temporarily revert the fix
   and run it once more, and confirm that the assertion really does fail — otherwise that assertion is
   only running in a vacuum. Take the rule that "the classroom app has to accept chunked": once you
   revert it, the body really does turn into an empty string, and only then does the assertion go red.
2. **Do not misreport results.** Integration tests have turned up cases of "the call returned success
   but nothing happened", so the key assertions all verify one step further: after authorization, also
   check that "these classes really are in the authorization list".
