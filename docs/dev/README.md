# 开发

| 这一页 | 内容 |
|---|---|
| [项目结构](/dev/structure.html) | 各个项目负责什么、分层原则、状态文件放哪 |
| [构建与打包](/dev/build.html) | 依赖、构建命令、打包脚本、发布脚本 |
| [验证](/dev/verify.html) | 回归五阶段、端到端工具、渲染校验 |

## 想快速上手

```powershell
git clone https://github.com/WRD1145/ClassShout.git
cd ClassShout
dotnet build ClassShout.slnx -c Debug
pwsh -File scripts/regress.ps1        # 跑一遍回归，确认环境没问题
```

需要 .NET 10 SDK。只做桌面部分、没装 Android SDK 时用 `ClassShout.DesktopOnly.slnf`。
