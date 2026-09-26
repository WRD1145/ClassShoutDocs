# Image shouts

On the **Text**（文字）page, tap **Choose Image**（选择图片）, pick a photo or screenshot, and it is sent to
the classroom **along with that text** — in the classroom the image and the text appear together in the
same place. An image can also be sent on its own (without any text).

## It is compressed automatically before sending

A photo taken with a phone is already three or four megabytes. Sending it as-is would mean chopping it into
hundreds of requests, and the computer in the classroom would have to receive all of them before it could
display anything — while the detail a screen can actually present is nowhere near that order of magnitude.
So before sending, the app will:

- scale the longest edge down to **1600** pixels;
- leave an original image **untouched** if it is under 400 KB and its dimensions are not over the limit
  (re-encoding a screenshot only makes the text in it blurry);
- after scaling, **encode it once as JPEG and once as PNG, and keep whichever is smaller**.

That last rule is not a pointless extra step: for screenshots and charts — images that are "large areas of
flat color plus sharp lines" — JPEG can actually turn out bigger than PNG, and the edges of the text go
blurry. Using JPEG for everything is simply wrong.

## How the image gets across

It takes the "announce first, then chunk, then finish up" route. A whole image does not fit in one frame, so:

- LAN: 48 KB per chunk;
- Relay server: 10 KB per chunk (the relay server caps a single request body at 16 KiB, and base64 inflates
  it by another third).

The computer in the classroom assembles the image as the chunks arrive and only displays it once everything
has arrived — a missing chunk does not produce half a garbled image; instead the whole shout is dropped and a
log entry is written.

> A ClassIsland notification has no room for an image, so the integration only displays the caption line that
> comes with the image.
> The image itself is displayed in the big-text area of the classroom app.
