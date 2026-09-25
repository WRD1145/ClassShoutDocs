# ClassShout 文档站

[ClassShout](https://github.com/WRD1145/ClassShout) 的文档站，基于 [VuePress 2](https://v2.vuepress.vuejs.org/)。

**这个仓库只放源码**：不提交 `node_modules`、构建缓存与 `docs/.vuepress/dist`（见 `.gitignore`）。
要发布到某个地址时，由使用它的人在自己那边构建。

## 本地预览

```bash
npm install
npm run dev
```

默认起在 `http://localhost:8080`，改文件会自动刷新。

## 构建

```bash
npm run build
```

产物在 `docs/.vuepress/dist`，是一份纯静态站点，扔到任何能托管静态文件的地方都能跑。

## 目录结构

```
docs/
├─ .vuepress/config.js     站点配置：导航栏与侧边栏分组都在这
├─ README.md               首页
├─ guide/                  指南：安装、喊话、课堂、教室端、服务器
├─ reference/              参考：协议、配置文件、排错
└─ dev/                    开发：结构、构建打包、验证
```

侧边栏按目录分组，每一个分组在 `docs/.vuepress/config.js` 里显式列出。
新增一页时要在那里登记，否则它不会出现在侧栏里 —— 顺手也能防止出现"写了但没人找得到"的页面。
