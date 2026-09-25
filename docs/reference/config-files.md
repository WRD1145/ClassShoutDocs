# 配置文件一览

所有本机配置都在用户数据目录里，不在程序旁边 ——
程序可能被装在只读位置，而且同一台机器上不同账户应当有各自独立的身份。

- Windows：`%LOCALAPPDATA%\ClassShout\`
- Linux：`~/.local/share/ClassShout/`（或 `$XDG_DATA_HOME`）
- 可用环境变量 `CLASSSHOUT_DATA_DIR` 指定到别处（便携安装、自检都靠它）

## 教室端

| 文件 | 内容 | 含凭据 |
|---|---|---|
| `classroom.json` | 教室名、UUID、口令、服务器地址 | **是**（口令） |
| `classroom-notification.json` | 弹窗设置与喊话默认展示参数 | 否 |
| `classroom-speech.json` | 朗读设置（引擎、音色、音量、语速） | 否 |
| `classroom-stt.json` | 语音转文字的接口地址与**密钥** | **是**（密钥） |
| `settings-lock.json` | PIN 的派生值与盐、哪几项受保护 | **是**（派生值，不含明文） |
| `appearance.json` | 主题色（两端共用同一份格式） | 否 |

## 教师端

| 文件 | 内容 | 含凭据 |
|---|---|---|
| `teacher.json` | 服务器地址、登录令牌、已保存的教室（**含口令**）、任教科目（默认 + 按班级） | **是** |
| `teacher-display.json` | 上次用的展示参数 | 否 |
| `teacher-schedule.json` | 本机定时喊话（待发 + 最近处理完的） | 否 |
| `schedule-audio/` | 本机定时语音的 WAV（发出去或取消之后就删掉） | 否 |
| `teacher-rosters.json` | 学生名单（可能有好几份） | 否 |
| `teacher-calls.json` | 呼叫模板（组件拼装出来的那几套） | 否 |
| `teacher-phrases.json` | 常用语（文字页那排一键填入的短语） | 否 |
| `shout-history.json` | 最近 100 条喊话内容 | 否 |
| `appearance.json` | 主题色 | 否 |
| `developer.json` | 开发者模式开关（连点版本号 10 次解锁） | 否 |

> 任教科目存在 `teacher.json` 里只是一份**缓存**（局域网直连那条路不经过服务器，
> 名字得由教师端自己贴），权威的那份在服务器账号上。

> `teacher.json` 里有明文口令，`classroom-stt.json` 里有 API 密钥。
> 这两个文件是"这台设备被拿走就等于这些凭据也一起被拿走"的那一类 ——
> 这是有意的取舍（见[跑通第一个班级](/guide/first-class.html)里那段说明），
> 但要把它当凭据对待：不要把整个目录打进备份镜像再公开分享。

## 中继服务器

见[中继服务器](/guide/relay.html)里的状态文件表。
