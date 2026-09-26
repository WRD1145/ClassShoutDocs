# Guide

This documentation is broken into blocks by "what you want to do", so you don't have to read it from start to finish.

| Section | What it solves |
|---|---|
| **Getting started** | Packaging, deployment, getting your first classroom running |
| **Shouts** | How to send text / voice / images, what they look like on screen, how to send to several classes at once, and how to send on a schedule |
| **In class** | Roster, quick calls, transcription captions |
| **Classroom app** | On-screen pop-ups, ClassIsland integration, the classroom app's various settings, PIN protection |
| **Server** | How to deploy the relay server, the admin console, share links |

## Three components — tell them apart first

- **Classroom app**: the computer in the classroom that stays on all year round. It handles the sound and the picture, and it is the only end that "knows what is actually going on in the classroom".
- **Teacher app**: the app on the teacher's own phone (or computer). All it does is send.
- **Relay server**: needed only when the two ends are **not on the same network**. On the same Wi-Fi, the classroom app and the teacher app connect to each other directly and no server is required.

> A lot of the design trade-offs below come from a single premise: **the machine in the classroom is shared, stays on all year round, and nobody is watching it**.
> So actions like "reset the classroom identity" or "quit the app" are either protected, or simply given no entry point at all.

## Suggested reading order

1. [Installation and deployment](/en/guide/install.html)
2. [Get your first class running](/en/guide/first-class.html)
3. Look at the specific features under "Shouts" or "In class" as you need them
4. When something goes wrong, see [Troubleshooting](/en/reference/troubleshooting.html)
