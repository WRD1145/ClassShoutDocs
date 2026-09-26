# Building and Packaging

## Dependencies

- **.NET 10 SDK** (the repository's `global.json` pins the version and the rollForward policy)
- The Android side needs the Android SDK (`AndroidApiLevel` lives in `Directory.Build.props`)
- The version number is written in `<Version>` in `Directory.Build.props`: change it in one place and every project follows

## Building

```powershell
# Everything (Android included)
dotnet build ClassShout.slnx -c Release

# Desktop only: use this one when the Android SDK is not installed
dotnet build ClassShout.DesktopOnly.slnf -c Release
```

The classroom app is dual-targeted (`net10.0-windows;net10.0`), so when you build only one side you have to name the framework explicitly:

```powershell
dotnet build src/ClassShout.Classroom/ClassShout.Classroom.csproj -f net10.0-windows
```

## Packaging

```powershell
pwsh -File scripts/pack.ps1 -IncludeLinuxServer
```

The output goes to `dist/release/`, laid out under their "final attachment names", and `SHA256SUMS.txt` is generated:

| Asset | Notes |
|---|---|
| `ClassShout.Classroom.exe` | classroom app (Windows, self-contained) |
| `ClassShout.Classroom-linux-x64` | classroom app (Linux) |
| `ClassShout.Teacher.Desktop.exe` | teacher app desktop head |
| `classshout-teacher-<version>-universal.apk` | teacher app Android (arm64 + x64) |
| `ClassShout.RelayServer-win-x64.exe` / `-linux-x64` | relay server |
| `SHA256SUMS.txt` | checksum manifest (**LF line endings, no BOM** — it has to work on Linux) |

When an asset is missing, the script fails outright instead of quietly producing a release that is short of something.

## Releasing

```powershell
pwsh -File scripts/release.ps1 -Version v1.7.0 -NotesFile notes.md -Proxy http://127.0.0.1:7890
```

It does four things: package → push the branch and the tag → create the release and upload the assets → **check one by one** that the count and the names of the attachments match.

Getting an upload of several hundred megabytes interrupted is routine, so it is **resumable**:

- If the tag and the release already exist, it reuses them (it does not simply fail because "the tag already exists");
- An attachment with the same name and the same size is skipped; one whose size does not match is deleted and uploaded again;
- In the end what counts is "what is actually on the release", not "what I uploaded".

The house style for release notes: three sections — **Bug fixes / New features / Reverts** — and each entry looks like "description · commit · related proposal".

## The ClassIsland plugin is a separate repository

[WRD1145/ClassShoutCiPlugin](https://github.com/WRD1145/ClassShoutCiPlugin) is packaged and released
separately (a `.cipx` attachment). It is **not a release asset of the main program**: whether to install it is up to each school,
and its version cadence has nothing to do with the main program. It has its own `scripts/package.ps1` and `scripts/release.ps1`.

The plugin marketplace Tag must be exactly `a.b.c.d` (for example `1.0.2.0`); a Tag with a `v` prefix, or an
incomplete one, is ignored outright by the index generator, and you get no feedback at all at publish time — so the release script puts this check first, ahead of everything else.
