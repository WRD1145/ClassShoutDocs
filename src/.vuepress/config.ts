import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";

// 这两个插件要在这里手动装上：主题只"认得"这两个选项，自己并不 import 它们
// （notice 是 import 了的，但只有走主题选项那条路时不生效 —— 见下面注释）。
import { noticePlugin } from "@vuepress/plugin-notice";
import { watermarkPlugin } from "@vuepress/plugin-watermark";

import theme from "./theme.js";

/**
 * 站点配置。
 *
 * 语言区两套：根路径是中文（默认），`/en/` 是英文。两边的页面目录同构
 * （src/guide 对 src/en/guide，以此类推），所以「切语言」等价于把路径前缀换掉。
 */
export default defineUserConfig({
  // 部署在自有域名下，直接落在站点根目录
  base: "/",

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["link", { rel: "apple-touch-icon", href: "/logo-192.png" }],
    ["meta", { name: "theme-color", content: "#00b2ee" }],
  ],

  locales: {
    "/": {
      lang: "zh-CN",
      title: "ClassShout 文档",
      description: "课堂喊话：手机说一句，教室那块屏上就能听见、看见",
    },
    "/en/": {
      lang: "en-US",
      title: "ClassShout Docs",
      description:
        "ClassShout — say a sentence on your phone, and the classroom screen shows and speaks it",
    },
  },

  bundler: viteBundler(),

  // PWA 装好之后由 service worker 负责缓存，页面上再预取一堆别的页面只会白费流量 ——
  // 这也是 @vuepress/plugin-pwa 在构建时提醒的那一条。
  shouldPrefetch: false,

  plugins: [
    // 公告：首次进站弹一次，说明"这站有中英两版"。
    // 走主题的 plugins.notice 那一份配置时构建不报错、页面上却什么都不出现，
    // 所以改成在这里显式调用 —— 能看见才算装上了。
    noticePlugin({
      config: [
        {
          title: "中英双语 · Bilingual",
          // 每条公告都必须给 path（前缀匹配）或 match（正则），否则它一条都不匹配、
          // 页面上什么都不会出现 —— 插件不报错，只是静静地不显示。
          path: "/",
          key: "bilingual-2026",
          showOnce: true,
          contentType: "html",
          content:
            "本站有中文与 English 两个语言区：右上角「简体中文 / English」切换。" +
            "<br />This site ships in Chinese and English — switch with the language menu in the top-right corner.",
        },
      ],
    }),

    // 水印：截图外传时至少能看出是从哪一页来的。画得克制（小字、浅灰）。
    watermarkPlugin({
      enabled: true,
      watermarkOptions: {
        content: "docs.wrd1145.top",
        width: 180,
        height: 120,
        fontSize: 14,
        fontColor: "rgba(130, 130, 130, 0.2)",
        rotate: 20,
      },
    }),
  ],

  theme,
});
