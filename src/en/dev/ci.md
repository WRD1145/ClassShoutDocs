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

The 1.21.0 pipeline used a .NET Android debug key generated on the Runner. Sideloading works, but different builds may use different keys, preventing in-place upgrades.

The development version reuses one persistent keystore across Android ABIs and releases. Android supports a freely generated self-signed certificate; a paid Windows code-signing certificate is unnecessary. Debug signing is suitable for tests, but a common password does not imply an identical private key. Do not regenerate it on every build or use a publicly shared test private key as the release identity. Updates require the same signing identity; see the [official Android signing guide](https://developer.android.com/studio/publish/app-signing).

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

The following signing flow belongs to this development version and was not used for the 1.21.0 release. Official publishing still needs GITHUB_TOKEN with contents: write. The four Android Actions Secrets below are required; the two Windows Secrets are optional:

| Secret | Value |
|---|---|
| WINDOWS_SIGNING_PFX_BASE64 | Optional: Base64 Windows code-signing PFX including private key and chain |
| WINDOWS_SIGNING_PASSWORD | Optional: PFX password; configure both Windows entries or neither |
| ANDROID_SIGNING_KEYSTORE_BASE64 | Base64 persistent Android keystore |
| ANDROID_SIGNING_KEY_ALIAS | Signing key alias |
| ANDROID_SIGNING_STORE_PASSWORD | Keystore password |
| ANDROID_SIGNING_KEY_PASSWORD | Alias private-key password |

A persistent release keystore is not configured yet; actual publishing still requires the four Android Secrets. Use JDK keytool to generate an RSA self-signed keystore once, back it up, and save that same file's Base64, alias and passwords in Secrets. Do not regenerate it at the start of each CI run. Never commit private keys or passwords to source, notes or logs. Optional PFX signing requires an exportable private key; hardware/cloud certificates need their signing provider integrated separately.

The preparation step reads ANDROID_SIGNING_KEYSTORE_BASE64, decodes it into a restricted Runner temporary directory, and exports ANDROID_SIGNING_KEYSTORE_PATH through GITHUB_ENV. The packing step uses the same alias and password environment-variable names as the Secrets, without alternate shortened names. MSBuild receives AndroidSigningStorePass=env:ANDROID_SIGNING_STORE_PASSWORD and AndroidSigningKeyPass=env:ANDROID_SIGNING_KEY_PASSWORD, referencing variable names rather than literal passwords.

Local packaging uses the same variables. Assuming the signing files are stored in the directory below, read the local files in PowerShell before invoking the pack command; do not replace passwords with command-line literals:

```powershell
$signingDir = 'D:\安全备份\ClassShout'
$env:ANDROID_SIGNING_KEYSTORE_PATH = Join-Path $signingDir 'classshout-release.keystore'
$env:ANDROID_SIGNING_KEY_ALIAS = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_KEY_ALIAS.txt') -Raw).Trim()
$env:ANDROID_SIGNING_STORE_PASSWORD = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_STORE_PASSWORD.txt') -Raw).Trim()
$env:ANDROID_SIGNING_KEY_PASSWORD = (Get-Content (Join-Path $signingDir 'ANDROID_SIGNING_KEY_PASSWORD.txt') -Raw).Trim()
pwsh -NoProfile -File scripts/pack.ps1 -Configuration Release -IncludeLinuxServer -Installer -RequireSigning
```

## Unified signing order

Every Android ABI uses the same persistent keystore, and apksigner verifies its certificate digest. Freely generated self-signed release keys are supported; Android Debug certificates are not accepted as official release identities.

Without a Windows certificate, desktop packaging proceeds with an explicit notice that Authenticode signing is disabled; Android publishing is unaffected. If configured, Windows portable files, installer payloads and installers use the same certificate. Owned ClassShout exe/dll files are signed before archiving and verified for identity, trust and SHA-256 timestamps; third-party runtimes are not re-signed.

ZIPs/installers and SHA256SUMS are finalized after signing. Linux archives retain checksum verification; SHA-256 checksums are not publisher digital signatures. Experimental macOS artifacts remain unsigned and outside the official release assets.

Keys are decoded only into a restricted Runner temporary directory. Passwords use environment variables and Android env: password sources instead of command arguments. Temporary Windows certificate imports are cleaned after packing; an always step removes private-key files.

## Missing material and validation

Official packing uses scripts/pack.ps1 -RequireSigning, requiring a persistent Android key rather than a Windows certificate. With -SkipAndroid, Android material is unnecessary. Missing Android entries or a partially configured optional Windows pair fail before packaging. An entirely unconfigured manual run may produce development assets without persistent signing only when both dry_run and allow_unsigned_dry_run are selected; it never creates a release.

Moving from previous temporary Android signing to a fixed key generally prevents in-place installation. Incrementing versionCode cannot resolve certificate mismatch. If the old private key cannot be recovered, retain migratable settings, uninstall/reinstall and sign in again; a new keystore cannot restore the old identity. Back up and reuse the same keystore thereafter.

Syntax, YAML, Android-only configuration, missing-material rejection, explicit development dry-runs and cleanup boundaries can be checked locally. Persistent-keystore publishing requires Secrets to be configured; trusted Windows signing is validated only if the optional certificate is enabled.
