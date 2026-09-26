import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
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

  theme,
});
