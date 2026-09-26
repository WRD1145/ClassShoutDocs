import { sidebar } from "vuepress-theme-hope";

/** English sidebar：与中文那份逐项对应，链接落在 /en/ 下。 */
export const enSidebar = sidebar({
  "/en/guide/": [
    {
      text: "Getting started",
      icon: "fa-solid fa-flag-checkered",
      collapsible: true,
      children: ["README.md", "install.md", "first-class.md"],
    },
    {
      text: "Shouting",
      icon: "fa-solid fa-bullhorn",
      collapsible: true,
      children: ["shout.md", "display.md", "image.md", "multi-class.md", "schedule.md"],
    },
    {
      text: "In class",
      icon: "fa-solid fa-chalkboard-user",
      collapsible: true,
      children: ["roster.md", "call.md", "transcript.md"],
    },
    {
      text: "Classroom app",
      icon: "fa-solid fa-school",
      collapsible: true,
      children: ["notification.md", "classisland.md", "classroom-settings.md", "pin.md"],
    },
    {
      text: "Relay server",
      icon: "fa-solid fa-server",
      collapsible: true,
      children: ["relay.md", "console.md", "share.md"],
    },
  ],

  "/en/reference/": [
    {
      text: "Reference",
      icon: "fa-solid fa-list",
      collapsible: false,
      children: ["README.md", "protocol.md", "config-files.md", "troubleshooting.md"],
    },
  ],

  "/en/dev/": [
    {
      text: "Development",
      icon: "fa-solid fa-code",
      collapsible: false,
      children: ["README.md", "structure.md", "build.md", "verify.md"],
    },
  ],

  "/en/community/": [
    {
      text: "Community",
      icon: "fa-solid fa-comments",
      collapsible: false,
      children: ["README.md", "question.md", "contributing.md", "promotion.md"],
    },
  ],
});
