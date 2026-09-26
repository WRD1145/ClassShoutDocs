import { hopeTheme } from "vuepress-theme-hope";
import { enNavbar, zhNavbar } from "./navbar/index.js";
import { enSidebar, zhSidebar } from "./sidebar/index.js";

/**
 * 站点主题配置。
 *
 * 这套配置与插件来自 WRD1145/Docs（docs.wrd1145.top）那套站点，原有风格照搬：
 * hope 主题 + slimsearch 搜索 + 满配的 Markdown 扩展（提示框、选项卡、代码块高亮、
 * mermaid / echarts / flowchart 图、VPCard 卡片…）。
 *
 * 双语的做法：站点分 `/`（中文）与 `/en/`（英文）两个语言区，
 * 两边的导航栏与侧边栏各自一份、条目一一对应 —— 中文页里点「English」会落到
 * 同一页的英文版，靠的就是两棵树结构完全一致。
 */
export default hopeTheme({
  hostname: "https://docs.wrd1145.top",

  author: {
    name: "WRD1145",
    url: "https://wrd1145.top",
  },

  logo: "/logo.png",

  // 深色模式下换一份：原图是白底黑字，直接放在深色导航栏上会是一块白贴纸；
  // logo-dark.png 是同一张图导出的（白底去掉、黑字换成白字、蓝色保留）。
  logoDark: "/logo-dark.png",

  repo: "WRD1145/ClassShoutDocs",

  docsDir: "src",

  displayFooter: true,
  copyright: false,

  locales: {
    "/": {
      navbar: zhNavbar,
      sidebar: zhSidebar,
      footer: "Copyright © 2026 WRD1145",
      displayFooter: true,
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },

    "/en/": {
      navbar: enNavbar,
      sidebar: enSidebar,
      footer: "Copyright © 2026 WRD1145",
      displayFooter: true,
      metaLocales: {
        editLink: "Edit this page on GitHub",
      },
    },
  },

  markdown: {
    align: true,
    attrs: true,
    component: true,
    demo: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    sub: true,
    sup: true,
    tasklist: true,
    vPre: true,
    imgSize: true,
    obsidianImgSize: true,

    // 图：三套都开着，写文档时挑顺手的那个用
    echarts: true,
    flowchart: true,
    mermaid: true,

    gfm: true,
    alert: true,
    hint: true,
    tabs: true,
    codeTabs: true,
    highlighter: {
      type: "shiki",
      themes: {
        light: "one-light",
        dark: "one-dark-pro",
      },
      highlightLines: true,
      notationDiff: true,
      notationFocus: true,
      notationHighlight: true,
    },
  },

  plugins: {
    // 图标：导航栏与侧边栏里那些 fa-* 图标靠它解析
    // （主题仍然认 iconAssets，但那是旧写法，会打一条弃用告警）
    icon: {
      assets: "fontawesome-with-brands",
    },

    // 搜索：走 slimsearch（本地索引，不需要任何外部服务）
    slimsearch: true,

    components: {
      components: ["Badge", "VPCard"],
    },

    // 主题这一版不再自带 dynamicTitle（原 Docs 站那份配置里写了，但一直被忽略、
    // 只会打一条「not supported by theme」）。装独立插件才能用，而它不在本项目的
    // 依赖里，所以这里干脆不写 —— 宁可没有这个功能，也不要一个天天报警告的配置。
  },
});
