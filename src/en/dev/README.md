# Development

| This page | What it covers |
|---|---|
| [Project structure](/en/dev/structure.html) | What each project is responsible for, the layering principles, and where state files live |
| [Build and packaging](/en/dev/build.html) | Dependencies, build commands, packaging scripts, release scripts |
| [Verification](/en/dev/verify.html) | The five regression stages, end-to-end tooling, render validation |

## Want to get started quickly

```powershell
git clone https://github.com/WRD1145/ClassShout.git
cd ClassShout
dotnet build ClassShout.slnx -c Debug
pwsh -File scripts/regress.ps1        # 跑一遍回归，确认环境没问题
```

You need the .NET 10 SDK. If you are working on the desktop part only and do not have the Android SDK installed, use `ClassShout.DesktopOnly.slnf`.
