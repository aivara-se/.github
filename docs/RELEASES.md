# Releases

The organisation's optional release standard, for anything a repository ships: a desktop app, a command-line binary, an npm package, a bundle of assets. The version is a number in a file, and the push that carries a new number is the release. Nothing enforces it; a repository without a publish workflow is unaffected.

## The shape

1. A push to the default branch starts the repository's `publish` workflow, which reads the version from the file that owns it: `package.json`, `tinyjs.json`, `VERSION`.
2. If `v<version>` is already tagged and its release exists, the run stops. A push that did not move the version publishes nothing.
3. The build packages the artifact, one job per target: from the tag when the tag exists, otherwise from the pushed commit.
4. When every build succeeds, the pushed commit is tagged `v<version>` if the tag is missing.
5. The release is created from the tag with the files attached, if it is missing.
6. A repository that ships to a registry publishes there last, and only when the registry does not already have the version.

The tag waits for the builds: a release nobody can rebuild from its tag is a claim, not an artifact.

## The rules the run keeps

- **One trigger, the push.** No `workflow_dispatch`: a person cannot publish by hand.
- **Nothing else is written.** The run creates a tag, a release and a registry entry; it makes no commit and no pull request.
- **Every step checks before it writes.** A version already tagged and released builds nothing. The next push finishes a run that failed before the release; a step after it is re-run from the Actions tab, which is not `workflow_dispatch`.
- **The tag names the tree that was built.** A retry builds the tag when it exists, so one release cannot mix two commits.
- **One run at a time.** `concurrency` with `cancel-in-progress: false` keeps two pushes from publishing one version twice.

## Why the version is the trigger

The Baseline ruleset refuses a push to the default branch and requires an approving review, and a workflow token cannot approve. A workflow that bumped the version and opened its own release pull request would ask for a second review of a number the change's own review already carried. So the version is raised in the change that earns it, and merging that change is the release.

## The workflow is the repository's own

The steps are the standard; the YAML is not shared. Each repository carries `.github/workflows/publish.yml` in the shape its artifact needs, because a tinyjs build, a `go build` and an `npm pack` share no runner, no command and no asset. What they share is the order above and the rules that keep it. `pereda`, a tinyjs app on three platforms, and `dispatch`, a Go binary with one job per architecture, are the two worked examples; each names its own secrets in its own file.

## What the repository owns

- **The version file**: `package.json` for an npm library, `tinyjs.json` for a tinyjs app, `VERSION` for a binary. Three numbers, `major.minor.patch`, raised in the change that earns them.
- **The build and its targets**: `npm pack` for a library, the platform toolchain for a desktop app, `GOOS` and `GOARCH` for a Go binary, an archive of the files for a set of assets.
- **The asset names**: `<name>-<version>-<platform>-<arch>.<extension>`, or one file when there is one target.
- **The secrets** its build reads: a signing certificate, a registry token.
- **The registry**, when the artifact is installed by name rather than downloaded from the release page. `npm view <package>@<version> version` answers whether the version is already there; `npm publish` puts it there, with the `--registry` of npmjs or GitHub Packages. The step is skipped, not failed, when the version is found. A Go module needs no such step: its tag is what the module proxy reads.

A repository that deploys from the branch cuts a release only if it also builds a binary to attach; the deployment itself is outside this standard.
