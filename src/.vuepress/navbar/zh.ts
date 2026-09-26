import { navbar } from "vuepress-theme-hope";

/**
 * 中文（默认语言）导航栏。
 *
 * 「社区」这一栏是从 WRD1145/Docs 那套站点搬过来的，原样保留：
 * 那里放的是社区规范、提问求助、贡献指南与宣传页，
 * 与 ClassShout 的正文（指南 / 参考 / 开发）分开，读者不必在正文里翻规则。
 */
export const zhNavbar = navbar([
  { text: "指南", icon: "fa-solid fa-book", link: "/guide/" },
  { text: "参考", icon: "fa-solid fa-list", link: "/reference/" },
  { text: "开发", icon: "fa-solid fa-code", link: "/dev/" },
  { text: "社区", icon: "fa-solid fa-comments", link: "/community/" },
  {
    text: "ClassShout",
    icon: "fa-brands fa-github",
    link: "https://github.com/WRD1145/ClassShout",
  },
]);
