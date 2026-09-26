import { sidebar } from "vuepress-theme-hope";

/**
 * 中文侧边栏。
 *
 * 分组的理由和默认主题那会儿一样：这套文档的读者有三种 ——
 * 准备部署的运维、日常上课的老师、改代码的人，他们要找的东西完全不同，
 * 混成一列谁都得多扫几眼。分组之后每个组自己可折叠，扫一眼就能落到自己那一类。
 */
export const zhSidebar = sidebar({
  "/guide/": [
    {
      text: "起步",
      icon: "fa-solid fa-flag-checkered",
      collapsible: true,
      children: ["README.md", "install.md", "first-class.md"],
    },
    {
      text: "喊话",
      icon: "fa-solid fa-bullhorn",
      collapsible: true,
      children: ["shout.md", "display.md", "image.md", "multi-class.md", "schedule.md"],
    },
    {
      text: "课堂",
      icon: "fa-solid fa-chalkboard-user",
      collapsible: true,
      children: ["roster.md", "call.md", "transcript.md"],
    },
    {
      text: "教室端",
      icon: "fa-solid fa-school",
      collapsible: true,
      children: ["notification.md", "classisland.md", "classroom-settings.md", "pin.md"],
    },
    {
      text: "服务器",
      icon: "fa-solid fa-server",
      collapsible: true,
      children: ["relay.md", "console.md", "share.md"],
    },
  ],

  "/reference/": [
    {
      text: "参考",
      icon: "fa-solid fa-list",
      collapsible: false,
      children: ["README.md", "protocol.md", "config-files.md", "troubleshooting.md"],
    },
  ],

  "/dev/": [
    {
      text: "开发",
      icon: "fa-solid fa-code",
      collapsible: false,
      children: ["README.md", "structure.md", "build.md", "verify.md"],
    },
  ],

  "/community/": [
    {
      text: "社区",
      icon: "fa-solid fa-comments",
      collapsible: false,
      children: ["README.md", "aibot.md", "question.md", "contributing.md", "promotion.md"],
    },
  ],
});
