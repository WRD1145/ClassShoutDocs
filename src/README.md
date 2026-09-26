---
home: true
icon: home
title: 首页
heroText: ClassShout
tagline: 手机说一句，教室那块屏上就能听见、看见
heroImage: /logo.png
heroImageDark: /logo-dark.png
heroImageStyle:
  maxWidth: "320px"
  margin: "0 auto"
actions:
  - text: 快速开始
    icon: lightbulb
    link: /guide/install.html
    type: primary
  - text: 功能一览
    link: /guide/
  - text: 社区
    link: /community/
  - text: GitHub
    icon: fa-brands fa-github
    link: https://github.com/WRD1145/ClassShout
footer: 本项目的源码按 GPL v3 提供
---

## 这是什么

一套给中小学教室用的**课堂喊话系统**。老师在自己手机上输入文字、按住说话、或者发一张图，
教室里那台电脑就会把它**读出来、放出来、显示出来** —— 学生不用回头看老师在哪，
老师也不必走到讲台前的中控上按按钮。

它由三个部分组成：

| 组件 | 跑在哪 | 干什么 |
|---|---|---|
| **教室端** | 教室里那台常年开着的电脑 | 接收并朗读/播放/显示喊话，提供大屏字幕与屏幕边缘弹窗 |
| **教师端** | 老师的手机（Android）或电脑 | 发文字、发语音、发图片，管理名单与呼叫 |
| **中继服务器** | 任意一台能上公网的机器 | 两端不在同一网络时转发消息；自带管理控制台 |

同一个局域网里，教室端与教师端**不需要服务器**也能用 —— 教师端会自动发现同一网段里的教室。
只有跨网络（老师在家里、教室在学校）时才需要部署中继服务器。

## 目录

<div class="vp-card-container">
  <VPCard
    title="指南"
    desc="打包、部署、跑通第一间教室；文字 / 语音 / 图片怎么发，显示成什么样，怎么定时发"
    logo="/logo-192.png"
    link="/guide/"
  />
  <VPCard
    title="参考"
    desc="通信协议、配置文件与各项默认值、排错时先看哪一眼"
    logo="/logo-192.png"
    link="/reference/"
  />
  <VPCard
    title="开发"
    desc="代码结构与分层、怎么构建与打包、改动之后怎么验证"
    logo="/logo-192.png"
    link="/dev/"
  />
  <VPCard
    title="社区"
    desc="社区规范、提问求助、贡献指南与宣传页"
    logo="/logo-192.png"
    link="/community/"
  />
</div>

## 从哪看起

- 准备部署 → [安装与部署](/guide/install.html)
- 已经装好了，想跑通第一间教室 → [跑通第一个班级](/guide/first-class.html)
- 只是想知道某个功能怎么用 → 左侧「指南」里按主题找
- 遇到问题 → [排错](/reference/troubleshooting.html)
- 要改代码 → [开发](/dev/)

> 这套文档写的是**为什么这么做**，而不只是"点哪里"。
> 一个功能怎么用通常一眼就会，但"为什么默认值是这个""为什么这条消息不补发"
> 才是在教室里出问题时真正需要的。

## 源码与许可

- 主程序：[WRD1145/ClassShout](https://github.com/WRD1145/ClassShout)（GPL v3）
- ClassIsland 联动插件：[WRD1145/ClassShoutCiPlugin](https://github.com/WRD1145/ClassShoutCiPlugin)（GPL v3）
- 本文档站：[WRD1145/ClassShoutDocs](https://github.com/WRD1145/ClassShoutDocs)
