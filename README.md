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
pnpm docs:dev              # 起在 http://localhost:8080
pnpm docs:build            # 产物在 src/.vuepress/dist
pnpm export-pdf            # 导出 PDF 到 pdf/（用 Puppeteer，缺 Chrome 会自动下载）
```

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

## 部署

- `.github/workflows/deploy-docs.yml`：推送到 `main` 时用 pnpm 构建，再通过 rsync 发布到服务器，
  然后提交 IndexNow。目标主机与目录来自 `DEPLOY_WEB_*` 这几条 secrets。
- `.github/workflows/generate-pdf.yml`：发布 Release 时生成 PDF 并附到该 Release 上。

> rsync 用的是 `--delete`：目标目录会被构建产物**完全覆盖**。
> 目标路径由 secret 决定，动它之前先确认那确实是本文档站的目录。
