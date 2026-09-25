import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'ClassShout',
  description: '课堂喊话：手机说一句，教室那块屏上就能听见、看见',

  // 文档站只放源码，不在这里配部署信息 —— 要不要发到某个地址由使用它的人决定。
  base: '/',

  // VuePress 2 的正式候选版不再捆绑打包器，必须自己选一个。
  // 选 vite：构建快，默认配置就能跑，没有额外要调的 loader。
  bundler: viteBundler(),

  theme: defaultTheme({
    logo: null,

    navbar: [
      { text: '指南', link: '/guide/' },
      { text: '参考', link: '/reference/' },
      { text: '开发', link: '/dev/' },
      { text: 'ClassShout', link: 'https://github.com/WRD1145/ClassShout' },
    ],

    // 侧边栏按目录分组，每组可折叠。
    // 分组而不是一条长列表：这套文档的读者有三种（准备部署的运维、日常使用的老师、
    // 改代码的人），他们要找的东西完全不同，混在一列里谁都得多扫几眼。
    sidebar: {
      '/guide/': [
        {
          text: '起步',
          collapsible: true,
          children: [
            '/guide/README.md',
            '/guide/install.md',
            '/guide/first-class.md',
          ],
        },
        {
          text: '喊话',
          collapsible: true,
          children: [
            '/guide/shout.md',
            '/guide/display.md',
            '/guide/image.md',
            '/guide/multi-class.md',
            '/guide/schedule.md',
          ],
        },
        {
          text: '课堂',
          collapsible: true,
          children: [
            '/guide/roster.md',
            '/guide/call.md',
            '/guide/transcript.md',
          ],
        },
        {
          text: '教室端',
          collapsible: true,
          children: [
            '/guide/notification.md',
            '/guide/classisland.md',
            '/guide/classroom-settings.md',
            '/guide/pin.md',
          ],
        },
        {
          text: '服务器',
          collapsible: true,
          children: [
            '/guide/relay.md',
            '/guide/console.md',
            '/guide/share.md',
          ],
        },
      ],

      '/reference/': [
        {
          text: '参考',
          collapsible: false,
          children: [
            '/reference/README.md',
            '/reference/protocol.md',
            '/reference/config-files.md',
            '/reference/troubleshooting.md',
          ],
        },
      ],

      '/dev/': [
        {
          text: '开发',
          collapsible: false,
          children: [
            '/dev/README.md',
            '/dev/structure.md',
            '/dev/build.md',
            '/dev/verify.md',
          ],
        },
      ],
    },

    sidebarDepth: 2,
    contributors: false,
    lastUpdated: false,
    editLink: false,

    // 每页底部的翻页链接：文档是按顺序读的，这个比自己在侧栏里找下一页省事
    prev: true,
    next: true,
  }),
})
