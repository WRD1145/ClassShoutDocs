# 中继服务器

## 什么时候需要它

- 老师与教室在**同一个 Wi-Fi** 下 → 不需要。教师端打开就会自动发现教室端（UDP 广播）。
- 老师在家里 / 在另一个校区，教室在学校 → 需要。两端都接到同一台中继服务器即可。

链路优先级是**局域网 > 服务器**：同一网段下延迟更低，也不会占用公网带宽。
两条都在时会自动走局域网。

## 部署

服务器是自包含的（Windows 与 Linux 都有发布物，**1.10.0 起是压缩包而不是单个文件**）。
最小做法：

```bash
# Linux：解压到一个固定目录
sudo mkdir -p /opt/classshout/app
sudo tar -xzf ClassShout.RelayServer-linux-x64.tar.gz -C /opt/classshout/app

# ⚠ Windows 上打的 tar 不保留 Unix 权限位，解压出来的可执行文件是 0666。
#   不补这一步，systemd 会报 status=203/EXEC（Permission denied）。
sudo chmod +x /opt/classshout/app/ClassShout.RelayServer/ClassShout.RelayServer

cd /opt/classshout
./app/ClassShout.RelayServer/ClassShout.RelayServer --urls "http://0.0.0.0:8080"
```

首次启动会在**当前工作目录**生成 `relay-config.json`，里面是管理员账号与随机口令 ——
控制台登录要用它。**它同时写在启动日志里**，忘了口令就去这两个地方找。

> 想升级时只覆盖 `app/`：状态文件留在外面（见下），程序与数据谁也不动谁。
> 服务端默认按"程序所在目录"找状态文件，所以把程序放进子目录之后，
> 要在 systemd 单元里用环境变量显式指定状态路径（见[状态文件](#状态文件)），
> 否则启动自检会以 `status=78` 拒绝启动，并在日志里写明是哪一项不可用。

> 生产环境建议放在反向代理后面（Caddy / Nginx）并配 HTTPS ——
> 中继上跑的是老师的账号与喊话内容。

## 状态文件

服务器把状态放在程序目录（可用环境变量改到别处；**程序放进子目录时一定要显式指定**）：

| 文件 | 内容 | 敏感级别 |
|---|---|---|
| `relay-config.json` | 管理员账号与口令（**明文**） | 中 |
| `relay-users.json` | 老师账号（口令为 PBKDF2 哈希，含任教科目） | **高** |
| `relay-state.json` | 教室注册记录 | 中 |
| `relay-bindings.json` | 班级授权表（哪位老师可以用哪个班） | 中 |
| `relay-shares.json` | 分享链接 | 中 |
| `relay-schedule.json` | **老师排在服务器上的定时喊话** | **高** |
| `relay-schedule-audio/` | 定时语音的音频（一条几十秒约 1 MB） | **高** |

存放位置都可以用环境变量改到别处：`CLASSSHOUT_CONFIG`、`CLASSSHOUT_USER_STATE`、
`CLASSSHOUT_RELAY_STATE`、`CLASSSHOUT_BINDING_STATE`、`CLASSSHOUT_SHARE_STATE`、
`CLASSSHOUT_SCHEDULE_STATE`、`CLASSSHOUT_SCHEDULE_AUDIO`。
另外 `CLASSSHOUT_SCHEDULE_TICK_MS` 是定时任务的检查间隔（默认 5000 毫秒）。

备份就是把这些文件拷走 —— **`relay-schedule.json` 与 `relay-schedule-audio/` 别忘了**：
漏掉它们的后果特别隐蔽，服务器起来之后一切正常，只有老师排好的那些定时悄无声息地没了，
而老师那边以为它们还在。**注意文件放在哪里就要把权限收紧**：
默认 `relay-config.json` 里是明文口令，同机其它账号不该读到。

## 服务器定时

老师登录之后排的定时任务存在服务器上，到点由服务器自己发出去 ——
老师关掉手机、甚至关机过周末，教室里照样响。详见[定时通知](/guide/schedule.html)。


## 接入流程

1. 教室端 → 设置 → 「跨局域网喊话」→ 填地址 → 连接服务器 → 得到本教室的 UUID 与口令。
2. 老师注册账号（教师端 → 设备页）。
3. 把班级给老师：控制台授权，或者用[分享链接](/guide/share.html)，或者直接抄口令。
4. 老师绑定教室。

## 多班级

同一台服务器可以带很多间教室，互相隔离：每间教室只收到发给自己的喊话。
一位老师可以绑定多间教室，并在教师端里切换。

## 服务器上的账号与权限

- **内置管理员**：账号与口令在 `relay-config.json` 里，默认对所有班级可用
  （不需要逐个授权）。它是唯一能在控制台里改自己口令的账号。
- **老师账号**：自己在教师端注册；能不能用某个班由管理员在控制台上授权。
- 服务端**刻意不区分**"账号不存在"与"口令错误" —— 那样可以被用来枚举账号。
