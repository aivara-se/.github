# Releases

The optional standard for shipping a tinyjs desktop app: a repository that adds the caller below gets a version bump, a tag and a GitHub release with downloadable builds. Nothing enforces it; a repository without the caller is unaffected.

## Why a pull request

The Baseline ruleset refuses a push to the default branch and requires an approving review, and the workflow token cannot approve. So the release is two steps: the workflow prepares a `release/v<version>` pull request, and merging it is the release. That is also the review the version deserves.

## What a run does

1. `Publish` is run by hand with `patch`, `minor` or `major`.
2. It bumps `version` in `tinyjs.json`, pushes `release/v<version>`, opens the pull request and arms auto-merge.
3. Approving the pull request merges it. The push is a commit whose message starts `release: v`, which starts the build.
4. The build tags that commit `v<version>` and creates the release:
   - `macos-arm64` and `macos-x86_64`: `Pereda.app` (the app's title) zipped per architecture.
   - `windows-x86_64`: a zip of the build folder, holding `<name>.exe` and `launcher.exe`. A bare `.exe` does not run without the launcher.
   - `linux-x86_64`: a tar of the build folder.

The tag is created only after every build succeeds, and the release is created from the tag.

## Add it

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

The workflow reads `name` and `title` from `tinyjs.json`. The default branch is assumed to be `main`.

## Secrets

Optional. Without them the macOS app is ad-hoc signed and Gatekeeper blocks it on another Mac; the build still publishes.

- `MACOS_CERTIFICATE`, `MACOS_CERTIFICATE_PASSWORD`, `MACOS_KEYCHAIN_PASSWORD`: a base64 Developer ID `.p12`, its password, and a password for the temporary keychain.
- `MACOS_SIGN_IDENTITY`: the certificate's name, such as `Developer ID Application: Name (TEAMID)`.
- `MACOS_NOTARY_PROFILE`, `MACOS_APPLE_ID`, `MACOS_TEAM_ID`, `MACOS_APP_PASSWORD`: a profile name and the Apple ID credentials `notarytool` stores it with. Signing is required for notarization.

`RELEASE_TOKEN` is a personal access token with `repo` and `workflow` scope. Set it when the repository requires a check on pull requests: a pull request opened with `GITHUB_TOKEN` does not start other workflows, so its check would never appear. It also covers a repository whose workflow token is read-only.
