---
home: true
heroText: ClassShout
tagline: 手机说一句，教室那块屏上就能听见、看见
actions:
  - text: 快速开始
    link: /guide/install.html
    type: primary
  - text: 功能一览
    link: /guide/
    type: secondary
features:
  - title: 教室端 + 教师端 + 中继服务器
    details: 教室里那台电脑负责出声出画面，老师手机上只管发；跨网络时接一台中继服务器即可。
  - title: 文字、语音、图片
    details: 文字走教室的 TTS 朗读，语音实时流过去，图片可以连同一句说明一起发。
  - title: 每条喊话自己决定怎么显示
    details: 窗口还是弹窗、字号多大、停多久、要不要朗读 —— 跟着每一条走，不搞一刀切。
  - title: 一次发给多个班
    details: 教好几个班的老师可以勾选几个班一起发，不必一间一间来。
  - title: 学生名单与快速呼叫
    details: 导入名单，用组件拼出要喊的话，选好学生一次叫出去。
  - title: 与 ClassIsland 联动
    details: 教室那台电脑上挂着 ClassIsland 时，喊话可以走它的提醒通道，观感统一。
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
