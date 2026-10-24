# Automatic releases

The repository has a GitHub Actions pipeline (`.github/workflows/release.yml`, named 自动发布):
after something is merged into `main`, it packs the apps, creates a release and uploads the assets.
The manual path (`scripts/release.ps1`) is untouched — CI calls the same `scripts/pack.ps1`.

## When it runs

Two ways:

- **A push to `main`**, i.e. merging a PR. This is the everyday one.
- **A manual run** (the Actions page's "Run workflow", `workflow_dispatch`), with two inputs:
  - `dry_run`, default **true**: pack only, create no release;
  - `version`, optional: when empty, the `<Version>` in `Directory.Build.props` is used.

Only one run at a time: two merges close together queue up instead of building releases in parallel.

## The version number is a human decision

The pipeline reads `<Version>` from `Directory.Build.props` and builds the tag `v<version>`.
If that tag **already has a release**, it does nothing at all — the pack steps are skipped outright.

The version is **never** bumped automatically, and that is deliberate: "what are we shipping this
time" is a human decision, not a function of how many commits landed.
The price is that forgetting to bump the version means nothing gets released — which is the
correct outcome, not a failure.

## The four jobs

```
version (read the version, find the notes, has this tag shipped already)
  ├─ pack (Windows / Linux / Android) → release (verify SHA256SUMS, create the release, upload)
  └─ pack-macos (parallel; teacher app only, failure does not block the release, not attached)
```

- `version` — decides only, produces nothing; every later job depends on its outputs.
- `pack` — reuses `scripts/pack.ps1`; CI does not keep a second copy of the release parameters.
  Once the two diverge you get "it releases locally, but CI ships something missing".
- `pack-macos` — see the platform coverage below. It carries `continue-on-error`: its failure
  must not block the other platforms' release.
- `release` — `sha256sum -c SHA256SUMS.txt` first, then asserts every expected asset is present
  (one missing asset means shipping a half-finished release), then `gh release create`.

## The assets are the same as a manual release

Still the same seven, under the same names (attachment names are frozen once released: the README
and past releases refer to them):

| Asset | What it is |
|---|---|
| `ClassShout.Classroom-win-x64.zip` | classroom app (Windows) |
| `ClassShout.Classroom-linux-x64.tar.gz` | classroom app (Linux) |
| `ClassShout.Teacher-win-x64.zip` | teacher app (desktop) |
| `ClassShout.RelayServer-win-x64.zip` | relay server (Windows) |
| `ClassShout.RelayServer-linux-x64.tar.gz` | relay server (Linux) |
| `classshout-teacher-<version>-universal.apk` | teacher app (Android, arm64 + x64) |
| `SHA256SUMS.txt` | checksum manifest (LF line endings, no BOM — it has to work on Linux) |

The workflow uploads all of `dist/release`, so any other file sitting in that folder (the icons
that go out with a release, for instance) rides along into the release.

## Release notes come from the repository

The notes for a release are looked up in this order:

1. `.github/releases/notes-v<version>.md` (**committed** to the repository, so CI can read it);
2. `artifacts/notes-v<version>.md` (the one a local `release.ps1` points at with `-NotesFile`);
3. neither, and a short placeholder body is used.

The second one is effectively useless in CI: `artifacts/` is covered by `.gitignore`, so the
runner cannot see it at all. So **if you want a real body on an automatic release, put it in
`.github/releases/`**. The house style is the same as any other release: Bug fixes / New features /
Reverts.

## dry_run: validating the pipeline

`dry_run` defaults to **true** on a manual run: it packs as usual and uploads the result as a
workflow artifact (`release-assets`), but **creates no release**. Use it to check "can this machine
actually build the thing".

It also differs in one deliberate way: with `dry_run` it runs even when this version has already
been released — a manual run is there to validate the pipeline, and should not do nothing just
because "the tag already exists".

## Platform coverage, honestly

| Platform | How far this pipeline gets |
|---|---|
| Windows / Linux / Android | fully produced and published |
| macOS | only the teacher desktop head is built (`osx-arm64`, unsigned, no `.app`); uploaded as the Actions artifact `macos-unsigned` for anyone with a Mac to try, and **not attached to the release**. The classroom app's playback and read-aloud on macOS have no implementation yet (they use Linux's `aplay` / `spd-say`) |
| iOS | there is **no** iOS head project. Adding one means an `Avalonia.iOS` head plus an Apple developer certificate and provisioning profile — that is porting work, not CI configuration |

## Android signing

There is no keystore on a runner, so the APK is signed with .NET Android's **debug key**: it can be
sideloaded with `adb install`, but it is **not acceptable for an app store**.
Shipping to a store means signing it yourself — this pipeline does not do that.

## Pitfalls

These three are all "works on my machine, fails on a clean runner", and they are why `pack.ps1`
looks the way it does today:

1. **A framework-dependent publish does not download the runtime packs.** `pack.ps1` assembles
   `runtime\` from those packs, and only a self-contained publish pulls them. A local machine has
   them cached, so CI failed at "runtime pack not found" on its first run. The script now restores
   the project once with `-p:SelfContained=true` before assembling the runtime.
2. **The `tar` on a runner is Git's GNU tar, not Windows' bsdtar.** It used to run
   `tar -a -c -f <file>.zip` (picking zip by extension); GNU tar does not understand that
   combination and **produced nothing at all**. Windows zips now use `Compress-Archive`.
3. **`tar -czf` can produce a truncated archive and still return 0.** A 106 MB server directory came
   out as a 0.4 MB archive with exit code 0. `.tar.gz` is now generated entirely in process
   (`System.Formats.Tar` + `GZipStream`), with no external tar involved, plus an assertion: an
   archive under 5% of its source directory fails the pack.

## What has to be configured

Only the built-in `GITHUB_TOKEN`, with `contents: write` (creating tags, creating the release and
uploading assets all need it). No other secret is configured.
So changing CI behaviour means editing the workflow file, not a pile of secrets in the repository
settings.
