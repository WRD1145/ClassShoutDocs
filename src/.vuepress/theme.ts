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

    // 幻灯片：用 --- 分页就能把一页写成可翻页的演示（@vuepress/plugin-revealjs）
    revealjs: true,
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

    // 订阅源：RSS / Atom / JSON 三种都出。中文那份在 /rss.xml、/atom.xml、/feed.json，
    // 英文那份在 /en/ 下面同名 —— 中英各订各的，不必在一份订阅里混着看两种语言。
    // 只收正文三块（指南 / 参考 / 开发）：社区那一栏是群规，跟"文档更新"不是一回事。
    feed: {
      rss: true,
      atom: true,
      json: true,
      filter: (page) =>
        ["/guide/", "/reference/", "/dev/"].some((prefix) => page.path.startsWith(prefix)),
      locales: {
        "/": {
          rss: true,
          atom: true,
          json: true,
          filter: (page) =>
            ["/guide/", "/reference/", "/dev/"].some((prefix) => page.path.startsWith(prefix)),
        },
        "/en/": {
          rss: true,
          atom: true,
          json: true,
          filter: (page) =>
            ["/en/guide/", "/en/reference/", "/en/dev/"].some((prefix) =>
              page.path.startsWith(prefix),
            ),
        },
      },
    },

    // PWA：可以"添加到主屏幕"，装过之后断网也能翻已经看过的页。
    // update 取 hint —— 文档站改了就该让读者看见新内容，而不是让他拿旧缓存翻半天。
    pwa: {
      favicon: "/favicon.ico",
      themeColor: "#00b2ee",
      showInstall: true,
      cacheHTML: true,
      cacheImage: true,
      update: "hint",
      manifest: {
        name: "ClassShout 文档 / Docs",
        short_name: "ClassShout",
        description: "课堂喊话：手机说一句，教室那块屏上就能听见、看见",
        lang: "zh-CN",
        theme_color: "#00b2ee",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    },

    // 目录页：把全站页面按目录结构列成 /catalog/ 一页，页面多了以后按这一页找比翻侧栏快
    catalog: {
      index: true,
    },

    // 版权：复制正文超过 100 字时自动附上出处与协议
    copyright: {
      author: "WRD1145",
      license: "CC BY-NC-SA 4.0",
      canonical: "https://docs.wrd1145.top",
      global: true,
    },

    // 公告与水印不在这里配：主题认得这两个选项，但走这条路时页面上什么都不出现，
    // 所以改成在 config.ts 里显式 import 插件并手动调用（见那里的注释）。

    // 下面这些"可选插件"也一并装上了（见 package.json），但故意不在这里开：
    //   · docsearch / meilisearch：要 Algolia / Meilisearch 的账号与 Key，
    //     没有凭据就开，搜索框会直接坏掉 —— 现在用的是本地索引的 slimsearch；
    //   · search / prismjs：功能与 slimsearch、shiki 重叠，同时开只会打架；
    //   · shiki-twoslash：给 TypeScript 代码块加类型提示，本项目的示例是
    //     C# / PowerShell / bash，用不上。
    // 需要的时候把对应那一行加上就行，依赖已经在了。
  },
});
