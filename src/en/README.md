---
home: true
icon: home
title: Home
heroText: ClassShout
tagline: Say it on your phone — the classroom screen shows it and speaks it
heroImage: /logo.png
heroImageDark: /logo-dark.png
heroImageStyle:
  maxWidth: "320px"
  margin: "0 auto"
actions:
  - text: Get started
    icon: lightbulb
    link: /en/guide/install.html
    type: primary
  - text: Feature tour
    link: /en/guide/
  - text: Community
    link: /en/community/
  - text: GitHub
    icon: fa-brands fa-github
    link: https://github.com/WRD1145/ClassShout
footer: The project source is released under GPL v3
---

## What this is

A **classroom shout system** for primary and secondary schools. A teacher types a line,
holds to talk, or sends a picture on their own phone, and the computer in the classroom
**speaks it, plays it and shows it** — no need for students to look around for the teacher,
and no need for the teacher to walk to the podium and press buttons.

It consists of three parts:

| Part | Runs on | What it does |
|---|---|---|
| **Classroom app** | The always-on computer in the classroom | Receives shouts, speaks/plays/shows them, provides the big caption area and screen-edge pop-ups |
| **Teacher app** | The teacher's phone (Android) or desktop | Sends text, voice and images; manages the roster and student calls |
| **Relay server** | Any machine reachable from the internet | Forwards messages when the two ends are not on the same network; ships with an admin console |

On the same LAN the classroom app and the teacher app work **without any server** —
the teacher app discovers classrooms in its own subnet automatically.
A relay server is only needed when the two ends are apart (teacher at home, classroom at school).

## Contents

<div class="vp-card-container">
  <VPCard
    title="Guide"
    desc="Packaging, deployment, your first classroom; how to send text / voice / images, how they are displayed, how to schedule"
    logo="/logo-192.png"
    link="/en/guide/"
  />
  <VPCard
    title="Reference"
    desc="Wire protocol, configuration files and defaults, and where to look first when something breaks"
    logo="/logo-192.png"
    link="/en/reference/"
  />
  <VPCard
    title="Development"
    desc="Code layout and layers, how to build and package, how to verify a change"
    logo="/logo-192.png"
    link="/en/dev/"
  />
  <VPCard
    title="Community"
    desc="Community rules, asking for help, contributing guide and promotion page"
    logo="/logo-192.png"
    link="/en/community/"
  />
</div>

## Where to start

- About to deploy → [Install & deploy](/en/guide/install.html)
- Already installed, want your first classroom working → [Your first class](/en/guide/first-class.html)
- Just want to know how one feature works → browse by topic in the "Guide" sidebar
- Something is wrong → [Troubleshooting](/en/reference/troubleshooting.html)
- Changing the code → [Development](/en/dev/)

> These pages explain **why it works this way**, not just which button to press.
> How to use a feature is usually obvious at a glance; "why this default" and
> "why this message is not re-sent" are what you actually need when a classroom misbehaves.

## Source and license

- Main program: [WRD1145/ClassShout](https://github.com/WRD1145/ClassShout) (GPL v3)
- ClassIsland bridge plugin: [WRD1145/ClassShoutCiPlugin](https://github.com/WRD1145/ClassShoutCiPlugin) (GPL v3)
- This documentation site: [WRD1145/ClassShoutDocs](https://github.com/WRD1145/ClassShoutDocs)
