# Releases

The organisation's release standard, for anything a repository ships: a desktop app, an npm package, a binary for another platform, a bundle of digital assets. The version is proposed in a pull request, merging it is the release, and the release carries the packaged files. Nothing enforces it; a repository without a publish workflow is unaffected.

## The shape

1. `Publish` is run by hand with `patch`, `minor` or `major`.
2. It bumps the version in the file that owns it, pushes `release/v<version>`, opens the release pull request and arms auto-merge.
3. Approving the pull request merges it. The merge commit's message starts `release: v`.
4. The build packages the artifact, one job per target, and uploads the files.
5. When every build succeeds, that commit is tagged `v<version>` and the release is created from the tag.

The tag waits for the builds: a release nobody can rebuild from its tag is a claim, not an artifact.

## Why a pull request

The Baseline ruleset refuses a push to the default branch and requires an approving review, and the workflow token cannot approve. So the release is two steps: the workflow prepares `release/v<version>`, and merging it is the release. That is also the review the version deserves.

## What the repository owns

The five steps are the same for every artifact; only the packaging differs.

- **The version file**, and the bump: `package.json` for an npm library, `tinyjs.json` for a tinyjs app, a manifest or `VERSION` file for anything else.
- **The build**, one job per target: `npm pack` for a library, the platform toolchain for a native or desktop build, an archive of the files for a set of assets.
- **The asset names**: `<name>-<version>-<platform>-<arch>.<extension>`, or one file when there is one target.
- **Publishing past the release page**, when the file on the release is not the deliverable: `npm publish` of the built tarball, a store or CDN upload. It is a step of the release job, after the tag, with its token in a secret.

A repository whose release is a deploy — a service restarted from the branch — has no version to publish and no release to cut. The other kinds share this standard and no workflow yet: a shared one is written when a second repository needs the same packaging.

## Provided: tinyjs desktop apps

`.github/workflows/tinyjs-publish.yml` is the one implementation here, and `pereda` calls it. It runs the five steps, reads `name` and `title` from `tinyjs.json`, and packages:

- `macos-arm64`, `macos-x86_64`: `<title>.app`, zipped per architecture.
- `windows-x86_64`: a zip of the build folder, holding `<name>.exe` and `launcher.exe`. A bare `.exe` does not run without the launcher.
- `linux-x86_64`: a tar of the build folder.

### Add it

`.github/workflows/publish.yml` in the app's repository:

```yaml
name: publish
on:
  workflow_dispatch:
    inputs:
      bump:
        description: Version bump
        type: choice
        options: [patch, minor, major]
        default: patch
  push:
    branches: [main]
permissions:
  contents: write
  pull-requests: write
jobs:
  publish:
    uses: aivara-se/.github/.github/workflows/tinyjs-publish.yml@main
    with:
      bump: ${{ inputs.bump || 'patch' }}
    secrets: inherit
```

The default branch is assumed to be `main`.

### Secrets

Optional: without them the macOS app is ad-hoc signed and Gatekeeper blocks it on another Mac; the build still publishes.

- `MACOS_CERTIFICATE`, `MACOS_CERTIFICATE_PASSWORD`, `MACOS_KEYCHAIN_PASSWORD`: a base64 Developer ID `.p12`, its password, and a password for the temporary keychain.
- `MACOS_SIGN_IDENTITY`: the certificate's name, such as `Developer ID Application: Name (TEAMID)`.
- `MACOS_NOTARY_PROFILE`, `MACOS_APPLE_ID`, `MACOS_TEAM_ID`, `MACOS_APP_PASSWORD`: a profile name and the Apple ID credentials `notarytool` stores it with. Signing is required for notarization.

`RELEASE_TOKEN` is a personal access token with `repo` and `workflow` scope. Set it when the repository requires a check on pull requests: a pull request opened with `GITHUB_TOKEN` does not start other workflows, so its check would never appear. It also covers a repository whose workflow token is read-only.
