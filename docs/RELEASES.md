# Releases

The organisation's optional release standard, for anything a repository ships: a desktop app, a command-line binary, an npm package, a bundle of assets. The version is a number in a file, and the push that carries a new number is the release. Nothing enforces it; a repository without a publish workflow is unaffected.

## The shape

1. A push to the default branch starts `Publish`. It reads the version from the file that owns it: `package.json`, `tinyjs.json`, `VERSION`.
2. If `v<version>` is already tagged and its release exists, the run stops. A push that did not move the version publishes nothing.
3. The build packages the artifact, one job per target: from the tag when the tag exists, otherwise from the pushed commit.
4. When every build succeeds, the pushed commit is tagged `v<version>` if the tag is missing.
5. The release is created from the tag with the files attached, if it is missing.
6. A repository that ships to a registry publishes there last, and only when the registry does not already have the version.

The tag waits for the builds: a release nobody can rebuild from its tag is a claim, not an artifact. Every step checks before it writes, so a rerun or a later push over the same version finishes the missing steps and repeats none.

The workflow has one trigger, the push. It cannot be dispatched by hand, it creates no commit and no pull request, and it changes nothing in the tree.

## Why the version is the trigger

The Baseline ruleset refuses a push to the default branch and requires an approving review, and a workflow token cannot approve. A workflow that bumped the version and opened its own release pull request would ask for a second review of a number the change's own review already carried. So the version is raised in the change that earns it, and merging that change is the release.

## What the repository owns

The steps are the same for every artifact; only the packaging differs.

- **The version file**: `package.json` for an npm library, `tinyjs.json` for a tinyjs app, `VERSION` for a binary. Three numbers, `major.minor.patch`.
- **The build and its targets**: `npm pack` for a library, the platform toolchain for a desktop app, `GOOS` and `GOARCH` for a Go binary, an archive of the files for a set of assets.
- **The asset names**: `<name>-<version>-<platform>-<arch>.<extension>`, or one file when there is one target.
- **The registry**, when the artifact is installed by name rather than downloaded from the release page. `npm view <package>@<version> version` answers whether the version is already there; `npm publish` puts it there, with its token in a secret and the `--registry` of npmjs or GitHub Packages. The step is skipped, not failed, when the version is found. A Go module needs no such step: its tag is what the module proxy reads.

A repository that deploys from the branch cuts a release only if it also builds a binary to attach; the deployment itself is outside this standard.

## Provided: tinyjs desktop apps

`.github/workflows/tinyjs-publish.yml` is the implementation `pereda` calls. It reads `name` and `title` from `tinyjs.json` and packages:

- `macos-arm64`, `macos-x86_64`: `<title>.app`, zipped per architecture.
- `windows-x86_64`: a zip of the build folder, holding `<name>.exe` and `launcher.exe`. A bare `.exe` does not run without the launcher.
- `linux-x86_64`: a tar of the build folder.

### Add it

`.github/workflows/publish.yml` in the app's repository:

```yaml
name: publish
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  publish:
    uses: aivara-se/.github/.github/workflows/tinyjs-publish.yml@main
    secrets: inherit
```

The default branch is assumed to be `main`.

### Secrets

Optional, except where noted: without the signing and notary values the macOS app is ad-hoc signed and Gatekeeper blocks it on another Mac; the build still publishes.

- `MACOS_CERTIFICATE`, `MACOS_CERTIFICATE_PASSWORD`, `MACOS_KEYCHAIN_PASSWORD`: a base64 Developer ID `.p12`, its password, and a password for the temporary keychain.
- `MACOS_SIGN_IDENTITY`: the certificate's name, such as `Developer ID Application: Name (TEAMID)`.
- `MACOS_NOTARY_PROFILE`, `MACOS_APPLE_ID`, `MACOS_TEAM_ID`, `MACOS_APP_PASSWORD`: a profile name and the Apple ID credentials `notarytool` stores it with. Signing is required for notarization.
- `RELEASE_TOKEN`: a personal access token with `contents: write`. Set it when the repository's workflow token is read-only, so the tag and the release can be written.

## Provided: Go binaries

`.github/workflows/go-publish.yml` is the implementation `dispatch` calls. It reads `VERSION`, cross-compiles the caller's main package and attaches `<binary>-<version>-<os>-<arch>`, with `.exe` on Windows.

### Add it

`.github/workflows/publish.yml` in the repository:

```yaml
name: publish
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  publish:
    uses: aivara-se/.github/.github/workflows/go-publish.yml@main
    with:
      package: ./cmd/dispatch
      binary: dispatch
    secrets: inherit
```

`targets` takes a JSON array of `os/arch` pairs; it defaults to `["linux/amd64","linux/arm64"]`.
