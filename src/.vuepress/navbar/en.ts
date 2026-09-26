import { navbar } from "vuepress-theme-hope";

/** English navbar。与中文那份一一对应，只是链接都落到 /en/ 下。 */
export const enNavbar = navbar([
  { text: "Guide", icon: "fa-solid fa-book", link: "/en/guide/" },
  { text: "Reference", icon: "fa-solid fa-list", link: "/en/reference/" },
  { text: "Development", icon: "fa-solid fa-code", link: "/en/dev/" },
  { text: "Community", icon: "fa-solid fa-comments", link: "/en/community/" },
  {
    text: "ClassShout",
    icon: "fa-brands fa-github",
    link: "https://github.com/WRD1145/ClassShout",
  },
]);
