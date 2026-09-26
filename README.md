# ClassShout 文档站

[ClassShout](https://github.com/WRD1145/ClassShout) 的文档站，部署在 <https://docs.wrd1145.top/>。

技术栈与 [WRD1145/Docs](https://github.com/WRD1145/Docs) 那套站点一致：
[VuePress 2](https://v2.vuepress.vuejs.org/) + [vuepress-theme-hope](https://theme-hope.vuejs.press/)，
搜索用 `@vuepress/plugin-slimsearch`，Markdown 扩展（提示框、选项卡、代码块高亮、
mermaid / echarts / flowchart 图、VPCard 卡片…）也照那套开着；社区栏目（规范、提问、贡献、宣传）
同样来自那套站点。

**这个仓库只放源码**：不提交 `node_modules`、构建缓存与 `src/.vuepress/dist`（见 `.gitignore`）。

## 中英双语

站点分两个语言区，页面目录一一对应：

| 语言 | 页面目录 | 站点路径 | 导航与侧边栏 |
|---|---|---|---|
| 简体中文（默认） | `src/` | `/` | `src/.vuepress/navbar/zh.ts`、`sidebar/zh.ts` |
| English | `src/en/` | `/en/` | `src/.vuepress/navbar/en.ts`、`sidebar/en.ts` |

两套导航与侧边栏逐项对应 —— 中文页右上角切到 English 会落到同一页的英文版。
**改了一边就改另一边**：只改一边的话，切过去看到的是旧内容。

## 本地开发

```bash
corepack enable            # 或者直接用 npx pnpm@9.9.0
pnpm install --frozen-lockfile
pnpm check                 # 内容自检（提示框语法、中英成对、侧边栏与站内链接）
pnpm docs:dev              # 起在 http://localhost:8080
pnpm docs:build            # 产物在 src/.vuepress/dist
pnpm export-pdf            # 导出 PDF 到 pdf/（用 Puppeteer，缺 Chrome 会自动下载）
```

`pnpm check` 与 CI 里那道「内容自检」是同一个脚本（`scripts/check-content.mjs`）。
它守的是**构建不报错、页面上却是坏的**那一类问题，比如提示框写成 `> [!note] 标题`
（标记后面跟了字就不被识别，页面上直接显示字面量），或者只改了中文页忘了改英文页。

## 目录结构

```
src/
├─ .vuepress/
│  ├─ config.ts            站点配置：语言区、head、打包器
│  ├─ theme.ts             主题与插件：hope 配置、Markdown 扩展、搜索
│  ├─ navbar/{zh,en}.ts    两套导航栏
│  ├─ sidebar/{zh,en}.ts   两套侧边栏（分组在这里显式列出）
│  ├─ styles/              主题色与字体
│  └─ public/              站点图标：logo.png、logo-dark.png、favicon.ico
├─ README.md               首页（中文）
├─ guide/                  指南：安装、喊话、课堂、教室端、服务器
├─ reference/              参考：协议、配置文件、排错
├─ dev/                    开发：结构、构建打包、验证
├─ community/              社区：社区规范、提问求助、贡献、宣传
└─ en/                     以上页面的英文版（目录结构完全相同）
```

侧边栏分组是显式列出的（`sidebar/*.ts`）。新增一页时要在那里登记，
否则它不会出现在侧栏里 —— 顺手也能防止出现"写了但没人找得到"的页面。

## 装了哪些 hope 插件

主题自带的那些（搜索都用本地索引、复制代码、图片预览、阅读时间、SEO、sitemap、RTL…）开箱即用；
另外这些"可选插件"也装在 `package.json` 里：

| 插件 | 状态 | 说明 |
|---|---|---|
| `@vuepress/plugin-slimsearch` | 开 | 搜索。本地索引，不需要任何外部服务 |
| `@vuepress/plugin-feed` | 开 | RSS / Atom / JSON，中英各一份：`/rss.xml` 与 `/en/rss.xml` 等 |
| `@vuepress/plugin-pwa` | 开 | 可"添加到主屏幕"，断网也能翻看过的页；`config.ts` 里关了预取 |
| `@vuepress/plugin-notice` | 开 | 首次进站弹一次"本站中英双语"的公告。**每条公告必须给 `path` 或 `match`**，否则它一条都不匹配、页面上什么都不出现 |
| `@vuepress/plugin-watermark` | 开 | 页面浅色水印（`docs.wrd1145.top`），截图外传时能看出出处 |
| `@vuepress/plugin-revealjs` | 开 | Markdown 幻灯片（`markdown.revealjs`） |
| `@vuepress/plugin-catalog` | 开 | 目录页。本站每个目录都有 `README.md`，所以它暂时无事可做 |
| `@vuepress/plugin-copyright` | 开 | 复制正文超过 100 字时自动附上出处与协议 |
| `@vuepress/plugin-docsearch`、`@vuepress/plugin-meilisearch` | 装但不开 | 要 Algolia / Meilisearch 的账号与 Key，没有凭据就开会把搜索框弄坏 |
| `@vuepress/plugin-search`、`@vuepress/plugin-prismjs` | 装但不开 | 与 slimsearch、shiki 功能重叠，同时开只会打架 |
| `@vuepress/shiki-twoslash` | 装但不开 | 只对 TypeScript 代码块有意义，本项目的示例是 C# / PowerShell / bash |

> 公告与水印在 `config.ts` 里**显式 import 插件并手动调用**：主题认得这两个选项，
> 但走主题选项那条路时构建不报错、页面上却什么都不出现。

## 部署

- `.github/workflows/deploy-docs.yml`：推送到 `main` 时用 pnpm 构建，再通过 rsync 发布到服务器，
  然后提交 IndexNow。目标主机与目录来自 `DEPLOY_WEB_*` 这几条 secrets。
- `.github/workflows/generate-pdf.yml`：发布 Release 时生成 PDF 并附到该 Release 上。

> rsync 用的是 `--delete`：目标目录会被构建产物**完全覆盖**。
> 目标路径由 secret 决定，动它之前先确认那确实是本文档站的目录。
